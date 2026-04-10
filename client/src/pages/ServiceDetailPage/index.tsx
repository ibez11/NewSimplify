import { FC, useState, useEffect, useCallback, useContext } from 'react';
import clsx from 'clsx';
import { Button, Container, Grid, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';
import useRouter from 'hooks/useRouter';
import { GET_CONFIRM_SERVICE_URL, GET_DELETE_SERVICES_URL, GET_JOB_DETAIL_BY_ADDITIONAL_SERVICE_ID, GET_SERVICE_DETAIL_BY_ID } from 'constants/url';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import ViewIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';
import RenewIcon from '@material-ui/icons/Autorenew';
import ConfirmIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';

import ActionSnackbar from 'components/ActionSnackbar';
import Breadcrumb from 'components/Breadcrumb';
import ShowPdfModal from 'components/ShowPdfModal';
import ShowPdfTypes from 'typings/ShowPdfTypes';
import { dummyServiceDetailBody } from 'constants/dummy';
import Content from './components/Content';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import SideBarContent from 'components/SideBarContent';
import { hasAccessPermission, ucWords } from 'utils';
import EditChecklistForm from './components/EditForm/EditChecklistForm';
import EditScheduleForm from './components/EditForm/EditScheduleForm';
import EditServiceForm from './components/EditForm/EditServiceForm';
import { ServiceType } from 'constants/enum';
import ServiceForm from 'pages/ServiceForm';
import CustomizedDialog from 'components/CustomizedDialog';
import InvoiceForm from './components/EditForm/InvoiceForm';
import theme from 'theme';
import { StandardConfirmationDialog } from 'components/AppDialog';
import PasswordConfirmation from 'components/PasswordConfirmation';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants } from 'selectors';

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
  marginRight: {
    marginRight: theme.spacing(1)
  },
  marginLeft: {
    marginLeft: theme.spacing(1)
  }
}));

