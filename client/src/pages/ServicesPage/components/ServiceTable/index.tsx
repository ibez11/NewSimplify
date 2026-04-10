import React, { FC, Fragment, useState, useEffect } from 'react';
import { createStyles, Divider, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';

import BodyRow from './components/BodyRow';
import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import TablePagination from 'components/TablePagination';
import ToolBar from './components/ToolBar';
import { dummyContract } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  isExportingData: boolean;
  contracts: ServiceModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  order: 'asc' | 'desc';
  orderBy: string;
  setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  filterBy: string;
  setFilterBy: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  entities: Select[];
  contractTypes: Select[];
  contractTypeFilter: ColumnFilter[];
  setContractTypeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  entityFilter: ColumnFilter[];
  setEntityFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  invoiceFilter: ColumnFilter[];
  setInvoiceFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  renewFilter: ColumnFilter[];
  setRenewFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  selectedTab: number;
  csv: CSVContractModel[];
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  handleOpenEditInvoice: (invoiceIndex: number) => React.MouseEventHandler;
  handleCsvClick: () => void;
  handleConfirmAction: (index: number) => void;
  handleCancelAction: (index: number) => void;
  handleDeleteAction: (index: number) => void;
  handleRenewAction: (index: number) => void;
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

const ServiceTable: FC<Props> = props => {
  const classes = useStyles();

  const {
    isLoadingData,
    isExportingData,
    contracts,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    entities,
    contractTypes,
    selectedTab,
    csv,
    handleSnackbar,
    handleOpenEditInvoice,
    handleCsvClick,
    handleConfirmAction,
    handleCancelAction,
    handleDeleteAction,
    handleRenewAction,
    column,
    setColumn,
    tableSettingId,
    currentRoleGrants
  } = props;

  const { query, setQuery } = props;
  const { order, setOrder, orderBy, setOrderBy } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const {
    contractTypeFilter,
    setContractTypeFilter,
    entityFilter,
    setEntityFilter,
    invoiceFilter,
    setInvoiceFilter,
    renewFilter,
    setRenewFilter
  } = props;

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
      return headers.push({ id: value.field, label: value.name, isVisible: value.isVisible, sort: value.sort });
    });

    headers.push({ label: 'Action', verticalAlign: 'top', isVisible: true });
    headers.unshift({ label: '', verticalAlign: 'top', isVisible: true });

    setHeaders(headers);
    setColumns(SelectedColumns);

    return () => {
      setShowSkeleton(false);
    };
  }, [isLoadingData, column]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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
        selectedTabId={selectedTab}
        csv={csv}
        handleCsvClick={handleCsvClick}
        columns={columns}
        setColumns={setColumn}
        tableSettingId={tableSettingId}
      />
      <Divider style={{ marginTop: 16 }} />
      <div className={classes.tableWrapper}>
        <Table>
          <TableHead>
            <HeaderRow headers={headers} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} isListPage={true} />
          </TableHead>
          <TableBody>
            {showSkeleton ? (
              [1, 2, 3, 4, 5].map((value, index) => (
                <BodyRow
                  index={index}
                  isLoadingData={showSkeleton}
                  key={value}
                  contract={dummyContract}
                  onEditInvoice={handleOpenEditInvoice(index)}
                  handleConfirmAction={handleConfirmAction}
                  handleCancelAction={handleCancelAction}
                  handleDeleteAction={handleDeleteAction}
                  selectedTabId={selectedTab}
                  handleRenewAction={handleRenewAction}
                  handleSnackbar={handleSnackbar}
                  columns={columns}
                  currentRoleGrants={currentRoleGrants}
                />
              ))
            ) : contracts && contracts.length > 0 ? (
              contracts.map((contract, index) => (
                <BodyRow
                  index={index}
                  isLoadingData={showSkeleton}
                  key={contract.id}
                  contract={contract}
                  onEditInvoice={handleOpenEditInvoice(index)}
                  handleConfirmAction={handleConfirmAction}
                  handleCancelAction={handleCancelAction}
                  handleDeleteAction={handleDeleteAction}
                  selectedTabId={selectedTab}
                  handleRenewAction={handleRenewAction}
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

export default ServiceTable;
