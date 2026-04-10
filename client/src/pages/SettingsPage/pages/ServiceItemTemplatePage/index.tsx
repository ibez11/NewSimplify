import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import { Button, CircularProgress, Divider, Fade, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import ExportIcon from '@material-ui/icons/GetApp';
import axios, { CancelTokenSource } from 'axios';
import { CSVLink } from 'react-csv';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import ServiceItemTemplateTable from './components/ServiceItemTemplateTable';
import ActionSnackbar from 'components/ActionSnackbar';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { SERVICE_ITEM_TEMPLATE_BASE_URL } from 'constants/url';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto'
  },
  addButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    marginLeft: theme.spacing(2)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const ServiceItemTemplatePage: FC = () => {
  useCurrentPageTitleUpdater('Services');

  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingServiceItemTemplate, setSearchingServiceItemTemplate] = useState<boolean>(false);
  const [, setSearchServiceItemTemplateError] = useState<boolean>(false);
  const [serviceItemTemplates, setServiceItemTemplates] = useState<ServiceItemTemplatesModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openCreateServiceItemTemplate, setOpenCreateServiceItemTemplate] = useState<boolean>(false);
  const [openEditServiceItemTemplate, setOpenEditServiceItemTemplate] = useState<boolean>(false);
  const [currentEditingServiceTemplateIndex, setCurrentEditingServiceTemplateIndex] = useState<number>(0);

  const [csv, setCsv] = useState<CSVServiceItemTemplateModel[]>([]);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);
  const csvInstance = useRef<any | null>(null);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  const getQueryParams = (noLimit?: boolean) => {
    const params = new URLSearchParams();
    if (queryString) {
      params.append('q', queryString);
    }

    if (!noLimit) {
      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());
    }

    return params.toString();
  };

  // Search Service whenever rowsPerPage, currentPage, queryString changes
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const searchServiceItemTemplate = async () => {
      setSearchingServiceItemTemplate(true);
      setSearchServiceItemTemplateError(false);

      try {
        const url = `${SERVICE_ITEM_TEMPLATE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setServiceItemTemplates(data.serviceItemTemplates);
      } catch (err) {
        setSearchServiceItemTemplateError(true);
      }

      setSearchingServiceItemTemplate(false);
    };

    searchServiceItemTemplate();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleOpenCreateServiceItemTemplate = () => {
    setOpenEditServiceItemTemplate(false);
    setOpenCreateServiceItemTemplate(true);
  };

  const handleCancelCreateServiceItemTemplate = () => {
    setOpenCreateServiceItemTemplate(false);
  };

  const handleOpenEditServiceItemTemplate = (serviceItemTemplateIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingServiceTemplateIndex(serviceItemTemplateIndex);
    setOpenCreateServiceItemTemplate(false);
    setOpenEditServiceItemTemplate(true);
  };

  const handleCancelEditServiceItemTemplate = () => {
    setOpenEditServiceItemTemplate(false);
  };

  const addNewServiceItemTemplate = (serviceItemTemplate: ServiceItemTemplatesModel) => {
    serviceItemTemplate.new = true;
    serviceItemTemplates.unshift(serviceItemTemplate);
    setServiceItemTemplates([...serviceItemTemplates]);
    setCount(c => c + 1);
  };

  const updateIndividualServiceItemTemplate = (updatedServiceItemTemplateProperties: Partial<ServiceItemTemplatesModel>) => {
    setServiceItemTemplates(
      serviceItemTemplates!.map((serviceItemTemplate, index) => {
        if (index !== currentEditingServiceTemplateIndex) {
          return serviceItemTemplate;
        }

        return Object.assign({}, serviceItemTemplate, updatedServiceItemTemplateProperties);
      })
    );
  };

  const deleteIndividualServiceItemTemplate = (serviceItemTemplateIndex: number) => {
    serviceItemTemplates.splice(serviceItemTemplateIndex, 1);
    setServiceItemTemplates([...serviceItemTemplates]);
    setCount(c => c - 1);
  };

  const handleCsvClick = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    try {
      setIsExportingData(true);
      const url = `${SERVICE_ITEM_TEMPLATE_BASE_URL}?${getQueryParams(true)}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

      let csvData: CSVServiceItemTemplateModel[] = [];
      if (data && data.serviceItemTemplates.length > 0) {
        await Promise.all(
          data.serviceItemTemplates.map(async (value: any) => {
            csvData.push({
              id: value.id,
              name: value.name,
              description: value.description,
              unitPrice: value.unitPrice
            });
          })
        );
      }

      setCsv(csvData);
      setIsExportingData(false);
      csvInstance.current.link.click();
    } catch (error) {
      console.log(error);
      setIsExportingData(false);
    }
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Service...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Grid>
          {csv.length > 0 ? (
            <CSVLink
              headers={[
                { label: 'id', key: 'id' },
                { label: 'Service Item Name', key: 'name' },
                { label: 'Description', key: 'description' },
                { label: 'Unit Price', key: 'unitPrice' }
              ]}
              filename={'Service Item Template.csv'}
              asyncOnClick={true}
              onClick={() => {
                setIsExportingData(true);
                return false;
              }}
              ref={csvInstance}
              data={csv}
            >
              <Button
                color='secondary'
                size='medium'
                variant='contained'
                disabled={isSearchingServiceItemTemplate}
                disableElevation
                className={classes.addButton}
              >
                <ExportIcon className={classes.extendedIcon} />
                Export to CSV
              </Button>
            </CSVLink>
          ) : (
            <Button
              color='secondary'
              size='medium'
              variant='contained'
              disableElevation
              className={classes.addButton}
              disabled={isExportingData}
              startIcon={<ExportIcon />}
              onClick={() => {
                handleCsvClick();
              }}
            >
              Export to CSV
              {isExportingData && (
                <Fade
                  in={isExportingData}
                  style={{
                    transitionDelay: '0ms'
                  }}
                  unmountOnExit
                >
                  <CircularProgress size={24} className={classes.buttonProgress} />
                </Fade>
              )}
            </Button>
          )}
          <Button
            color='primary'
            size='medium'
            variant='contained'
            disabled={isSearchingServiceItemTemplate}
            disableElevation
            className={classes.addButton}
            startIcon={<AddIcon />}
            onClick={() => {
              handleOpenCreateServiceItemTemplate();
            }}
          >
            New Service Item
          </Button>
        </Grid>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <ServiceItemTemplateTable
        isLoadingData={isSearchingServiceItemTemplate}
        serviceItemTemplates={serviceItemTemplates}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        openCreateServiceItemTemplate={openCreateServiceItemTemplate}
        handleCancelCreateServiceItemTemplate={handleCancelCreateServiceItemTemplate}
        addNewServiceItemTemplate={addNewServiceItemTemplate}
        deleteIndividualServiceItemTemplate={deleteIndividualServiceItemTemplate}
        openEditServiceItemTemplate={openEditServiceItemTemplate}
        serviceItemTemplate={serviceItemTemplates[currentEditingServiceTemplateIndex]}
        currentEditingServiceTemplateIndex={currentEditingServiceTemplateIndex}
        handleOpenEditServiceItemTemplate={handleOpenEditServiceItemTemplate}
        handleCancelEditServiceItemTemplate={handleCancelEditServiceItemTemplate}
        updateIndividualServiceItemTemplate={updateIndividualServiceItemTemplate}
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

export default ServiceItemTemplatePage;
