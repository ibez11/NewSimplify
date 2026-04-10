import httpContext from 'express-http-context';
import { Model } from 'sequelize';
import { models as Models } from '../../config/database';
import TableNames from '../enums/TableNames';
import Agent from './Agent';
import AppLog from './AppLog';
import ChecklistItemTemplate from './ChecklistItemTemplate';
import ChecklistTemplate from './ChecklistTemplate';
import ChecklistJob from './ChecklistJob';
import ChecklistJobItem from './ChecklistJobItem';
import Client from './Client';
import Entity from './Entity';
import Invoice from './Invoice';
import Job from './Job';
import JobNote from './JobNote';
import JobDocument from './JobDocument';
import JobHistory from './JobHistory';
import Permission from './Permission';
import Role from './Role';
import Service from './Service';
import Schedule from './Schedule';
import ServiceAddress from './ServiceAddress';
import ServiceItem from './ServiceItem';
import ServiceSkill from './ServiceSkill';
import ServiceItemTemplate from './ServiceItemTemplate';
import ServiceTemplate from './ServiceTemplate';
import Setting from './Setting';
import SkillTemplate from './SkillTemplate';
import Tenant from './Tenant';
import User from './User';
import UserProfile from './UserProfile';
import Vehicle from './Vehicle';
import ContactPerson from './ContactPerson';
import Rating from './Rating';
import JobNoteTemplate from './JobNoteTemplate';
import Equipment from './Equipment';
import JobLabelTemplate from './JobLabelTemplate';
import JobLabel from './JobLabel';
import WaJob from './WaJob';
import Notification from './Notification';
import BrandTemplate from './BrandTemplate';
import ClientDocument from './ClientDocument';
import GstTemplate from './GstTemplate';
import JobExpenses from './JobExpenses';
import JobExpensesItem from './JobExpensesItem';
import TableColumnSetting from './TableColumnSetting';
import InvoiceHistory from './InvoiceHistory';
import CollectedAmountHistory from './CollectedAmountHistory';
import JobNoteMedia from './JobNoteMedia';
import CustomField from './CustomField';
import TimeOff from './TimeOff';
import District from './District';
import RoleGrant from './RoleGrant';
import PdfTemplateOptions from './PdfTemplateOptions';
import BookingSetting from './BookingSetting';

export const getTenantModel = (): (new () => Tenant) & typeof Model => {
  return Models.Tenant.schema('shared');
};

export const getUserModel = (): (new () => User) & typeof Model => {
  return Models.User.schema('shared');
};

export const getUserProfileModel = (): (new () => UserProfile) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.UserProfile.schema(tenant);
};

export const getRoleModel = (): (new () => Role) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Role.schema(tenant);
};

export const getPermissionModel = (): (new () => Permission) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Permission.schema(tenant);
};

export const getClientModel = (): (new () => Client) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Client.schema(tenant);
};

export const getServiceAddressModel = (): (new () => ServiceAddress) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ServiceAddress.schema(tenant);
};

export const getServiceItemTemplateModel = (): (new () => ServiceItemTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ServiceItemTemplate.schema(tenant);
};

export const getServiceModel = (): (new () => Service) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Service.schema(tenant);
};

export const getScheduleModel = (): (new () => Schedule) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Schedule.schema(tenant);
};

export const getServiceItemModel = (): (new () => ServiceItem) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ServiceItem.schema(tenant);
};

export const getServiceSkillModel = (): (new () => ServiceSkill) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ServiceSkill.schema(tenant);
};

export const getJobModel = (): (new () => Job) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Job.schema(tenant);
};

export const getJobNoteModel = (): (new () => JobNote) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobNote.schema(tenant);
};

export const getJobDocumentModel = (): (new () => JobDocument) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobDocument.schema(tenant);
};

export const getJobHistoryModel = (): (new () => JobHistory) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobHistory.schema(tenant);
};

export const getVehicleModel = (): (new () => Vehicle) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Vehicle.schema(tenant);
};

export const getEntityModel = (): (new () => Entity) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Entity.schema(tenant);
};

export const getInvoiceModel = (): (new () => Invoice) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Invoice.schema(tenant);
};

export const getServiceTemplateModel = (): (new () => ServiceTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ServiceTemplate.schema(tenant);
};

export const getSkillTemplateModel = (): (new () => SkillTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.SkillTemplate.schema(tenant);
};

export const getTenantKey = (): string => {
  const tenant = httpContext.get('tenant');

  return tenant;
};

