import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import JobNoteTable from './components/JobNoteTable';
import ActionSnackbar from 'components/ActionSnackbar';

import { JOB_NOTE_TEMPLATE_BASE_URL } from 'constants/url';
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

const JobNoteTemplate: FC = () => {
  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const [isSearchingJobNoteTemplate, setSearchingJobNoteTemplate] = useState<boolean>(false);
  const [, setSearchJobNoteTemplateError] = useState<boolean>(false);
  const [jobNoteTemplates, setJobNoteTemplates] = useState<JobNoteTemplateModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openCreateJobNoteTemplate, setOpenCreateJobNoteTemplate] = useState<boolean>(false);
  const [openEditJobNoteTemplate, setOpenEditJobNoteTemplate] = useState<boolean>(false);
  const [currentEditingJobNoteTemplateIndex, setCurrentEditingJobNoteTemplateIndex] = useState<number>(0);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  // Search JobNoteTemplate whenever rowsPerPage, currentPage, queryString changes
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

    const searchJobNoteTemplate = async () => {
      setSearchingJobNoteTemplate(true);
      setSearchJobNoteTemplateError(false);

      try {
        const url = `${JOB_NOTE_TEMPLATE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setJobNoteTemplates(data.JobNoteTemplates);
      } catch (err) {
        setSearchJobNoteTemplateError(true);
      }

      setSearchingJobNoteTemplate(false);
    };

    searchJobNoteTemplate();

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

  const handleOpenCreateJobNoteTemplate = () => {
    setOpenEditJobNoteTemplate(false);
    setOpenCreateJobNoteTemplate(true);
  };

  const handleCancelCreateJobNoteTemplate = () => {
    setOpenCreateJobNoteTemplate(false);
  };

  const handleOpenEditJobNoteTemplate = (skillIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingJobNoteTemplateIndex(skillIndex);
    setOpenCreateJobNoteTemplate(false);
    setOpenEditJobNoteTemplate(true);
  };

  const handleCancelEditJobNoteTemplate = () => {
    setOpenEditJobNoteTemplate(false);
  };

  const addNewJobNoteTemplate = (jobNoteTemplate: JobNoteTemplateModel) => {
    jobNoteTemplate.new = true;
    jobNoteTemplates.unshift(jobNoteTemplate);
    setJobNoteTemplates([...jobNoteTemplates]);
    setCount(c => c + 1);
  };

  const updateIndividualJobNoteTemplate = (updatedJobNoteTemplateProperties: Partial<JobNoteTemplateModel>) => {
    setJobNoteTemplates(
      jobNoteTemplates!.map((jobNoteTemplate, index) => {
        if (index !== currentEditingJobNoteTemplateIndex) {
          return jobNoteTemplate;
        }

        return Object.assign({}, jobNoteTemplate, updatedJobNoteTemplateProperties);
      })
    );
  };

  const deleteIndividualJobNoteTemplate = (skillIndex: number) => {
    jobNoteTemplates.splice(skillIndex, 1);
    setJobNoteTemplates([...jobNoteTemplates]);
    setCount(c => c - 1);
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Job Notes...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingJobNoteTemplate}
          disableElevation
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={() => {
            handleOpenCreateJobNoteTemplate();
          }}
        >
          New Template
          <LoadingButtonIndicator isLoading={isSearchingJobNoteTemplate} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <JobNoteTable
        isLoadingData={isSearchingJobNoteTemplate}
        jobNoteTemplates={jobNoteTemplates}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        openCreateJobNoteTemplate={openCreateJobNoteTemplate}
        handleCancelCreateJobNoteTemplate={handleCancelCreateJobNoteTemplate}
        addNewJobNoteTemplate={addNewJobNoteTemplate}
        openEditJobNoteTemplate={openEditJobNoteTemplate}
        jobNoteTemplate={jobNoteTemplates[currentEditingJobNoteTemplateIndex]}
        currentEditingJobNoteTemplateIndex={currentEditingJobNoteTemplateIndex}
        handleOpenEditJobNoteTemplate={handleOpenEditJobNoteTemplate}
        handleCancelEditJobNoteTemplate={handleCancelEditJobNoteTemplate}
        updateIndividualJobNoteTemplate={updateIndividualJobNoteTemplate}
        deleteIndividualJobNoteTemplate={deleteIndividualJobNoteTemplate}
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

export default JobNoteTemplate;
