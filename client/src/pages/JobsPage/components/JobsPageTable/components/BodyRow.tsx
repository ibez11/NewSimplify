import React, { FC, Fragment, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import Skeleton from 'react-loading-skeleton';
import {
  Box,
  Chip,
  Collapse,
  Avatar,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  TableRow,
  TableCell,
  Theme,
  Typography,
  Tooltip,
  Divider
} from '@material-ui/core';
import { format } from 'date-fns';

import MenuIcon from '@material-ui/icons/MoreVert';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import InfoIcon from '@material-ui/icons/Info';
import BodyCell from 'components/BodyCell';
import theme from 'theme';
import { getNumberWithOrdinal, ucWords } from 'utils';
import ShowPdfModal from 'components/ShowPdfModal';
import ShowPdfTypes from 'typings/ShowPdfTypes';
import NumberFormat from 'react-number-format';
import SendJobForm from 'components/SendJobForm';

interface Props {
  isLoadingData: boolean;
  setSelectedId: React.Dispatch<React.SetStateAction<number | undefined>>;
  job: JobModel;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onEditJob: React.MouseEventHandler;
  onViewJob: React.MouseEventHandler;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  columns: SelectedColumn[];
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      borderBottom: 'unset'
    }
  },
  tableCellInner: {
    display: 'flex',
    alignItems: 'center'
  },
  tableCellInnerOther: {
    alignItems: 'center'
  },
  chip: {
    borderRadius: 50,
    marginBottom: theme.spacing(1)
  },
  nameTextCell: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  otherTextCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  menuAvatar: {
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    fontSize: '14px',
    fontWeight: 500,
    height: '36px',
    width: '36px',
    color: '#707070'
  },
  menuList: {
    minHeight: 40,
    minWidth: 150
  },
  serviceItemRow: {
    paddingTop: 0,
    paddingBottom: 0
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoadingData, job, onViewJob, onEditJob, setMessage, setOpenDialog, setSelectedId, handleSnackbar, columns } = props;
  const {
    jobId,
    clientId,
    serviceId,
    clientName,
    serviceName,
    invoiceNumber,
    serviceAddress,
    postalCode,
    jobSequence,
    totalJob,
    startDateTime,
    serviceType,
    // jobAmount,
    collectedAmount,
    paymentMethod,
    employees,
    vehicles,
    jobStatus,
    jobLabels,
    ServiceItem,
    AdditionalServiceItem,
    totalAmount
  } = job;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [open, setOpen] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openSendJobMessage, setOpenSendJobMessage] = useState<boolean>(false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    handleClose();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setAnchorEl(null);
    setOpenModal(false);
  };

  const handleViewDetail = (event: any) => {
    setAnchorEl(null);
    onViewJob(event);
  };

  const handleAssign = (event: any) => {
    setAnchorEl(null);
    onEditJob(event);
  };

  const handleConfirmActionClick = () => {
    setAnchorEl(null);
    setOpenDialog(true);
    setSelectedId(jobId);
    setMessage('Are you sure you want to confirm this?');
  };

  const handleViewClient = () => {
    window.open(`/clients/${clientId}`, '_blank');
  };

  const handleViewContract = (serviceId: number) => {
    window.open(`/quotations/${serviceId}`, '_blank');
  };

  const handleViewMap = () => {
    window.open(`https://maps.google.com/maps?q=Singapore ${postalCode}`, '_blank');
  };

  const handleSendJobMessage = () => {
    setAnchorEl(null);
    setOpenSendJobMessage(true);
  };

  const renderColumn = () => {
    if (columns.length > 0) {
      // eslint-disable-next-line array-callback-return
      return columns.map(value => {
        if (value.isVisible) {
          if (value.field === 'id') {
            return (
              <BodyCell cellWidth='5%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInner}>
                    <div className={classes.nameTextCell}>
                      <Grid container>
                        <Grid item xs={12}>
                          <Tooltip title='View Job Detail'>
                            <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewDetail}>
                              <Typography variant='body2'>{`#${jobId}`}</Typography>
                            </Link>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant='caption'>
                            {getNumberWithOrdinal(jobSequence)} of {totalJob}
                          </Typography>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'clientName') {
            return (
              <BodyCell cellWidth='10%' pL='10px' pR='10px' isComponent={true}>
                <div className={classes.tableCellInner}>
                  <div className={classes.nameTextCell}>
                    {isLoadingData ? (
                      <Skeleton width={100} />
                    ) : (
                      <Tooltip title='View Client Detail'>
                        <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewClient}>
                          <Typography variant='body2'> {clientName}</Typography>
                        </Link>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </BodyCell>
            );
          } else if (value.field === 'contract') {
            return (
              <BodyCell cellWidth='5%' pL='10px' pR='10px' isComponent={true}>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInner}>
                    <div className={classes.nameTextCell}>
                      <Grid container>
                        <Grid item xs={12}>
                          <Tooltip title='View Quotation Detail'>
                            <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={() => handleViewContract(serviceId!)}>
                              <Typography variant='body2' gutterBottom>
                                {serviceName}
                              </Typography>
                            </Link>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant='caption'>INV. {invoiceNumber || '-'}</Typography>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'serviceAddress') {
            return (
              <BodyCell cellWidth='20%' pR='5px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Tooltip title='View on Map'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewMap}>
                      <Typography variant='body2'>{serviceAddress}</Typography>
                    </Link>
                  </Tooltip>
                )}
              </BodyCell>
            );
          } else if (value.field === 'startDateTime') {
            return (
              <BodyCell cellWidth='8%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                    {startDateTime && ` ${format(new Date(startDateTime), `EEE dd-MM-yyyy,'\n'hh:mm a`)}`}
                  </Typography>
                )}
              </BodyCell>
            );
          } else if (value.field === 'serviceType') {
            return (
              <BodyCell cellWidth='8%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInnerOther}>
                    <div className={classes.otherTextCell}>
                      <Chip
                        label={ucWords(serviceType === 'CONTRACT' ? 'SERVICE CONTRACT' : serviceType === 'ADHOC' ? 'AD-HOC SERVICE' : serviceType)}
                        className={classes.chip}
                        size='small'
                        style={{
                          color: 'inherit',
                          backgroundColor: theme.palette.grey[200]
                        }}
                      />
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'jobAmount') {
            return (
              <BodyCell cellWidth='3%' pR='5px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='body2'>
                    <NumberFormat
                      value={totalAmount || 0}
                      displayType={'text'}
                      thousandSeparator={true}
                      prefix={'$'}
                      decimalScale={2}
                      fixedDecimalScale={true}
                    />
                  </Typography>
                )}
              </BodyCell>
            );
          } else if (value.field === 'collectedAmount') {
            return (
              <BodyCell cellWidth='3%' pR='5px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='body2'>
                    <NumberFormat
                      value={collectedAmount}
                      displayType={'text'}
                      thousandSeparator={true}
                      prefix={'$'}
                      decimalScale={2}
                      fixedDecimalScale={true}
                    />
                  </Typography>
                )}
              </BodyCell>
            );
          } else if (value.field === 'paymentMethod') {
            return (
              <BodyCell cellWidth='3%' pR='5px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='body2'>{totalAmount! > 0 ? (paymentMethod ? ucWords(paymentMethod) : '-') : 'Not Chargeable'}</Typography>
                )}
              </BodyCell>
            );
          } else if (value.field === 'vehicleNo') {
            return (
              <BodyCell cellWidth='3%' pR='5px'>
                {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{vehicles ? vehicles.join(', ') : '-'}</Typography>}
              </BodyCell>
            );
          } else if (value.field === 'employee') {
            return (
              <BodyCell cellWidth='3%' pR='5px'>
                {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{employees ? employees.join(', ') : '-'}</Typography>}
              </BodyCell>
            );
          } else if (value.field === 'jobLabels') {
            return (
              <BodyCell cellWidth='5%' pR='3px' textAlign='center'>
                <div className={classes.tableCellInnerOther}>
                  <div className={classes.otherTextCell}>
                    {isLoadingData ? (
                      <Skeleton width={'80%'} />
                    ) : jobLabels ? (
                      jobLabels.map((value: any) => (
                        <div className={classes.nameTextCell}>
                          <Chip
                            label={ucWords(value.name)}
                            color='primary'
                            size='small'
                            style={{ color: value.color, backgroundColor: `${value.color}40` }}
                            className={classes.chip}
                          />
                        </div>
                      ))
                    ) : (
                      <div className={classes.nameTextCell}>
                        <Typography variant='body2'>-</Typography>
                      </div>
                    )}
                  </div>
                </div>
              </BodyCell>
            );
          }
        }
      });
    }
  };

  return (
    <Fragment>
      <TableRow className={classes.root}>
        <BodyCell cellWidth='1%' pL='10px' pR='10px'>
          {!isLoadingData && (
            <Tooltip title={open ? 'Hide Service Items' : 'Show Service Items'}>
              <IconButton aria-label='expand row' onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          )}
        </BodyCell>
        {renderColumn()}
        <BodyCell cellWidth='5%' pR='5px' textAlign='center'>
          {isLoadingData ? (
            <Skeleton width={50} />
          ) : (
            <Fragment>
              <IconButton size='small' color='inherit' onClick={handleClick}>
                <Avatar className={classes.menuAvatar}>
                  <MenuIcon />
                </Avatar>
              </IconButton>
              <Menu
                id='list-menu'
                anchorEl={anchorEl}
                keepMounted
                elevation={1}
                getContentAnchorEl={null}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center'
                }}
              >
                <MenuItem className={classes.menuList} onClick={handleViewDetail}>
                  View Details
                </MenuItem>
                <MenuItem className={classes.menuList} onClick={handleOpenModal}>
                  View PDF
                </MenuItem>
                {(jobStatus === 'UNASSIGNED' || jobStatus === 'CONFIRMED') && (
                  <MenuItem className={classes.menuList} onClick={handleAssign}>
                    Assign Technician
                  </MenuItem>
                )}
                {jobStatus === 'UNASSIGNED' && (
                  <MenuItem className={classes.menuList} onClick={handleConfirmActionClick}>
                    Confirm Job
                  </MenuItem>
                )}
                <MenuItem className={classes.menuList} onClick={handleSendJobMessage}>
                  Send Job Message
                </MenuItem>
              </Menu>
            </Fragment>
          )}
        </BodyCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.serviceItemRow} colSpan={15}>
          <Collapse in={!isLoadingData && open} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={5}>
                  <Typography variant='h5' gutterBottom component='div' style={{ marginBottom: theme.spacing(2) }}>
                    Service Items
                  </Typography>
                  <Grid container spacing={1}>
                    {ServiceItem &&
                      ServiceItem.length > 0 &&
                      ServiceItem.map((value, index) => {
                        return (
                          <Grid item xs={12}>
                            <Typography variant='body2' gutterBottom style={{ whiteSpace: 'pre-line', alignItems: 'center', display: 'flex' }}>
                              {index + 1}. {value.name}
                              {value.description && (
                                <Tooltip
                                  title={
                                    <Typography variant='caption' style={{ whiteSpace: 'pre-line', fontSize: 10 }}>
                                      {value.description}
                                    </Typography>
                                  }
                                >
                                  <InfoIcon fontSize='small' color='disabled' style={{ marginLeft: theme.spacing(1) }} />
                                </Tooltip>
                              )}
                            </Typography>
                          </Grid>
                        );
                      })}
                  </Grid>
                </Grid>
                {AdditionalServiceItem && (
                  <>
                    <Divider orientation='vertical' flexItem style={{ margin: '0px 8px 8px 8px' }} />
                    <Grid item xs={12} sm={5}>
                      <Typography variant='h5' gutterBottom component='div' style={{ marginBottom: theme.spacing(2) }}>
                        Additional Items
                      </Typography>
                      <Grid container spacing={1}>
                        {AdditionalServiceItem.length > 0 &&
                          AdditionalServiceItem.map((value, index) => {
                            return (
                              <Grid item xs={12}>
                                <Typography variant='body2' gutterBottom style={{ whiteSpace: 'pre-line', alignItems: 'center', display: 'flex' }}>
                                  {index + 1}.{value.name}
                                  {value.description && (
                                    <Tooltip title={<Typography style={{ whiteSpace: 'pre-line', fontSize: 10 }}>{value.description}</Typography>}>
                                      <InfoIcon fontSize='small' color='disabled' style={{ marginLeft: theme.spacing(1) }} />
                                    </Tooltip>
                                  )}
                                </Typography>
                              </Grid>
                            );
                          })}
                      </Grid>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
        {openModal && (
          <ShowPdfModal
            id={Number(jobId)}
            serviceId={Number(serviceId)}
            documentType={ShowPdfTypes.JOB}
            documentNumber={`${jobId}`}
            open={openModal}
            handleClose={handleCloseModal}
            handleSnackbar={handleSnackbar}
          />
        )}
        {openSendJobMessage && (
          <SendJobForm open={openSendJobMessage} job={job} handleSnackbar={handleSnackbar} handleClose={() => setOpenSendJobMessage(false)} />
        )}
      </TableRow>
    </Fragment>
  );
};

export default BodyRow;
