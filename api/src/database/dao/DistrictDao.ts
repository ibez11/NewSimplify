import { Op, QueryTypes } from 'sequelize';
import { DistrictBody } from '../../typings/body/DistrictBody';
import { PaginationQueryParams } from '../../typings/params/PaginationQueryParams';
import { getDistrictModel, getTableName } from '../models';
import District from '../models/District';
import TableNames from '../enums/TableNames';
import { sequelize } from '../../config/database';

export const getPaginated = async (query: PaginationQueryParams): Promise<{ rows: DistrictBody[]; count: number }> => {
  const { s, l, q } = query;
  const model = getDistrictModel();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (q) {
    where[Op.or] = {
      postalSector: {
        [Op.iLike]: `%${q}%`
      },
      postalDistrict: {
        [Op.iLike]: `%${q}%`
      }
    };
  }

  return model.findAndCountAll<District>({
    where,
    offset: s,
    limit: l,
    order: [['id', 'asc']],
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  });
};

export const getSectorByDistrict = async (postalDistrict: string[]): Promise<DistrictBody[]> => {
  const model = getDistrictModel();

  const where = {
    id: {
      [Op.in]: postalDistrict
    }
  };

  return model.findAll<District>({
    where,
    attributes: {
      exclude: ['createdAt', 'updatedAt']
    }
  });
};

export type DistrictProximityInfo = {
  proximityScore: number | null;
  fromGroup: string | null;
  toGroup: string | null;
};

export const getDistrictProximityInfo = async (fromPostalCode: string, toPostalCode: string): Promise<DistrictProximityInfo> => {
  const District = getTableName(TableNames.District);
  const DistrictMatrixScored = getTableName(TableNames.DistrictMatrixScored);

  // ✅ strict sanitize: keep only digits, then take first 2
  const sectorOf = (pc?: string) => {
    const digits = String(pc ?? '')
      .trim()
      .replace(/\D/g, '');
    const two = digits.slice(0, 2);
    return two.length === 2 ? two : null;
  };

  const fromSector = sectorOf(fromPostalCode);
  const toSector = sectorOf(toPostalCode);

  if (!fromSector || !toSector) {
    console.error('SmartRank.SKIP: invalid sector', JSON.stringify({ fromSector, toSector }));
    return { proximityScore: null, fromGroup: null, toGroup: null };
  }

  // ✅ inline SQL (no replacements)
  const sql = `
    WITH g AS (
      SELECT
        MAX(CASE WHEN '${fromSector}' = ANY(d."postalSector") THEN d."group" END) AS "fromGroup",
        MAX(CASE WHEN '${toSector}'   = ANY(d."postalSector") THEN d."group" END) AS "toGroup"
      FROM ${District} d
    )
    SELECT
      g."fromGroup" AS "fromGroup",
      g."toGroup"   AS "toGroup",
      m."proximityScore"::int AS "proximityScore"
    FROM g
    LEFT JOIN ${DistrictMatrixScored} m
      ON m."fromGroup" = g."fromGroup"
     AND m."toGroup"   = g."toGroup"
    LIMIT 1;
  `;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (await sequelize.query(sql, { type: QueryTypes.SELECT })) as any[];

    // Important: stringify or you might get "[object Object]"
    const row = rows?.[0] ?? null;

    return {
      fromGroup: row?.fromGroup ?? null,
      toGroup: row?.toGroup ?? null,
      proximityScore: row?.proximityScore !== null && row?.proximityScore !== undefined ? Number(row.proximityScore) : null
    };
  } catch (err) {
    // ✅ do NOT swallow — log it
    console.error('SmartRank.ERROR:', err?.message);
    return { proximityScore: null, fromGroup: null, toGroup: null };
  }
};

// keep your old function (backward compatible)
export const getDistrictProximityScore = async (fromPostalCode: string, toPostalCode: string): Promise<number | null> => {
  const info = await getDistrictProximityInfo(fromPostalCode, toPostalCode);
  return info.proximityScore;
};

// optional helper if you ever need group only (no matrix)
export const getDistrictGroupByPostalCode = async (postalCode: string): Promise<string | null> => {
  const District = getTableName(TableNames.District);
  const sector = postalCode
    ?.trim()
    ?.slice(0, 2)
    ?.toUpperCase();
  if (!sector) return null;

  const sql = `
    SELECT d."group" AS "group"
    FROM ${District} d
    WHERE :sector = ANY(d."postalSector")
    LIMIT 1;
  `;

  const rows = (await sequelize.query(sql, {
    replacements: { sector },
    type: QueryTypes.SELECT
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any[];

  return rows?.[0]?.group ?? null;
};
