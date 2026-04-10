import { Request, Response, NextFunction } from 'express';
import { ClassErrorMiddleware, Controller, Get, Post } from '../overnightjs/core/lib/decorators';
import { BAD_REQUEST, NO_CONTENT, NOT_FOUND, OK, UNAUTHORIZED } from 'http-status-codes';
import * as WebHooksService from '../services/WebHooksService';
import * as JobService from '../services/JobService';
// import * as TenantService from '../services/TenantService';
import * as NotificationService from '../services/NotificationService';
import * as BookingSettingService from '../services/BookingSettingService';
import * as AwsService from '../services/AwsService';
import * as TenantService from '../services/TenantService';

import Logger from '../Logger';
import { sendMessageWhatsApp } from '../utils';
import { WADataresponseModel } from '../typings/ResponseFormats';
import globalErrorHandler from '../globalErrorHandler';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';
import { BookingSettingCode } from '../database/models/BookingSetting';
import { getByServiceNumber } from '../services/ServiceService';

const LOG = new Logger('WebHooksController.ts');

@Controller('api/webhooks')
@ClassErrorMiddleware(globalErrorHandler)
export class WebHooksController {
  @Get('')
  private async get(req: Request<void, void, void>, res: Response, next: NextFunction) {
    try {
      const verify_token = process.env.VERIFY_TOKEN_WA;

      // Parse params from the webhook verification request
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      // Check if a token and mode were sent
      if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === verify_token) {
          // Respond with 200 OK and challenge token from the request
          console.log('WEBHOOK_VERIFIED');
          return res.status(OK).send(challenge);
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          return res.sendStatus(403);
        }
      }

      return res.status(OK);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
  //old flow
  // @Post('')
  // private async add(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const { object, entry } = req.body;

  //     if (!object) {
  //       return next('Object not found');
  //     }

  //     if (entry) {
  //       if (
  //         entry[0].changes &&
  //         entry[0].changes[0] &&
  //         entry[0].changes[0].value.messages &&
  //         entry[0].changes[0].value.messages[0] &&
  //         entry[0].changes[0].value.messages[0].context
  //       ) {
  //         const from = entry[0].changes[0].value.messages ? entry[0].changes[0].value.messages[0].from : ''; // extract the phone number from the webhook payload
  //         const wamid: string = entry[0].changes[0].value.messages[0].context.id; // extract the message text from the webhook payload

  //         if (wamid && from && entry[0].changes[0].value.messages[0].type && entry[0].changes[0].value.messages[0].type == 'button') {
  //           const text = entry[0].changes[0].value.messages[0].button.text;
  //           const { TenantKey, JobId, status } = await WebHooksService.getWAJob(wamid);
  //           // let tenant;
  //           // if (TenantKey) {
  //           //   tenant = await TenantService.getTenant(TenantKey.toLocaleUpperCase());
  //           // }
  //           // const tenantName = tenant ? tenant.name : TenantKey;
  //           let entityName = '';
  //           let clientId = 0;
  //           let serviceId = 0;
  //           if (TenantKey && JobId) {
  //             const { jobDetail } = await JobService.getJobDetailForWa(TenantKey, JobId);
  //             entityName = jobDetail ? jobDetail.entityName : '-';
  //             clientId = jobDetail ? jobDetail.clientId : 0;
  //             serviceId = jobDetail ? jobDetail.serviceId : 0;
  //           }

  //           let title = '';
  //           let body = '';

  //           if (status === 'sending') {
  //             if (text === 'Yes') {
  //               title = 'Job Confirmed';
  //               body = `Job #${JobId} is Confirmed! Please assign technician to job.`;
  //               // Send messages using WA
  //               const messageData: WADataresponseModel = {
  //                 messaging_product: 'whatsapp',
  //                 to: from,
  //                 type: 'template',
  //                 template: {
  //                   name: 'job_confirm',
  //                   language: { code: 'en_US' }
  //                 }
  //               };

