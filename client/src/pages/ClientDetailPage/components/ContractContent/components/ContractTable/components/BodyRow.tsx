import React, { FC, Fragment, useState } from 'react';

import 'react-circular-progressbar/dist/styles.css';

import clsx from 'clsx';
import NumberFormat from 'react-number-format';
import Skeleton from 'react-loading-skeleton';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  TableCell,
  TableRow,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { format } from 'date-fns';
import { green } from '@material-ui/core/colors';

import EditInvoiceIcon from '@material-ui/icons/Edit';
import MenuIcon from '@material-ui/icons/MoreVert';
import NewIcon from '@material-ui/icons/FiberNew';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import InfoIcon from '@material-ui/icons/Info';

import BodyCell from 'components/BodyCell';
import { hasAccessPermission, ucWords } from 'utils';
import theme from 'theme';
import { StandardConfirmationDialog } from 'components/AppDialog';
import ShowPdfModal from 'components/ShowPdfModal';
import ShowPdfTypes from 'typings/ShowPdfTypes';

interface Props {
  index: number;
  isLoadingData: boolean;
  contract: ServiceModel;
  onEditInvoice: React.MouseEventHandler;
  handleConfirmAction: (serviceId: number, isFromCreate: boolean) => void;
  handleCancelAction: (index: number) => void;
  handleDeleteAction: (index: number) => void;
  handleRenewAction: (serviceId: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  columns: SelectedColumn[];
  currentRoleGrants: RoleGrantModel[];
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
  otherTextCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  chip: {
    borderRadius: 50,
    marginBottom: theme.spacing(1)
  },
  nameTextCell: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  editIconForEmptyInvoice: {
    marginLeft: theme.spacing(5.5)
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
  expandRow: {
    paddingTop: 0,
    paddingBottom: 0
  },
  gridDescription: {
    color: 'textSecondary',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingLeft: 10
  },
  newIcon: {
    color: green[500]
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const {
    index,
    isLoadingData,
    contract,
    onEditInvoice,
    handleConfirmAction,
    handleCancelAction,
    handleDeleteAction,
    handleRenewAction,
    handleSnackbar,
    columns,
    currentRoleGrants
  } = props;

  const {
    id,
    contractTitle,
    entity,
    serviceAddress,
    startDate,
    endDate,
    invoiceId,
    invoiceNo,
    amount,
    collectedAmount,
    completed,
    cancelledJob,
    totalJob,
    additionalCompleted,
    additionalTotalJob,
    contractType,
    new: isNew,
    isRenewed,
    renewedServiceId,
    ServiceItems
  } = contract;
  const isDeleteActive = hasAccessPermission('QUOTATIONS', 'DELETE', currentRoleGrants);

  let { contractStatus } = contract;
  const cancelled = cancelledJob || 0;
  const doneJob = Number(completed) + Number(cancelled);
  const progress = (contractType && contractType !== 'ADDITIONAL' ? doneJob / totalJob : additionalCompleted / additionalTotalJob) * 100;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openActionMenuPopper, setOpenActionMenuPopper] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(true);

  const [openConfirm, setOpenConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenActionMenuPopper(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenActionMenuPopper(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    handleClose();
  };

  const handleCloseModal = () => {
    setAnchorEl(null);
    setOpenModal(false);
  };

  const handleViewDetail = () => {
    window.open(`/quotations/${id}`, '_blank');
    handleClose();
  };

  const handleViewInvoice = () => {
    window.open(`/invoices/${invoiceId}`, '_blank');
    handleClose();
  };

  const handleConfirmContract = () => {
    setOpenConfirmation(true);
    setConfirmationType('confirm');
    setMessage('Are you sure you want to approve this quotation?');
    handleClose();
  };

  const handleCancelActionClick = () => {
    setOpenConfirmation(true);
    setConfirmationType('cancel');
    setMessage('Are you sure you want to cancel this quotation?');
    handleClose();
  };

  const handleDeleteActionClick = () => {
    setOpenConfirmation(true);
    setConfirmationType('delete');
    setMessage(
      'Please confirm that you want to permanently delete this quotation.\nThis action will also remove all associated jobs, and invoices.\nAre you sure you want to proceed?'
    );
    handleClose();
  };

  const handleRenewActionClick = () => {
    if (contractStatus !== 'Active') {
      handleRenewAction(id);
    } else {
      setOpenConfirmation(true);
      setConfirmationType('renew');
      setMessage('This quotation not expiring, are you sure want to renew?');
    }
    handleClose();
  };

  const handleConfirmContractRenew = () => {
    handleRenewAction(id);
  };

  const handleViewRenewed = () => {
    window.open(`/quotations/${renewedServiceId}`, '_blank');
  };

  const renderColumn = () => {
    if (columns.length > 0) {
      // eslint-disable-next-line array-callback-return
      return columns.map(value => {
        if (value.isVisible) {
          if (value.field === 'id') {
            return (
              <BodyCell cellWidth='8%' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <>
                    <Typography variant='body2'>{contractTitle}</Typography>
                    <Tooltip title='View Quotation Detail'>
                      <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewDetail}>
                        <Typography variant='body2'> #{id}</Typography>
                      </Link>
                    </Tooltip>
                    {isNew && (
                      <div>
                        <NewIcon className={classes.newIcon} />
                      </div>
                    )}
                  </>
                )}
              </BodyCell>
            );
          } else if (value.field === 'entity') {
            return (
              <BodyCell cellWidth='12%' pR='10px'>
                {isLoadingData ? <Skeleton width={'100%'} /> : <Typography variant='body2'>{entity}</Typography>}
              </BodyCell>
            );
          } else if (value.field === 'serviceAddress') {
            return (
              <BodyCell cellWidth='12%' pR='10px'>
                {isLoadingData ? <Skeleton width={'100%'} /> : <Typography variant='body2'>{serviceAddress}</Typography>}
              </BodyCell>
            );
          } else if (value.field === 'term') {
            return (
              <BodyCell cellWidth={'8%'} pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                    {`${format(new Date(startDate), 'dd MMM yyyy')} -\n ${format(new Date(endDate), 'dd MMM yyyy')}`}
                  </Typography>
                )}
              </BodyCell>
            );
          } else if (value.field === 'contractType') {
            return (
              <BodyCell cellWidth={'8%'} pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInnerOther}>
                    <div className={classes.otherTextCell}>
                      <Chip
                        label={ucWords(
                          contractType! === 'CONTRACT' ? 'SERVICE CONTRACT' : contractType! === 'ADHOC' ? 'AD-HOC SERVICE' : 'SEPARATE QUOTATION'!
                        )}
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
          } else if (value.field === 'contractStatus') {
            return (
              <BodyCell cellWidth='8%' textAlign='center' isComponent>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInnerOther}>
                    <div className={classes.otherTextCell}>
                      <Chip
                        size='small'
                        label={ucWords(contractStatus)}
                        className={classes.chip}
                        style={{
                          color:
                            contractStatus === 'Active'
                              ? theme.palette.primary.main
                              : contractStatus === 'Pending'
                              ? theme.palette.secondary.main
                              : contractStatus === 'Completed'
                              ? theme.palette.success.main
                              : contractStatus === 'Expired'
                              ? theme.palette.error.main
                              : 'inherit',
                          backgroundColor:
                            contractStatus === 'Active'
                              ? theme.palette.primary.light
                              : contractStatus === 'Pending'
                              ? theme.palette.secondary.light
                              : contractStatus === 'Completed'
                              ? theme.palette.success.light
                              : contractStatus === 'Expired'
                              ? theme.palette.error.light
                              : theme.palette.grey[200]
                        }}
                      />
                      {isRenewed && (
                        <Tooltip title='View New Quotation'>
                          <Chip
                            size='small'
                            label={`Renewed at #${renewedServiceId}`}
                            className={classes.chip}
                            style={{
                              color: theme.palette.success.main,
                              backgroundColor: theme.palette.success.light,
                              textDecoration: 'underline'
                            }}
                            onClick={handleViewRenewed}
                          />
                        </Tooltip>
                      )}
                      {contractStatus === 'Pending' && (
                        <Link component='button' onClick={handleConfirmContract}>
                          Approve?
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'contractProgress') {
            return (
              <BodyCell cellWidth='5%' pR='10px' isComponent={true} textAlign='center'>
                {isLoadingData ? (
                  <Skeleton circle={true} height={45} width={45} />
                ) : (
                  <svg width={45} height={45} style={{ marginTop: 3, marginBottom: 3 }}>
                    <CircularProgressbar
                      value={progress}
                      text={
                        contractType && contractType !== 'ADDITIONAL'
                          ? `${doneJob} of ${totalJob}`
                          : `${additionalCompleted} of ${additionalTotalJob}`
                      }
                      styles={buildStyles({
                        strokeLinecap: 'butt',
                        textColor: '#000000',
                        textSize: 25,
                        backgroundColor: theme.palette.primary.light,
                        trailColor: theme.palette.primary.light
                      })}
                      background
                    />
                  </svg>
                )}
              </BodyCell>
            );
          } else if (value.field === 'invoiceNo') {
            return (
              <BodyCell cellWidth='8%' pR='10px' isComponent={true}>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInner}>
                    {invoiceNo[0] && (
                      <div className={classes.nameTextCell}>
                        <Tooltip title='View Invoice Detail'>
                          <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewInvoice}>
                            <Typography variant='body2'>{invoiceNo}</Typography>
                          </Link>
                        </Tooltip>
                      </div>
                    )}
                    <div>
                      {contractStatus !== 'Pending' && contractStatus !== 'Cancelled' ? (
                        invoiceNo[0] ? (
                          <Tooltip title={'Edit Invoice Number'}>
                            <IconButton size='small' className={clsx({ [classes.editIconForEmptyInvoice]: !invoiceNo })} onClick={onEditInvoice}>
                              <EditInvoiceIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Button color='primary' variant='contained' disableElevation onClick={onEditInvoice} style={{ textTransform: 'none' }}>
                            Generate
                          </Button>
                        )
                      ) : (
                        <div className={classes.nameTextCell}>
                          <Typography variant='body2'>-</Typography>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'contractAmount') {
            return (
              <BodyCell cellWidth='5%' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <NumberFormat value={amount} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
                )}
              </BodyCell>
            );
          } else if (value.field === 'collectedAmount') {
            return (
              <BodyCell cellWidth='5%' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <NumberFormat
                    value={collectedAmount || 0}
                    displayType={'text'}
                    thousandSeparator={true}
                    prefix={'$'}
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                )}
              </BodyCell>
            );
          }
        }
      });
    }
  };

  return (
    <>
      <TableRow className={classes.root}>
        <BodyCell cellWidth='1%' pR='10px'>
          {isLoadingData ? (
            <Skeleton width={'100%'} />
          ) : (
            <Tooltip title={open ? 'Hide Service Items' : 'Show Service Items'}>
              <IconButton aria-label='expand row' onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          )}
        </BodyCell>
        {renderColumn()}
        <BodyCell cellWidth='5%' isComponent={true} textAlign='center'>
          {isLoadingData ? (
            <Skeleton width={'80%'} />
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
                open={openActionMenuPopper}
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
                  View Quotation
                </MenuItem>
                <MenuItem className={classes.menuList} onClick={handleOpenModal}>
                  View PDF
                </MenuItem>
                {!isRenewed && contractStatus !== 'Pending' && contractStatus !== 'Cancelled' && contractType !== 'ADDITIONAL' && (
                  <MenuItem className={classes.menuList} onClick={handleRenewActionClick}>
                    Renew Quotation
                  </MenuItem>
                )}
                {contractStatus !== 'Cancelled' && contractStatus !== 'Pending' && (
                  <MenuItem className={classes.menuList} onClick={handleCancelActionClick}>
                    <Typography color='error'>Cancel Quotation</Typography>
                  </MenuItem>
                )}
                {isDeleteActive && (
                  <MenuItem className={classes.menuList} onClick={handleDeleteActionClick}>
                    <Typography color='error'>Delete Quotation</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Fragment>
          )}
        </BodyCell>
        {openConfirm && (
          <StandardConfirmationDialog
            variant={'warning'}
            title={
              confirmationType === 'delete'
                ? 'Confirm Quotation Deletion'
                : confirmationType === 'cancel'
                ? 'Confirm Quotation Cancelation'
                : confirmationType === 'confirm'
                ? 'Approve Quotation'
                : 'Confirm Renew'
            }
            message={message}
            okLabel='OK'
            cancelLabel='cancel'
            open={openConfirm}
            handleClose={() => setOpenConfirmation(false)}
            onConfirm={
              confirmationType === 'delete'
                ? () => {
                    handleDeleteAction(index);
                    setOpenConfirmation(false);
                  }
                : confirmationType === 'cancel'
                ? () => {
                    handleCancelAction(index);
                    setOpenConfirmation(false);
                  }
                : confirmationType === 'confirm'
                ? () => {
                    handleConfirmAction(id, false);
                    setOpenConfirmation(false);
                  }
                : () => {
                    handleConfirmContractRenew();
                    setOpenConfirmation(false);
                  }
            }
          />
        )}
        {openModal && (
          <ShowPdfModal
            id={Number(id)}
            serviceId={Number(id)}
            documentType={ShowPdfTypes.SERVICE}
            documentNumber={contractTitle!}
            open={openModal}
            handleClose={handleCloseModal}
            handleSnackbar={handleSnackbar}
          />
        )}
      </TableRow>
      <TableRow>
        <TableCell className={classes.expandRow} colSpan={12}>
          <Collapse in={!isLoadingData && open} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Typography variant='h5' gutterBottom component='div' style={{ marginBottom: theme.spacing(2) }}>
                Service Items
              </Typography>
              <Grid container spacing={1}>
                {ServiceItems &&
                  ServiceItems.length > 0 &&
                  ServiceItems.map((value, index) => {
                    return (
                      <Grid item xs={12}>
                        <Typography variant='body2' gutterBottom style={{ whiteSpace: 'pre-line', alignItems: 'center', display: 'flex' }}>
                          {index + 1}. {value.name}
                          {value.description && (
                            <Tooltip title={value.description}>
                              <InfoIcon fontSize='small' color='disabled' style={{ marginLeft: theme.spacing(1) }} />
                            </Tooltip>
                          )}
                        </Typography>
                      </Grid>
                    );
                  })}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default BodyRow;
