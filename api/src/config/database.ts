import { Sequelize } from 'sequelize';

import Logger from '../Logger';
import User from '../database/models/User';
import UserProfile from '../database/models/UserProfile';
import Role from '../database/models/Role';
import Permission from '../database/models/Permission';
import { Models } from '../database/typings/Models';
import Client from '../database/models/Client';
import ServiceAddress from '../database/models/ServiceAddress';
import ServiceItemTemplate from '../database/models/ServiceItemTemplate';
import Service from '../database/models/Service';
import ServiceItem from '../database/models/ServiceItem';
import ServiceSkill from '../database/models/ServiceSkill';
import Schedule from '../database/models/Schedule';
import Job from '../database/models/Job';
import JobNote from '../database/models/JobNote';
import JobDocument from '../database/models/JobDocument';
import JobHistory from '../database/models/JobHistory';
import Tenant from '../database/models/Tenant';
import Vehicle from '../database/models/Vehicle';
import Entity from '../database/models/Entity';
import Invoice from '../database/models/Invoice';
import ServiceTemplate from '../database/models/ServiceTemplate';
import SkillTemplate from '../database/models/SkillTemplate';
import ChecklistTemplate from '../database/models/ChecklistTemplate';
import ChecklistItemTemplate from '../database/models/ChecklistItemTemplate';
import ChecklistJob from '../database/models/ChecklistJob';
import ChecklistJobItem from '../database/models/ChecklistJobItem';
import UserSkill from '../database/models/UserSkill';
import Setting from '../database/models/Setting';
import AppLog from '../database/models/AppLog';
import Agent from '../database/models/Agent';
import ContactPerson from '../database/models/ContactPerson';
import Rating from '../database/models/Rating';
import JobNoteTemplate from '../database/models/JobNoteTemplate';
import Equipment from '../database/models/Equipment';
import JobLabelTemplate from '../database/models/JobLabelTemplate';
import JobLabel from '../database/models/JobLabel';
import WaJob from '../database/models/WaJob';
import Notification from '../database/models/Notification';
import BrandTemplate from '../database/models/BrandTemplate';
import ClientDocument from '../database/models/ClientDocument';
import GstTemplate from '../database/models/GstTemplate';
import JobExpenses from '../database/models/JobExpenses';
import JobExpensesItem from '../database/models/JobExpensesItem';
import TableColumnSetting from '../database/models/TableColumnSetting';
import InvoiceHistory from '../database/models/InvoiceHistory';
import CollectedAmountHistory from '../database/models/CollectedAmountHistory';
import JobNoteMedia from '../database/models/JobNoteMedia';
import CustomField from '../database/models/CustomField';
import TimeOff from '../database/models/TimeOff';
import District from '../database/models/District';
import RoleGrant from '../database/models/RoleGrant';
import PdfTemplateOptions from '../database/models/PdfTemplateOptions';
import BookingSetting from '../database/models/BookingSetting';

const { DB_HOST, DB_PORT, DB_SCHEMA, DB_USER, DB_PW, DB_POOL_ACQUIRE, DB_POOL_IDLE, DB_POOL_MAX_CONN, DB_POOL_MIN_CONN, DB_LOG_LEVEL } = process.env;

const LOG = new Logger('sequelize');

/**
 * The same database user is used to access the different tenants / schema
 * This decision is made because
 *  1. User can only access the wrong schema if the data is corrupted or hacked.
 *     The hacker can access all tenants information if the app is compromised
 *  2. Having different connection to the same database is overkilled
 */
export const sequelize = new Sequelize(DB_SCHEMA, DB_USER, DB_PW, {
  dialect: 'postgres',
  host: DB_HOST,
  pool: {
    acquire: +DB_POOL_ACQUIRE,
    idle: +DB_POOL_IDLE,
    max: +DB_POOL_MAX_CONN,
    min: +DB_POOL_MIN_CONN,
    evict: 10000, // Run eviction checks every second
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate: (conn: any) => {
      // Validate connection before use
      return conn && !conn.ended;
    }
  },
  dialectOptions: {
    statement_timeout: 30000, // 30 second query timeout
    idle_in_transaction_session_timeout: 60000, // 60 seconds
    connectionTimeoutMillis: 2000, // 2 second connection timeout
    keepAlive: true,
    keepAliveInitialDelayMillis: 30000
  },
  retry: {
    match: [/Deadlock/i, /ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/, /Connection terminated unexpectedly/], // Retry on connection errors
    max: 3 // Maximum retry 3 times
  },
  port: +DB_PORT,
  timezone: 'Asia/Singapore',
  logging: (msg: string) => {
    LOG.log(DB_LOG_LEVEL, msg);
  }
});

