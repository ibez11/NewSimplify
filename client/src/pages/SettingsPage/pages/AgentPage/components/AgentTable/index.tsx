import React, { FC, useState, useEffect, useCallback } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';

import CreateEditAgentForm from './components/CreateEditAgentForm';

import HeaderRow from 'components/HeaderRow';
import BodyRow from './components/BodyRow';
import BodyCell from 'components/BodyCell';
import TablePagination from 'components/TablePagination';
import { AGENT_BASE_URL, GET_EDIT_AGENT_URL } from 'constants/url';
import { dummyAgent } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  agents: AgentsModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  openCreateAgent: boolean;
  handleCancelCreateAgent(): void;
  openEditAgent: boolean;
  agent?: AgentsModel;
  currentEditingAgentIndex: number;
  handleOpenEditAgent: (agentIndex: number) => React.MouseEventHandler;
  handleCancelEditAgent(): void;
  addNewAgent(agent: AgentsModel): void;
  updateIndividualAgent: (updatedAgentProperties: Partial<AgentsModel>) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const AgentTable: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const {
    isLoadingData,
    agents,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    openCreateAgent,
    handleCancelCreateAgent,
    openEditAgent,
    agent,
    currentEditingAgentIndex,
    handleOpenEditAgent,
    handleCancelEditAgent,
    addNewAgent,
    updateIndividualAgent,
    handleSnackbar
  } = props;

  const [isLoading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [nameError, setNameError] = useState<string>('');

  const resetInputFormValues = () => {
    setName('');
    setDescription('');
  };

  const resetEditFormValues = useCallback(() => {
    if (!agent) {
      return;
    }

    const { name, description } = agent;

    setName(name);
    setDescription(description ? description : '');
  }, [agent]);

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  useEffect(() => {
    if (!openEditAgent) {
      if (isLoadingData) {
        setShowSkeleton(true);
      }

      resetInputFormValues();
      clearFormErrors();

      return () => {
        setShowSkeleton(false);
      };
    } else {
      resetEditFormValues();
      clearFormErrors();
    }
  }, [openEditAgent, isLoadingData, resetEditFormValues]);

  const handleCloseCreateAgent = () => {
    handleCancelCreateAgent();
    resetInputFormValues();
    clearFormErrors();
  };

  const handleCloseEditAgent = () => {
    handleCancelEditAgent();
    resetInputFormValues();
    clearFormErrors();
  };

  const clearFormErrors = () => {
    setNameError('');
  };

  const validateForm = () => {
    let ret = true;
    clearFormErrors();

    if (!name || !name.trim()) {
      setNameError('Please enter agent name');
      ret = false;
    }

    return ret;
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      cancelTokenSource = axios.CancelToken.source();
      if (!openEditAgent) {
        const response = await axios.post(
          `${AGENT_BASE_URL}`,
          {
            name,
            description
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewAgent(response.data);
        handleSnackbar('success', 'Successfully added new agent');
      } else {
        const response = await axios.put(
          `${GET_EDIT_AGENT_URL(agent!.id)}`,
          {
            name,
            description
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualAgent(response.data);
        handleSnackbar('success', 'Successfully edited new agent');
      }
      !openEditAgent ? handleCloseCreateAgent() : handleCloseEditAgent();
    } catch (err) {
      const error = err as any;
      const { errorCode } = error.data;
      if (errorCode === 28) {
        handleSnackbar('error', 'This agent has been added in the system');
      } else {
        handleSnackbar('error', !openEditAgent ? 'Failed to create agent' : 'Failed to edit a new agent');
      }
    }

    setLoading(false);
  };

  // headerNameWithPaddings['headerName:pL:pR:pT:pB']
  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow
            headers={[{ label: 'Agent Name' }, { label: 'Description' }, { label: 'Action', pL: '110px', pR: '0px', pT: '0px', pB: '0px' }]}
          />
        </TableHead>
        <TableBody>
          {openCreateAgent && (
            <CreateEditAgentForm
              name={name}
              setName={setName}
              nameError={nameError}
              description={description}
              setDescription={setDescription}
              isSubmitting={isLoading}
              onSubmit={handleOnSubmit}
              onCancel={handleCloseCreateAgent}
              primaryButtonLabel={'Save'}
            />
          )}
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map(index => (
              <BodyRow index={index} key={index} agent={dummyAgent} onEditAgent={handleOpenEditAgent(index)} isLoadingData={showSkeleton} />
            ))
          ) : agents.length > 0 ? (
            agents.map((agent, index) =>
              openEditAgent && currentEditingAgentIndex === index ? (
                <CreateEditAgentForm
                  key={agent.id}
                  name={name}
                  setName={setName}
                  nameError={nameError}
                  description={description}
                  setDescription={setDescription}
                  isSubmitting={isLoading}
                  onSubmit={handleOnSubmit}
                  onCancel={handleCloseEditAgent}
                  primaryButtonLabel={'Save'}
                  customBackground={'#F4F9FC'}
                />
              ) : (
                <BodyRow index={index} key={agent.id} agent={agent} onEditAgent={handleOpenEditAgent(index)} isLoadingData={showSkeleton} />
              )
            )
          ) : (
            <TableRow>
              <BodyCell colSpan={3}>
                <Typography variant='body2' color='textSecondary' style={{ textAlign: 'center' }}>
                  No matching result
                </Typography>
              </BodyCell>
            </TableRow>
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          count={count}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Table>
    </div>
  );
};

export default AgentTable;
