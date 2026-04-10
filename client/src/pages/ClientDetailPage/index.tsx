import React, { FC, useState, useEffect, useRef, useContext } from 'react';
import clsx from 'clsx';
import { Button, Container, Grid, makeStyles, Theme, Typography } from '@material-ui/core';

import useRouter from 'hooks/useRouter';
import ProfileContent from './components/ProfileContent';
import ContractContent from './components/ContractContent';
import JobContent from './components/JobContent';
import EquipmentContent from './components/EquipmentContent';
import CustomizedTabs from 'components/CustomizedTabs';
import Breadcrumb from 'components/Breadcrumb';
import ActionSnackbar from 'components/ActionSnackbar';
import SideBarContent from 'components/SideBarContent';
import ClientDocumentForm from './components/ClientDocumentForm';

import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DocumentIcon from '@material-ui/icons/Description';
import ErrorIcon from '@material-ui/icons/Error';
import DeleteIcon from '@material-ui/icons/Delete';
import axios, { CancelTokenSource } from 'axios';
import { GET_CLIENT_BY_ID_URL, GET_DELETE_CLIENT_URL, GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL } from 'constants/url';
import theme from 'theme';
import { dummyClientDetail } from 'constants/dummy';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { StandardConfirmationDialog } from 'components/AppDialog';
import PasswordConfirmation from 'components/PasswordConfirmation';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants } from 'selectors';
import { hasAccessPermission } from 'utils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  }
}));

