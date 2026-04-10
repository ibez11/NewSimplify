import { WAJobResponseModel } from '../../typings/ResponseFormats';
import { getWAJobModel } from '../models';
import WaJob from '../models/WaJob';

export const getWAData = async (wamid: string): Promise<WAJobResponseModel> => {
  const model = getWAJobModel();

  return await model.findOne<WaJob>({ where: { wamid } });
};

export const getWADataByWamID = async (wamid: string): Promise<WaJob> => {
  const model = getWAJobModel();

  return model.findOne<WaJob>({ where: { wamid } });
};
