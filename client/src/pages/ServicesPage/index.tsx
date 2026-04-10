import React, { FC, useState, useContext, useEffect, useCallback } from 'react';
import axios, { CancelTokenSource } from 'axios';

import clsx from 'clsx';
import useDebounce from 'hooks/useDebounce';

import { Container, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { CurrentPageContext } from 'contexts/CurrentPageContext';
import { TableColumnSettingContext } from 'contexts/TableColumnSettingContext';
import { format, addMonths, subMonths, subDays, startOfWeek, endOfWeek, startOfMonth, lastDayOfMonth } from 'date-fns';
import {
  SERVICE_BASE_URL,
  ENTITY_BASE_URL,
  GET_SERVICE_CSV_URL,
  GET_CONFIRM_SERVICE_URL,
  GET_CANCEL_SERVICE_URL,
  GET_DELETE_SERVICES_URL
} from 'constants/url';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import ActionSnackbar from 'components/ActionSnackbar';
import CustomizedTabs from 'components/CustomizedTabs';
import Breadcrumb from 'components/Breadcrumb';

import ServiceTable from './components/ServiceTable';
import InvoiceForm from './components/InvoiceForm';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { dummyServiceColumn } from 'constants/dummy';
import ExportCsvProgress from 'components/ExportCsvProgress';
import PasswordConfirmation from 'components/PasswordConfirmation';
import SideBarContent from 'components/SideBarContent';
import ServiceForm from 'pages/ServiceForm';
import CustomizedDialog from 'components/CustomizedDialog';
import { ucWords } from 'utils';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants } from 'selectors';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(1)
    }
  },
  paper: {
    margin: 'auto'
  }
}));

