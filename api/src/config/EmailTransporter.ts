import aws from 'aws-sdk';
import Email from 'email-templates';
import path from 'path';
import nodeMailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { google } from 'googleapis';

const {
  EMAIL_SERVICE,
  EMAIL_ENABLE,
  EMAIL_PREVIEW,
  EMAIL_FROM_ADDRESS,
  EMAIL_AWS_SES_API_VERSION,
  EMAIL_AWS_SES_REGION,
  EMAIL_GMAIL_USER,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PW
} = process.env;

let transport: Mail;

if (EMAIL_SERVICE === 'aws') {
  transport = nodeMailer.createTransport({
    SES: new aws.SES({
      apiVersion: EMAIL_AWS_SES_API_VERSION,
      region: EMAIL_AWS_SES_REGION
    }),
    sendingRate: 1
  });
} else if (EMAIL_SERVICE === 'gmail') {
  const gmailUser = process.env.DOMAIN.includes('dev') ? 'orenda.dev@gmail.com' : EMAIL_GMAIL_USER;
  const clientId = '997069084202-7ptrmrgk20bdhull1kbqhn5hgmjiqq7b.apps.googleusercontent.com';
  const clientSecret = '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';
  const refreshToken = '1//04xM4quKnypLMCgYIARAAGAQSNwF-L9IrGAhxJ4ht29CoqSAz_p6vH7xnmuL0_P7mqntoGl9AbddkE6s0DUT4dtShED_K6mWKbSQ';

  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  const accessToken = async (): Promise<string> => {
    const accessToken = await oauth2Client.getAccessToken();
    return String(accessToken);
  };
  transport = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: gmailUser,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken,
      accessToken: String(accessToken)
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  transport = nodeMailer.createTransport({
    pool: true,
    host: SMTP_HOST,
    port: +SMTP_PORT,
    secure: true, // use TLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PW
    }
  });
}

console.log(path.join(__dirname, '..'));
const EmailTransporter = new Email({
  views: {
    root: `${__dirname}/../emails`
  },
  message: {
    from: EMAIL_FROM_ADDRESS,
    replyTo: EMAIL_FROM_ADDRESS
  },
  transport,
  send: EMAIL_ENABLE === 'true',
  preview: EMAIL_PREVIEW === 'true'
});

export default EmailTransporter;
