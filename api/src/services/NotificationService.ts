import admin from '../config/firebase';
import Logger from '../Logger';
import Notification from '../database/models/Notification';
import * as NotificationDao from '../database/dao/NotificationDao';
import * as UserProfileDao from '../database/dao/UserProfileDao';
// import NotificationNotFoundError from '../errors/NotificationNotFoundError';

const LOG = new Logger('NotificationService');

interface Data {
  [keys: string]: string;
}

const optionsMessage = {
  priority: 'high',
  timeToLive: 0
};

/**
 * Search Notification with query and optional pagination
 *
 * @param offset offset for pagination search
 * @param limit limit for pagination search
 * @param q query for searching
 *
 * @returns the total counts and the data for current page
 */
export const searchNotificationWithPagination = async (
  offset: number,
  limit?: number,
  q?: string
): Promise<{ rows: Notification[]; count: number }> => {
  LOG.debug('Searching Notification with Pagination');

  return await NotificationDao.getPaginated(offset, limit, q);
};

/**
 * Create a new Notification in the system, based on user input
 *
 * @param title of the new Notification
 * @param description of the new Notification
 *
 * @returns NotificationResponseModel
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const createNotification = async (TenantKey: string, title: string, description: string, type: string, jobId: number) => {
  LOG.debug('Creating Notification');

  try {
    const Notification = await NotificationDao.createNotification(TenantKey, title, description, type, jobId);
    return Notification[0];
  } catch (err) {
    throw err;
  }
};

/**
 * To Edit a Notification in the system, based on user choose and inputed new data
 *
 * @param id of Notification
 * @param status of the Notification
 *
 * @returns void
 */
export const editIndividualNotification = async (id: number, status: string, userId?: number): Promise<Notification> => {
  LOG.debug('Editing Notification');
  const notification = await NotificationDao.getNotificationById(id);

  let resolvedBy = undefined;
  if (status == 'resolved' && userId) {
    const userProfile = await UserProfileDao.getById(userId);
    resolvedBy = userProfile.displayName;
  }

  try {
    return await notification.update({ status, resolvedBy });
  } catch (err) {
    throw err;
  }
};

export const editStatusNotification = async (q: string, status: string): Promise<void> => {
  LOG.debug('Editing Notification');

  try {
    return await NotificationDao.updateStatusNotification(q, status);
  } catch (err) {
    throw err;
  }
};

export const sendTechnicianNotif = async (token: string, message: { title: string; body: string }, data: Data): Promise<void> => {
  try {
    if (!token) {
      return;
    }

    const payload = {
      notification: {
        title: message.title,
        body: message.body
      },
      data,
      android: {
        notification: {
          sound: 'default'
        },
        data
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          },
          data
        }
      },
      token
    };

    const request = await admin
      .messaging()
      .send(payload)
      .then(function(response) {
        console.log('Successfully sent message:', response);
      })
      .catch(function(error) {
        console.log('Error sending message:', error);
      });

    return request;
  } catch (error) {
    throw error;
  }
};

export const sendAdminNotif = async (tenatKey: string, message: { title: string; body: string }, data: Data): Promise<void> => {
  try {
    const { CORS_WHITELIST_ORIGIN } = process.env;
    const activeAdmin = await UserProfileDao.getAdminTokens(tenatKey);
    const tokens = activeAdmin.filter(value => value.token).map(value => value.token);

    const payload = {
      webpush: {
        notification: {
          sound: 'default'
        },
        data: {
          ...data,
          title: message.title,
          body: message.body,
          icon: `${CORS_WHITELIST_ORIGIN}/favicon.png`,
          url: `${CORS_WHITELIST_ORIGIN}/jobs/${data.JobId}`
        }
      }
    };

    const requests = tokens.map(token =>
      admin.messaging().send({
        token,
        ...payload
      })
    );
    const responses = await Promise.all(requests);

    responses.forEach(response => console.log('Successfully sent message:', response));
  } catch (error) {
    throw error;
  }
};
