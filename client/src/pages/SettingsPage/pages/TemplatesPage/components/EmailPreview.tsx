import { FC, useEffect, useState } from 'react';
import { Card, createStyles, Divider, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import logo from 'images/simplify_logo2C.png';
import asset from 'images/email_asset.png';
import theme from 'theme';
import { format } from 'date-fns';

interface Props {
  type: string;
  emailTemplateBody: string;
  dummyData: any;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rightPaper: {
      padding: theme.spacing(2),
      textAlign: 'justify'
    }
  })
);

const EmailPreview: FC<Props> = props => {
  const classes = useStyles();
  const { type, emailTemplateBody, dummyData } = props;

  const [emailBody, setEmailBody] = useState<string>('');

  useEffect(() => {
    let newBody = '';
    if (type === 'CONTRACT') {
      const replacementValues: Record<string, string> = {
        clientName: dummyData ? dummyData.clientName : 'Dummy Name',
        contactPerson: dummyData ? dummyData.contactPerson : 'Dummy Contact Person',
        serviceAddress: dummyData ? dummyData.serviceAddress : 'Dummy Service Address',
        quotationTitle: dummyData ? dummyData.serviceTitle : 'Dummy Service Title',
        quotationNumber: dummyData ? dummyData.serviceNumber : 'Dummy 001',
        quotationTerm: dummyData ? dummyData.contractTerm : format(new Date(), 'dd-MM-yyyy'),
        quotationAmount: dummyData ? dummyData.contractAmount : '$0'
      };
      newBody = emailTemplateBody.replace(/{([^}]+)}/g, (match, placeholder) => {
        return replacementValues[placeholder] || match;
      });
    } else if (type === 'INVOICE') {
      const replacementValues: Record<string, string> = {
        clientName: dummyData ? dummyData.clientName : 'Dummy Name',
        contactPerson: dummyData ? dummyData.contactPerson : 'Dummy Contact Person',
        invoiceNumber: dummyData ? dummyData.invoiceNumber : 'Dummy Invoice 001',
        termEnd: dummyData ? dummyData.termEnd : format(new Date(), 'dd-MM-yyyy'),
        invoiceAmount: dummyData ? dummyData.invoiceAmount : '$0',
        quotationTitle: dummyData ? dummyData.serviceTitle : 'Dummy Service Title'
      };
      newBody = emailTemplateBody.replace(/{([^}]+)}/g, (match, placeholder) => {
        return replacementValues[placeholder] || match;
      });
    } else if (type === 'JOB') {
      const replacementValues: Record<string, string> = {
        clientName: dummyData ? dummyData.clientName : 'Dummy Name',
        contactPerson: dummyData ? dummyData.contactPerson : 'Dummy Contact Person',
        jobDateTime: dummyData ? dummyData.jobDateTime : format(new Date(), 'dd-MM-yyyy HH:mm a'),
        serviceAddress: dummyData ? dummyData.serviceAddress : 'Dummy Service Address',
        jobSequence: dummyData ? dummyData.jobSequence : '1',
        jobAmount: dummyData ? dummyData.jobAmount : '$0'
      };
      newBody = emailTemplateBody.replace(/{([^}]+)}/g, (match, placeholder) => {
        return replacementValues[placeholder] || match;
      });
    }

    setEmailBody(newBody);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailTemplateBody, dummyData]);

  return (
    <span className={classes.rightPaper}>
      <Grid container spacing={1} style={{ marginBottom: theme.spacing(1) }}>
        <Grid item xs={12}>
          <Typography variant='h5' display='block' gutterBottom>
            Live Preview
          </Typography>
          <Typography color='textSecondary' variant='body1' display='block' gutterBottom>
            You can see email preview here.
          </Typography>
        </Grid>
      </Grid>
      <Card elevation={0} variant='outlined'>
        <Grid container spacing={1} style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={12}>
            <span style={{ background: '#27928a', height: 5, display: 'inherit', borderStartStartRadius: 3, borderStartEndRadius: 3 }} />
          </Grid>
          <Grid item container justify='center' xs={12}>
            <img src={logo} alt='logo' style={{ width: '20%' }} />
          </Grid>
        </Grid>
        <Grid container style={{ background: theme.palette.grey[200] }}>
          <Paper square elevation={0} style={{ margin: theme.spacing(3), marginBottom: 0 }}>
            <Grid>
              <Grid item container justify='center' xs={12}>
                <img src={asset} alt='asset' style={{ width: '40%' }} />
              </Grid>
              <Grid item container justify='center' xs={12}>
                <Typography variant='h4' color='primary'>
                  {type === 'CONTRACT' ? 'Quotation' : type === 'JOB' ? 'Service Report' : 'Invoice'}
                </Typography>
              </Grid>
              <Grid item xs={12} container justify='flex-start'>
                <div
                  dangerouslySetInnerHTML={{ __html: emailBody }}
                  style={{ margin: theme.spacing(2), lineHeight: '20px', whiteSpace: 'pre-line' }}
                ></div>
              </Grid>
              <Divider style={{ marginTop: theme.spacing(1), background: '#27928a', height: 5 }} />
              {dummyData && (
                <>
                  <Grid item container justify='center' xs={12} style={{ background: '#E6F1F5' }}>
                    {dummyData.logoUrl ? (
                      <img src={dummyData.logoUrl} alt='logo' style={{ width: '20%', marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }} />
                    ) : (
                      <Typography variant='h4' align='center' color='textSecondary' gutterBottom>
                        {dummyData.entityName}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item container justify='center' xs={12} style={{ background: '#E6F1F5' }}>
                    <Typography variant='body1' align='center' color='textSecondary' gutterBottom>
                      <span>{dummyData.entityName}</span>
                      <br />
                      <span>{dummyData.entityAddress}</span>
                      <br />
                      <span>
                        Call us: {dummyData.entityPhone} / Email: {dummyData.entityEmail}
                      </span>
                    </Typography>
                  </Grid>
                </>
              )}
              <Divider style={{ background: '#3a8ab8', height: 1 }} />
              <Grid item container justify='center' xs={12} style={{ background: '#E6F1F5' }}>
                <Typography variant='body1' color='textSecondary' gutterBottom>
                  © Simplify All Rights Reserved.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Card>
    </span>
  );
};

export default EmailPreview;
