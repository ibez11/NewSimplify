import { Op, QueryTypes, Transaction } from 'sequelize';
import TableNames from '../enums/TableNames';
import { getRoleModel, getTableName, getPermissionModel } from '../models';
import Role from '../models/Role';
import { sequelize } from '../../config/database';
import { RoleGrantResponseModel } from '../../typings/ResponseFormats';
import { RoleBody } from '../../typings/body/RoleBody';
import { PaginationQueryParams } from '../../typings/params/PaginationQueryParams';
import * as PermissionDao from '../dao/PermissionDao';
import Permission from '../models/Permission';

export const getAllRoles = async (): Promise<Role[]> => {
  const model = getRoleModel();

  return model.findAll<Role>();
};

export const getPaginated = async (query?: PaginationQueryParams): Promise<{ rows: Role[]; count: number }> => {
  const model = getRoleModel();
  const { s: offset, l: limit, q } = query;

  // eslint-disable-next-line
  let where: any = {};

  if (q) {
    where[Op.or] = {
      ...where,
      name: {
        [Op.iLike]: `%${q}%`
      }
    };
  }
  return model.findAndCountAll<Role>({
    where,
    offset,
    limit,
    order: [['id', 'ASC']]
  });
};

export const getAccessSettings = async (): Promise<RoleGrantResponseModel[]> => {
  const RoleGrants = getTableName(TableNames.RoleGrant);

  const results: RoleGrantResponseModel[] = await sequelize.query(
    `SELECT

    rg."id" as "id",
    rg."module" AS "module", 
    rg."function" AS "function",
    rg."label" as "label",
    rg."description" as "description",
    rg."isMain" as "isMain"

    FROM ${RoleGrants} AS rg
    ORDER BY rg."id", rg."isMain" DESC`,
    { type: QueryTypes.SELECT }
  );

  if (results && results.length > 0) {
    results.map(value => {
      value.isActive = true;
    });
  }
  return results;
};

export const getRoleById = async (id: number): Promise<Role> => {
  const model = getRoleModel();

  return model.findByPk<Role>(id);
};

export const createRole = async (req: RoleBody): Promise<Role> => {
  const model = getRoleModel();
  const { name, description, isEdited } = req;

  return model.create<Role>({
    name,
    description,
    isEdited: isEdited ? isEdited : true
  });
};

export const deleteRole = async (id: number): Promise<void> => {
  const model = getRoleModel();

  await model.destroy({ where: { id } });
};

export const getRoleGrantByRoleId = async (id: number): Promise<{ row: RoleGrantResponseModel[] }> => {
  const RoleGrants = getTableName(TableNames.RoleGrant);
  const RoleGrantPermission = getTableName(TableNames.RoleGrantPermission);

  const results: RoleGrantResponseModel[] = await sequelize.query(
    `SELECT

    rg."id" as "id",
    rg."module" AS "module", 
    rg."function" AS "function",
    rg."label" as "label",
    rg."description" as "description",
    rg."isMain" as "isMain",

    rgp."isActive" as "isActive"

    FROM ${RoleGrantPermission} AS rgp
    INNER JOIN ${RoleGrants} AS rg ON rg."id" = rgp."roleGrantId"
    WHERE rgp."roleId" = ${id}
    GROUP BY rg."id", rg."module", rg."function", rg."label", rg."description", rg."isMain", rgp."isActive"
    ORDER BY rg."id", rg."isMain" DESC`,
    { type: QueryTypes.SELECT }
  );
  return { row: results };
};

export const bulkCreateRoleGrant = async (roleId: number, roleGrants: RoleGrantResponseModel[]): Promise<void> => {
  const RoleGrantPermission = getTableName(TableNames.RoleGrantPermission);

  await sequelize.transaction(async (transaction: Transaction) => {
    for (const roleGrant of roleGrants) {
      const { id, isActive } = roleGrant;
      await sequelize.query(`INSERT INTO ${RoleGrantPermission} ("roleGrantId", "roleId", "isActive") VALUES (:id, :roleId, :isActive)`, {
        replacements: { id, roleId, isActive },
        type: QueryTypes.INSERT,
        transaction
      });
    }
  });
};

export const bulkEditRoleGrantByRoleId = async (roleId: number, roleGrants: RoleGrantResponseModel[]): Promise<void> => {
  const RoleGrantPermission = getTableName(TableNames.RoleGrantPermission);

  await sequelize.transaction(async (transaction: Transaction) => {
    for (const roleGrant of roleGrants) {
      const { id, isActive } = roleGrant;
      await sequelize.query(
        `UPDATE ${RoleGrantPermission} 
           SET "isActive" = :isActive
           WHERE "roleGrantId" = :id AND "roleId" = :roleId`,
        {
          replacements: { isActive, id, roleId },
          type: QueryTypes.UPDATE,
          transaction
        }
      );
    }
  });
};

export const bulkCreateRolePermission = async (roleId: number): Promise<void> => {
  const RolePermission = getTableName(TableNames.RolePermission);
  const permissions: Permission[] = await PermissionDao.getAllPermission();
  const values = permissions.map(permission => `(${roleId}, ${permission.id})`).join(', ');

  const query = `INSERT INTO ${RolePermission} ("roleId", "permissionId") VALUES ${values};`;
  await sequelize.transaction(async (transaction: Transaction) => {
    await sequelize.query(query, { type: QueryTypes.INSERT, transaction });
  });
};
