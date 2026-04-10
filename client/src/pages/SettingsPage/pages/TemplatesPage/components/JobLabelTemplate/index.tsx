import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import JobLabelTable from './components/JobLabelTable';
import ActionSnackbar from 'components/ActionSnackbar';

import { JOB_LABEL_TEMPLATE_BASE_URL } from 'constants/url';
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

const JobLabelTemplate: FC = () => {
  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const [isSearchingJobLabelTemplate, setSearchingJobLabelTemplate] = useState<boolean>(false);
  const [, setSearchJobLabelTemplateError] = useState<boolean>(false);
  const [jobLabelTemplates, setJobLabelTemplates] = useState<JobLabelTemplateModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openCreateJobLabelTemplate, setOpenCreateJobLabelTemplate] = useState<boolean>(false);
  const [openEditJobLabelTemplate, setOpenEditJobLabelTemplate] = useState<boolean>(false);
  const [currentEditingJobLabelTemplateIndex, setCurrentEditingJobLabelTemplateIndex] = useState<number>(0);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  // Search JobLabelTemplate whenever rowsPerPage, currentPage, queryString changes
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

    const searchJobLabelTemplate = async () => {
      setSearchingJobLabelTemplate(true);
      setSearchJobLabelTemplateError(false);

      try {
        const url = `${JOB_LABEL_TEMPLATE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setJobLabelTemplates(data.JobLabelTemplates);
      } catch (err) {
        setSearchJobLabelTemplateError(true);
      }

      setSearchingJobLabelTemplate(false);
    };

    searchJobLabelTemplate();

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

  const handleOpenCreateJobLabelTemplate = () => {
    setOpenEditJobLabelTemplate(false);
    setOpenCreateJobLabelTemplate(true);
  };

  const handleCancelCreateJobLabelTemplate = () => {
    setOpenCreateJobLabelTemplate(false);
  };

  const handleOpenEditJobLabelTemplate = (skillIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingJobLabelTemplateIndex(skillIndex);
    setOpenCreateJobLabelTemplate(false);
    setOpenEditJobLabelTemplate(true);
  };

  const handleCancelEditJobLabelTemplate = () => {
    setOpenEditJobLabelTemplate(false);
  };
  const addNewJobLabelTemplate = (jobLabelTemplate: JobLabelTemplateModel) => {
    jobLabelTemplate.new = true;
    jobLabelTemplates.unshift(jobLabelTemplate);
    setJobLabelTemplates([...jobLabelTemplates]);
    setCount(c => c + 1);
  };

  const updateIndividualJobLabelTemplate = (updatedJobLabelTemplateProperties: Partial<JobLabelTemplateModel>) => {
    setJobLabelTemplates(
      jobLabelTemplates!.map((jobLabelTemplate, index) => {
        if (index !== currentEditingJobLabelTemplateIndex) {
          return jobLabelTemplate;
        }

        return Object.assign({}, jobLabelTemplate, updatedJobLabelTemplateProperties);
      })
    );
  };

  const deleteIndividualJobLabelTemplate = (skillIndex: number) => {
    jobLabelTemplates.splice(skillIndex, 1);
    setJobLabelTemplates([...jobLabelTemplates]);
    setCount(c => c - 1);
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Job Labels...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          id='add_button'
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingJobLabelTemplate}
          disableElevation
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={() => {
            handleOpenCreateJobLabelTemplate();
          }}
        >
          New Template
          <LoadingButtonIndicator isLoading={isSearchingJobLabelTemplate} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <JobLabelTable
        isLoadingData={isSearchingJobLabelTemplate}
        jobLabelTemplates={jobLabelTemplates}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        openCreateJobLabelTemplate={openCreateJobLabelTemplate}
        handleCancelCreateJobLabelTemplate={handleCancelCreateJobLabelTemplate}
        addNewJobLabelTemplate={addNewJobLabelTemplate}
        openEditJobLabelTemplate={openEditJobLabelTemplate}
        jobLabelTemplate={jobLabelTemplates[currentEditingJobLabelTemplateIndex]}
        currentEditingJobLabelTemplateIndex={currentEditingJobLabelTemplateIndex}
        handleOpenEditJobLabelTemplate={handleOpenEditJobLabelTemplate}
        handleCancelEditJobLabelTemplate={handleCancelEditJobLabelTemplate}
        updateIndividualJobLabelTemplate={updateIndividualJobLabelTemplate}
        deleteIndividualJobLabelTemplate={deleteIndividualJobLabelTemplate}
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

export default JobLabelTemplate;
