import { FC } from 'react';
import { Grid, Typography, Theme, Card, CardHeader, CardContent, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';
import { ClientBody } from 'typings/body/ClientBody';

interface Props {
  client: ClientBody;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: 'auto',
    width: '100%'
  },
  gridContent: {
    marginBottom: theme.spacing(3)
  },
  gridContactPerson: {
    background: '#F5F8FA',
    marginBottom: theme.spacing(2)
  }
}));

const SummrayForm: FC<Props> = props => {
  const classes = useStyles();
  const { client } = props;
  const {
    name,
    clientType,
    agentName,
    remarks,
    emailJobReport,
    whatsAppReminder,
    emailReminder,
    priceReportVisibility,
    billingAddress,
    ServiceAddresses,
    ContactPersons
  } = client;

  return (
    <Card variant='outlined' className={classes.card}>
      <CardHeader title={<Typography variant='subtitle2'>Client Summary</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
      <CardContent>
        <Grid container spacing={1} className={classes.gridContent}>
          <Grid item xs={12}>
            <Typography variant='subtitle2'>Client Information</Typography>
            <Divider style={{ marginTop: 16, marginBottom: 16 }} />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Client name</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{name}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Client type</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{clientType}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Agent name</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{agentName || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Email for job report</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{emailJobReport ? 'Active' : 'Inactive'}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Email for job appointment</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{emailReminder ? 'Active' : 'Inactive'}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Whatsapp for job appointment</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{whatsAppReminder ? 'Active' : 'Inactive'}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Price Visibilty on Job Report</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{priceReportVisibility ? 'Show' : 'Hide'}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Client Remarks</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{remarks || '-'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={1} className={classes.gridContent}>
          <Grid item xs={12}>
            <Typography variant='subtitle2'>Billing & Service Address</Typography>
            <Divider style={{ marginTop: 16, marginBottom: 16 }} />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Billing Address</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{billingAddress}</Typography>
              </Grid>
              {ServiceAddresses.map((value, index) => (
                <>
                  <Grid item xs={12} md={3}>
                    <Typography variant='body1'>Service Address {index + 1}</Typography>
                  </Grid>
                  <Grid item xs={12} md={9}>
                    <Typography variant='body1'>{value.address}</Typography>
                  </Grid>
                </>
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={1} className={classes.gridContent}>
          <Grid item xs={12}>
            <Typography variant='subtitle2'>Contact Information</Typography>
            <Divider style={{ marginTop: 16, marginBottom: 16 }} />
          </Grid>
          <Grid item xs={12} className={classes.gridContactPerson}>
            <Typography variant='subtitle1'>Contact Person 1</Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Person name</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{ContactPersons[0].contactPerson}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Phone number</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{`${ContactPersons[0].countryCode} ${ContactPersons[0].contactNumber}`}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Email address</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{ContactPersons[0].contactEmail || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant='body1'>Descriptions</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant='body1'>{ContactPersons[0].description || '-'}</Typography>
              </Grid>
            </Grid>
          </Grid>
          {ContactPersons.length > 1 &&
            ContactPersons.filter(item => !item.isMain).map((value, index) => (
              <>
                <Grid item xs={12} className={classes.gridContactPerson} style={{ marginTop: 16 }}>
                  <Typography variant='subtitle1'>Contact Person {index + 2}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Typography variant='body1'>Person name</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant='body1'>{value.contactPerson}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='body1'>Phone number</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant='body1'>{`${value.countryCode} ${value.contactNumber}`}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='body1'>Email address</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant='body1'>{value.contactEmail || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='body1'>Descriptions</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography variant='body1'>{value.description || '-'}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SummrayForm;
