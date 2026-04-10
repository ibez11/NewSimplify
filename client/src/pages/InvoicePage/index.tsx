import React, { FC, useCallback, useContext, useState, useEffect } from 'react';
import axios, { CancelTokenSource } from 'axios';

import clsx from 'clsx';
import useDebounce from 'hooks/useDebounce';
import { Container, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { CurrentPageContext } from 'contexts/CurrentPageContext';
import { TableColumnSettingContext } from 'contexts/TableColumnSettingContext';
import { endOfWeek, format, lastDayOfMonth, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { INVOICES_BASE_URL, GET_INVOICE_INFO_URL, GET_INVOICE_CSV_URL, GET_DELETE_INVOICE_URL } from 'constants/url';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import ActionSnackbar from 'components/ActionSnackbar';
import Breadcrumb from 'components/Breadcrumb';
import InvoiceTable from './components/InvoiceTable';
import InvoiceCollectedForm from './components/InvoiceCollectedForm';
import InformationContent from 'components/InformationContent';
import InvoiceRemakrsForm from './components/InvoiceRemakrsForm';
import { dummyInformationContent, dummyInvoiceColumn } from 'constants/dummy';
import { StandardConfirmationDialog } from 'components/AppDialog';
import PasswordConfirmation from 'components/PasswordConfirmation';
import ExportCsvProgress from 'components/ExportCsvProgress';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants } from 'selectors';

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
  }
}));

