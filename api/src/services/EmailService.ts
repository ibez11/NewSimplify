import Logger from '../Logger';
import EmailTransporter from '../config/EmailTransporter';

const LOG = new Logger('EmailService.ts');

/**
 * To send forgot password email
 *
 * @param loginName Login name of the user requested for reset password
 * @param displayName Display name of the user requested for reset password
 * @param toEmail Email address of the recepient
 * @param jwt JWT
 */
export const sendForgotPasswordEmail = async (loginName: string, displayName: string, toEmail: string, jwt: string): Promise<void> => {
  const { DOMAIN } = process.env;
  const resetPasswordLink = `https://${DOMAIN}/resetpassword?t=${jwt}`;
  await EmailTransporter.send({
    template: `forgotPassword`,
    message: {
      to: toEmail
    },
    locals: {
      loginName,
      displayName,
      resetPasswordLink
    }
  });

  LOG.debug('Reset Password Link email sent');
};

/**
 * To send reset password email
 *
 * @param loginName Login name of the user requested for reset password
 * @param displayName Display name of the user requested for reset password
 * @param newPassword The newly reset password
 * @param toEmail Email address of the recepient
 */
export const sendResetPasswordEmail = async (loginName: string, displayName: string, newPassword: string, toEmail: string): Promise<void> => {
  await EmailTransporter.send({
    template: `resetPassword`,
    message: {
      to: toEmail
    },
    locals: {
      loginName,
      displayName,
      newPassword
    }
  });

  LOG.debug('Confirm Reset Password email sent');
};

/**
 * To send new user welcome email
 *
 * @param loginName
 * @param displayName
 * @param newPassword
 * @param toEmail
 */
export const sendNewUserWelcomeEmail = async (
  loginName: string,
  displayName: string,
  newPassword: string,
  toEmail: string,
  roleId: number,
  contactNumber?: string
): Promise<void> => {
  const { DOMAIN } = process.env;
  const webAppUrl = `https://${DOMAIN}`;
  const emailBody =
    roleId === 2
      ? `<p>Phone Number: <b>${contactNumber}</b>.</p>`
      : `<p>Email Account: <b>${loginName}</b></p><p>Password: <b>${newPassword}</b></p><p>You can login to system here: <a href="${webAppUrl}">login</a>.</p>`;

  await EmailTransporter.send({
    template: `welcome`,
    message: {
      to: toEmail
    },
    locals: {
      loginName,
      displayName,
      newPassword,
      webAppUrl,
      emailBody
    }
  });

  LOG.debug('Welcome email sent');
};

/**
 * To send client contact person completed job email
 *
 * @param jobId
 * @param entityName
 * @param displayName
 * @param jobTime
 * @param serviceAddress
 * @param unitNo
 * @param postalCode
 * @param toEmail
 * @param jobReportFile
 */
export const sendJobCompletedEmail = async (
  jobId: number,
  entityName: string,
  clientName: string,
  jobTime: string,
  firstLineAddress: string,
  secondLineAddress: string,
  // eslint-disable-next-line
  contactEmail: string[],
  // eslint-disable-next-line
  jobReportFile: any,
  logoUrl: string,
  entityEmail: string,
  entityContactNumber: string,
  entityAddress: string,
  emailBody: string
): Promise<void> => {
  const { EMAIL_FROM_ADDRESS } = process.env;

  await EmailTransporter.send({
    template: `jobCompleted`,
    message: {
      from: `${entityName} <${EMAIL_FROM_ADDRESS}>`,
      to: contactEmail.join(', '),
      // cc: entityEmail,
      subject: `Service Report from ${entityName} for Job ${jobId}`,
      attachments: [
        {
          filename: `Service-report-${jobId}.pdf`,
          contentType: 'application/pdf',
          content: jobReportFile
        }
      ]
    },
    locals: {
      displayName: clientName,
      jobTime,
      firstLineAddress,
      secondLineAddress,
      entityName,
      logoUrl,
      entityEmail,
      entityContactNumber,
      entityAddress,
      emailBody
    }
  });

  LOG.debug('Job Completed email sent');
};

/**
 * To send client contact person invoice email
 *
 * @param clientEmail
 * @param clientName
 * @param invoiceNumber
 * @param invoiceFile
 * @param contractTitle
 * @param invoiceFile
 * @param entityName
 * @param logoUrl
 * @param entityEmail
 * @param entityContactNumber
 * @param entityAddress
 */
export const sendInvoiceEmail = async (
  // eslint-disable-next-line
  contactEmail: string[],
  clientName: string,
  invoiceNumber: string,
  contractTitle: string,
  // eslint-disable-next-line
  invoiceFile: any,
  entityName: string,
  logoUrl: string,
  entityEmail: string,
  entityContactNumber: string,
  entityAddress: string,
  emailBody: string
): Promise<void> => {
  const { EMAIL_FROM_ADDRESS } = process.env;

  await EmailTransporter.send({
    template: `invoice`,
    message: {
      from: `${entityName} <${EMAIL_FROM_ADDRESS}>`,
      to: contactEmail.join(', '),
      // cc: entityEmail,
      subject: `Invoice from ${entityName}`,
      attachments: [
        {
          filename: `${invoiceNumber}-${contractTitle}.pdf`,
          contentType: 'application/pdf',
          content: invoiceFile
        }
      ]
    },
    locals: {
      clientName,
      emailBody,
      entityName,
      logoUrl,
      entityEmail,
      entityContactNumber,
      entityAddress
    }
  });

  LOG.debug('Invoice email sent');
};

/**
 * To send client contact person service email
 *
 * @param clientEmail
 * @param clientName
 * @param serviceNumber
 * @param serviceFile
 * @param contractTitle
 * @param invoiceFile
 * @param entityName
 * @param logoUrl
 * @param entityEmail
 * @param entityContactNumber
 * @param entityAddress
 */
export const sendServiceEmail = async (
  // eslint-disable-next-line
  contactEmail: string[],
  clientName: string,
  serviceNumber: string,
  serviceTitle: string,
  // eslint-disable-next-line
  serviceFile: any,
  entityName: string,
  logoUrl: string,
  entityEmail: string,
  entityContactNumber: string,
  entityAddress: string,
  emailBody: string,
  serviceAddress: string
): Promise<void> => {
  const { EMAIL_FROM_ADDRESS } = process.env;

  await EmailTransporter.send({
    template: `contract`,
    message: {
      from: `${entityName} <${EMAIL_FROM_ADDRESS}>`,
      to: contactEmail.join(', '),
      // cc: entityEmail,
      subject: `${serviceTitle} & ${serviceAddress}`,
      attachments: [
        {
          filename: `${serviceTitle}.pdf`,
          contentType: 'application/pdf',
          content: serviceFile
        }
      ]
    },
    locals: {
      clientName,
      serviceNumber,
      serviceTitle,
      entityName,
      logoUrl,
      entityEmail,
      entityContactNumber,
      entityAddress,
      emailBody
    }
  });

  LOG.debug('Contract email sent');
};