  //               sendMessageWhatsApp(messageData);

  //               await JobService.updateJobStatusByWa(TenantKey, JobId, 'CONFIRMED');
  //               await WebHooksService.editWAJob(wamid, 'Yes');
  //               // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //               const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'CONFIRMED', JobId);
  //               await NotificationService.sendAdminNotif(
  //                 TenantKey,
  //                 { title, body },
  //                 { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'CONFIRMED' }
  //               );
  //             }

  //             if (text === 'No') {
  //               title = 'Reschedule Job';
  //               body = `Customer request to reschedule Job #${JobId}! Please contact customer to reschedule.`;

  //               // Send messages using WA
  //               const messageData = {
  //                 messaging_product: 'whatsapp',
  //                 to: from,
  //                 type: 'template',
  //                 template: {
  //                   name: 'job_cancel',
  //                   language: { code: 'en_US' },
  //                   components: [
  //                     {
  //                       type: 'body',
  //                       parameters: [{ type: 'text', text: entityName }]
  //                     }
  //                   ]
  //                 }
  //               };

  //               sendMessageWhatsApp(messageData);
  //               await WebHooksService.editWAJob(wamid, 'No');
  //               // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //               const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'RESCHEDULE', JobId);
  //               await NotificationService.sendAdminNotif(
  //                 TenantKey,
  //                 { title, body },
  //                 { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'RESCHEDULE' }
  //               );
  //             }

  //             if (text === 'callback') {
  //               title = 'Callback Requested';
  //               body = `Customer requested a callback for Job #${JobId}. Please contact the customer.`;

  //               // Send messages using WA
  //               const messageData: WADataresponseModel = {
  //                 messaging_product: 'whatsapp',
  //                 to: from,
  //                 type: 'template',
  //                 template: {
  //                   name: 'job_callback',
  //                   language: { code: 'en_US' }
  //                 }
  //               };
  //               sendMessageWhatsApp(messageData);

  //               // Optionally tag this WA job state so you can track it
  //               await WebHooksService.editWAJob(wamid, 'Callback');

  //               // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //               const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'CALLBACK', JobId);
  //               await NotificationService.sendAdminNotif(
  //                 TenantKey,
  //                 { title, body },
  //                 { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'CALLBACK' }
  //               );
  //             }

  //             if (text === 'reschedule') {
  //               if (TenantKey && JobId && clientId) {
  //                 const bookingLink = await WebHooksService.generateJobLinkJwt(TenantKey, Number(clientId), Number(JobId));

  //                 // Send messages using WA
  //                 const messageData: WADataresponseModel = {
  //                   messaging_product: 'whatsapp',
  //                   to: from,
  //                   type: 'template',
  //                   template: {
  //                     name: 'job_booking_reschedule',
  //                     language: { code: 'en_US' },
  //                     components: [
  //                       {
  //                         type: 'body',
  //                         parameters: [
  //                           { type: 'text', text: entityName },
  //                           { type: 'text', text: bookingLink }
  //                         ]
  //                       }
  //                     ]
  //                   }
  //                 };
  //                 sendMessageWhatsApp(messageData);

  //                 // Optionally tag this WA job state so you can track it
  //                 await WebHooksService.editWAJob(wamid, 'Reschedule');
  //               }
  //             }
  //           } else if (status === 'Yes') {
  //             if (text === 'No') {
  //               title = 'Reschedule Job';
  //               body = `Customer request to reschedule Job #${JobId}! Please contact customer to reschedule.`;

  //               // Send messages using WA
  //               const messageData = {
  //                 messaging_product: 'whatsapp',
  //                 to: from,
  //                 type: 'template',
  //                 template: {
  //                   name: 'job_confirm_to_cancel',
  //                   language: { code: 'en_US' },
  //                   components: [
  //                     {
  //                       type: 'body',
  //                       parameters: [{ type: 'text', text: entityName }]
  //                     }
  //                   ]
  //                 }
  //               };

