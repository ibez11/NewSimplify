import React, { FC, useState, useEffect, useCallback, useContext } from 'react';
import clsx from 'clsx';
import { Button, Container, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';

import PersonAddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import useRouter from 'hooks/useRouter';
import useDebounce from 'hooks/useDebounce';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import axios, { CancelTokenSource } from 'axios';
import ClientTable from './components/ClientTable';
import ActionSnackbar from 'components/ActionSnackbar';
import Breadcrumb from 'components/Breadcrumb';
import { CLIENT_BASE_URL, AGENT_BASE_URL, GET_DELETE_CLIENT_URL } from 'constants/url';
import { TableColumnSettingContext } from 'contexts/TableColumnSettingContext';
import { CurrentPageContext } from 'contexts/CurrentPageContext';
import SideBarContent from 'components/SideBarContent';
import CreateForm from './components/CreateFrorm';
import { dummyClientColumn } from 'constants/dummy';
import { StandardConfirmationDialog } from 'components/AppDialog';
import PasswordConfirmation from 'components/PasswordConfirmation';
import { getCurrentRoleGrants } from 'selectors';
import { CurrentUserContext } from 'contexts/CurrentUserContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(4)
    }
  },
  paper: {
    margin: 'auto'
  },
  addGrid: {
    textAlign: 'end'
  },
  addButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  },
  headerColumn: {
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  icon: {
    fontSize: 25
  },
  filterIcon: {
    fontSize: 20
  }
}));