// Add connection hooks for debugging
sequelize.addHook('beforeConnect', config => {
  LOG.debug('Opening new database connection');
});

sequelize.addHook('afterConnect', (connection, config) => {
  LOG.debug('New database connection established');
});

sequelize.addHook('beforeDisconnect', connection => {
  LOG.debug('Closing database connection');
});

export const models: Models = {
  Tenant: Tenant.initModel(sequelize),
  User: User.initModel(sequelize),
  UserProfile: UserProfile.initModel(sequelize),
  Role: Role.initModel(sequelize),
  Permission: Permission.initModel(sequelize),
  Client: Client.initModel(sequelize),
  ServiceAddress: ServiceAddress.initModel(sequelize),
  ServiceItemTemplate: ServiceItemTemplate.initModel(sequelize),
  Service: Service.initModel(sequelize),
  ServiceItem: ServiceItem.initModel(sequelize),
  ServiceSkill: ServiceSkill.initModel(sequelize),
  Schedule: Schedule.initModel(sequelize),
  Job: Job.initModel(sequelize),
  JobNote: JobNote.initModel(sequelize),
  JobDocument: JobDocument.initModel(sequelize),
  JobHistory: JobHistory.initModel(sequelize),
  Vehicle: Vehicle.initModel(sequelize),
  Entity: Entity.initModel(sequelize),
  Invoice: Invoice.initModel(sequelize),
  ServiceTemplate: ServiceTemplate.initModel(sequelize),
  SkillTemplate: SkillTemplate.initModel(sequelize),
  ChecklistTemplate: ChecklistTemplate.initModel(sequelize),
  ChecklistItemTemplate: ChecklistItemTemplate.initModel(sequelize),
  ChecklistJob: ChecklistJob.initModel(sequelize),
  ChecklistJobItem: ChecklistJobItem.initModel(sequelize),
  UserSkill: UserSkill.initModel(sequelize),
  Setting: Setting.initModel(sequelize),
  AppLog: AppLog.initModel(sequelize),
  ContactPerson: ContactPerson.initModel(sequelize),
  Agent: Agent.initModel(sequelize),
  Rating: Rating.initModel(sequelize),
  JobNoteTemplate: JobNoteTemplate.initModel(sequelize),
  Equipment: Equipment.initModel(sequelize),
  JobLabelTemplate: JobLabelTemplate.initModel(sequelize),
  JobLabel: JobLabel.initModel(sequelize),
  WaJob: WaJob.initModel(sequelize),
  Notification: Notification.initModel(sequelize),
  BrandTemplate: BrandTemplate.initModel(sequelize),
  ClientDocument: ClientDocument.initModel(sequelize),
  GstTemplate: GstTemplate.initModel(sequelize),
  JobExpenses: JobExpenses.initModel(sequelize),
  JobExpensesItem: JobExpensesItem.initModel(sequelize),
  TableColumnSetting: TableColumnSetting.initModel(sequelize),
  InvoiceHistory: InvoiceHistory.initModel(sequelize),
  CollectedAmountHistory: CollectedAmountHistory.initModel(sequelize),
  JobNoteMedia: JobNoteMedia.initModel(sequelize),
  CustomField: CustomField.initModel(sequelize),
  TimeOff: TimeOff.initModel(sequelize),
  District: District.initModel(sequelize),
  RoleGrant: RoleGrant.initModel(sequelize),
  PdfTemplateOptions: PdfTemplateOptions.initModel(sequelize),
  BookingSetting: BookingSetting.initModel(sequelize)
};

Object.keys(models).forEach((key: string) => {
  const model = models[key];

  model.associate(models);
});
