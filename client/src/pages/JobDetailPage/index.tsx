import React, { FC, useState, useCallback, useEffect, useContext } from 'react';
import clsx from 'clsx';
import { Button, Container, Grid, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';
import useRouter from 'hooks/useRouter';

import { dummyJobDetail } from 'constants/dummy';
import ViewIcon from '@material-ui/icons/Visibility';
import HistoryIcon from '@material-ui/icons/History';
import DocumentIcon from '@material-ui/icons/Description';
import SendIcon from '@material-ui/icons/Send';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import CollectedIcon from '@material-ui/icons/AttachMoney';
import CustomizedTabs from 'components/CustomizedTabs';
import Breadcrumb from 'components/Breadcrumb';
import ActionSnackbar from 'components/ActionSnackbar';

import EditIcon from '@material-ui/icons/Edit';
import JobServiceItemContent from './components/JobServiceItemContent';
import JobNoteContent from './components/JobNoteContent';
import JobExpensesContent from './components/JobExpensesContent';
import ShowPdfModal from 'components/ShowPdfModal';
import ShowPdfTypes from 'typings/ShowPdfTypes';
import { PublicHolidayContext } from 'contexts/PublicHolidayContext';
import { GET_JOB_DETAIL_BY_ID } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import SideBarContent from 'components/SideBarContent';
import { ucWords } from 'utils';
import HistoryContent from './components/HistoryContent';
import DocumentForm from './components/EditForm/DocumentForm';
import JobInfoContent from './components/JobInfoContent';
import JobChecklistContent from './components/JobChecklistContent';
import EditJobForm from './components/EditForm/EditJobForm';
import ServiceItemForm from './components/EditForm/ServiceItemForm';
import EditCollectedForm from './components/EditForm/EditCollectedForm';
import { StandardConfirmationDialog } from 'components/AppDialog';
import InvoiceForm from './components/EditForm/InvoiceForm';
import SendJobForm from 'components/SendJobForm';

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
  menuList: {
    minHeight: 30
  },
  mainPaper: {
    padding: theme.spacing(2)
  }
}));

