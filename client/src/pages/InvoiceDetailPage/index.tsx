import { FC, useCallback, useContext, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Button, Container, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import useRouter from 'hooks/useRouter';
import Breadcrumb from 'components/Breadcrumb';
import ActionSnackbar from 'components/ActionSnackbar';
import { StandardConfirmationDialog } from 'components/AppDialog';
import PasswordConfirmation from 'components/PasswordConfirmation';

import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants, getCurrentSyncApp } from 'selectors';
import axios, { CancelTokenSource } from 'axios';
import { GET_INVOICE_BY_ID_URL, GET_DELETE_INVOICE_URL, SYNCING_INVOICE_URL } from 'constants/url';

import EditCollectedForm from './components/EditCollectedForm';
import Content from './components/Content';
import { dummyInvoiceDetail } from 'constants/dummy';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import ViewIcon from '@material-ui/icons/Visibility';
import SyncIcon from '@material-ui/icons/Sync';
import CollectedIcon from '@material-ui/icons/AttachMoney';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import ShowPdfModal from 'components/ShowPdfModal';
import ShowPdfTypes from 'typings/ShowPdfTypes';
import theme from 'theme';
import SideBarContent from 'components/SideBarContent';
import EditDetailForm from './components/EditDetailForm';
import { hasAccessPermission } from 'utils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(2)
    }
  },
  actionButton: { color: '#53A0BE', backgroundColor: '#ffffff' },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  marginButton: {
    marginRight: theme.spacing(1)
  },
  marginLeft: {
    marginLeft: theme.spacing(1)
  },
  menuList: {
    minHeight: 40,
    minWidth: 150
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  }
}));