const ServicesPage: FC = () => {
  useCurrentPageTitleUpdater('Quotation List');

  const classes = useStyles();
  const { currentPageTitle } = useContext(CurrentPageContext);
  const { tableColumn } = useContext(TableColumnSettingContext);
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [selectedTab, setSelectedTab] = useState<number>(0);

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingContract, setSearchingContract] = useState<boolean>(false);
  const [contracts, setContracts] = useState<ServiceModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('id');
  const [filterBy, setFilterBy] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [entities, setEntities] = useState<Select[]>([]);
  const [contractTypes, setContractTypes] = useState<Select[]>([]);
  const [contractTypeFilter, setContractTypeFilter] = useState<ColumnFilter[]>([]);
  const [entityFilter, setEntityFilter] = useState<ColumnFilter[]>([]);
  const [invoiceFilter, setInvoiceFilter] = useState<ColumnFilter[]>([]);
  const [renewFilter, setRenewFilter] = useState<ColumnFilter[]>([]);

  const [csv, setCsv] = useState<CSVContractModel[]>([]);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const [openEditInvoice, setOpenEditInvoice] = useState<boolean>(false);
  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isRenew, setIsRenew] = useState<boolean>(false);
  const [oldContractId, setOldContractId] = useState<number>(0);
  const [serviceId, setServicetId] = useState<number>(0);
  const [, setServiceType] = useState<string>('');

  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);

  const [column, setColumn] = useState<any[]>(dummyServiceColumn);
  const [tableSettingId, setTableSettingId] = useState<number>(4);

  // Search Contract whenever rowsPerPage, currentPage, queryString, contract, and filterby changes
  const fetchData = useCallback(() => {
    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }

      if (selectedTab) {
        params.append('c', selectedTab.toString());
        if (selectedTab === 1) {
          params.append('fb', 'active');
        } else if (selectedTab === 2) {
          params.append('fb', 'expiring');
          params.append('na', 'true');
        }
        if (selectedTab === 3) {
          const newStartDate = subMonths(startDate || new Date(), 6);
          const newEndDate = subDays(endDate || new Date(), 1);
          params.append('fb', 'custom');
          params.append('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
          params.append('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
          params.append('na', 'true');
        }
      }

      if (filterBy) {
        if (filterBy === 'termStart' || filterBy === 'termEnd') {
          params.set('fb', filterBy.toString());
          if (selectedTab === 3) {
            params.set('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd') : '');
            params.set('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd') : '');
          } else {
            params.append('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd') : '');
            params.append('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd') : '');
          }
        } else if (filterBy === 'within1Month') {
          const newEndDate = addMonths(startDate || new Date(), 1);
          params.set('fb', 'custom');
          params.set('sd', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        } else if (filterBy === 'within2Month') {
          const newEndDate = addMonths(startDate || new Date(), 2);
          params.set('fb', 'custom');
          params.set('sd', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        } else if (filterBy === 'today') {
          params.set('fb', 'termStart');
          params.set('sd', format(new Date(), 'yyyy-MM-dd'));
          params.set('ed', format(new Date(), 'yyyy-MM-dd'));
        } else if (filterBy === 'thisWeek') {
          params.set('fb', 'termStart');
          params.set('sd', format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
          params.set('ed', format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        } else if (filterBy === 'thisMonth') {
          params.set('fb', 'termStart');
          params.set('sd', format(startOfMonth(new Date()), 'yyyy-MM-dd'));
          params.set('ed', format(lastDayOfMonth(new Date()), 'yyyy-MM-dd'));
        } else if (filterBy === 'lastMonth') {
          const newStartDate = subMonths(startDate || new Date(), 1);
          const newEndDate = subDays(endDate || new Date(), 1);
          params.set('fb', 'custom');
          params.set('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        } else if (filterBy === 'last3Month') {
          const newStartDate = subMonths(startDate || new Date(), 3);
          const newEndDate = subDays(endDate || new Date(), 1);
          params.set('fb', 'custom');
          params.set('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        }
      }

      if (orderBy) {
        params.append('ob', orderBy === 'term' ? 'date' : orderBy);
        params.append('ot', order);
      }

      if (contractTypeFilter.length !== 0) {
        contractTypeFilter.map(value => {
          return params.append('ct', value.columnValue === 0 ? 'ADHOC' : value.columnValue === 1 ? 'CONTRACT' : 'ADDITIONAL');
        });
      }

      if (entityFilter.length !== 0) {
        entityFilter.map(value => {
          return params.append('ei', value.columnValue.toString());
        });
      }

      if (invoiceFilter.length !== 0) {
        if (invoiceFilter.length === 1) {
          invoiceFilter.map(value => {
            return params.append('fi', value.columnValue.toString());
          });
        }
      }

      if (renewFilter.length !== 0) {
        if (renewFilter.length === 1) {
          renewFilter.map(value => {
            return params.append('rnw', value.columnValue === 1 ? 'true' : 'false');
          });
        }
      }

      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchContract = async () => {
      setSearchingContract(true);

      try {
        const url = `${SERVICE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setContracts(data.contracts);
        setContractTypes(
          selectedTab === 2 || selectedTab === 3
            ? [
                { id: 0, name: ucWords('AD-HOC SERVICE') },
                { id: 1, name: ucWords('SERVICE CONTRACT') }
              ]
            : [
                { id: 0, name: ucWords('AD-HOC SERVICE') },
                { id: 1, name: ucWords('SERVICE CONTRACT') },
                { id: 2, name: ucWords('SEPARATE QUOTATION') }
              ]
        );
      } catch (err) {
        console.log('err', err);
      }

      setSearchingContract(false);
    };

    searchContract();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rowsPerPage,
    currentPage,
    queryString,
    selectedTab,
    filterBy,
    startDate,
    endDate,
    contractTypeFilter,
    entityFilter,
    invoiceFilter,
    renewFilter,
    order,
    orderBy
  ]);

  const getEntitiesData = async () => {
    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

      const { data } = await axios.get(`${ENTITY_BASE_URL}`, { cancelToken: cancelTokenSource.token });
      setEntities(data.entities);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEntitiesData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tableColumn.length > 0) {
      const { column, id } = tableColumn.find(value => value.tableName === 'CONTRACT');

      setColumn(column);
      setTableSettingId(id);
    }
  }, [tableColumn]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    setFilterBy('');
    action(actionParam);
  };

  // Load contract data if search not empty and populate on search list
  const handleSearch = useCallback((searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  }, []);

  const debouncedSearchTerm = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const updateIndividual = (serviceIndex: number) => {
    return (updatedContractProperties: Partial<ServiceModel>) => {
      setContracts(
        contracts!.map((contract, index) => {
          if (index !== serviceIndex) {
            return contract;
          }

          return Object.assign({}, contract, updatedContractProperties);
        })
      );
    };
  };

  const handleOpenEditInvoice = (serviceIndex: number): React.MouseEventHandler => () => {
    setSelectedIndex(serviceIndex);
    setOpenEditInvoice(true);
  };

  const handleCancelEditInvoice = () => {
    setOpenEditInvoice(false);
  };

  const handleCancel = () => {
    setIsCancel(false);
    setIsDelete(false);
  };

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  const handleCsvClick = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    if (count >= 1000) {
      handleSnackbar('error', 'Cannot export more than 1000 records, please apply more filters to reduce the number of records.');
      return;
    }

    try {
      setIsExportingData(true);
      setCsv([]);
      setExportProgress(0);

      const getQueryParams = (newOffest: number) => {
        const params = new URLSearchParams();
        if (queryString) {
          params.append('q', queryString);
        }

        if (selectedTab) {
          params.append('c', selectedTab.toString());
          if (selectedTab === 1) {
            params.append('fb', 'active');
          } else if (selectedTab === 2) {
            params.append('fb', 'expiring');
            params.append('na', 'true');
          }
          if (selectedTab === 3) {
            const newStartDate = subMonths(startDate || new Date(), 6);
            const newEndDate = subDays(endDate || new Date(), 1);
            params.append('fb', 'custom');
            params.append('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
            params.append('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
            params.append('na', 'true');
          }
        }

        if (filterBy) {
          if (filterBy === 'termStart' || filterBy === 'termEnd') {
            params.set('fb', filterBy.toString());
            if (selectedTab === 3) {
              params.set('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd') : '');
              params.set('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd') : '');
            } else {
              params.append('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd') : '');
              params.append('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd') : '');
            }
          } else if (filterBy === 'within1Month') {
            const newEndDate = addMonths(startDate || new Date(), 1);
            params.set('fb', 'custom');
            params.set('sd', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
            params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
          } else if (filterBy === 'within2Month') {
            const newEndDate = addMonths(startDate || new Date(), 2);
            params.set('fb', 'custom');
            params.set('sd', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
            params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
          } else if (filterBy === 'today') {
            params.set('fb', 'custom');
            params.set('sd', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
            params.set('ed', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
          } else if (filterBy === 'lastMonth') {
            const newStartDate = subMonths(startDate || new Date(), 1);
            const newEndDate = subDays(endDate || new Date(), 1);
            params.set('fb', 'custom');
            params.set('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
            params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
          } else if (filterBy === 'last3Month') {
            const newStartDate = subMonths(startDate || new Date(), 3);
            const newEndDate = subDays(endDate || new Date(), 1);
            params.set('fb', 'custom');
            params.set('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
            params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
          }
        }

        if (orderBy) {
          params.append('ob', orderBy);
          params.append('ot', order);
        }

        if (contractTypeFilter.length !== 0) {
          contractTypeFilter.map(value => {
            return params.append('ct', value.columnValue === 0 ? 'ADHOC' : value.columnValue === 1 ? 'CONTRACT' : 'ADDITIONAL');
          });
        }

        if (entityFilter.length !== 0) {
          entityFilter.map(value => {
            return params.append('ei', value.columnValue.toString());
          });
        }

        if (invoiceFilter.length !== 0) {
          if (invoiceFilter.length === 1) {
            invoiceFilter.map(value => {
              return params.append('fi', value.columnValue.toString());
            });
          }
        }

        if (renewFilter.length !== 0) {
          if (renewFilter.length === 1) {
            renewFilter.map(value => {
              return params.append('rnw', value.columnValue === 1 ? 'true' : 'false');
            });
          }
        }

        params.append('s', newOffest.toString());
        params.append('l', '200');

        return params.toString();
      };

      let csvData: CSVContractModel[] = [];
      let counter = 0;
      for (let i = counter; i < count; ) {
        const url = `${GET_SERVICE_CSV_URL}?${getQueryParams(counter)}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        if (data.contracts && data.contracts.length > 0) {
          await Promise.all(
            data.contracts.map(async (value: any) => {
              csvData.push(value);
            })
          );
        }

        const progress = (counter / count) * 100;
        counter = counter + 200;
        i = counter;
        setExportProgress(progress);

        if (counter > count) {
          setCsv(csvData);
          setExportProgress(100);
        }
      }
      setIsExportingData(false);
      setOpenSnackbar(true);
      setSnackbarVarient('success');
      setSnackbarMessage('Successfully export');
    } catch (error) {
      console.log(error);
      setIsExportingData(false);
      setOpenSnackbar(true);
      setSnackbarVarient('error');
      setSnackbarMessage('Failed to export');
      setCsv([]);
    }
  };

  const handleConfirmAction = async (serviceId: number) => {
    setIsLoading(true);
    try {
      await axios.put(`${GET_CONFIRM_SERVICE_URL(serviceId)}`, { cancelToken: cancelTokenSource.token });
      handleSnackbar('success', 'Successfully approve quotation');
      fetchData();
      setOpenSuccessModal(false);
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed approve quotation');
    }
    setIsLoading(false);
  };

  const handleCancelAction = (index: number) => {
    setSelectedIndex(index);
    setIsCancel(true);
  };

  const handleDeleteAction = (index: number) => {
    setSelectedIndex(index);
    setIsDelete(true);
  };

  const handleRenewAction = (index: number) => {
    setSelectedIndex(index);
    setIsRenew(true);
    setOpenForm(true);
    setOldContractId(contracts[index].id);
  };

  const handleViewDetailAction = () => {
    window.open(`/quotations/${serviceId}`, '_blank');
    setOpenSuccessModal(false);
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Typography variant='h4' gutterBottom>
            {currentPageTitle}
          </Typography>
          <Breadcrumb pages={['quotations']} />
        </Grid>
      </Grid>
      <CustomizedTabs
        tabs={[
          { id: 0, name: 'All' },
          { id: 1, name: 'Active' },
          { id: 2, name: 'Expiring' },
          { id: 3, name: 'Expired' },
          { id: 4, name: 'Completed' },
          { id: 5, name: 'Cancelled' },
          { id: 6, name: 'Pending' }
        ]}
        selectedTabId={selectedTab}
        onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
      />
      <Paper variant='outlined' className={classes.paper}>
        <ServiceTable
          isLoadingData={isSearchingContract}
          isExportingData={isExportingData}
          contracts={contracts}
          count={count}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleChangePage={(event, page) => setCurrentPage(page)}
          handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
          query={query}
          setQuery={setQuery}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          entities={entities}
          contractTypes={contractTypes}
          contractTypeFilter={contractTypeFilter}
          setContractTypeFilter={setContractTypeFilter}
          entityFilter={entityFilter}
          setEntityFilter={setEntityFilter}
          invoiceFilter={invoiceFilter}
          setInvoiceFilter={setInvoiceFilter}
          renewFilter={renewFilter}
          setRenewFilter={setRenewFilter}
          handleSnackbar={handleSnackbar}
          handleOpenEditInvoice={handleOpenEditInvoice}
          setSelectedIndex={setSelectedIndex}
          handleCsvClick={handleCsvClick}
          selectedTab={selectedTab}
          csv={csv}
          handleConfirmAction={handleConfirmAction}
          handleCancelAction={handleCancelAction}
          handleDeleteAction={handleDeleteAction}
          handleRenewAction={handleRenewAction}
          column={column}
          setColumn={setColumn}
          tableSettingId={tableSettingId}
          currentRoleGrants={currentRoleGrants}
        />
        {openEditInvoice && (
          <InvoiceForm
            open={openEditInvoice}
            contract={contracts[selectedIndex]}
            handleCancel={handleCancelEditInvoice}
            updateIndividual={updateIndividual(selectedIndex)}
            handleSnackbar={handleSnackbar}
          />
        )}
        {isCancel && (
          <PasswordConfirmation
            open={isCancel}
            handleClose={handleCancel}
            url={GET_CANCEL_SERVICE_URL(contracts[selectedIndex].id)}
            isEdit
            title='Cancel Quotation'
            message='cancel quotation'
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
          />
        )}
        {isDelete && (
          <PasswordConfirmation
            open={isDelete}
            handleClose={handleCancel}
            url={GET_DELETE_SERVICES_URL(contracts[selectedIndex].id)}
            title='Delete Quotation'
            message='delete quotation'
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
          />
        )}
        <SideBarContent title={'Renew Quotation'} open={openForm} onClickDrawer={() => setOpenForm(false)} width={'100%'}>
          <ServiceForm
            isRenew={isRenew}
            oldContractId={isRenew ? oldContractId : 0}
            clientId={isRenew ? contracts[selectedIndex].clientId : 0}
            setServiceId={setServicetId}
            setServiceType={setServiceType}
            setOpenSuccessModal={setOpenSuccessModal}
            fetchData={fetchData}
            handleCancel={() => {
              setOpenForm(false);
              setIsRenew(false);
            }}
            handleSnackbar={handleSnackbar}
          />
        </SideBarContent>
        {openSuccessModal && (
          <CustomizedDialog
            isLoading={isLoading}
            open={openSuccessModal}
            isConfirmation
            variant='success'
            title='Successfully!'
            message={`Your quotation has been renewed with ID: ${serviceId}`}
            primaryButtonLabel='Approve Quotation'
            secondaryButtonLabel='Done & View Details'
            primaryActionButton={() => handleConfirmAction(serviceId)}
            secondaryActionButton={handleViewDetailAction}
            handleClose={() => setOpenSuccessModal(false)}
          />
        )}
        {isExportingData && <ExportCsvProgress open={isExportingData} progress={exportProgress} />}
        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={() => setOpenSnackbar(false)}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        />
      </Paper>
    </Container>
  );
};

export default ServicesPage;
