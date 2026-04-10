import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import AgentTable from './components/AgentTable';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { AGENT_BASE_URL } from 'constants/url';
import ActionSnackbar from 'components/ActionSnackbar';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto'
  },
  addButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  }
}));

const AgentPage: FC = () => {
  useCurrentPageTitleUpdater('Agent');

  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingAgent, setSearchingAgent] = useState<boolean>(false);
  const [, setSearchAgentError] = useState<boolean>(false);
  const [agents, setAgents] = useState<AgentsModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openCreateAgent, setOpenCreateAgent] = useState<boolean>(false);
  const [openEditAgent, setOpenEditAgent] = useState<boolean>(false);
  const [currentEditingAgentIndex, setCurrentEditingAgentIndex] = useState<number>(0);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  // Search Agent whenever rowsPerPage, currentPage, queryString changes
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }

      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchAgent = async () => {
      setSearchingAgent(true);
      setSearchAgentError(false);

      try {
        const url = `${AGENT_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setAgents(data.agents);
      } catch (err) {
        setSearchAgentError(true);
      }

      setSearchingAgent(false);
    };

    searchAgent();

    return () => {
      cancelTokenSource.cancel();
    };
  }, [rowsPerPage, currentPage, queryString]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  const handleSearch = useCallback((searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  }, []);

  const debouncedSearchTerm = useDebounce(query, 500);
  // Load client data to populate on search list
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const handleOpenCreateAgent = () => {
    setOpenEditAgent(false);
    setOpenCreateAgent(true);
  };

  const handleCancelCreateAgent = () => {
    setOpenCreateAgent(false);
  };

  const handleOpenEditAgent = (agentIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingAgentIndex(agentIndex);
    setOpenCreateAgent(false);
    setOpenEditAgent(true);
  };

  const handleCancelEditAgent = () => {
    setOpenEditAgent(false);
  };

  const addNewAgent = (agent: AgentsModel) => {
    agent.new = true;
    agents.unshift(agent);
    setAgents([...agents]);
    setCount(c => c + 1);
  };

  const updateIndividualAgent = (updatedAgentProperties: Partial<AgentsModel>) => {
    setAgents(
      agents!.map((agent, index) => {
        if (index !== currentEditingAgentIndex) {
          return agent;
        }

        return Object.assign({}, agent, updatedAgentProperties);
      })
    );
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Agent...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingAgent}
          disableElevation
          className={classes.addButton}
          onClick={handleOpenCreateAgent}
        >
          <AddIcon className={classes.extendedIcon} />
          New Agent
          <LoadingButtonIndicator isLoading={isSearchingAgent} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <AgentTable
        isLoadingData={isSearchingAgent}
        agents={agents}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        openCreateAgent={openCreateAgent}
        handleCancelCreateAgent={handleCancelCreateAgent}
        addNewAgent={addNewAgent}
        openEditAgent={openEditAgent}
        agent={agents[currentEditingAgentIndex]}
        currentEditingAgentIndex={currentEditingAgentIndex}
        handleOpenEditAgent={handleOpenEditAgent}
        handleCancelEditAgent={handleCancelEditAgent}
        updateIndividualAgent={updateIndividualAgent}
        handleSnackbar={handleSnackbar}
      />
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={() => setOpenSnackbar(false)}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </Paper>
  );
};

export default AgentPage;
