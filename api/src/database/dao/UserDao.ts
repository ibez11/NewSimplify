import { getUserModel } from '../models';
import { Transaction, FindOptions, Sequelize } from 'sequelize';
import { hashPassword } from '../../services/PasswordService';
import User from '../models/User';

export const createUser = async (
  loginName: string,
  clearPassword: string,
  tenant: string,
  countryCode: string,
  contactNumber: string,
  transaction: Transaction
): Promise<User> => {
  const model = getUserModel();

  return model.create<User>(
    {
      loginName,
      password: await hashPassword(clearPassword),
      countryCode,
      contactNumber,
      TenantKey: tenant
    },
    { transaction }
  );
};

export const getById = async (id: number, findOption?: FindOptions): Promise<User> => {
  const model = getUserModel();

  return model.findByPk<User>(id, findOption);
};

export const getByLoginName = async (loginName: string): Promise<User> => {
  const model = getUserModel();

  return model.findOne<User>({
    where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('loginName')), loginName.toLowerCase())
  });
};

export const getByContactNumber = async (countryCode: string, contactNumber: string): Promise<User> => {
  const model = getUserModel();

  return model.findOne<User>({ where: { countryCode, contactNumber } });
};

export const countById = async (id: number): Promise<number> => {
  const model = getUserModel();

  return model.count({ where: { id } });
};

export const countByLoginName = async (loginName: string): Promise<number> => {
  const model = getUserModel();

  return model.count({ where: { loginName } });
};

export const countByContactNumber = async (contactNumber: string): Promise<number> => {
  const model = getUserModel();

  return model.count({ where: { contactNumber } });
};

export const countByTenantAndStatus = async (tenantKey: string, active: boolean): Promise<number> => {
  const model = getUserModel();

  return model.count({ where: { TenantKey: tenantKey, active } });
};

export const deactivateUserById = async (id: number): Promise<[number, User[]]> => {
  const model = getUserModel();

  return model.update<User>({ active: false }, { where: { id } });
};