const InvoiceDetailPage: FC = () => {
  const classes = useStyles();
  const { match, history } = useRouter();
  const params = Number(match.params.id);
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const { currentUser } = useContext(CurrentUserContext);
  const currentSyncApp = getCurrentSyncApp(currentUser);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);
  const isDeleteActive = hasAccessPermission('INVOICES', 'DELETE', currentRoleGrants);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarIsCountdown, setSnackbarIsCountdown] = useState<boolean>(false);

  const [isLoading, setIsloading] = useState<boolean>(false);
  const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<InvoiceDetailModel>(dummyInvoiceDetail);

  const [isEditCollected, setIsEditCollected] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);
  const [openPdfModal, setOpenPdfModal] = useState<boolean>(false);

  const [openForm, setOpenForm] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setIsloading(true);
      const { data } = await axios.get(`${GET_INVOICE_BY_ID_URL(params)}`, { cancelToken: cancelTokenSource.token });
      setInvoice(data);
      setIsloading(false);
    } catch (err) {
      console.log(err);
      const error = err as any;
      const { errorCode } = error.data;

      if (errorCode === 16) {
        history.push({ pathname: `/notfound/` });
      }
      setIsloading(false);
    }
  };

  const fetchData = useCallback(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSnackbar = (variant: 'success' | 'error', message: string, isCountdown?: boolean) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(message);
    if (isCountdown) {
      setSnackbarIsCountdown(isCountdown);
    }
  };

  const handleSyncInvoice = async () => {
    setIsLoadingButton(true);
    try {
      const { id, invoiceNumber, totalCollectedAmount } = invoice;
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      const url = `${SYNCING_INVOICE_URL}/${id}`;

      const { data } = await axios.put(
        url,
        {
          invoiceNumber,
          collectedAmount: totalCollectedAmount,
          isSynchronize: true
        },
        { cancelToken: cancelTokenSource.token }
      );

      updateIndividual(data);
      handleSnackbar('success', 'Successfully sync invoice');
    } catch (err) {
      handleSnackbar('error', 'Failed sync invoice');

      const error = err as any;
      if (error.message) {
        handleSnackbar('error', error.message);
      }
    }
    setIsLoadingButton(false);
  };

  const handleDelete = () => {
    setOpenPasswordDialog(true);
    setIsDelete(false);
  };

  const handleCloseDelete = () => {
    setIsDelete(false);
    setOpenPasswordDialog(false);
  };

  const updateIndividual = (value: any) => {
    setInvoice(value);
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3} alignItems='center'>
        <Grid item sm={6}>
          <Typography variant='h4' gutterBottom>
            Invoice Details
          </Typography>
          <Breadcrumb key={'breadcrumbs'} pages={['invoices', invoice.invoiceNumber]} />
        </Grid>
        <Grid item container sm={12}>
          <Grid item sm={10}>
            <Button
              variant='contained'
              disabled={isLoading || isLoadingButton}
              disableElevation
              className={classes.marginButton}
              startIcon={<ViewIcon />}
              onClick={() => setOpenPdfModal(true)}
            >
              View PDF
              <LoadingButtonIndicator isLoading={isLoading || isLoadingButton} />
            </Button>
            <Button
              variant='contained'
              disabled={isLoading || isLoadingButton}
              disableElevation
              className={classes.marginButton}
              startIcon={<CollectedIcon />}
              onClick={() => setIsEditCollected(true)}
            >
              Update Collected
              <LoadingButtonIndicator isLoading={isLoading || isLoadingButton} />
            </Button>
            {currentSyncApp && (
              <Button
                variant='contained'
                disabled={isLoading || isLoadingButton}
                disableElevation
                className={classes.marginButton}
                startIcon={<SyncIcon />}
                onClick={handleSyncInvoice}
              >
                Syncronize Invoice
                <LoadingButtonIndicator isLoading={isLoading || isLoadingButton} />
              </Button>
            )}
            {isDeleteActive && (
              <Button
                variant='contained'
                disabled={isLoading || isLoadingButton}
                disableElevation
                className={classes.marginButton}
                style={{ background: theme.palette.error.main, color: '#ffffff' }}
                startIcon={<DeleteIcon />}
                onClick={() => setIsDelete(true)}
              >
                Delete Invoice
                <LoadingButtonIndicator isLoading={isLoading || isLoadingButton} />
              </Button>
            )}
          </Grid>
          <Grid item container justify='flex-end' sm={2}>
            <Button
              variant='contained'
              color='primary'
              disabled={isLoading || isLoadingButton}
              disableElevation
              startIcon={<EditIcon />}
              onClick={() => setOpenForm(true)}
            >
              Edit Invoice
              <LoadingButtonIndicator isLoading={isLoading || isLoadingButton} />
            </Button>
          </Grid>
        </Grid>
        <Content isLoading={isLoading} invoice={invoice} />
      </Grid>
      <SideBarContent title={'Edit Invoice'} open={openForm} onClickDrawer={() => setOpenForm(false)} width={'40%'}>
        <EditDetailForm
          invoice={invoice}
          updateIndividual={updateIndividual}
          handleClose={() => setOpenForm(false)}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
      {openPdfModal && (
        <ShowPdfModal
          id={Number(invoice.id)}
          serviceId={Number(invoice.contractId)}
          documentType={ShowPdfTypes.INVOICE}
          documentNumber={invoice.invoiceNumber}
          open={openPdfModal}
          handleClose={() => setOpenPdfModal(false)}
          handleSnackbar={handleSnackbar}
        />
      )}
      {isEditCollected && (
        <EditCollectedForm
          open={isEditCollected}
          invoice={invoice}
          updateIndividual={updateIndividual}
          setIsEditCollected={setIsEditCollected}
          handleSnackbar={handleSnackbar}
        />
      )}
      {openPasswordDialog && (
        <PasswordConfirmation
          open={openPasswordDialog}
          handleClose={handleCloseDelete}
          url={GET_DELETE_INVOICE_URL(params)}
          title='Delete Invoice'
          message='delete invoice, redirecting to invoice list'
          handleSnackbar={handleSnackbar}
        />
      )}
      {openSnackbar && (
        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={() => setOpenSnackbar(false)}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
          isCountdown={snackbarIsCountdown}
          redirectPath='invoices'
        />
      )}
      {isDelete && (
        <StandardConfirmationDialog
          variant={'warning'}
          title='Delete Confirmation'
          message='Are you sure want to delete this invoice?'
          okLabel='OK'
          cancelLabel='cancel'
          open={isDelete}
          handleClose={() => setIsDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </Container>
  );
};

export default InvoiceDetailPage;