  //               sendMessageWhatsApp(messageData);
  //               await WebHooksService.editWAJob(wamid, 'No');
  //               // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //               const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'RESCHEDULE', JobId);
  //               await NotificationService.sendAdminNotif(
  //                 TenantKey,
  //                 { title, body },
  //                 { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'RESCHEDULE' }
  //               );
  //             }
  //           } else if (status === 'No') {
  //             if (text === 'Yes') {
  //               title = 'Customer request to Confirm';
  //               body = `Customer is requesting to confirm Job #${JobId}! Please contact customer to confirm.`;

  //               // Send messages using WA
  //               const messageData = {
  //                 messaging_product: 'whatsapp',
  //                 to: from,
  //                 type: 'template',
  //                 template: {
  //                   name: 'job_cancel_to_confirm',
  //                   language: { code: 'en_US' },
  //                   components: [
  //                     {
  //                       type: 'body',
  //                       parameters: [{ type: 'text', text: entityName }]
  //                     }
  //                   ]
  //                 }
  //               };

  //               sendMessageWhatsApp(messageData);
  //               await WebHooksService.editWAJob(wamid, 'Yes');
  //               // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //               const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'PENDING CONFIRMED', JobId);
  //               await NotificationService.sendAdminNotif(
  //                 TenantKey,
  //                 { title, body },
  //                 { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'PENDING CONFIRMED' }
  //               );
  //             }
  //           }
  //         }

  //         return res.status(OK).json('Success');
  //       } else {
  //         const from = entry[0].changes[0].value.messages ? entry[0].changes[0].value.messages[0].from : ''; // extract the phone number from the webhook payload

  //         if (from) {
  //           const messageData: WADataresponseModel = {
  //             messaging_product: 'whatsapp',
  //             to: from,
  //             type: 'template',
  //             template: {
  //               name: 'uninteractive_message',
  //               language: { code: 'en_US' }
  //             }
  //           };

  //           sendMessageWhatsApp(messageData);
  //         }
  //         return res.status(OK).json('Success');
  //       }
  //     }
  //   } catch (err) {
  //     LOG.error(err);
  //     return next(err);
  //   }
  // }

  //new flow

  @Post('')
  private async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { object, entry } = req.body;

      // If payload format is wrong, just ACK so WA doesn't retry
      if (!object) {
        LOG.warn('[WA webhook] object not found in payload');
        return res.status(OK).json('Success');
      }

      if (!entry || !entry[0] || !entry[0].changes || !entry[0].changes[0]) {
        LOG.warn('[WA webhook] entry/changes missing in payload');
        return res.status(OK).json('Success');
      }

      const change = entry[0].changes[0];
      const value = change.value;

      const hasInteractiveContext = value && value.messages && value.messages[0] && value.messages[0].context;

