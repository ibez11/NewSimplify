import { FC, Fragment, useEffect, useState } from 'react';
import { Button, Card, CardHeader, CardContent, Divider, Grid, makeStyles, Theme, Typography, Tooltip, IconButton } from '@material-ui/core';

import Skeleton from 'react-loading-skeleton';
import EditIcon from '@material-ui/icons/Edit';
import MarkerIcon from '@material-ui/icons/LocationOn';

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
  CardContent: { padding: 0, maxHeight: 500, flexGrow: 1, overflowY: 'scroll', overflowX: 'hidden' },
  grid: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  divider: { margin: theme.spacing(2), marginBottom: theme.spacing(1) }
}));

const ClientLocation: FC<Props> = props => {
  const classes = useStyles();
  const { clients, isLoading, setOpenForm, setEditType } = props;

  const [clientBillingAddress, setClientBillingAddress] = useState<string>('');
  const [clientBillingPostal, setClientBillingPostal] = useState<string>('');
  const [serviceAddresses, setServiceAddresses] = useState<ServiceAddressModel[]>([]);

  useEffect(() => {
    const { billingAddress, billingPostal, ServiceAddresses } = clients!;

    setClientBillingAddress(billingAddress);
    setClientBillingPostal(billingPostal);
    setServiceAddresses(ServiceAddresses);
  }, [clients]);

  const handleOpenEditLocation = () => {
    setOpenForm(true);
    setEditType('location');
  };

  return (
    <Grid item xs={4}>
      <Card variant='outlined' className={classes.card}>
        <CardHeader
          className={classes.cardHeader}
          title={
            <Grid container alignItems='center'>
              <Grid item xs={12} md={7}>
                <Typography variant='h4'>Location Address</Typography>
              </Grid>
              <Grid item container xs={12} md={5} justify='flex-end'>
                <Button color='primary' disableElevation startIcon={<EditIcon />} onClick={handleOpenEditLocation}>
                  Edit Address
                </Button>
              </Grid>
            </Grid>
          }
        />
        <Divider />
        <CardContent className={classes.CardContent}>
          <Grid container spacing={2} className={classes.grid}>
            <Grid item xs={11}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Billing Address
              </Typography>
              {isLoading ? (
                <Skeleton width={'80%'} />
              ) : (
                <Typography variant='subtitle2' style={{ whiteSpace: 'pre-line' }}>
                  {clientBillingAddress}
                  <Tooltip title='Open Map'>
                    <IconButton color='primary' href={'https://maps.google.com/maps?q=Singapore ' + clientBillingPostal} target={'_blank'} size='small'>
                      <MarkerIcon color='primary' />
                    </IconButton>
                  </Tooltip>
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1' color='textSecondary' gutterBottom>
                Postal Code
              </Typography>
              {isLoading ? <Skeleton width={'20%'} /> : <Typography variant='subtitle2'>{clientBillingPostal}</Typography>}
            </Grid>
          </Grid>
          <Divider className={classes.divider} />
          {isLoading ? (
            <>
              <Grid container spacing={1} className={classes.grid}>
                <Grid item xs={12}>
                  <Typography variant='h5' gutterBottom>
                    Service Address 1
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Skeleton width={'80%'} />
                </Grid>
              </Grid>
            </>
          ) : (
            serviceAddresses.length > 0 &&
            serviceAddresses.map((value, index) => {
              return (
                <Fragment key={`location-${index}`}>
                  <Grid container spacing={1} className={classes.grid}>
                    <Grid item xs={12}>
                      <Typography variant='h5' gutterBottom>
                        Service Address {index + 1}
                      </Typography>
                    </Grid>
                    <Grid item container xs={11}>
                      <Grid item xs={12}>
                        <Typography variant='body1' color='textSecondary' gutterBottom>
                          Address
                        </Typography>
                        <Typography variant='subtitle2' gutterBottom style={{ whiteSpace: 'pre-line' }}>
                          {value.address}
                          <Tooltip title='Open Map'>
                            <IconButton color='primary' href={'https://maps.google.com/maps?q=Singapore ' + value.postalCode} target={'_blank'} size='small'>
                              <MarkerIcon color='primary' />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid item container xs={12}>
                      <Grid item xs={12}>
                        <Typography variant='body1' color='textSecondary' gutterBottom>
                          Postal Code
                        </Typography>
                        <Typography variant='subtitle2' gutterBottom style={{ whiteSpace: 'pre-line' }}>
                          {value.postalCode}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {index !== serviceAddresses.length - 1 && <Divider className={classes.divider} />}
                </Fragment>
              );
            })
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};
export default ClientLocation;