const ClientDetailPage: FC = () => {
  const classes = useStyles();
  const { history, match } = useRouter();
  const params = match.params.id;
  const childRef: any = useRef();

  const [tabs, setTabs] = useState<any[]>([
    { id: 0, name: 'Profile', module: 'CLIENTS' },
    { id: 1, name: 'Quotations', module: 'QUOTATIONS' },
    { id: 2, name: 'Jobs', module: 'JOBS' },
    { id: 3, name: 'Equipments' }
  ]);

  const { tab } = (history.location.state as any) ? (history.location.state as any) : 0;
  const [selectedTab, setSelectedTab] = useState<number>(tab ? tab : 0);
  const [clientName, setClientName] = useState<string>('');

  const [clients, setClients] = useState<ClientDetailsModel>(dummyClientDetail);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serviceAddressMaster, setServiceAddressMaster] = useState<Select[]>([]);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarIsCountdown, setSnackbarIsCountdown] = useState<boolean>(false);

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);
  const [clientDocuments, setClientDocuments] = useState<JobDocumentModel[]>([]);
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);
  const isDeleteActive = hasAccessPermission('CLIENTS', 'DELETE', currentRoleGrants);

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    setIsLoading(true);

    const renderTabs = async () => {
      const newTabs = tabs
        .filter(({ module }) => !module || hasAccessPermission(module, 'ACCESS', currentRoleGrants))
        .map(({ id, name }) => ({ id, name }));

      // Set the filtered and formatted tabs
      setTabs(newTabs);
    };

    renderTabs();

    const getData = async () => {
      try {
        const { data } = await axios.get(`${GET_CLIENT_BY_ID_URL(params)}`, { cancelToken: cancelTokenSource.token });
        setClients(data.client);
        setClientName(data.client.name);
        setClientDocuments(data.client.ClientDocuments);
      } catch (err) {
        console.log(err);
      }
    };
    getData();

    const getServiceAddresses = async () => {
      try {
        if (Number(params) !== 0) {
          const { data } = await axios.get(`${GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL(Number(params))}`, { cancelToken: cancelTokenSource.token });

          let serviceAddressData: Select[] = [];
          data.serviceAddresses.map((value: any) => {
            return serviceAddressData.push({ id: value.id, name: value.address });
          });

          setServiceAddressMaster(serviceAddressData);
        }
      } catch (err) {
        console.log(err);
      }
    };

    getServiceAddresses();

    setIsLoading(false);
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, selectedTab]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSnackbar = (variant: 'success' | 'error', message: string, isCountdown?: boolean) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(message);
    if (isCountdown) {
      setSnackbarIsCountdown(isCountdown);
    }
  };

  const handleOpenCreateContract = () => {
    childRef && childRef.current!.handleOpenCreateContract();
  };

  const handleOpenCreateEquipment = () => {
    childRef && childRef.current!.handleOpenCreateEquipment();
  };

  const handleOpenClientDocument = () => {
    setOpenForm(true);
  };

  const handleConfirmDelete = () => {
    setOpenPasswordDialog(true);
    setIsDelete(false);
  };

  const handleCloseDelete = () => {
    setIsDelete(false);
    setOpenPasswordDialog(false);
  };

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    action(actionParam);
  };

  const SelectedContent: FC<{ page: number }> = props => {
    switch (props.page) {
      case 0:
        return <ProfileContent isLoading={isLoading} clients={clients} setClients={setClients} handleSnackbar={handleSnackbar} />;
      case 1:
        return <ContractContent ref={childRef} serviceAddressMaster={serviceAddressMaster} currentRoleGrants={currentRoleGrants} />;
      case 2:
        return <JobContent serviceAddressMaster={serviceAddressMaster} />;
      case 3:
        return <EquipmentContent ref={childRef} serviceAddressMaster={serviceAddressMaster} />;
      default:
        return <div />;
    }
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root)}>
      <Grid container spacing={3}>
        <Grid item sm={6}>
          <Typography variant='h4' gutterBottom>
            Clients Details
          </Typography>
          <Breadcrumb pages={['clients', clientName]} />
        </Grid>
      </Grid>
      <Grid container spacing={1} style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(5), maxHeight: 60 }}>
        <Grid item sm={6}>
          <CustomizedTabs
            // eslint-disable-next-line array-callback-return
            tabs={tabs}
            selectedTabId={selectedTab}
            onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
          />
        </Grid>
        <Grid item container sm={6} justify='flex-end' alignItems='center'>
          <Grid item container sm={12} justify='flex-end'>
            {isDeleteActive && (
              <Button
                variant='contained'
                disabled={isLoading}
                disableElevation
                style={{ background: theme.palette.error.main, color: '#ffffff', marginRight: theme.spacing(2) }}
                startIcon={<DeleteIcon />}
                onClick={() => setIsDelete(true)}
              >
                Delete Client
                <LoadingButtonIndicator isLoading={isLoading} />
              </Button>
            )}
            {selectedTab === 0 ? (
              <Button
                color='primary'
                size='medium'
                variant='contained'
                disableElevation
                startIcon={<DocumentIcon />}
                onClick={handleOpenClientDocument}
              >
                Client Documents
              </Button>
            ) : selectedTab === 1 ? (
              <Button color='primary' size='medium' variant='contained' disableElevation startIcon={<AddIcon />} onClick={handleOpenCreateContract}>
                New Quotation
              </Button>
            ) : (
              selectedTab === 3 && (
                <Button
                  color='primary'
                  size='medium'
                  variant='contained'
                  disableElevation
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreateEquipment}
                >
                  New Equipment
                </Button>
              )
            )}
          </Grid>
        </Grid>
      </Grid>
      <SelectedContent page={selectedTab} />
      <SideBarContent title={'Client Documents'} open={openForm} onClickDrawer={() => setOpenForm(false)} width='50%'>
        <ClientDocumentForm
          clientId={Number(params)}
          clientDocuments={clientDocuments}
          setClientDocuments={setClientDocuments}
          handleClose={() => setOpenForm(false)}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        isCountdown={snackbarIsCountdown}
        redirectPath='clients'
      />
      {isDelete && (
        <StandardConfirmationDialog
          variant={'warning'}
          title='Confirm Client Deletion'
          message={`Please confirm that you want to permanently delete this client.\nThis action will also remove all associated quotations, jobs, and invoices.\nAre you sure you want to proceed?`}
          okLabel='OK'
          cancelLabel='cancel'
          open={isDelete}
          handleClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
      {openPasswordDialog && (
        <PasswordConfirmation
          open={openPasswordDialog}
          handleClose={handleCloseDelete}
          url={GET_DELETE_CLIENT_URL(Number(params))}
          title='Delete Client'
          message='delete client, redirecting to client list'
          handleSnackbar={handleSnackbar}
        />
      )}
    </Container>
  );
};

export default ClientDetailPage;