const ServiceDetailPage: FC = () => {
  const { match, history } = useRouter();
  const params = match.params.id;
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);
  const isDeleteActive = hasAccessPermission('QUOTATIONS', 'DELETE', currentRoleGrants);
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [service, setService] = useState<ServiceDetailModel>(dummyServiceDetailBody);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarIsCountdown, setSnackbarIsCountdown] = useState<boolean>(false);

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [form, setForm] = useState<string>('');
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [openPdfModal, setOpenPdfModal] = useState<boolean>(false);

  const [isRenew, setIsRenew] = useState<boolean>(false);
  const [serviceId, setServicetId] = useState<number>(0);
  const [, setServiceType] = useState<string>('');
  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [openInvoiceForm, setOpenInvoiceForm] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);

  const fetchData = useCallback(() => {
    setIsLoading(true);

    const loadData = async () => {
      try {
        const { data } = await axios.get(`${GET_SERVICE_DETAIL_BY_ID(params)}`, { cancelToken: cancelTokenSource.token });

        const jobs: JobModel[] = data.Jobs;
        // const isJobCompeleted = jobs.some(value => value.jobStatus === JobStatus.COMPLETED);

        if (data.serviceStatus === 'CANCELLED' || data.serviceType === ServiceType.ADDITIONAL) {
          setIsEditable(false);
        }

        if (jobs.length === 0) {
          const additionalJob = await axios.get(`${GET_JOB_DETAIL_BY_ADDITIONAL_SERVICE_ID(params)}`, { cancelToken: cancelTokenSource.token });
          const Jobs = [
            {
              id: additionalJob.data.jobId,
              jobStatus: additionalJob.data.jobStatus,
              startDateTime: additionalJob.data.startDateTime,
              endDateTime: additionalJob.data.endDateTime,
              ChecklistJob: additionalJob.data.ChecklistJob ? additionalJob.data.ChecklistJob : [],
              serviceItemsJob: additionalJob.data.AdditionalServiceItem ? additionalJob.data.AdditionalServiceItem : [],
              JobLabels: additionalJob.data.JobLabel ? additionalJob.data.JobLabel : [],
              jobAmount: additionalJob.data.additionalAmount ? additionalJob.data.additionalAmount : 0
            }
          ];
          setService({ ...data, Jobs });
        } else {
          setService(data);
        }

        setIsLoading(false);
      } catch (err) {
        console.log(err);
        const error = err as any;
        const { errorCode } = error.data;

        if (errorCode === 11 || errorCode === 12) {
          history.push({ pathname: `/notfound/` });
        }
        setIsLoading(false);
      }
    };

    loadData();
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

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

  const handleOpenForm = (form: string) => {
    setOpenForm(true);
    setForm(form);
  };

  const handleConfirmAction = async (serviceId: number) => {
    setIsLoading(true);
    try {
      await axios.put(`${GET_CONFIRM_SERVICE_URL(serviceId)}`, { cancelToken: cancelTokenSource.token });
      setOpenConfirmation(false);
      fetchData();
      handleSnackbar('success', 'Successfully approve contract');
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed approve contract');
    }
    setIsLoading(false);
  };

  const handleViewDetailAction = () => {
    window.open(`/quotations/${serviceId}`, '_blank');
    setOpenSuccessModal(false);
  };

  const handleDelete = () => {
    setOpenPasswordDialog(true);
    setIsDelete(false);
  };

  const handleCloseDelete = () => {
    setIsDelete(false);
    setOpenPasswordDialog(false);
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3} alignItems='center'>
        <Grid item sm={6}>
          <Typography variant='h4' gutterBottom>
            Quotation Details
          </Typography>
          <Breadcrumb pages={['quotations', service.clientName]} />
        </Grid>
        <Grid item container sm={12}>
          <Grid item sm={6}>
            <Button
              variant='contained'
              disabled={isLoading}
              disableElevation
              className={classes.marginRight}
              startIcon={<ViewIcon />}
              onClick={() => setOpenPdfModal(true)}
            >
              View PDF
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
            {service.serviceStatus !== 'PENDING' ? (
              <Tooltip
                title={
                  !isEditable
                    ? service.serviceType === ServiceType.ADDITIONAL
                      ? 'Cannot edit because this is separate quotation'
                      : 'Cannot edit because quotation already have invoice or quotation is cancelled'
                    : ''
                }
              >
                <span style={{ cursor: !isEditable ? 'not-allowed' : 'default' }}>
                  <Button
                    variant='contained'
                    disabled={isLoading || !isEditable}
                    disableElevation
                    className={classes.marginRight}
                    startIcon={<RenewIcon />}
                    onClick={() => {
                      setIsRenew(true);
                      handleOpenForm('renew contract');
                    }}
                  >
                    Renew Quotation
                    <LoadingButtonIndicator isLoading={isLoading} />
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant='contained'
                disabled={isLoading || !isEditable}
                disableElevation
                className={classes.marginRight}
                startIcon={<ConfirmIcon />}
                onClick={() => setOpenConfirmation(true)}
              >
                Approve Quotation
                <LoadingButtonIndicator isLoading={isLoading} />
              </Button>
            )}
            {isDeleteActive && (
              <Button
                variant='contained'
                disabled={isLoading}
                disableElevation
                style={{ background: theme.palette.error.main, color: '#ffffff' }}
                startIcon={<DeleteIcon />}
                onClick={() => setIsDelete(true)}
              >
                Delete Quotation
                <LoadingButtonIndicator isLoading={isLoading} />
              </Button>
            )}
          </Grid>
          <Grid item container justify='flex-end' sm={6}>
            <Tooltip
              title={
                !isEditable || service.invoiceNumber !== null
                  ? service.serviceType === ServiceType.ADDITIONAL
                    ? 'Cannot edit because this is separate quotation'
                    : 'Cannot edit because quotation already have invoice or quotation is cancelled'
                  : ''
              }
            >
              <span style={{ cursor: !isEditable || service.invoiceNumber !== null ? 'not-allowed' : 'default' }}>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={isLoading || !isEditable || service.invoiceNumber !== null}
                  disableElevation
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenForm('edit details')}
                >
                  Edit Quotation
                  <LoadingButtonIndicator isLoading={isLoading} />
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      <Content
        isLoading={isLoading}
        service={service}
        isEditable={isEditable}
        handleOpenForm={handleOpenForm}
        setOpenInvoiceForm={setOpenInvoiceForm}
      />
      {openPdfModal && (
        <ShowPdfModal
          id={Number(service.id)}
          serviceId={Number(service.id)}
          documentType={ShowPdfTypes.SERVICE}
          documentNumber={service.serviceTitle}
          open={openPdfModal}
          handleClose={() => setOpenPdfModal(false)}
          handleSnackbar={handleSnackbar}
        />
      )}
      <SideBarContent
        title={ucWords(form)}
        open={openForm}
        onClickDrawer={() => setOpenForm(false)}
        width={form.includes('renew') ? '100%' : form.includes('schedules') ? '80%' : '70%'}
      >
        {form.includes('renew') ? (
          <ServiceForm
            isRenew={isRenew}
            oldContractId={service.id}
            clientId={Number(service.clientId)}
            setServiceId={setServicetId}
            setServiceType={setServiceType}
            setOpenSuccessModal={setOpenSuccessModal}
            fetchData={fetchData}
            handleCancel={() => setOpenForm(false)}
            handleSnackbar={handleSnackbar}
          />
        ) : form.includes('details') ? (
          <EditServiceForm
            service={service}
            setService={setService}
            handleClose={() => setOpenForm(false)}
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
          />
        ) : form.includes('schedules') ? (
          <EditScheduleForm service={service} handleClose={() => setOpenForm(false)} handleSnackbar={handleSnackbar} fetchData={fetchData} />
        ) : (
          <EditChecklistForm serviceId={service.id} handleCancel={() => setOpenForm(false)} handleSnackbar={handleSnackbar} fetchData={fetchData} />
        )}
      </SideBarContent>
      {openSuccessModal && (
        <CustomizedDialog
          isLoading={isLoading}
          open={openSuccessModal}
          isConfirmation
          variant='success'
          title='Successfully!'
          message={`Your contract has been renewed with ID: ${serviceId}`}
          primaryButtonLabel='Approve Quotation'
          secondaryButtonLabel='Done & View Details'
          primaryActionButton={() => {
            handleConfirmAction(serviceId);
            setOpenSuccessModal(false);
          }}
          secondaryActionButton={handleViewDetailAction}
          handleClose={() => setOpenSuccessModal(false)}
        />
      )}
      {openConfirmation && (
        <CustomizedDialog
          isLoading={isLoading}
          open={openConfirmation}
          isConfirmation
          variant='warning'
          title='Approve Quotation'
          message={'Are you sure you want to approve this quotation?'}
          primaryButtonLabel='Ok'
          secondaryButtonLabel='Cancel'
          primaryActionButton={() => handleConfirmAction(service.id)}
          secondaryActionButton={() => setOpenConfirmation(false)}
          handleClose={() => setOpenConfirmation(false)}
        />
      )}
      {openInvoiceForm && (
        <InvoiceForm
          open={openInvoiceForm}
          service={service}
          loadData={fetchData}
          handleCancel={() => setOpenInvoiceForm(false)}
          handleSnackbar={handleSnackbar}
        />
      )}
      {isDelete && (
        <StandardConfirmationDialog
          variant={'warning'}
          title='Confirm Quotation Deletion'
          message={`Please confirm that you want to permanently delete this quotation.\nThis action will also remove all associated jobs, and invoices.\nAre you sure you want to proceed?`}
          okLabel='OK'
          cancelLabel='cancel'
          open={isDelete}
          handleClose={() => setIsDelete(false)}
          onConfirm={handleDelete}
        />
      )}
      {openPasswordDialog && (
        <PasswordConfirmation
          open={openPasswordDialog}
          handleClose={handleCloseDelete}
          url={GET_DELETE_SERVICES_URL(Number(params))}
          title='Delete Quotation'
          message='delete quotation, redirecting to quotation list'
          handleSnackbar={handleSnackbar}
        />
      )}
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={() => setOpenSnackbar(false)}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        isCountdown={snackbarIsCountdown}
        redirectPath='quotations'
      />
    </Container>
  );
};

export default ServiceDetailPage;
