import { Op } from 'sequelize';
import { getPdfTemplateOptionsModel } from '../models';
import PdfTemplateOptions from '../models/PdfTemplateOptions';

export const getByFileName = async (fileName: string): Promise<PdfTemplateOptions> => {
  const model = getPdfTemplateOptionsModel();

  return model.findOne<PdfTemplateOptions>({ where: { fileName: { [Op.like]: `%${fileName}%` } } });
};
