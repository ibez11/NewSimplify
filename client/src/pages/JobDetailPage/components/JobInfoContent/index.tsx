import { FC, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  Theme,
  Tooltip,
  Typography,
  makeStyles
} from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import theme from 'theme';
import { format } from 'date-fns';
import { getNumberWithOrdinal, ucWords } from 'utils';
import ViewIcon from '@material-ui/icons/Visibility';
import CloseIcon from '@material-ui/icons/Close';
import MarkerIcon from '@material-ui/icons/LocationOn';
import EditIcon from '@material-ui/icons/Edit';

interface Props {
  isLoading: boolean;
  job: JobDetailModel;
  setOpenInvoiceForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    borderRadius: 50,
    marginRight: theme.spacing(1),
    minWidth: 100
  },
  divider: { margin: '16px 0' },
  viewModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  contentGrid: {
    padding: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  highlightGrid: {
    background: theme.palette.grey[200],
    borderRadius: 5,
    padding: theme.spacing(2),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  },
  unassignedColor: {
    backgroundColor: theme.palette.unassigned.main,
    color: theme.palette.unassigned.contrastText
  },
  confirmedColor: {
    backgroundColor: theme.palette.confirmed.main,
    color: theme.palette.confirmed.contrastText
  },
  assignedColor: {
    backgroundColor: theme.palette.assigned.main,
    color: theme.palette.assigned.contrastText
  },
  inprogressColor: {
    backgroundColor: theme.palette.inProgress.main,
    color: theme.palette.inProgress.contrastText
  },
  pausedColor: {
    backgroundColor: theme.palette.paused.main,
    color: theme.palette.paused.contrastText
  },
  completedColor: {
    backgroundColor: theme.palette.completed.main,
    color: theme.palette.completed.contrastText
  },
  cancelledColor: {
    backgroundColor: theme.palette.cancelled.main,
    color: theme.palette.cancelled.contrastText
  }
}));