const JobDetailPage: FC = () => {
  const classes = useStyles();
  const { match, history } = useRouter();
  const params = match.params.id;
  const { holidays } = useContext(PublicHolidayContext);

  const [job, setJob] = useState<JobDetailModel>(dummyJobDetail);
  const [serviceItems, setServiceItems] = useState<ServiceItemModel[]>([]);
  const [additionalServiceItems, setAdditionalServiceItems] = useState<ServiceItemModel[]>([]);
  const [jobNotes, setJobNotes] = useState<JobNoteModel[]>([]);
  const [checklist, setChecklist] = useState<JobChecklistModel[]>([]);
  const [jobDocuments, setJobDocuments] = useState<JobDocumentModel[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [form, setForm] = useState<string>('');
  const [openPdfModal, setOpenPdfModal] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const [openCollectedConfirmation, setOpenCollectedConfirmation] = useState<boolean>(false);
  const [isEditCollected, setIsEditCollected] = useState<boolean>(false);
  const [openInvoiceForm, setOpenInvoiceForm] = useState<boolean>(false);

  const [openSendJobMessage, setOpenSendJobMessage] = useState<boolean>(false);

  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const fetchData = useCallback(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(`${GET_JOB_DETAIL_BY_ID(params)}`, { cancelToken: cancelTokenSource.token });

        if (data.job.serviceStatus === 'CANCELLED') {
          setIsEditable(false);
        }

        setJob(data.job);
        setServiceItems(data.job.ServiceItems);
        setAdditionalServiceItems(data.job.AdditionalServiceItems);
        setJobNotes(data.job.JobNotes);
        setChecklist(data.job.JobChecklist);
        setJobDocuments(data.job.JobDocuments);

        setIsLoading(false);
      } catch (err) {
        console.log(err);
        const error = err as any;
        const { errorCode } = error.data;

        if (errorCode === 12) {
          history.push({ pathname: `/notfound/` });
        } else {
          setOpenSnackbar(true);
          setSnackbarVarient('error');
          setSnackbarMessage('Failed to load Job');
        }
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    action(actionParam);
  };

  const handleSnackbar = (variant: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(message);
  };

  const SelectedContent: FC<{ page: number }> = props => {
    switch (props.page) {
      case 0:
        return (
          <>
            <JobServiceItemContent
              isLoading={isLoading}
              isEditable={isEditable}
              job={job}
              serviceItems={serviceItems}
              additionalServiceItems={additionalServiceItems}
              handleOpenEditServiceItem={handleOpenEditServiceItem}
            />
            <JobChecklistContent
              isLoading={isLoading}
              isEditable={isEditable}
              jobId={job.jobId}
              checklist={checklist}
              setChecklist={setChecklist}
              handleSnackbar={handleSnackbar}
            />
          </>
        );
      case 1:
        return (
          <JobNoteContent
            isLoading={isLoading}
            jobId={job.jobId}
            serviceAddressId={job.serviceAddressId!}
            jobNotes={jobNotes}
            setJobNotes={setJobNotes}
            handleSnackbar={handleSnackbar}
          />
        );
      case 2:
        return (
          <JobExpensesContent
            isLoading={isLoading}
            job={job}
            setJob={setJob}
            handleSnackbar={handleSnackbar}
            setOpenSnackbar={setOpenSnackbar}
            setSnackbarVarient={setSnackbarVarient}
            setSnackbarMessage={setSnackbarMessage}
          />
        );
      default:
        return <div />;
    }
  };

  const handleViewPdf = async () => {
    setOpenPdfModal(true);
  };

  const handleOpenJobHistories = () => {
    setOpenForm(true);
    setForm('job history');
  };

  const handleOpenJobDocument = () => {
    setOpenForm(true);
    setForm('job document');
  };

  const handleOpenEditJob = () => {
    setOpenForm(true);
    setForm('edit job');
  };

  const handleOpenEditServiceItem = () => {
    setOpenForm(true);
    setForm('edit service items');
  };

  const handleClosePdfModal = () => {
    setOpenPdfModal(false);
  };

  const handleSendJobMessage = () => {
    setOpenSendJobMessage(true);
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item sm={6}>
          <Typography variant='h4' gutterBottom>
            Job Details
          </Typography>
          <Breadcrumb pages={['jobs', job.clientName]} />
        </Grid>
        <Grid item container sm={12}>
          <Grid item sm={10}>
            <Button
              variant='contained'
              disabled={isLoading}
              disableElevation
              className={classes.marginButton}
              startIcon={<ViewIcon />}
              onClick={handleViewPdf}
            >
              View PDF
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
            <Button
              variant='contained'
              disabled={isLoading}
              disableElevation
              className={classes.marginButton}
              startIcon={<HistoryIcon />}
              onClick={handleOpenJobHistories}
            >
              Job History
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
            <Button
              variant='contained'
              disabled={isLoading}
              disableElevation
              className={classes.marginButton}
              startIcon={<DocumentIcon />}
              onClick={handleOpenJobDocument}
            >
              Job Document
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
            <Tooltip title={job.invoiceStatus === 'FULLY PAID' ? 'Cannot update collected amount because invoice is fully paid' : ''} placement='top'>
              <span
                style={{
                  cursor: job.invoiceStatus === 'FULLY PAID' ? 'not-allowed' : 'default'
                }}
              >
                <Button
                  variant='contained'
                  disabled={isLoading || job.invoiceStatus === 'FULLY PAID'}
                  disableElevation
                  className={classes.marginButton}
                  startIcon={<CollectedIcon />}
                  onClick={() => setIsEditCollected(true)}
                >
                  Update Collected Amount
                  <LoadingButtonIndicator isLoading={isLoading} />
                </Button>
              </span>
            </Tooltip>
            <Button
              variant='contained'
              disabled={isLoading}
              disableElevation
              className={classes.marginButton}
              startIcon={<SendIcon />}
              onClick={handleSendJobMessage}
            >
              Send Job Message
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
          </Grid>
          <Grid item container justify='flex-end' sm={2}>
            <Tooltip title={!isEditable ? 'Cannot edit because quotation is cancelled' : ''}>
              <span style={{ cursor: !isEditable ? 'not-allowed' : 'default' }}>
                <Button
                  variant='contained'
                  color='primary'
                  disabled={isLoading || !isEditable}
                  disableElevation
                  startIcon={<EditIcon />}
                  onClick={handleOpenEditJob}
                >
                  Edit Job
                  <LoadingButtonIndicator isLoading={isLoading} />
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      <JobInfoContent isLoading={isLoading} job={job} setOpenInvoiceForm={setOpenInvoiceForm} />
      <CustomizedTabs
        tabs={[
          { id: 0, name: 'Services Items & Checklist' },
          { id: 1, name: 'Notes' },
          { id: 2, name: 'Expenses' }
        ]}
        selectedTabId={selectedTab}
        onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
      />
      <SelectedContent page={selectedTab} />
      <SideBarContent
        title={ucWords(form)}
        open={openForm}
        onClickDrawer={() => setOpenForm(false)}
        width={form.includes('document') ? '50%' : form.includes('service items') ? '80%' : '60%'}
      >
        {form.includes('history') ? (
          <HistoryContent job={job} handleClose={() => setOpenForm(false)} />
        ) : form.includes('document') ? (
          <DocumentForm
            jobId={job.jobId}
            jobDocuments={jobDocuments}
            setJobDocuments={setJobDocuments}
            handleClose={() => setOpenForm(false)}
            handleSnackbar={handleSnackbar}
          />
        ) : form.includes('service items') ? (
          <ServiceItemForm
            job={job}
            serviceItems={serviceItems}
            additionalServiceItems={additionalServiceItems}
            handleClose={() => {
              const { ServiceItems, AdditionalServiceItems } = job;

              setServiceItems(ServiceItems);
              setAdditionalServiceItems(AdditionalServiceItems);
              setOpenForm(false);
            }}
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
          />
        ) : (
          <EditJobForm
            job={job}
            setJob={setJob}
            publicHolidays={holidays}
            handleClose={() => setOpenForm(false)}
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
            setOpenCollectedConfirmation={setOpenCollectedConfirmation}
          />
        )}
      </SideBarContent>
      {openPdfModal && (
        <ShowPdfModal
          id={Number(params)}
          serviceId={Number(job.serviceId)}
          documentType={ShowPdfTypes.JOB}
          documentNumber={params}
          open={openPdfModal}
          handleClose={handleClosePdfModal}
          handleSnackbar={handleSnackbar}
        />
      )}
      {isEditCollected && (
        <EditCollectedForm
          open={isEditCollected}
          job={job}
          fetchData={fetchData}
          setIsEditCollected={setIsEditCollected}
          handleSnackbar={handleSnackbar}
        />
      )}
      {openCollectedConfirmation && (
        <StandardConfirmationDialog
          variant={'warning'}
          title=''
          message='Do you want to update the collected amount for this job?'
          okLabel='Ok'
          cancelLabel='No'
          open={openCollectedConfirmation}
          handleClose={() => setOpenCollectedConfirmation(false)}
          onConfirm={() => {
            setOpenCollectedConfirmation(false);
            setIsEditCollected(true);
          }}
        />
      )}
      {openInvoiceForm && (
        <InvoiceForm
          open={openInvoiceForm}
          invoiceId={job.invoiceId ? job.invoiceId : 0}
          invoiceNumber={job.invoiceNumber ? job.invoiceNumber : ''}
          serviceId={job.serviceId}
          clientId={job.clientId}
          loadData={fetchData}
          handleCancel={() => setOpenInvoiceForm(false)}
          handleSnackbar={handleSnackbar}
        />
      )}
      {openSendJobMessage && (
        <SendJobForm open={openSendJobMessage} job={job} handleSnackbar={handleSnackbar} handleClose={() => setOpenSendJobMessage(false)} />
      )}
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={() => setOpenSnackbar(false)}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </Container>
  );
};

export default JobDetailPage;
