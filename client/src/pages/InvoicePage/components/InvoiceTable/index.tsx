import React, { FC, Fragment, useState, useEffect } from 'react';

import { createStyles, Divider, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';

import BodyRow from './components/BodyRow';
import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import TablePagination from 'components/TablePagination';
import ToolBar from './components/ToolBar';
import { dummyInvoice } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  isExportingData: boolean;
  invoices: InvoicesModel[];
  csv: CSVInvoiceModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  filterBy: string;
  setFilterBy: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  invoiceStatus: Select[];
  columnFilter: ColumnFilter[];
  setColumnFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  handleOpenEditInvoiceCollected: (invoiceIndex: number) => React.MouseEventHandler;
  handleOpenEditInvoiceRemarks: (invoiceIndex: number) => React.MouseEventHandler;
  handleOpenDeleteInvoice: (invoiceIndex: number) => React.MouseEventHandler;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  handleCsvClick: () => void;
  column: any[];
  setColumn: React.Dispatch<React.SetStateAction<any[]>>;
  tableSettingId: number;
  currentRoleGrants: RoleGrantModel[];
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const InvoiceTable: FC<Props> = props => {
  const classes = useStyles();
  const {
    isLoadingData,
    isExportingData,
    invoices,
    csv,
    count,
    currentPage,
    rowsPerPage,
    invoiceStatus,
    handleOpenEditInvoiceCollected,
    handleOpenEditInvoiceRemarks,
    handleOpenDeleteInvoice,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSnackbar,
    handleCsvClick,
    column,
    setColumn,
    tableSettingId,
    currentRoleGrants
  } = props;

  const { query, setQuery } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const { columnFilter, setColumnFilter } = props;

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [headers, setHeaders] = useState<HeaderTable[]>([]);
  const [columns, setColumns] = useState<SelectedColumn[]>([]);

  useEffect(() => {
    if (isLoadingData) {
      setShowSkeleton(true);
    }

    const SelectedColumns: SelectedColumn[] = [...column];
    const headers: HeaderTable[] = [];

    column.map((value: any) => {
      return headers.push({ label: value.name, isVisible: value.isVisible });
    });

    headers.push({ label: 'Action', verticalAlign: 'top', textAlign: 'left', isVisible: true });
    headers.unshift({ label: '', verticalAlign: 'top', isVisible: true });

    setHeaders(headers);
    setColumns(SelectedColumns);

    return () => {
      setShowSkeleton(false);
    };
  }, [isLoadingData, column]);

  return (
    <Fragment>
      <ToolBar
        isExportingData={isExportingData}
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
        csv={csv}
        handleCsvClick={handleCsvClick}
        columns={columns}
        setColumns={setColumn}
        tableSettingId={tableSettingId}
        currentRoleGrants={currentRoleGrants}
      />
      <Divider style={{ marginTop: 16 }} />
      <div className={classes.tableWrapper}>
        <Table>
          <TableHead>
            <HeaderRow headers={headers} isListPage={true} />
          </TableHead>
          <TableBody>
            {showSkeleton ? (
              [1, 2, 3, 4, 5].map((value, index) => (
                <BodyRow
                  key={value}
                  isLoadingData={showSkeleton}
                  invoice={dummyInvoice}
                  onEditInvoiceCollected={handleOpenEditInvoiceCollected(index)}
                  onEditInvoiceRemarks={handleOpenEditInvoiceRemarks(index)}
                  onDeleteInvoice={handleOpenDeleteInvoice(index)}
                  handleSnackbar={handleSnackbar}
                  columns={columns}
                  currentRoleGrants={currentRoleGrants}
                />
              ))
            ) : invoices && invoices.length > 0 ? (
              invoices.map((invoice, index) => (
                <BodyRow
                  key={invoice.id}
                  isLoadingData={showSkeleton}
                  invoice={invoice}
                  onEditInvoiceCollected={handleOpenEditInvoiceCollected(index)}
                  onEditInvoiceRemarks={handleOpenEditInvoiceRemarks(index)}
                  onDeleteInvoice={handleOpenDeleteInvoice(index)}
                  handleSnackbar={handleSnackbar}
                  columns={columns}
                  currentRoleGrants={currentRoleGrants}
                />
              ))
            ) : (
              <TableRow>
                <BodyCell colSpan={12}>
                  <Typography variant='body2' style={{ textAlign: 'center' }}>
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
    </Fragment>
  );
};

export default InvoiceTable;
