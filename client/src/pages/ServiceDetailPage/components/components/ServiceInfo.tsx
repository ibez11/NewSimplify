import { FC, useEffect, useState } from 'react';
import { Button, Card, CardContent, Chip, Divider, Grid, IconButton, Link, Theme, Tooltip, Typography, makeStyles } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import theme from 'theme';
import { format } from 'date-fns';
import { convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { ucWords } from 'utils';
import { ServiceType } from 'constants/enum';
import MUIRichTextEditor from 'mui-rte';
import EditIcon from '@material-ui/icons/Edit';

interface Props {
  isLoading: boolean;
  service: ServiceDetailModel;
  setOpenInvoiceForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    borderRadius: 50,
    padding: theme.spacing(1)
  },
  divider: {
    marginRight: theme.spacing(1)
  },
  highlightGrid: {
    background: theme.palette.grey[200],
    borderRadius: 5,
    padding: theme.spacing(2)
  }
}));

const ServiceInfo: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, service, setOpenInvoiceForm } = props;
  const {
    serviceTitle,
    serviceStatus,
    description,
    id,
    serviceType,
    issueDate,
    expiryDate,
    termStart,
    termEnd,
    needGST,
    gstTax,
    salesPerson,
    skills,
    serviceAddress,
    postalCode,
    billingAddress,
    billingPostalCode,
    clientId,
    clientName,
    entityName,
    clientType,
    clientAgent,
    clientRemarks,
    CustomFields,
    invoiceId,
    invoiceNumber,
    invoiceStatus
  } = service;

  const [currentDescription, setCurrentDescription] = useState<string>('');

  useEffect(() => {
    if (!description) {
      return;
    }

    const contentHTMLDescription = convertFromHTML(description);

    // 2. Create the ContentState object
    const stateDescription = ContentState.createFromBlockArray(contentHTMLDescription.contentBlocks, contentHTMLDescription.entityMap);

    // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
    const contentDescription = JSON.stringify(convertToRaw(stateDescription));

    setCurrentDescription(contentDescription);
  }, [description]);

  const handleViewContract = () => {
    window.open(`/clients/${clientId}`, '_blank');
  };

  const handleViewInvoice = () => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  const handleViewMap = (postalCode: string) => {
    window.open(`https://maps.google.com/maps?q=Singapore ${postalCode}`, '_blank');
  };

  return (
    <Card variant='outlined'>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Quotation Title
            </Typography>
            {isLoading ? <Skeleton width={'30%'} /> : <Typography variant='h4'>{serviceTitle}</Typography>}
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Chip
                key={serviceStatus}
                label={ucWords(serviceStatus)}
                className={classes.chip}
                style={{
                  color:
                    serviceStatus === 'Active'
                      ? theme.palette.primary.main
                      : serviceStatus === 'Pending'
                      ? theme.palette.secondary.main
                      : serviceStatus === 'Completed'
                      ? theme.palette.success.main
                      : serviceStatus === 'Expired'
                      ? theme.palette.error.main
                      : 'inherit',
                  backgroundColor:
                    serviceStatus === 'Active'
                      ? theme.palette.primary.light
                      : serviceStatus === 'Pending'
                      ? theme.palette.secondary.light
                      : serviceStatus === 'Completed'
                      ? theme.palette.success.light
                      : serviceStatus === 'Expired'
                      ? theme.palette.error.light
                      : theme.palette.grey[200]
                }}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body2' color='textSecondary' gutterBottom>
              Quotation Description :
            </Typography>
            {isLoading ? <Skeleton width={'50%'} /> : <MUIRichTextEditor controls={[]} readOnly defaultValue={currentDescription} />}
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} alignItems='center' className={classes.highlightGrid}>
              <Grid item xs={12} sm={2}>
                <Typography variant='body2' color='textSecondary'>
                  Invoice Number
                </Typography>
              </Grid>
              <Grid item xs={12} sm={invoiceNumber ? 1 : 4}>
                {invoiceNumber ? (
                  <Typography variant='subtitle2'>
                    <Tooltip title='View Invoice Detail'>
                      <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewInvoice}>
                        <Typography variant='body1'>{invoiceNumber}</Typography>
                      </Link>
                    </Tooltip>
                    <Tooltip title='Edit Invoice Number'>
                      <IconButton size='small' onClick={() => setOpenInvoiceForm(true)} style={{ marginLeft: 8 }}>
                        <EditIcon color='primary' fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                ) : (
                  <Tooltip title={service.serviceStatus === 'PENDING' ? 'Cannot generate because quotation is pending' : ''} placement='top'>
                    <span
                      style={{
                        cursor: service.serviceStatus === 'PENDING' ? 'not-allowed' : 'default'
                      }}
                    >
                      <Button
                        variant='contained'
                        color='primary'
                        size='small'
                        disableElevation
                        disabled={isLoading || service.serviceStatus === 'PENDING'}
                        onClick={() => setOpenInvoiceForm(true)}
                      >
                        Generate Invoice
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Grid>
              {invoiceNumber && (
                <Grid item xs={12} sm={3}>
                  {isLoading ? (
                    <Skeleton width={100} />
                  ) : (
                    <Chip
                      key={invoiceStatus}
                      label={invoiceStatus}
                      size='medium'
                      className={classes.chip}
                      style={{
                        color:
                          invoiceStatus === 'FULLY PAID'
                            ? theme.palette.success.main
                            : invoiceStatus === 'PARTIALLY PAID'
                            ? theme.palette.secondary.main
                            : theme.palette.error.main,
                        background:
                          invoiceStatus === 'FULLY PAID'
                            ? theme.palette.success.light
                            : invoiceStatus === 'PARTIALLY PAID'
                            ? theme.palette.secondary.light
                            : theme.palette.error.light
                      }}
                    />
                  )}
                </Grid>
              )}
              <Grid item xs={12} sm={2}>
                <Typography variant='body2' color='textSecondary'>
                  Issue & Expiry Date
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                {issueDate && expiryDate ? (
                  <Typography variant='subtitle2'>
                    {format(new Date(issueDate), 'dd MMM yyyy')} - {format(new Date(expiryDate), 'dd MMM yyyy')}
                  </Typography>
                ) : (
                  '-'
                )}
              </Grid>
              {CustomFields &&
                CustomFields.length > 0 &&
                CustomFields.map(field => {
                  return (
                    <>
                      <Grid item xs={12} sm={2}>
                        <Typography variant='body2' color='textSecondary'>
                          {field.label}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant='subtitle2'>{field.value}</Typography>
                      </Grid>
                    </>
                  );
                })}
            </Grid>
          </Grid>
          <Grid item xs={12} style={{ marginTop: 16 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={1}>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  Quotation ID
                </Typography>
                {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle2'>{id}</Typography>}
              </Grid>
              <Divider orientation='vertical' flexItem className={classes.divider} />
              <Grid item xs={12} sm={2}>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  Quotation Type
                </Typography>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Typography variant='subtitle2'>
                    {ucWords(
                      serviceType.includes(ServiceType.CONTRACT)
                        ? 'SERVICE CONTRACT'
                        : serviceType.includes(ServiceType.ADHOC)
                        ? 'AD-HOC SERVICE'
                        : 'SEPARATE QUOTATION'
                    )}
                  </Typography>
                )}
              </Grid>
              <Divider orientation='vertical' flexItem className={classes.divider} />
              <Grid item xs={12} sm={2}>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  Quotation Term
                </Typography>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Typography variant='subtitle2'>
                    {format(new Date(termStart), 'dd MMM yyyy')} - {format(new Date(termEnd), 'dd MMM yyyy')}
                  </Typography>
                )}
              </Grid>
              <Divider orientation='vertical' flexItem className={classes.divider} />
              <Grid item xs={12} sm={2}>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  Quotation GST
                </Typography>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Typography variant='subtitle2'>
                    {needGST ? 'YES' : 'NO'} ({gstTax}%)
                  </Typography>
                )}
              </Grid>
              <Divider orientation='vertical' flexItem className={classes.divider} />
              <Grid item xs={12} sm={2}>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  Sales Person
                </Typography>
                {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle2'>{salesPerson || '-'}</Typography>}
              </Grid>
              <Divider orientation='vertical' flexItem className={classes.divider} />
              <Grid item xs={12} sm={2}>
                <Typography variant='body2' color='textSecondary' gutterBottom>
                  Required Skills
                </Typography>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Typography variant='subtitle2'>{skills && skills.length > 0 ? skills.join(', ') : '-'}</Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider style={{ marginTop: 32, marginBottom: 32 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant='h5' style={{ marginBottom: 20 }}>
              Service & Billing Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Service Address
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Tooltip title='View on Map'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={() => handleViewMap(postalCode)}>
                      <Typography variant='body1'>{serviceAddress}</Typography>
                    </Link>
                  </Tooltip>
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Service Postal Code
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{postalCode}</Typography>}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Billing Address
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Tooltip title='View on Map'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={() => handleViewMap(billingPostalCode)}>
                      <Typography variant='body1'>{billingAddress}</Typography>
                    </Link>
                  </Tooltip>
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Billing Postal Code
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{billingPostalCode}</Typography>}
              </Grid>
            </Grid>
          </Grid>
          <Divider orientation='vertical' flexItem className={classes.divider} />
          <Grid item xs={12} sm={5}>
            <Typography variant='h5' style={{ marginBottom: 20 }}>
              Client Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Client Name
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Tooltip title='View Client Detail'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewContract}>
                      <Typography variant='body1'>{clientName}</Typography>
                    </Link>
                  </Tooltip>
                )}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Entity Name
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{entityName}</Typography>}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Client Type
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{ucWords(clientType)}</Typography>}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Client Agent
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{clientAgent}</Typography>}
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant='body1' color='textSecondary'>
                  Client Remarks
                </Typography>
              </Grid>
              <Grid item xs={12} sm={8}>
                {isLoading ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Typography variant='body1' style={{ whiteSpace: 'pre-line' }}>
                    {clientRemarks}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ServiceInfo;
