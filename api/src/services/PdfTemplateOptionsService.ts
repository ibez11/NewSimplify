import Logger from '../Logger';
import PdfTemplateOptions from '../database/models/PdfTemplateOptions';
import * as PdfTemplateOptionsDao from '../database/dao/PdfTemplateOptionsDao';
import { PdfTemplateOptionsBody } from '../typings/body/PdfTemplateOptionsBody';
import * as InvoiceService from './InvoiceService';
import * as ServiceService from './ServiceService';
import * as InvoiceDao from '../database/dao/InvoiceDao';
import * as ServiceDao from '../database/dao/ServiceDao';

const LOG = new Logger('PdfTemplateOptionsService.ts');

/**
 * Gets a PdfTemplateOptions by fileName
 *
 * @param fileName the fileName of the PdfTemplateOptions to get
 *
 * @returns the PdfTemplateOptions with the given fileName
 */
export const getPdfTemplateOptionsByFileName = async (fileName: string): Promise<PdfTemplateOptions> => {
  LOG.info('Getting PdfTemplateOptions by fileName: ' + fileName);

  const pdfTemplateOptions = await PdfTemplateOptionsDao.getByFileName(fileName);

  return pdfTemplateOptions;
};

export const editPdfTemplateOptionsByFileName = async (query?: PdfTemplateOptionsBody): Promise<PdfTemplateOptions> => {
  const { fileName, headerOptionId, clientInfoOptionId, tableOptionId, tncOptionId, signatureOptionId } = query;

  LOG.info('Editing PdfTemplateOptions by fileName: ' + fileName);

  const pdfTemplateOptions = await PdfTemplateOptionsDao.getByFileName(fileName);

  return await pdfTemplateOptions.update({
    headerOptionId,
    clientInfoOptionId,
    tableOptionId,
    tncOptionId,
    signatureOptionId
  });
};

export const getPreviewPdfTemplate = async (fileName: string, query?: PdfTemplateOptionsBody): Promise<Buffer> => {
  try {
    const { id } = fileName == 'invoice' ? await InvoiceDao.getLastId() : await ServiceDao.getLastId();
    const preview = fileName == 'invoice' ? await InvoiceService.exportPdf(id, query) : await ServiceService.exportPdf(id, query);

    return preview;
  } catch (error) {
    throw error;
  }
};
