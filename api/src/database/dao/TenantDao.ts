import { getTenantModel } from '../models';
import Tenant from '../models/Tenant';

export const getAllTenant = async (): Promise<Tenant[]> => {
  const model = getTenantModel();

  return model.findAll<Tenant>();
};

export const getByTenantKey = async (tenantKey: string): Promise<Tenant> => {
  const model = getTenantModel();

  return model.findByPk<Tenant>(tenantKey);
};

export const getByDomain = async (domain: string): Promise<Tenant> => {
  const model = getTenantModel();

  return model.findOne<Tenant>({ where: { domain } });
};