export const getSettingModel = (): (new () => Setting) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Setting.schema(tenant);
};

export const getTableColumnSettingModel = (): (new () => TableColumnSetting) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.TableColumnSetting.schema(tenant);
};

export const getAppLogModel = (): (new () => AppLog) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.AppLog.schema(tenant);
};

export const getAgentModel = (): (new () => Agent) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Agent.schema(tenant);
};

export const getChecklistTemplateModel = (): (new () => ChecklistTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ChecklistTemplate.schema(tenant);
};

export const getChecklistItemTemplateModel = (): (new () => ChecklistItemTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ChecklistItemTemplate.schema(tenant);
};

export const getChecklistJobModel = (): (new () => ChecklistJob) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ChecklistJob.schema(tenant);
};

export const getContactPersonModel = (): (new () => ContactPerson) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ContactPerson.schema(tenant);
};

export const getChecklistJobItemModel = (): (new () => ChecklistJobItem) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ChecklistJobItem.schema(tenant);
};

export const getRatingModel = (): (new () => Rating) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Rating.schema(tenant);
};

export const getJobNoteTemplateModel = (): (new () => JobNoteTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobNoteTemplate.schema(tenant);
};

export const getEquipmentModel = (): (new () => Equipment) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Equipment.schema(tenant);
};

export const getJobLabelTemplateModel = (): (new () => JobLabelTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobLabelTemplate.schema(tenant);
};

export const getJobLabelModel = (): (new () => JobLabel) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobLabel.schema(tenant);
};

export const getWAJobModel = (): (new () => WaJob) & typeof Model => {
  return Models.WaJob.schema('shared');
};

export const getNotificationModel = (): (new () => Notification) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.Notification.schema(tenant);
};

export const getBrandTemplateModel = (): (new () => BrandTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.BrandTemplate.schema(tenant);
};

export const getClientDocumentModel = (): (new () => ClientDocument) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.ClientDocument.schema(tenant);
};

export const getGstTemplateModel = (): (new () => GstTemplate) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.GstTemplate.schema(tenant);
};

export const getJobExpensesModel = (): (new () => JobExpenses) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobExpenses.schema(tenant);
};

export const getJobExpensesItemModel = (): (new () => JobExpensesItem) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobExpensesItem.schema(tenant);
};

export const getInvoiceHistoryModel = (): (new () => InvoiceHistory) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.InvoiceHistory.schema(tenant);
};

export const getCollectedAmountHistoryModel = (): (new () => CollectedAmountHistory) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.CollectedAmountHistory.schema(tenant);
};

export const getJobNoteMediaModel = (): (new () => JobNoteMedia) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.JobNoteMedia.schema(tenant);
};

export const getCustomFieldModel = (): (new () => CustomField) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.CustomField.schema(tenant);
};

export const getTimeOffModel = (): (new () => TimeOff) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.TimeOff.schema(tenant);
};

export const getDistrictModel = (): (new () => District) & typeof Model => {
  return Models.District.schema('shared');
};

export const getDistrictMatrixScoredModel = (): (new () => District) & typeof Model => {
  return Models.District.schema('shared');
};

export const getRoleGrantModel = (): (new () => RoleGrant) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.RoleGrant.schema(tenant);
};

export const getPdfTemplateOptionsModel = (): (new () => PdfTemplateOptions) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.PdfTemplateOptions.schema(tenant);
};

export const getBookingSettingModel = (): (new () => BookingSetting) & typeof Model => {
  const tenant = httpContext.get('tenant');

  return Models.BookingSetting.schema(tenant);
};