const InvoicePage: FC = () => {
  useCurrentPageTitleUpdater('Invoices List');

  const classes = useStyles();
  const { currentPageTitle } = useContext(CurrentPageContext);
  const { tableColumn } = useContext(TableColumnSettingContext);
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingInvoice, setSearchingInvoice] = useState<boolean>(false);

  const [invoices, setInvoices] = useState<InvoicesModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [filterBy, setFilterBy] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [isEditCollected, setIsEditCollected] = useState<boolean>(false);
  const [isEditRemarks, setIsEditRemarks] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);

  const [csv, setCsv] = useState<CSVInvoiceModel[]>([]);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const [invoiceStatus, setInvoiceStatus] = useState<Select[]>([]);
  const [columnFilter, setColumnFilter] = useState<ColumnFilter[]>([]);

  const [infomationContents, setInformationContents] = useState<InformationContentModel[]>(dummyInformationContent);
  const [column, setColumn] = useState<any[]>(dummyInvoiceColumn);
  const [tableSettingId, setTableSettingId] = useState<number>(5);

  const getQueryParams = (noLimit?: boolean, newOffest?: number) => {
    const params = new URLSearchParams();
    if (queryString) {
      params.append('q', queryString);
    }

    if (filterBy) {
      params.append('fb', filterBy.toString());

      if (filterBy === '1') {
        params.append('startDate', format(new Date(), 'yyyy-MM-dd'));
        params.append('endDate', format(new Date(), 'yyyy-MM-dd'));
      }

      if (filterBy === '3') {
        params.append('startDate', format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        params.append('endDate', format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
      }

      if (filterBy === '4') {
        params.append('startDate', format(startOfMonth(new Date()), 'yyyy-MM-dd'));
        params.append('endDate', format(lastDayOfMonth(new Date()), 'yyyy-MM-dd'));
      }

      if (filterBy === '9') {
        params.append('startDate', format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
        params.append('endDate', format(lastDayOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
      }

      if (filterBy === '5') {
        if (startDate || endDate) {
          params.append('startDate', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
          params.append('endDate', endDate ? format(new Date(endDate), 'yyyy-MM-dd') : '');
        }
      }
    }

    if (columnFilter.length !== 0) {
      columnFilter.map(value => {
        return params.append(
          'is',
          value.columnValue === 0 ? 'FULLY PAID' : value.columnValue === 1 ? 'UNPAID' : value.columnValue === 2 ? 'PARTIALLY PAID' : 'VOID'
        );
      });
    }

    if (!noLimit) {
      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());
    } else {
      params.append('s', newOffest ? newOffest.toString() : '0');
      params.append('l', '200');
    }

    return params.toString();
  };

  // Search Invoice whenever rowsPerPage, currentPage, queryString, contract, and filterby changes
  const fetchData = useCallback(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const searchContract = async () => {
      setSearchingInvoice(true);

      try {
        const url = `${INVOICES_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setInvoices(data.invoices);
        setInvoiceStatus([
          { id: 0, name: 'FULLY PAID' },
          { id: 1, name: 'UNPAID' },
          { id: 2, name: 'PARTIALLY PAID' },
          { id: 3, name: 'VOID' }
        ]);
      } catch (err) {}

      setSearchingInvoice(false);
    };

    searchContract();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, currentPage, queryString, filterBy, startDate, endDate, columnFilter]);

  const fetchInvoiceInfo = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    try {
      const { data } = await axios.get(`${GET_INVOICE_INFO_URL}`, { cancelToken: cancelTokenSource.token });
      const invoiceStats = [
        { header: 'Invoices Created Today', value: data.valueInvoiceToday, count: data.invoiceToday },
        { header: 'Total Value Created This Week', value: data.valueInvoiceThisWeek, count: data.invoiceThisWeek },
        { header: 'Total Value Created Last Month', value: data.valueInvoiceLastMonth, count: data.invoiceLastMonth },
        { header: 'Total All Unpaid Invoices', value: data.valueUnpaidInvoice, count: data.unpaidInvoice }
      ];

      const infoContents = invoiceStats.map(stat => ({
        header: stat.header,
        value: stat.value,
        isPrice: true,
        subheader: `From ${stat.count} invoice${stat.count !== 1 ? 's' : ''}`
      }));

      setInformationContents(infoContents);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  useEffect(() => {
    fetchInvoiceInfo();
  }, []);

  useEffect(() => {
    if (tableColumn.length > 0) {
      const { column, id } = tableColumn.find(value => value.tableName === 'INVOICE');

      setColumn(column);
      setTableSettingId(id);
    }
  }, [tableColumn]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
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

  const updateIndividual = (invoiceIndex: number) => {
    return (updatedInvoiceProperties: Partial<InvoicesModel>) => {
      setInvoices(
        invoices!.map((invoice, index) => {
          if (index !== invoiceIndex) {
            return invoice;
          }

          return Object.assign({}, invoice, updatedInvoiceProperties);
        })
      );
    };
  };

  const handleOpenEditInvoiceCollected = (invoiceIndex: number): React.MouseEventHandler => () => {
    setSelectedIndex(invoiceIndex);
    setIsEditCollected(true);
  };

  const handleOpenEditInvoiceRemarks = (invoiceIndex: number): React.MouseEventHandler => () => {
    setSelectedIndex(invoiceIndex);
    setIsEditRemarks(true);
  };

  const handleOpenDeleteInvoice = (invoiceIndex: number): React.MouseEventHandler => () => {
    setSelectedIndex(invoiceIndex);
    setIsDelete(true);
  };

  const handleDelete = () => {
    setOpenPasswordDialog(true);
    setIsDelete(false);
  };

  const handleCloseDelete = () => {
    setIsDelete(false);
    setOpenPasswordDialog(false);
    setSelectedIndex(0);
    fetchData();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSnackbar = (variant: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(message);
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
      let csvData: CSVInvoiceModel[] = [];

      let counter = 0;
      for (let i = counter; i < count; ) {
        const url = `${GET_INVOICE_CSV_URL}?${getQueryParams(true, counter)}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        if (data && data.invoices.length > 0) {
          await Promise.all(
            data.invoices.map(async (value: any) => {
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
      handleSnackbar('success', 'Successfully export');
    } catch (error) {
      console.log(error);
      handleSnackbar('error', 'Failed to export');
      setIsExportingData(false);
      setCsv([]);
    }
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Typography variant='h4' gutterBottom>
            {currentPageTitle}
          </Typography>
          <Breadcrumb pages={['invoices']} />
        </Grid>
      </Grid>
      <InformationContent isLoading={isSearchingInvoice} infomationContents={infomationContents} />
      <Paper variant='outlined' className={classes.paper}>
        <InvoiceTable
          isLoadingData={isSearchingInvoice}
          isExportingData={isExportingData}
          invoices={invoices}
          csv={csv}
          count={count}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleChangePage={(event, page) => setCurrentPage(page)}
          handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
          query={query}
          setQuery={setQuery}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          invoiceStatus={invoiceStatus}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          handleOpenEditInvoiceCollected={handleOpenEditInvoiceCollected}
          handleOpenEditInvoiceRemarks={handleOpenEditInvoiceRemarks}
          handleOpenDeleteInvoice={handleOpenDeleteInvoice}
          handleSnackbar={handleSnackbar}
          handleCsvClick={handleCsvClick}
          column={column}
          setColumn={setColumn}
          tableSettingId={tableSettingId}
          currentRoleGrants={currentRoleGrants}
        />
        {isEditCollected && (
          <InvoiceCollectedForm
            open={isEditCollected}
            invoice={invoices[selectedIndex]}
            updateIndividual={updateIndividual(selectedIndex)}
            setIsEditCollected={setIsEditCollected}
            handleSnackbar={handleSnackbar}
          />
        )}
        {isEditRemarks && (
          <InvoiceRemakrsForm
            open={isEditRemarks}
            invoice={invoices[selectedIndex]}
            setIsEditRemarks={setIsEditRemarks}
            updateIndividual={updateIndividual(selectedIndex)}
            handleSnackbar={handleSnackbar}
          />
        )}
        {isDelete && (
          <StandardConfirmationDialog
            variant={'warning'}
            title='Delete Confirmation'
            message='Are you sure want to delete this invoice?'
            okLabel='OK'
            cancelLabel='cancel'
            open={isDelete}
            handleClose={handleCloseDelete}
            onConfirm={handleDelete}
          />
        )}
        {openPasswordDialog && (
          <PasswordConfirmation
            open={openPasswordDialog}
            handleClose={handleCloseDelete}
            url={GET_DELETE_INVOICE_URL(invoices[selectedIndex].id)}
            title='Delete Invoice'
            message='delete invoice'
            handleSnackbar={handleSnackbar}
          />
        )}
        {isExportingData && <ExportCsvProgress open={isExportingData} progress={exportProgress} />}
        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={handleCloseSnackbar}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        />
      </Paper>
    </Container>
  );
};

export default InvoicePage;
