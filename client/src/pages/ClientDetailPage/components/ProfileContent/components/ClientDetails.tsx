import { FC, useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardContent, Divider, Grid, makeStyles, Theme, Typography } from '@material-ui/core';

import Skeleton from 'react-loading-skeleton';
import EditIcon from '@material-ui/icons/Edit';
import { ucWords } from 'utils';
import theme from 'theme';

interface Props {
  clients: ClientDetailsModel;
  isLoading: boolean;
  setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
  setEditType: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: 10
  },
  cardHeader: {
    padding: theme.spacing(2)
  },
  CardContent: { padding: 0, height: 500, maxHeight: 500, flexGrow: 1, overflowY: 'scroll', overflowX: 'hidden' },
  actionIcon: {
    fontSize: 20,
    marginRight: 4
  },
  grid: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2)
  }
}));

const ClientDetails: FC<Props> = props => {
  const classes = useStyles();
  const { clients, isLoading, setOpenForm, setEditType } = props;

  const [clientName, setClientName] = useState<string>('');
  const [clientTypes, setClientTypes] = useState<string>('RESIDENTIAL');
  const [clientRemarks, setClientRemarks] = useState<string>('');
  const [clientAgentName, setClientAgentName] = useState<string>('');
  const [clientWAReminder, setClientWAReminder] = useState<boolean>(false);
  const [clientEmailReminder, setClientEmailReminder] = useState<boolean>(false);
  const [clientJobReportReminder, setClientJobReportReminder] = useState<boolean>(false);
  const [clientPriceReportVisibility, setClientPriceReportVisibility] = useState<boolean>(false);

  useEffect(() => {
    const { name, clientType, remarks, Agent, emailReminder, whatsAppReminder, emailJobReport, priceReportVisibility } = clients!;

    setClientName(name);
    setClientTypes(clientType);
    setClientRemarks(remarks);
    setClientAgentName(Agent ? Agent.name : '-');
    setClientEmailReminder(emailReminder ? emailReminder : false);
    setClientWAReminder(whatsAppReminder ? whatsAppReminder : false);
    setClientJobReportReminder(emailJobReport ? emailJobReport : false);
    setClientPriceReportVisibility(priceReportVisibility ? priceReportVisibility : false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  const handleOpenEditDetail = () => {
    setOpenForm(true);
    setEditType('details');
  };

  return (
    <Grid item xs={4}>
      <Card variant='outlined' className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          title={
            <Grid container alignItems='center'>
              <Grid item xs={12} md={7}>
                <Typography variant='h4'>Client Details</Typography>
              </Grid>
              <Grid item container xs={12} md={5} justify='flex-end'>
                <Button color='primary' disableElevation startIcon={<EditIcon />} onClick={handleOpenEditDetail}>
                  Edit Details
                </Button>
              </Grid>
            </Grid>
          }
        />
        <Divider />
        <CardContent className={classes.CardContent}>
          <Grid container spacing={2} className={classes.grid}>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Client Name
              </Typography>
              {isLoading ? <Skeleton width={'80%'} /> : <Typography variant='subtitle2'>{clientName}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Client Type
              </Typography>
              {isLoading ? <Skeleton width={'30%'} /> : <Typography variant='subtitle2'>{ucWords(clientTypes)}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Client Agent
              </Typography>
              {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle2'>{clientAgentName}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Email Job Report
              </Typography>
              {isLoading ? (
                <Skeleton width={'20%'} />
              ) : (
                <Typography variant='subtitle2'>{ucWords(clientJobReportReminder ? 'Active' : 'Inactive')}</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Email Appointment Reminder
              </Typography>
              {isLoading ? (
                <Skeleton width={'20%'} />
              ) : (
                <Typography variant='subtitle2'>{ucWords(clientEmailReminder ? 'Active' : 'Inactive')}</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                WhatsApp Appointment Confirmation
              </Typography>
              {isLoading ? (
                <Skeleton width={'20%'} />
              ) : (
                <Typography variant='subtitle2'>{ucWords(clientWAReminder ? 'Active' : 'Inactive')}</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Price Visibilty on Job Report
              </Typography>
              {isLoading ? (
                <Skeleton width={'20%'} />
              ) : (
                <Typography variant='subtitle2'>{ucWords(clientPriceReportVisibility ? 'Show' : 'Hide')}</Typography>
              )}
            </Grid>
            <Grid item xs={12} style={{ marginBottom: theme.spacing(2) }}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Client Remarks
              </Typography>
              {isLoading ? (
                <Skeleton width={'80%'} />
              ) : (
                <Typography variant='h6' style={{ whiteSpace: 'pre-line' }} gutterBottom>
                  {clientRemarks || '-'}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};
export default ClientDetails;
