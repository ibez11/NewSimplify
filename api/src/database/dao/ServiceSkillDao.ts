import ServiceSkill from '../models/ServiceSkill';
import { getServiceSkillModel } from '../models';
import { ServiceSkillResponseModel } from '../../typings/ResponseFormats';
import { Transaction } from 'sequelize';

// eslint-disable-next-line
export const bulkCreateServiceSkill = async (value: ServiceSkillResponseModel[], transaction?: Transaction): Promise<any> => {
  const model = getServiceSkillModel();

  return model.bulkCreate(value, { validate: false, transaction });
};

export const getServiceSkillByServiceId = async (serviceId: number): Promise<ServiceSkill> => {
  const model = getServiceSkillModel();

  return model.findOne<ServiceSkill>({ where: { serviceId } });
};

// eslint-disable-next-line
export const deleteServiceSkillByServiceId = async (serviceId: number): Promise<any> => {
  const model = getServiceSkillModel();

  await model.destroy({ where: { serviceId } });
};
