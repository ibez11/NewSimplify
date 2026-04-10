import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import ChecklistTemplateTable from './components/ChecklistTemplateTable';
import ActionSnackbar from 'components/ActionSnackbar';

import { CHECKLIST_TEMPLATE_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import SideBarContent from 'components/SideBarContent';
import ChecklistTemplateForm from './components/ChecklistTemplateForm';
import { dummyChecklistTemplate } from 'constants/dummy';

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

const ChecklistTemplate: FC = () => {
  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingChecklistTemplate, setSearchingChecklistTemplate] = useState<boolean>(false);
  const [, setSearchChecklistTemplateError] = useState<boolean>(false);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplateModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [currentEditingChecklistTemplateIndex, setCurrentEditingChecklistTemplateIndex] = useState<number>(-1);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

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

    const searchChecklistTemplate = async () => {
      setSearchingChecklistTemplate(true);
      setSearchChecklistTemplateError(false);

      try {
        const url = `${CHECKLIST_TEMPLATE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setChecklistTemplates(data.checklistTemplates);
      } catch (err) {
        setSearchChecklistTemplateError(true);
      }

      setSearchingChecklistTemplate(false);
    };

    searchChecklistTemplate();

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

  const handleOpenEditChecklistTemplate = (checklistTemplateIndex: number): React.MouseEventHandler => () => {
    setIsEdit(true);
    setCurrentEditingChecklistTemplateIndex(checklistTemplateIndex);
    setOpenForm(true);
  };

  const addNewChecklistTemplate = (checklistTemplate: ChecklistTemplateModel) => {
    checklistTemplate.new = true;
    checklistTemplates.unshift(checklistTemplate);
    setChecklistTemplates([...checklistTemplates]);
    setCount(c => c + 1);
  };

  const updateIndividualChecklistTemplate = (checklistTemplateIndex: number) => {
    return (updatedChecklistTemplateProperties: Partial<ChecklistTemplateModel>) => {
      setChecklistTemplates(
        checklistTemplates!.map((checklistTemplate, index) => {
          if (index !== checklistTemplateIndex) {
            return checklistTemplate;
          }

          return Object.assign({}, checklistTemplate, updatedChecklistTemplateProperties);
        })
      );
    };
  };

  const deleteIndividualChecklistTemplate = (checklistTemplateIndex: number) => {
    checklistTemplates.splice(checklistTemplateIndex, 1);
    setChecklistTemplates([...checklistTemplates]);
    setCount(c => c - 1);
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Templates...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingChecklistTemplate}
          disableElevation
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          New Template
          <LoadingButtonIndicator isLoading={isSearchingChecklistTemplate} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <ChecklistTemplateTable
        isLoadingData={isSearchingChecklistTemplate}
        checklistTemplates={checklistTemplates}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        handleOpenEditChecklistTemplate={handleOpenEditChecklistTemplate}
        addNewChecklistTemplate={addNewChecklistTemplate}
        deleteIndividualChecklistTemplate={deleteIndividualChecklistTemplate}
        handleSnackbar={handleSnackbar}
      />
      <SideBarContent
        title={isEdit ? 'Edit Checklist Template' : 'Add Checklist Template'}
        open={openForm}
        onClickDrawer={() => setOpenForm(false)}
        width={'55%'}
      >
        <ChecklistTemplateForm
          checklistTemplate={isEdit ? checklistTemplates[currentEditingChecklistTemplateIndex] : dummyChecklistTemplate}
          isEdit={isEdit}
          addNewChecklistTemplate={addNewChecklistTemplate}
          updateIndividualChecklistTemplate={updateIndividualChecklistTemplate(currentEditingChecklistTemplateIndex)}
          handleClose={() => {
            setOpenForm(false);
            setIsEdit(false);
            setCurrentEditingChecklistTemplateIndex(0);
          }}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
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

export default ChecklistTemplate;
