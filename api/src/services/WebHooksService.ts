import { ServiceBody } from '../typings/body/ServiceBody';
import * as WebHooksDao from '../database/dao/WebHooksDao';
import Logger from '../Logger';
import { WAJobResponseModel } from '../typings/ResponseFormats';
import * as BookingSettingService from './BookingSettingService';
import UnavailableTimeSlotError from '../errors/UnavailableTimeSlotError';
import { getJobById, updateStartDateTimeJob } from '../database/dao/JobDao';
import { addMinutes, differenceInMinutes, format } from 'date-fns';
import * as NotificationService from './NotificationService';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as TenantService from './TenantService';

const LOG = new Logger('WebHooksService.ts');

export const getWAJob = async (wamid: string): Promise<WAJobResponseModel> => {
  LOG.debug('Get job information detail by id');
  try {
    const result = await WebHooksDao.getWAData(wamid);

    return result;
  } catch (err) {
    throw err;
  }
};

export const editWAJob = async (wamid: string, status: string): Promise<WAJobResponseModel> => {
  LOG.debug('Get job information detail by id');
  try {
    const waJob = await WebHooksDao.getWADataByWamID(wamid);

    return waJob.update({ status: status });
  } catch (err) {
    throw err;
  }
};
export const storeJobBooking = async (tenantKey: string, req: ServiceBody): Promise<void> => {
  LOG.debug('Save Job Booking');

  try {
    // Basic validation: ensure payload has Jobs array
    if (!req || !Array.isArray(req.Jobs)) {
      throw Object.assign(new Error('Invalid payload: Jobs missing'), { status: 400, code: 'JOBS_MISSING' });
    }

    // Validate tenant exists (helps avoid obscure DB/schema errors later)
    const tenant = await TenantService.getTenant(tenantKey?.toUpperCase?.() ?? tenantKey);
    if (!tenant) {
      throw Object.assign(new Error('Tenant not found'), { status: 404, code: 'TENANT_NOT_FOUND' });
    }

    const availabilityResults = (
      await Promise.all(
        req.Jobs.map(async job => {
          if (!job.isConfirmed) return null;

          const isAvailable = await BookingSettingService.isBookingSlotAvailable(job.startDateTime, tenantKey);
          return {
            job,
            isAvailable,
            identifier: format(new Date(job.startDateTime), 'dd MMM yyyy hh:mm a')
          };
        })
      )
    ).filter(Boolean);

    const unavailable = availabilityResults.filter(r => !r.isAvailable);

    if (unavailable.length > 0) {
      const allIdentifiers = unavailable.map(r => r.identifier).join(', ');
      throw new UnavailableTimeSlotError(allIdentifiers);
    }

    await Promise.all(
      req.Jobs.map(async value => {
        if (value.isConfirmed) {
          const job = await getJobById(value.id, tenantKey);
          const duration = differenceInMinutes(new Date(job.endDateTime), new Date(job.startDateTime));
          const newEndDate = format(addMinutes(new Date(value.startDateTime), duration), 'yyyy-MM-dd HH:mm');

          await updateStartDateTimeJob(tenantKey, value.id, value.startDateTime, newEndDate);

          const title = 'Job Confirmed';
          const body = `Job #${value.id} is Confirmed! Please assign technician to job.`;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newNotification: any = await NotificationService.createNotification(tenantKey, title, body, 'CONFIRMED', value.id);
          await NotificationService.sendAdminNotif(
            tenantKey,
            { title, body },
            { notifId: String(newNotification[0].id), JobId: String(value.id), type: 'CONFIRMED' }
          );
        }
      })
    );
  } catch (err) {
    throw err;
  }
};

type JobLinkPayload = {
  tenantKey: string;
  clientId: number;
  jobId: number;
};

export const generateJobLinkJwt = async (tenantKey: string, clientId: number, serviceId: number): Promise<string> => {
  const { DOMAIN } = process.env;
  // const body = {
  //   tenantKey,
  //   clientId,
  //   jobId
  // };

  // Expire in 24 hours
  // const jwtToken = jwt.sign(body, process.env.APP_SECRET as string, { expiresIn: '24h' });

  //get tenant domain
  const tenant = await TenantService.getTenant(tenantKey.toUpperCase());
  const domain = tenant?.domain || DOMAIN;

  const bookingLink = `https://${domain}/reschedule?quotation_id=${serviceId}`;
  // const bookingLink = `https://${domain}/reschedule?t=${jwtToken}`;
  // const bookingLink = `https://booking.simplify.asia/reschedule?t=${jwtToken}`;
  return bookingLink;
};

export const verifyJobLinkJwt = async (token: string): Promise<JobLinkPayload> => {
  if (!token) {
    throw Object.assign(new Error('Missing token'), { status: 400 });
  }

  let decoded: JwtPayload & Partial<JobLinkPayload>;
  try {
    decoded = jwt.verify(token, process.env.APP_SECRET as string, {
      algorithms: ['HS256'],
      clockTolerance: 5 // seconds of leeway for minor clock skew
    }) as JwtPayload & Partial<JobLinkPayload>;
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw Object.assign(new Error('Link expired'), { status: 401, code: 'TOKEN_EXPIRED' });
    }
    throw Object.assign(new Error('Invalid token'), { status: 401, code: 'TOKEN_INVALID' });
  }

  // Basic schema checks
  const tenantKey = String(decoded.tenantKey || '').trim();
  const clientId = Number(decoded.clientId);
  const jobId = Number(decoded.jobId);

  if (!tenantKey || Number.isNaN(clientId) || Number.isNaN(jobId)) {
    throw Object.assign(new Error('Token payload missing required fields'), {
      status: 400,
      code: 'TOKEN_PAYLOAD_INVALID'
    });
  }

  // Optional hardening: make sure tenant exists (and optionally job/customer belong to it)
  const tenant = await TenantService.getTenant(tenantKey.toUpperCase());
  if (!tenant) {
    throw Object.assign(new Error('Tenant not found'), { status: 404, code: 'TENANT_NOT_FOUND' });
  }

  return { tenantKey, clientId, jobId };
};