const ClientPage: FC = () => {
  useCurrentPageTitleUpdater('Client List');
  const classes = useStyles();

  const { history } = useRouter();
  const { currentPageTitle } = useContext(CurrentPageContext);
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);

  const { tableColumn } = useContext(TableColumnSettingContext);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingClient, setSearchingClient] = useState<boolean>(false);
  const [clients, setClients] = useState<ClientModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);
  const [clientId, setClientId] = useState<number>(0);

  const [columnFilter, setColumnFilter] = useState<ColumnFilter[]>([]);
  const [agents, setAgents] = useState<Select[]>([]);
  const [csv, setCsv] = useState<CSVClientModel[]>([]);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);
  const [column, setColumn] = useState<any[]>(dummyClientColumn);
  const [tableSettingId, setTableSettingId] = useState<number>(1);

  // Search Client whenever rowsPerPage, currentPage, queryString
  const fetchData = useCallback(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    setSearchingClient(true);

    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }

      if (columnFilter.length !== 0) {
        columnFilter.map(value => {
          return params.append('ai', value.columnValue.toString());
        });
      }

      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchClient = async () => {
      try {
        const url = `${CLIENT_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        setCount(data.count);
        setClients(data.clients);
        setSearchingClient(false);
      } catch (err) {
        console.log('err', err);
      }
    };
    searchClient();

    return () => {
      cancelTokenSource.cancel();
    };
  }, [rowsPerPage, currentPage, queryString, columnFilter]);

  const getFilterData = async () => {
    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

      const { data } = await axios.get(`${AGENT_BASE_URL}`, { cancelToken: cancelTokenSource.token });
      setAgents(data.agents);
    } catch (error) {}
  };

  useEffect(() => {
    getFilterData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tableColumn.length > 0) {
      const { column, id } = tableColumn.find(value => value.tableName === 'CLIENT');

      setColumn(column);
      setTableSettingId(id);
    }
  }, [tableColumn]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  const handleSearch = (searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  };

  const debouncedSearchTerm = useDebounce(query, 500);
  // Load client data to populate on search list
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleSnackbar = (variant: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(message);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleViewClient = (clientId: number): React.MouseEventHandler => () => {
    history.push({ pathname: `/clients/${clientId}`, state: { tab: 0 } });
  };

  const handleViewContract = (clientId: number): React.MouseEventHandler => () => {
    history.push({ pathname: `/clients/${clientId}`, state: { tab: 1 } });
  };

  const handleViewJob = (clientId: number): React.MouseEventHandler => () => {
    history.push({ pathname: `/clients/${clientId}`, state: { tab: 2 } });
  };

  const handleViewEquipment = (clientId: number): React.MouseEventHandler => () => {
    history.push({ pathname: `/clients/${clientId}`, state: { tab: 3 } });
  };

  const handleConfirmDeleteClient = (clientId: number): React.MouseEventHandler => () => {
    setClientId(clientId);
    setIsDelete(true);
  };

  const handleConfirmDelete = () => {
    setOpenPasswordDialog(true);
    setIsDelete(false);
  };

  const handleCloseDelete = () => {
    setIsDelete(false);
    setOpenPasswordDialog(false);
    setClientId(0);
    fetchData();
  };

  const addNewClient = (client: ClientModel) => {
    client.new = true;
    client.activeContract = '0';
    clients.unshift(client);
    setClients([...clients]);
    setCount(c => c + 1);
  };

  const handleCsvClick = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    if (count >= 1000) {
      handleSnackbar('error', 'Cannot export more than 1000 records, please apply more filters to reduce the number of records.');
      return;
    }

    try {
      setIsExportingData(true);
      const getQueryParams = () => {
        const params = new URLSearchParams();
        if (queryString) {
          params.append('q', queryString);
        }

        if (columnFilter.length !== 0) {
          columnFilter.map(value => {
            return params.append('ai', value.columnValue.toString());
          });
        }

        return params.toString();
      };

      const url = `${CLIENT_BASE_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

      let csvData: CSVClientModel[] = [];
      if (data.clients && data.clients.length > 0) {
        await Promise.all(
          data.clients.map(async (value: any) => {
            csvData.push({
              id: value.id,
              clientName: value.name,
              clientType: value.clientType,
              clientAgent: value.Agent ? value.Agent.name : '-',
              contactPerson: value.contactPerson,
              contactNumber: value.contactNumber,
              contactEmail: value.contactEmail,
              billingAddress: value.billingAddress
            });
          })
        );
      }

      setCsv(csvData);
      setIsExportingData(false);
    } catch (error) {
      console.log(error);
      setIsExportingData(false);
    }
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item sm={6}>
          <Typography variant='h4' gutterBottom>
            {currentPageTitle}
          </Typography>
          <Breadcrumb pages={['clients']} />
        </Grid>
        <Grid item sm={6} container alignItems='center' justify='flex-end' className={classes.addGrid}>
          <Button
            color='primary'
            size='medium'
            variant='contained'
            disableElevation
            className={classes.addButton}
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenForm(true)}
          >
            New Client
          </Button>
        </Grid>
      </Grid>
      <Paper variant='outlined' className={classes.paper}>
        <ClientTable
          isLoadingData={isSearchingClient}
          isExportingData={isExportingData}
          clients={clients}
          count={count}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          setOpenSnackbar={setOpenSnackbar}
          setSnackbarVarient={setSnackbarVarient}
          handleChangePage={(event, page) => setCurrentPage(page)}
          handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
          handleViewClient={handleViewClient}
          handleViewContract={handleViewContract}
          handleViewJob={handleViewJob}
          handleViewEquipment={handleViewEquipment}
          handleDeleteClient={handleConfirmDeleteClient}
          agents={agents}
          query={query}
          setQuery={setQuery}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          handleCsvClick={handleCsvClick}
          csv={csv}
          column={column}
          setColumn={setColumn}
          tableSettingId={tableSettingId}
          currentRoleGrants={currentRoleGrants}
        />
      </Paper>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
      <SideBarContent title='Create New Client' open={openForm} onClickDrawer={() => setOpenForm(false)} width='80%'>
        <CreateForm agentMaster={agents} addNewClient={addNewClient} handleCancel={() => setOpenForm(false)} handleSnackbar={handleSnackbar} />
      </SideBarContent>
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
          url={GET_DELETE_CLIENT_URL(clientId)}
          title='Delete Client'
          message='delete client'
          handleSnackbar={handleSnackbar}
        />
      )}
    </Container>
  );
};

export default ClientPage;
