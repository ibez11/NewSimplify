import Logger from '../Logger';
import Equipment from '../database/models/Equipment';
import * as EquipmentDao from '../database/dao/EquipmentDao';
import * as BrandTemplateDao from '../database/dao/BrandTemplateDao';
import * as JobNoteDao from '../database/dao/JobNoteDao';
import * as JobDao from '../database/dao/JobDao';
import * as JobNoteService from '../services/JobNoteService';
import * as ClientDao from '../database/dao/ClientDao';

import EquipmentNotFoundError from '../errors/EquipmentNotFoundError';
// import DuplicatedEquipmentError from '../errors/DuplicatedEquipmentError';
import { EquipmentResponseModel } from '../typings/ResponseFormats';
import { sequelize } from '../config/database';
import { EquipmentQueryParam } from '../typings/params/EquipmentQueryParam';
import { format } from 'date-fns';

const LOG = new Logger('EquipmentService');

/**
 * Search Equipment with query and optional pagination
 *
 * @param s offset for pagination search
 * @param l limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchEquipmentWithPagination = (query?: EquipmentQueryParam): Promise<{ rows: EquipmentResponseModel[]; count: number }> => {
  LOG.debug('Searching Equipment with Pagination');

  return EquipmentDao.getPaginated(query);
};

/**
 * Create a new client equiment in the system, based on user input
 *
 * @param brand of the new equipment
 * @param model of the new equipment
 * @param serialNumber of the equipment
 * @param location of the equipment
 * @param notes of the equipment
 * @param dateWorkDone of the equipment
 * @param remarks of the equipment
 * @param serviceAddressId of the equipment
 * @param updatedBy of the equipment
 * @param SubEquipments of the equipment
 * @param mainId of the equipment
 * @param warrantyStartDate of the equipment
 * @param warrantyEndDate of the equipment
 * @param description of the equipment
 *
 * @returns EquimentModel
 */