// Using a defined list of table name will make it more secured
export const getTableName = (tableName: TableNames): string => {
  const tenantKey = httpContext.get('tenant');

  switch (tableName) {
    case TableNames.User:
      return 'shared."User"';
    case TableNames.Tenant:
      return 'shared."Tenant"';
    case TableNames.Client:
      return `${tenantKey}."Client"`;
    case TableNames.Job:
      return `${tenantKey}."Job"`;
    case TableNames.JobNote:
      return `${tenantKey}."JobNote"`;
    case TableNames.JobDocument:
      return `${tenantKey}."JobDocument"`;
    case TableNames.JobHistory:
      return `${tenantKey}."JobHistory"`;
    case TableNames.Permission:
      return `${tenantKey}."Permission"`;
    case TableNames.Role:
      return `${tenantKey}."Role"`;
    case TableNames.RolePermission:
      return `${tenantKey}."RolePermission"`;
    case TableNames.Service:
      return `${tenantKey}."Service"`;
    case TableNames.ServiceAddress:
      return `${tenantKey}."ServiceAddress"`;
    case TableNames.ServiceSkill:
      return `${tenantKey}."ServiceSkill"`;
    case TableNames.ServiceItem:
      return `${tenantKey}."ServiceItem"`;
    case TableNames.ServiceItemJob:
      return `${tenantKey}."ServiceItemJob"`;
    case TableNames.ServiceItemTemplate:
      return `${tenantKey}."ServiceItemTemplate"`;
    case TableNames.SkillTemplate:
      return `${tenantKey}."SkillTemplate"`;
    case TableNames.ChecklistTemplate:
      return `${tenantKey}."ChecklistTemplate"`;
    case TableNames.ChecklistItemTemplate:
      return `${tenantKey}."ChecklistItemTemplate"`;
    case TableNames.ChecklistJob:
      return `${tenantKey}."ChecklistJob"`;
    case TableNames.ChecklistJobItem:
      return `${tenantKey}."ChecklistJobItem"`;
    case TableNames.UserProfile:
      return `${tenantKey}."UserProfile"`;
    case TableNames.UserProfileJob:
      return `${tenantKey}."UserProfileJob"`;
    case TableNames.UserProfileRole:
      return `${tenantKey}."UserProfileRole"`;
    case TableNames.UserSkill:
      return `${tenantKey}."UserSkill"`;
    case TableNames.Vehicle:
      return `${tenantKey}."Vehicle"`;
    case TableNames.VehicleJob:
      return `${tenantKey}."VehicleJob"`;
    case TableNames.Entity:
      return `${tenantKey}."Entity"`;
    case TableNames.Invoice:
      return `${tenantKey}."Invoice"`;
    case TableNames.ContactPerson:
      return `${tenantKey}."ContactPerson"`;
    case TableNames.Rating:
      return `${tenantKey}."Rating"`;
    case TableNames.JobNoteTemplate:
      return `${tenantKey}."JobNoteTemplate"`;
    case TableNames.Equipment:
      return `${tenantKey}."Equipment"`;
    case TableNames.JobLabelTemplate:
      return `${tenantKey}."JobLabelTemplate"`;
    case TableNames.JobLabel:
      return `${tenantKey}."JobLabel"`;
    case TableNames.WaJob:
      return `"shared"."WaJob"`;
    case TableNames.Notification:
      return `${tenantKey}."Notification"`;
    case TableNames.BrandTemplate:
      return `${tenantKey}."BrandTemplate"`;
    case TableNames.ClientDocument:
      return `${tenantKey}."ClientDocument"`;
    case TableNames.ServiceItemEquipment:
      return `${tenantKey}."ServiceItemEquipment"`;
    case TableNames.GstTemplate:
      return `${tenantKey}."GstTemplate"`;
    case TableNames.JobExpenses:
      return `${tenantKey}."JobExpenses"`;
    case TableNames.JobExpensesItem:
      return `${tenantKey}."JobExpensesItem"`;
    case TableNames.TableColumnSetting:
      return `${tenantKey}."TableColumnSetting"`;
    case TableNames.InvoiceHistory:
      return `${tenantKey}."InvoiceHistory"`;
    case TableNames.CollectedAmountHistory:
      return `${tenantKey}."CollectedAmountHistory"`;
    case TableNames.JobNoteMedia:
      return `${tenantKey}."JobNoteMedia"`;
    case TableNames.CustomField:
      return `${tenantKey}."CustomField"`;
    case TableNames.ServiceContactPerson:
      return `${tenantKey}."ServiceContactPerson"`;
    case TableNames.TimeOff:
      return `${tenantKey}."TimeOff"`;
    case TableNames.TimeOffEmployee:
      return `${tenantKey}."TimeOffEmployee"`;
    case TableNames.Agent:
      return `${tenantKey}."Agent"`;
    case TableNames.District:
      return 'shared."District"';
    case TableNames.JobNoteEquipment:
      return `${tenantKey}."JobNoteEquipment"`;
    case TableNames.RoleGrant:
      return `${tenantKey}."RoleGrant"`;
    case TableNames.RoleGrantPermission:
      return `${tenantKey}."RoleGrantPermission"`;
    case TableNames.BookingSetting:
      return `${tenantKey}."BookingSetting"`;
    case TableNames.DistrictMatrixScored:
      return 'shared."DistrictMatrixScored"';
    default:
      return '';
  }
};