      // =========================
      // 1) Interactive (buttons)
      // =========================
      if (hasInteractiveContext) {
        const message = value.messages[0];
        const from = message.from || ''; // phone number
        const wamid: string = message.context.id; // original message id
        const type = message.type;

        if (wamid && from && type === 'button') {
          const text: string = message.button?.text;

          const { TenantKey, JobId, status } = await WebHooksService.getWAJob(wamid);

          let entityName = '';
          let clientId = 0;
          let serviceId = 0;
          let entityCountryCode = '';
          let entityContactNumber = '';

          if (TenantKey && JobId) {
            const { jobDetail } = await JobService.getJobDetailForWa(TenantKey, JobId);
            entityName = jobDetail ? jobDetail.entityName : '-';
            clientId = jobDetail ? jobDetail.clientId : 0;
            serviceId = jobDetail ? jobDetail.serviceId : 0;
            entityCountryCode = jobDetail ? jobDetail.entityCountryCode : '';
            entityContactNumber = jobDetail ? jobDetail.entityContactNumber : '';
          }

          let title = '';
          let body = '';

          // ========== status: sending ==========
          if (status === 'sending') {
            // --- Old Logic: Yes / No ---
            if (text === 'Yes') {
              title = 'Job Confirmed';
              body = `Job #${JobId} is Confirmed! Please assign technician to job.`;

              const messageData: WADataresponseModel = {
                messaging_product: 'whatsapp',
                to: from,
                type: 'template',
                template: {
                  name: 'job_confirm',
                  language: { code: 'en_US' }
                }
              };

              sendMessageWhatsApp(messageData);

              await JobService.updateJobStatusByWa(TenantKey, JobId, 'CONFIRMED');
              await WebHooksService.editWAJob(wamid, 'Yes');

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'CONFIRMED', JobId);
              await NotificationService.sendAdminNotif(
                TenantKey,
                { title, body },
                { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'CONFIRMED' }
              );
            }

            if (text === 'No') {
              title = 'Reschedule Job';
              body = `Customer request to reschedule Job #${JobId}! Please contact customer to reschedule.`;

              const messageData = {
                messaging_product: 'whatsapp',
                to: from,
                type: 'template',
                template: {
                  name: 'job_cancel',
                  language: { code: 'en_US' },
                  components: [
                    {
                      type: 'body',
                      parameters: [{ type: 'text', text: entityName }]
                    }
                  ]
                }
              };

              sendMessageWhatsApp(messageData);
              await WebHooksService.editWAJob(wamid, 'No');

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'RESCHEDULE', JobId);
              await NotificationService.sendAdminNotif(
                TenantKey,
                { title, body },
                { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'RESCHEDULE' }
              );
            }

            // --- New Logic: CONFIRM / REQ CALLBACK / RESCHEDULE / CHOOSE DATE ---

            if (text === 'CONFIRM') {
              title = 'Job Confirmed';
              body = `Job #${JobId} is Confirmed! Please assign technician to job.`;

              const messageData: WADataresponseModel = {
                messaging_product: 'whatsapp',
                to: from,
                type: 'template',
                template: {
                  name: 'job_confirm',
                  language: { code: 'en_US' }
                }
              };

              sendMessageWhatsApp(messageData);

              await JobService.updateJobStatusByWa(TenantKey, JobId, 'CONFIRMED');
              await WebHooksService.editWAJob(wamid, 'CONFIRMED');

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'CONFIRMED', JobId);
              await NotificationService.sendAdminNotif(
                TenantKey,
                { title, body },
                { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'CONFIRMED' }
              );
            }

