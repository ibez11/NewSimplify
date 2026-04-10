import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import ServiceTemplateTable from './componentes/ServiceTemplateTable';
import ActionSnackbar from 'components/ActionSnackbar';

import { SERVICE_TEMPLATE_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import SideBarContent from 'components/SideBarContent';
import ServiceTemplateForm from './componentes/ServiceTemplateForm';
import { dummyServiceTemplate } from 'constants/dummy';

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

const ServiceTemplates: FC = () => {
  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingServiceTemplate, setSearchingServiceTemplate] = useState<boolean>(false);
  const [, setSearchServiceTemplateError] = useState<boolean>(false);
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplatesModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [currentEditingServiceTemplateIndex, setCurrentEditingServiceTemplateIndex] = useState<number>(-1);
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

  // Search Service whenever rowsPerPage, currentPage, queryString changes
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

    const searchServiceTemplate = async () => {
      setSearchingServiceTemplate(true);
      setSearchServiceTemplateError(false);

      try {
        const url = `${SERVICE_TEMPLATE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setServiceTemplates(data.serviceTemplates);
      } catch (err) {
        setSearchServiceTemplateError(true);
      }

      setSearchingServiceTemplate(false);
    };

    searchServiceTemplate();

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

  const handleOpenEditServiceItemTemplate = (serviceTemplateIndex: number): React.MouseEventHandler => () => {
    setIsEdit(true);
    setCurrentEditingServiceTemplateIndex(serviceTemplateIndex);
    setOpenForm(true);
  };

  const addNewServiceTemplate = (serviceTemplate: ServiceTemplatesModel) => {
    serviceTemplate.new = true;
    serviceTemplates.unshift(serviceTemplate);
    setServiceTemplates([...serviceTemplates]);
    setCount(c => c + 1);
  };

  const updateIndividualServiceTemplate = (serviceTemplateIndex: number) => {
    return (updatedServiceTemplateProperties: Partial<ServiceTemplatesModel>) => {
      setServiceTemplates(
        serviceTemplates!.map((serviceTemplate, index) => {
          if (index !== serviceTemplateIndex) {
            return serviceTemplate;
          }

          return Object.assign({}, serviceTemplate, updatedServiceTemplateProperties);
        })
      );
    };
  };

  const deleteIndividualServiceTemplate = (serviceTemplateIndex: number) => {
    serviceTemplates.splice(serviceTemplateIndex, 1);
    setServiceTemplates([...serviceTemplates]);
    setCount(c => c - 1);
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Quotations...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingServiceTemplate}
          disableElevation
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          New Template
          <LoadingButtonIndicator isLoading={isSearchingServiceTemplate} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <ServiceTemplateTable
        isLoadingData={isSearchingServiceTemplate}
        serviceTemplates={serviceTemplates}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        handleOpenEditServiceTemplate={handleOpenEditServiceItemTemplate}
        addNewServiceTemplate={addNewServiceTemplate}
        deleteIndividualServiceTemplate={deleteIndividualServiceTemplate}
        handleSnackbar={handleSnackbar}
      />
      <SideBarContent
        title={isEdit ? 'Edit Quotation Template' : 'Add Quotation Template'}
        open={openForm}
        onClickDrawer={() => setOpenForm(false)}
        width={'55%'}
      >
        <ServiceTemplateForm
          serviceTemplate={isEdit ? serviceTemplates[currentEditingServiceTemplateIndex] : dummyServiceTemplate}
          isEdit={isEdit}
          addNewServiceTemplate={addNewServiceTemplate}
          updateIndividualServiceTemplate={updateIndividualServiceTemplate(currentEditingServiceTemplateIndex)}
          handleClose={() => {
            setOpenForm(false);
            setIsEdit(false);
            setCurrentEditingServiceTemplateIndex(0);
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

export default ServiceTemplates;
