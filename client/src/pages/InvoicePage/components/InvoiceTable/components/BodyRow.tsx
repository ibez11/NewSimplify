import React, { FC, useState, useContext } from 'react';

import NumberFormat from 'react-number-format';
import Skeleton from 'react-loading-skeleton';
import theme from 'theme';

import {
  Avatar,
  Box,
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
import { format } from 'date-fns';
import axios, { CancelTokenSource } from 'axios';

import MenuIcon from '@material-ui/icons/MoreVert';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

import BodyCell from 'components/BodyCell';
import { hasAccessPermission, ucWords } from 'utils';
import { SYNCING_INVOICE_URL } from 'constants/url';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentSyncApp } from 'selectors';
import ShowPdfModal from 'components/ShowPdfModal';
import ShowPdfTypes from 'typings/ShowPdfTypes';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';

interface Props {
  isLoadingData: boolean;
  invoice: InvoicesModel;
  onEditInvoiceCollected: React.MouseEventHandler;
  onEditInvoiceRemarks: React.MouseEventHandler;
  onDeleteInvoice: React.MouseEventHandler;
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
    borderRadius: 50
  },
  nameTextCell: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1)
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
  remarksRow: {
    paddingTop: 0,
    paddingBottom: 0
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoadingData, invoice, onEditInvoiceCollected, onEditInvoiceRemarks, onDeleteInvoice, handleSnackbar, columns, currentRoleGrants } = props;
  const {
    id,
    invoiceNumber,
    generatedDate,
    clientName,
    clientId,
    termStart,
    termEnd,
    contractTitle,
    contractId,
    invoiceAmount,
    collectedAmount,
    invoiceStatus,
    remarks,
    totalJob
  } = invoice;
  const isDeleteActive = hasAccessPermission('INVOICES', 'DELETE', currentRoleGrants);

  const [openActionMenuPopper, setOpenActionMenuPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(remarks ? true : false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const { currentUser } = useContext(CurrentUserContext);
  const currentSyncApp = getCurrentSyncApp(currentUser);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenActionMenuPopper(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenActionMenuPopper(false);
  };

  const handleOpenModal = () => {
    handleClose();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setAnchorEl(null);
    setOpenModal(false);
  };

  const handleSyncInvoice = async () => {
    setIsLoadingButton(true);
    setOpenActionMenuPopper(!openActionMenuPopper);
    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      const url = `${SYNCING_INVOICE_URL}/${id}`;

      await axios.put(
        url,
        {
          invoiceNumber,
          collectedAmount,
          isSynchronize: true
        },
        { cancelToken: cancelTokenSource.token }
      );
      handleSnackbar('success', 'Successfully syncing invoice');
    } catch (err) {
      const error = err as any;
      if (error.message) {
        handleSnackbar('error', error.message);
      }
      handleSnackbar('error', 'Failed syncing invoice');
    }
    setIsLoadingButton(false);
    setOpenActionMenuPopper(!openActionMenuPopper);
  };

  const handleViewInvoice = (invoiceId: number) => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  const handleViewClient = (clientId: number) => {
    window.open(`/clients/${clientId}`, '_blank');
  };

  const handleViewContract = (serviceId: number) => {
    window.open(`/quotations/${serviceId}`, '_blank');
  };

  const renderColumn = () => {
    if (columns.length > 0) {
      // eslint-disable-next-line array-callback-return
      return columns.map(value => {
        if (value.isVisible) {
          if (value.field === 'invoiceNumber') {
            return (
              <BodyCell cellWidth='5%' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'50%'} />
                ) : (
                  <Tooltip title='View Invoice Details'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={() => handleViewInvoice(id)}>
                      <Typography variant='body2'>{invoiceNumber}</Typography>
                    </Link>
                  </Tooltip>
                )}
              </BodyCell>
            );
          } else if (value.field === 'generate') {
            return (
              <BodyCell cellWidth={'8%'} pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                    {format(new Date(generatedDate), `dd MMM yyyy'\n'hh:mm a`)}
                  </Typography>
                )}
              </BodyCell>
            );
          } else if (value.field === 'clientName') {
            return (
              <BodyCell cellWidth='10%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={100} />
                ) : (
                  <Tooltip title='View Client Detail'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={() => handleViewClient(clientId)}>
                      <Typography variant='body2'>{clientName}</Typography>
                    </Link>
                  </Tooltip>
                )}
              </BodyCell>
            );
          } else if (value.field === 'contractTitle') {
            return (
              <BodyCell cellWidth='10%' pL='10px' pR='10px' isComponent={true}>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInner}>
                    <div className={classes.nameTextCell}>
                      <Typography variant='body2' style={{ marginBottom: 4 }}>
                        {contractTitle}
                      </Typography>
                      <Tooltip title='View Quotation Detail'>
                        <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={() => handleViewContract(contractId)}>
                          <Typography variant='body2'>{`#${contractId}`}</Typography>
                        </Link>
                      </Tooltip>
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'term') {
            return (
              <BodyCell cellWidth={'7%'} pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <>
                    <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                      {`${format(new Date(termStart), 'dd MMM yyyy')} -\n ${format(new Date(termEnd), 'dd MMM yyyy')}`}
                    </Typography>
                  </>
                )}
              </BodyCell>
            );
          } else if (value.field === 'invoiceAmount') {
            return (
              <BodyCell cellWidth='5%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <NumberFormat
                    value={invoiceAmount}
                    displayType={'text'}
                    thousandSeparator={true}
                    prefix={'$'}
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                )}
              </BodyCell>
            );
          } else if (value.field === 'amountCollected') {
            return (
              <BodyCell cellWidth='5%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <NumberFormat
                    value={collectedAmount}
                    displayType={'text'}
                    thousandSeparator={true}
                    prefix={'$'}
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                )}
              </BodyCell>
            );
          } else if (value.field === 'outstandingAmount') {
            return (
              <BodyCell cellWidth='5%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <NumberFormat
                    value={invoiceAmount - collectedAmount}
                    displayType={'text'}
                    thousandSeparator={true}
                    prefix={'$'}
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                )}
              </BodyCell>
            );
          } else if (value.field === 'invoiceStatus') {
            return (
              <BodyCell cellWidth='8%' textAlign='center'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInnerOther}>
                    <div className={classes.otherTextCell}>
                      <Chip
                        label={ucWords(invoiceStatus)}
                        className={classes.chip}
                        size='small'
                        style={{
                          color:
                            invoiceStatus === 'FULLY PAID'
                              ? theme.palette.success.main
                              : invoiceStatus === 'UNPAID'
                              ? theme.palette.error.main
                              : invoiceStatus === 'VOID'
                              ? 'inherit'
                              : theme.palette.secondary.main,
                          backgroundColor:
                            invoiceStatus === 'FULLY PAID'
                              ? theme.palette.success.light
                              : invoiceStatus === 'UNPAID'
                              ? theme.palette.error.light
                              : invoiceStatus === 'VOID'
                              ? theme.palette.grey[200]
                              : theme.palette.secondary.light
                        }}
                      />
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'totalJob') {
            return (
              <BodyCell cellWidth='5%' pL='10px' pR='10px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <Typography variant='body2' align='center'>
                    {totalJob}
                  </Typography>
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
        <BodyCell cellWidth='1%' pL='10px' pR='10px'>
          {!isLoadingData && (
            <Tooltip title={open ? 'Hide Remarks' : 'Show Remakrs'}>
              <IconButton aria-label='expand row' onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          )}
        </BodyCell>
        {renderColumn()}
        <BodyCell cellWidth='5%' pL='10px' isComponent={true}>
          {isLoadingData ? (
            <Skeleton width={'80%'} />
          ) : (
            <React.Fragment>
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
                <MenuItem
                  className={classes.menuList}
                  disabled={isLoadingButton}
                  onClick={() => {
                    handleViewInvoice(id);
                    handleClose();
                  }}
                >
                  Invoice Details
                  <LoadingButtonIndicator isLoading={isLoadingButton} />
                </MenuItem>
                <MenuItem className={classes.menuList} disabled={isLoadingButton} onClick={handleOpenModal}>
                  View PDF
                  <LoadingButtonIndicator isLoading={isLoadingButton} />
                </MenuItem>
                {currentSyncApp && invoiceStatus !== 'VOID' && (
                  <MenuItem className={classes.menuList} disabled={isLoadingButton} onClick={handleSyncInvoice}>
                    Sync Invoice
                    <LoadingButtonIndicator isLoading={isLoadingButton} />
                  </MenuItem>
                )}
                <MenuItem
                  className={classes.menuList}
                  disabled={isLoadingButton}
                  onClick={event => {
                    onEditInvoiceCollected(event);
                    handleClose();
                  }}
                >
                  Edit Collected
                  <LoadingButtonIndicator isLoading={isLoadingButton} />
                </MenuItem>
                <MenuItem
                  className={classes.menuList}
                  disabled={isLoadingButton}
                  onClick={event => {
                    onEditInvoiceRemarks(event);
                    handleClose();
                  }}
                >
                  Input Remarks
                  <LoadingButtonIndicator isLoading={isLoadingButton} />
                </MenuItem>
                {isDeleteActive && (
                  <MenuItem
                    className={classes.menuList}
                    disabled={isLoadingButton}
                    onClick={event => {
                      onDeleteInvoice(event);
                      handleClose();
                    }}
                  >
                    <Typography color='error'>Delete Invoice</Typography>
                    <LoadingButtonIndicator isLoading={isLoadingButton} />
                  </MenuItem>
                )}
              </Menu>
            </React.Fragment>
          )}
        </BodyCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.remarksRow} colSpan={12}>
          <Collapse in={!isLoadingData && open} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Typography variant='h5' gutterBottom component='div' style={{ marginBottom: theme.spacing(2) }}>
                Invoice Remarks
              </Typography>
              {remarks && (
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant='body2' gutterBottom component='div' style={{ marginBottom: theme.spacing(2), whiteSpace: 'pre-line' }}>
                      {remarks}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      {openModal && (
        <ShowPdfModal
          id={Number(id)}
          serviceId={Number(invoice.contractId)}
          documentType={ShowPdfTypes.INVOICE}
          documentNumber={invoiceNumber!}
          open={openModal}
          handleClose={handleCloseModal}
          handleSnackbar={handleSnackbar}
        />
      )}
    </>
  );
};

export default BodyRow;
