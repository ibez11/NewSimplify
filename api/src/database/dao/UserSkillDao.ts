import { sequelize } from '../../config/database';
import { getTableName } from '../models';
import TableNames from '../enums/TableNames';
import { QueryTypes, Transaction } from 'sequelize';

export const create = async (userProfileId: number, skill: string, transaction: Transaction): Promise<[number, number]> => {
  const UserSkill = getTableName(TableNames.UserSkill);
  const currentDateTime = new Date();

  return sequelize.query(
    `INSERT INTO ${UserSkill} ("userProfileId", "skill", "createdAt", "updatedAt") VALUES ($userProfileId, $skill, $createdAt, $updatedAt)`,
    {
      type: QueryTypes.INSERT,
      bind: {
        userProfileId,
        skill,
        createdAt: currentDateTime,
        updatedAt: currentDateTime
      },
      transaction
    }
  );
};

export const removeAllByUserProfileId = async (userProfileId: number, transaction: Transaction): Promise<void> => {
  const UserSkill = getTableName(TableNames.UserSkill);

  return sequelize.query(`DELETE FROM ${UserSkill} WHERE "userProfileId" = $userProfileId`, {
    type: QueryTypes.DELETE,
    bind: { userProfileId },
    transaction
  });
};