            if (text === 'REQ CALLBACK') {
              title = 'Req Callback';
              body = `Customer has requested a callback regarding their appointment for Job #${JobId}. Please contact the customer.`;

              const messageData = {
                messaging_product: 'whatsapp',
                to: from,
                type: 'template',
                template: {
                  name: 'job_req_callback',
                  language: { code: 'en' },
                  components: [
                    {
                      type: 'body',
                      parameters: [{ type: 'text', text: entityName }]
                    }
                  ]
                }
              };

              sendMessageWhatsApp(messageData);
              await WebHooksService.editWAJob(wamid, 'CALLBACK');

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'CALLBACK', JobId);
              await NotificationService.sendAdminNotif(
                TenantKey,
                { title, body },
                { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'CALLBACK' }
              );
            }

            if (text === 'RESCHEDULE' || text === 'CHOOSE DATE') {
              if (TenantKey && JobId && clientId) {
                title = 'Reschedule';
                body = `Customer reschedule Job #${JobId}. Please check the job later.`;

                const bookingLink = await WebHooksService.generateJobLinkJwt(TenantKey, Number(clientId), Number(serviceId));

                const message = `You have requested to reschedule your appointment. 👉 Please click this link to choose your preferred time slot: ${bookingLink}. If you have any questions, please contact ${entityName} at ${entityCountryCode}${entityContactNumber}.`;

                const messageData: WADataresponseModel = {
                  messaging_product: 'whatsapp',
                  to: from,
                  type: 'template',
                  template: {
                    name: 'job_appointment_reschedule',
                    language: { code: 'en' },
                    components: [
                      {
                        type: 'body',
                        parameters: [{ type: 'text', text: message }]
                      }
                    ]
                  }
                };

                sendMessageWhatsApp(messageData);

                await WebHooksService.editWAJob(wamid, 'RESCHEDULE');

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'RESCHEDULE', JobId);
                await NotificationService.sendAdminNotif(
                  TenantKey,
                  { title, body },
                  { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'RESCHEDULE' }
                );
              }
            }

            // ========== status: Yes ==========
          } else if (status === 'Yes') {
            if (text === 'No') {
              title = 'Reschedule Job';
              body = `Customer request to reschedule Job #${JobId}! Please contact customer to reschedule.`;

              const messageData = {
                messaging_product: 'whatsapp',
                to: from,
                type: 'template',
                template: {
                  name: 'job_confirm_to_cancel',
                  language: { code: 'en_US' },
                  components: [
                    {
                      type: 'body',
                      parameters: [{ type: 'text', text: entityName }]
                    }
                  ]
                }
              };

              sendMessageWhatsApp(messageData);
              await WebHooksService.editWAJob(wamid, 'No');

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'RESCHEDULE', JobId);
              await NotificationService.sendAdminNotif(
                TenantKey,
                { title, body },
                { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'RESCHEDULE' }
              );
            }

            // ========== status: No ==========
          } else if (status === 'No') {
            if (text === 'Yes') {
              title = 'Customer request to Confirm';
              body = `Customer is requesting to confirm Job #${JobId}! Please contact customer to confirm.`;

              const messageData = {
                messaging_product: 'whatsapp',
                to: from,
                type: 'template',
                template: {
                  name: 'job_cancel_to_confirm',
                  language: { code: 'en_US' },
                  components: [
                    {
                      type: 'body',
                      parameters: [{ type: 'text', text: entityName }]
                    }
                  ]
                }
              };

              sendMessageWhatsApp(messageData);
              await WebHooksService.editWAJob(wamid, 'Yes');

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const newNotification: any = await NotificationService.createNotification(TenantKey, title, body, 'PENDING CONFIRMED', JobId);
              await NotificationService.sendAdminNotif(
                TenantKey,
                { title, body },
                { notifId: String(newNotification[0].id), JobId: String(JobId), type: 'PENDING CONFIRMED' }
              );
            }

            // ========== status: already processed / others ==========
          } else {
            // ❗ NEW: avoid double reply when status already RESCHEDULE/CALLBACK/CONFIRMED
            if (['RESCHEDULE', 'CALLBACK', 'CONFIRMED'].includes(status)) {
              const messageData: WADataresponseModel = {
                messaging_product: 'whatsapp',
                to: from,
                type: 'template',
                template: {
                  name: 'already_selected_message',
                  language: { code: 'en' },
                  components: [
                    {
                      type: 'body',
                      parameters: [
                        { type: 'text', text: entityName },
                        { type: 'text', text: `${entityCountryCode}${entityContactNumber}` }
                      ]
                    }
                  ]
                }
              };

              sendMessageWhatsApp(messageData);
            }
          }
        }

        // ACK interactive webhook
        return res.status(OK).json('Success');
      }

      // =========================
      // 2) Non-interactive message
      // =========================
      const from = entry[0].changes[0].value.messages && entry[0].changes[0].value.messages[0] ? entry[0].changes[0].value.messages[0].from : '';

      if (from) {
        const messageData: WADataresponseModel = {
          messaging_product: 'whatsapp',
          to: from,
          type: 'template',
          template: {
            name: 'uninteractive_message',
            language: { code: 'en_US' }
          }
        };

        sendMessageWhatsApp(messageData);
      }

      return res.status(OK).json('Success');
    } catch (err) {
      LOG.error('[WA webhook error]' + err);
      // For webhooks, still return 200 so WA doesn't retry same event
      return res.status(OK).json('Success');
    }
  }

  @Post('test')
  private async test(req: Request, res: Response, next: NextFunction) {
    try {
      const { TenantKey, JobId } = req.body;

      const message = { title: 'Job Confirmed', body: 'Confirmed!' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a: any = await NotificationService.createNotification(TenantKey, 'aaa', 'bidy', 'CONFIRMED', JobId);
      await NotificationService.sendAdminNotif(TenantKey, message, { notifId: String(a[0].id), JobId: String(JobId), type: 'CONFIRMED' });
      return res.status(OK).json('Success');
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('tenant/:domain')
  private async getTenantByDomain(req: Request, res: Response, next: NextFunction) {
    try {
      const { domain } = req.params;
      const tenant = await TenantService.getTenantByDomain(domain);

      return res.status(OK).json(tenant.key.toLowerCase());
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('booking-setting/:tenant')
  private async getBookingSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, cd }: PaginationQueryParams = req.query;
      const { tenant } = req.params;

      const settings = await BookingSettingService.getSettings(q, cd, tenant);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: Record<string, any> = {};

      for (const setting of settings) {
        result[setting.label] = setting.value;
        if (setting.code === BookingSettingCode.LOGO) {
          result['LogoUrl'] = await AwsService.s3BucketGetSignedUrl(setting.value, 'booking_settings', tenant);
        }
        if (setting.code === BookingSettingCode.INCLUDE_PUBLIC_HOLIDAY) {
          result['IncludePublicHoliday'] = setting.value === 'true';
        }
      }

      return res.status(OK).json(result);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('booking-timeslots/:tenant')
  private async getBookingTimeSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenant } = req.params;
      const { sd } = req.query;

      const slots = await BookingSettingService.getAvailableTimeSlots(tenant, sd.toString());
      return res.status(OK).json(slots);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Get('booking/:tenant/:serviceNumber')
  private async getByServiceNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenant, serviceNumber } = req.params;
      const [service] = await getByServiceNumber(tenant, Number(serviceNumber));

      if (!service) {
        return res.status(NOT_FOUND).json({ code: 404, message: 'Service not found' });
      }
      return res.status(OK).json(service);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('booking-link')
  private async generateBookingLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantKey, clientId, jobId } = req.body;

      const bookingLink = await WebHooksService.generateJobLinkJwt(tenantKey, Number(clientId), Number(jobId));

      return res.status(OK).json({ bookingLink });
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }

  @Post('booking-link/verify')
  private async verifyBookingLink(req: Request, res: Response, next: NextFunction) {
    try {
      // Accept token from either body.token or query ?t=...
      const token = (req.body?.token as string) || (req.query?.t as string);
      const payload = await WebHooksService.verifyJobLinkJwt(token);
      return res.status(OK).json(payload); // { tenantKey, customerId, jobId }
    } catch (err) {
      const status = err?.status ?? UNAUTHORIZED;
      // Map known codes to better HTTP codes if you like:
      if (err?.code === 'TOKEN_EXPIRED') return res.status(UNAUTHORIZED).json({ message: 'Link expired' });
      if (err?.code === 'TOKEN_INVALID') return res.status(UNAUTHORIZED).json({ message: 'Invalid token' });
      if (err?.code === 'TENANT_NOT_FOUND') return res.status(NOT_FOUND).json({ message: 'Tenant not found' });
      if (err?.code === 'TOKEN_PAYLOAD_INVALID') return res.status(BAD_REQUEST).json({ message: 'Invalid payload' });

      return next(err);
    }
  }

  @Post('booking/:tenant')
  private async storeJobBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenant } = req.params;
      await WebHooksService.storeJobBooking(tenant, req.body);
      return res.sendStatus(NO_CONTENT);
    } catch (err) {
      LOG.error(err);
      return next(err);
    }
  }
}