export const createEquipment = async (body: EquipmentResponseModel): Promise<EquipmentResponseModel> => {
  LOG.debug('Creating Equipment');

  // const existingEquipment = await isCheckEquipmentExistsBySerialNumber(serialNumber);

  // if (existingEquipment) {
  //   throw new DuplicatedEquipmentError();
  // }

  const transaction = await sequelize.transaction();
  try {
    const isBrandExist = await BrandTemplateDao.getBrandTemplateTemplateByName(body.brand);

    if (!isBrandExist) {
      await BrandTemplateDao.createBrandTemplate(body.brand, '');
    }

    const equipment = await EquipmentDao.createEquipment(body, transaction);

    if (body.SubEquipments) {
      body.SubEquipments.map(item => {
        delete item.id;
        item.mainId = equipment.id;
        item.isMain = false;
        item.updatedBy = body.updatedBy;
        item.serviceAddressId = equipment.serviceAddressId;
        item.dateWorkDone = null;
        item.warrantyStartDate = item.warrantyStartDate ? new Date(item.warrantyStartDate) : null;
        item.warrantyEndDate = item.warrantyEndDate ? new Date(item.warrantyEndDate) : null;
        item.description = item.description; // Ensure description is set
      });

      const subEquipments = await EquipmentDao.bulkCreateSubEquipment(body.SubEquipments, transaction);
      equipment.setDataValue('SubEquipments', subEquipments);
    }

    await transaction.commit();

    return await EquipmentDao.getEquipmentById(equipment.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Create a new client equiment in the system, based on user input
 *
 * @param mainId of the equipment
 * @param SubEquipments of the equipment
 * @param updatedBy of the equipment
 *
 * @returns EquimentModel
 */
export const createSubEquipments = async (mainId: number, SubEquipments: Equipment[], updatedBy: number): Promise<EquipmentResponseModel> => {
  LOG.debug('Creating Sub Equipments');

  const transaction = await sequelize.transaction();
  try {
    const equipment = await EquipmentDao.getEquipmentDetailById(mainId);

    if (SubEquipments) {
      SubEquipments.map(item => {
        item.mainId = equipment.id;
        item.isMain = false;
        item.updatedBy = updatedBy;
        item.serviceAddressId = equipment.serviceAddressId;
        item.dateWorkDone = null;
        item.warrantyStartDate = item.warrantyStartDate ? new Date(item.warrantyStartDate) : null;
        item.warrantyEndDate = item.warrantyEndDate ? new Date(item.warrantyEndDate) : null;
        item.description = item.description; // Ensure description is set
      });

      const subEquipments = await EquipmentDao.bulkCreateSubEquipment(SubEquipments, transaction);
      equipment.setDataValue('SubEquipments', subEquipments);
    }

    await transaction.commit();
    return await EquipmentDao.getEquipmentById(mainId);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const getEquipmentDetailById = async (id: number): Promise<EquipmentResponseModel> => {
  LOG.debug('Getting Equipment detail from id');

  const equipmenet = await EquipmentDao.getEquipmentById(id);

  if (!equipmenet) {
    throw new EquipmentNotFoundError(id);
  }

  return equipmenet;
};

/**
 * Edit a client equiment in the system, based on user input
 *
 * @param id of the new equipment
 * @param brand of the new equipment
 * @param model of the new equipment
 * @param serialNumber of the equipment
 * @param location of the equipment
 * @param dateWorkDone of the equipment
 * @param remarks of the equipment
 * @param serviceAddressId of the equipment
 * @param updatedBy of the equipment
 *
 * @returns EquimentModel
 */
export const editEquipment = async (id: number, body: EquipmentResponseModel): Promise<EquipmentResponseModel> => {
  LOG.debug('Editing Equipment');

  const {
    brand,
    model,
    serialNumber,
    location,
    dateWorkDone,
    remarks,
    serviceAddressId,
    updatedBy,
    isMain,
    mainId,
    isActive,
    warrantyStartDate,
    warrantyEndDate,
    description
  } = body;

  const equipment = await EquipmentDao.getEquipmentDetailById(id);

  if (!equipment) {
    throw new EquipmentNotFoundError(id);
  }

  // if (isChangeSerialNumber) {
  //   const existingEquipment = await isCheckEquipmentExistsBySerialNumber(serialNumber);

  //   if (existingEquipment) {
  //     throw new DuplicatedEquipmentError();
  //   }
  // }

  const transaction = await sequelize.transaction();

  try {
    const isBrandExist = await BrandTemplateDao.getBrandTemplateTemplateByName(brand);

    if (!isBrandExist) {
      await BrandTemplateDao.createBrandTemplate(brand, '');
    }

    await equipment.update(
      {
        brand,
        model,
        serialNumber,
        location: location ? location : null,
        dateWorkDone,
        remarks,
        serviceAddressId,
        updatedBy,
        isActive,
        isMain: isMain ? isMain : mainId === undefined || mainId === null || mainId === 0 ? true : false,
        mainId: mainId !== 0 ? mainId : null,
        warrantyStartDate: warrantyStartDate ? new Date(warrantyStartDate) : null,
        warrantyEndDate: warrantyEndDate ? new Date(warrantyEndDate) : null,
        description
      },
      { transaction }
    );

    await transaction.commit();

    return await EquipmentDao.getEquipmentById(equipment.id);
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * To delete equipment (hard delete)
 *
 * @param equipmentId of the sequipmentto be deleted
 *
 * @returns void
 */
export const deleteEquipment = async (id: number): Promise<void> => {
  await EquipmentDao.deleteEquipment(id);
};

/**
 * Check if a equipment item exists
 *
 * @param equipmentId of the required service item
 *
 * @returns boolean
 */
export const isCheckEquipmentExistsByEquimentId = (equipmentId: number): Promise<Equipment> => {
  LOG.debug('Checking Checklist Exists By Equipment Id');

  return EquipmentDao.countByEquipment(equipmentId);
};

/**
 * Check if a equipment item exists
 *
 * @param serialNumber of the required service item
 *
 * @returns boolean
 */
export const isCheckEquipmentExistsBySerialNumber = async (serialNumber: string): Promise<boolean> => {
  LOG.debug('Checking Equipment Exists By serial number');

  return (await EquipmentDao.countBySerialNumber(serialNumber)) > 0;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEquipmentByServiceAddressId = async (
  serviceAddressId: number,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  isActive?: any,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  offset?: any,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  limit?: any
): Promise<EquipmentResponseModel[]> => {
  LOG.debug('Get Equipment By Equipment Id');

  return await EquipmentDao.getEquipmentByServiceAddressId(serviceAddressId, isActive, offset, limit);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getEquipmentByServiceAddressIdwithNotesCount = async (
  serviceAddressId: number,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  type: any,
  jobId: number,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  isActive?: any,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  offset?: any,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  limit?: any
): Promise<EquipmentResponseModel[]> => {
  LOG.debug('Get Equipment By Equipment Id');

  const equipments = await EquipmentDao.getEquipmentByServiceAddressId(serviceAddressId, isActive, offset, limit);
  await Promise.all(
    equipments.map(async val => {
      const notesCount =
        type === 'current'
          ? await JobNoteService.getCountNotesByQuery(jobId, { equipmentIds: [val.id] })
          : await (async () => {
              if (type === 'previous') {
                const { row } = await JobDao.getJobDetailById(jobId);
                return JobNoteDao.getCountPreviousJobNotesByClientId(jobId, row.clientId, { equipmentIds: [val.id] });
              }
              return 0;
            })();
      val.setDataValue('notesCount', notesCount);

      const result: Equipment[] = [];
      const detailEquipment = await EquipmentDao.getEquipmentByMainId(val.id, isActive);
      if (detailEquipment && detailEquipment.length > 0) {
        for (const sub of detailEquipment) {
          const notesCount =
            type === 'current'
              ? await JobNoteService.getCountNotesByQuery(jobId, { equipmentIds: [sub.id] })
              : await (async () => {
                  if (type === 'previous') {
                    const { row } = await JobDao.getJobDetailById(jobId);
                    return JobNoteDao.getCountPreviousJobNotesByClientId(jobId, row.clientId, { equipmentIds: [sub.id] });
                  }
                  return 0;
                })();
          sub.setDataValue('notesCount', notesCount);
          result.push(sub);
        }
        val.setDataValue('SubEquipments', result);
      }
    })
  );
  return equipments;
};

export const editEquipmentStatus = async (id: number, isActive: boolean): Promise<EquipmentResponseModel> => {
  LOG.debug('Editing Equipment');

  const equipment = await EquipmentDao.getEquipmentDetailById(id);

  if (!equipment) {
    throw new EquipmentNotFoundError(id);
  }

  const transaction = await sequelize.transaction();

  try {
    await equipment.update({ isActive }, { transaction });

    await transaction.commit();

    return equipment;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const getEquipmentByServiceItemId = async (serviceItemId: number): Promise<EquipmentResponseModel[]> => {
  LOG.debug('Getting Equipment By Service Item Id');

  try {
    const equiments = await EquipmentDao.getEquipmentByServiceItemId(serviceItemId);
    return equiments;
  } catch (err) {
    throw err;
  }
};

export const exportCsv = async (query?: EquipmentQueryParam): Promise<EquipmentResponseModel[]> => {
  LOG.debug('Getting Equipment By Service Item Id');

  try {
    const result: EquipmentResponseModel[] = [];

    const equipments = await EquipmentDao.get(query);

    if (equipments) {
      let index = 1;
      for (const val of equipments) {
        result.push({
          id: val.id,
          brand: val.brand,
          model: val.model,
          serialNumber: val.serialNumber,
          location: val.location,
          address: val.address,
          dateWorkDone: val.dateWorkDone,
          type: `Main Equipment ${index}`,
          isActive: val.isActive,
          clientName: val.clientName,
          warrantyStartDate: val.warrantyStartDate ? format(new Date(val.warrantyStartDate), 'dd-MM-yyyy') : null,
          warrantyEndDate: val.warrantyEndDate ? format(new Date(val.warrantyEndDate), 'dd-MM-yyyy') : null,
          description: val.description || '-'
        });

        const detailEquipment = await EquipmentDao.getEquipmentByMainId(val.id);
        if (detailEquipment && detailEquipment.length > 0) {
          for (const sub of detailEquipment) {
            result.push({
              id: sub.id,
              brand: sub.brand,
              model: sub.model,
              serialNumber: sub.serialNumber,
              location: sub.location,
              address: val.address,
              dateWorkDone: sub.dateWorkDone,
              type: `Sub Equipment ${index}`,
              isActive: sub.isActive,
              clientName: val.clientName,
              warrantyStartDate: sub.warrantyStartDate ? format(new Date(sub.warrantyStartDate), 'dd-MM-yyyy') : null,
              warrantyEndDate: sub.warrantyEndDate ? format(new Date(sub.warrantyEndDate), 'dd-MM-yyyy') : null,
              description: sub.description
            });
          }
        }
        index++;
      }
    }

    return result.sort((a, b) => a.id - b.id);
  } catch (err) {
    throw err;
  }
};

export const getEquipmentByJobNoteId = async (jobNoteId: number): Promise<EquipmentResponseModel[]> => {
  LOG.debug('Getting Equipment By Job Note Id');

  try {
    const equipments = await EquipmentDao.getEquipmentByJobNoteId(jobNoteId);
    if (equipments) {
      let index = 0;
      for (const val of equipments) {
        val.index = index;

        if (!val.isMain) {
          const detailEquipment = await EquipmentDao.getEquipmentByMainId(val.id, true);
          if (detailEquipment && detailEquipment.length > 0) {
            for (const sub of detailEquipment) {
              sub.index = index;
            }
          }
        }
        index++;
      }
    }
    return equipments;
  } catch (err) {
    throw err;
  }
};