const JobInfoContent: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, job, setOpenInvoiceForm } = props;
  const {
    clientId,
    clientName,
    clientRemarks,
    jobId,
    jobSequence,
    totalJob,
    jobStatus,
    JobLabels,
    jobRemarks,
    serviceName,
    serviceId,
    Skills,
    contactPerson,
    contactNumber,
    signature,
    employees,
    vehicles,
    startDateTime,
    endDateTime,
    serviceAddress,
    postalCode,
    invoiceNumber,
    invoiceId,
    invoiceStatus,
    paymentMethod,
    chequeNumber
  } = job;

  const [openSignature, setOpenSignature] = useState<boolean>(false);

  const handleViewClient = () => {
    window.open(`/clients/${clientId}`, '_blank');
  };

  const handleViewContract = () => {
    window.open(`/quotations/${serviceId}`, '_blank');
  };

  const handleViewInvoice = () => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  return (
    <Card variant='outlined'>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <Typography variant='body1' color='textSecondary' gutterBottom>
              Client Name
            </Typography>
            {isLoading ? (
              <Skeleton width={'30%'} />
            ) : (
              <Tooltip title='View Client Detail'>
                <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewClient}>
                  <Typography variant='h4'>{clientName}</Typography>
                </Link>
              </Tooltip>
            )}
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={'30%'} />
            ) : (
              <Chip
                key={jobStatus}
                label={jobStatus.includes('IN_PROGRESS') ? 'In Progress' : ucWords(jobStatus)}
                className={`${classes.chip} ${
                  jobStatus === 'COMPLETED'
                    ? classes.completedColor
                    : jobStatus === 'ASSIGNED'
                    ? classes.assignedColor
                    : jobStatus === 'IN_PROGRESS'
                    ? classes.inprogressColor
                    : jobStatus === 'PAUSED'
                    ? classes.pausedColor
                    : jobStatus === 'CONFIRMED'
                    ? classes.confirmedColor
                    : jobStatus === 'CANCELLED'
                    ? classes.cancelledColor
                    : classes.unassignedColor
                }`}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body1' color='textSecondary' gutterBottom>
              Client Remarks : {isLoading ? <Skeleton width={'50%'} /> : clientRemarks || '-'}
            </Typography>
          </Grid>
          <Grid item container spacing={2} xs={6}>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary'>
                Job ID
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{jobId}</Typography>}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary'>
                Job Sequence
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? (
                <Skeleton width={'50%'} />
              ) : (
                <Typography variant='body1'>
                  {getNumberWithOrdinal(jobSequence)} of {totalJob}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary'>
                Contact Person
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{contactPerson}</Typography>}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary'>
                Contact Number
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{contactNumber}</Typography>}
            </Grid>
          </Grid>
          <Grid item container alignItems='center' spacing={2} xs={6}>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary'>
                Job Labels
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? (
                <Skeleton width={'80%'} />
              ) : JobLabels && JobLabels.length > 0 ? (
                JobLabels.map((jobLabel: any) => (
                  <Chip
                    key={jobLabel.id}
                    label={jobLabel.name}
                    size='small'
                    color='primary'
                    style={{ color: jobLabel.color, backgroundColor: `${jobLabel.color}40` }}
                    className={classes.chip}
                  />
                ))
              ) : (
                '-'
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary'>
                Skill Required
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? (
                <Skeleton width={'80%'} />
              ) : Skills && Skills.length > 0 ? (
                Skills.map((skill, index) => (
                  <Chip
                    key={`skill-${index}`}
                    label={`${index + 1}. ${skill}`}
                    size='small'
                    className={classes.chip}
                    style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                  />
                ))
              ) : (
                '-'
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary' style={{ verticalAlign: 'top' }}>
                Job Remarks
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? (
                <Skeleton width={'50%'} />
              ) : (
                <Typography variant='body1' style={{ whiteSpace: 'pre-line' }}>
                  {jobRemarks || '-'}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant='body1' color='textSecondary'>
                Client Signature
              </Typography>
            </Grid>
            <Grid item xs={12} sm={9}>
              {isLoading ? (
                <Skeleton width={'50%'} />
              ) : (
                <Typography variant='body1'>
                  {signature ? (
                    <Tooltip title='View Signature'>
                      <IconButton size='small' onClick={() => setOpenSignature(true)}>
                        <ViewIcon color='primary' />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    '-'
                  )}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={1} className={classes.highlightGrid}>
          <Grid item container spacing={2} xs={4} alignItems='center'>
            <Grid item xs={12} sm={4}>
              <Typography variant='body2' color='textSecondary'>
                Quotation Title
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              {isLoading ? (
                <Skeleton width={'50%'} />
              ) : (
                <Tooltip title='View Quotation Detail'>
                  <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewContract}>
                    <Typography variant='body1'>{serviceName}</Typography>
                  </Link>
                </Tooltip>
              )}
            </Grid>
          </Grid>
          <Grid item container spacing={2} xs={4} alignItems='center'>
            <Grid item xs={12} sm={5}>
              <Typography variant='body2' color='textSecondary'>
                Payment Method
              </Typography>
            </Grid>
            <Grid item xs={12} sm={7}>
              {isLoading ? (
                <Skeleton width={'50%'} />
              ) : (
                <Typography variant='body1'>{paymentMethod ? `${paymentMethod} ${chequeNumber ? `(No. ${chequeNumber})` : ''}` : '-'}</Typography>
              )}
            </Grid>
          </Grid>
          <Grid item container spacing={2} xs={4} alignItems='center'>
            <Grid item xs={12} sm={3}>
              <Typography variant='body2' color='textSecondary'>
                Invoice Number
              </Typography>
            </Grid>
            <Grid item xs={12} sm={invoiceNumber ? 3 : 9}>
              {isLoading ? (
                <Skeleton width={'50%'} />
              ) : invoiceNumber ? (
                <Typography variant='subtitle1'>
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
                <Button
                  variant='contained'
                  color='primary'
                  size='small'
                  disableElevation
                  disabled={isLoading}
                  onClick={() => setOpenInvoiceForm(true)}
                >
                  Generate Invoice
                </Button>
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
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={2}>
            <Typography variant='body1' color='textSecondary'>
              Technician(s)
            </Typography>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : employees && employees.length > 0 ? (
              <Typography variant='subtitle1'>{employees.join(' \u2022 ')}</Typography>
            ) : (
              '-'
            )}
          </Grid>
          <Divider orientation='vertical' flexItem />
          <Grid item xs={6} sm={2}>
            <Typography variant='body1' color='textSecondary'>
              Vehicle(s)
            </Typography>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : vehicles && vehicles.length > 0 ? (
              <Typography variant='subtitle1'>{vehicles.join(' \u2022 ')}</Typography>
            ) : (
              '-'
            )}
          </Grid>
          <Divider orientation='vertical' flexItem />
          <Grid item xs={6} sm={2}>
            <Typography variant='body1' color='textSecondary'>
              Start & End Date Time
            </Typography>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <Typography variant='subtitle1' style={{ whiteSpace: 'pre-line' }}>
                {`${format(startDateTime ? new Date(startDateTime) : new Date(), 'dd MMM yyyy hh:mm a')} to \n ${format(
                  endDateTime ? new Date(endDateTime) : new Date(),
                  'dd MMM yyyy hh:mm a'
                )}`}
              </Typography>
            )}
          </Grid>
          <Divider orientation='vertical' flexItem />
          <Grid item xs={6} sm={5}>
            <Typography variant='body1' color='textSecondary'>
              Service Address
            </Typography>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <Typography variant='subtitle1' style={{ whiteSpace: 'pre-line' }}>
                {serviceAddress}
                <Tooltip title='Open Map'>
                  <IconButton color='primary' href={'https://maps.google.com/maps?q=Singapore ' + postalCode} target={'_blank'} size='small'>
                    <MarkerIcon color='primary' />
                  </IconButton>
                </Tooltip>
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
      {openSignature && (
        <Dialog
          open={openSignature}
          className={classes.viewModal}
          closeAfterTransition
          onClose={() => setOpenSignature(false)}
          scroll='body'
          fullWidth
          maxWidth='md'
        >
          <DialogTitle>
            <Typography variant='h5' id='invoice-modal'>
              Preview
            </Typography>
            <IconButton size='small' className={classes.closeButton} onClick={() => setOpenSignature(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container alignItems='center'>
              <Grid item xs className={classes.contentGrid} spacing={2}>
                <img src={signature} alt='logo' />
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default JobInfoContent;
