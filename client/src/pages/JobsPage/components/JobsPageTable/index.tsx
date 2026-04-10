import React, { FC, Fragment, useState, useEffect } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { GET_EDIT_JOB_URL } from 'constants/url';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { createStyles, Divider, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import BodyRow from './components/BodyRow';
import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import TablePagination from 'components/TablePagination';
import ToolBar from './components/ToolBar';
import { dummyJob } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  isExportingData: boolean;
  jobs: JobModel[];
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
  vehicles: Select[];
  employees: Select[];
  districts: Select[];
  serviceType: Select[];
  order: 'asc' | 'desc';
  orderBy: string;
  setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  columnFilter: ColumnFilter[];
  setColumnFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  employeeFilter: ColumnFilter[];
  setEmployeeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  vehicleFilter: ColumnFilter[];
  setVehicleFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  districtFilter: ColumnFilter[];
  setDistrictFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  selectedTab: number;
  csv: CSVJobModel[];
  setDelete: React.Dispatch<React.SetStateAction<boolean>>;
  handleOnEdit: (jobIndex: number) => React.MouseEventHandler;
  handleViewJob: (jobId: number) => React.MouseEventHandler;
  handleCsvClick: () => void;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  column: any[];
  setColumn: React.Dispatch<React.SetStateAction<any[]>>;
  tableSettingId: number;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const JobsPageTable: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const {
    isLoadingData,
    isExportingData,
    jobs,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    vehicles,
    employees,
    districts,
    serviceType,
    selectedTab,
    csv,
    setDelete,
    handleOnEdit,
    handleViewJob,
    handleCsvClick,
    handleSnackbar,
    column,
    setColumn,
    tableSettingId
  } = props;

  const { order, setOrder, orderBy, setOrderBy } = props;
  const { query, setQuery } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const {
    columnFilter,
    setColumnFilter,
    employeeFilter,
    setEmployeeFilter,
    vehicleFilter,
    setVehicleFilter,
    districtFilter,
    setDistrictFilter
  } = props;

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number>();
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const actionWrapper = async (action: () => Promise<void>, actionMessage: string) => {
    setProcessing(true);

    try {
      await action();
      handleCloseDialog();
      setDelete(true);
      handleSnackbar('success', `Successfully ${actionMessage}`);
    } catch (err) {
      handleCloseDialog();
      handleSnackbar('error', `Failed to ${actionMessage}`);
    }

    setProcessing(false);
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const confirmJob = async (selectedId: number) => {
    cancelTokenSource = axios.CancelToken.source();
    await actionWrapper(async () => {
      await axios.put(
        `${GET_EDIT_JOB_URL(selectedId)}`,
        {
          jobStatus: 'CONFIRMED'
        },
        { cancelToken: cancelTokenSource.token }
      );
    }, 'confirm Jobs');
  };

  return (
    <Fragment>
      <ToolBar
        isProcessing={isProcessing}
        isExportingData={isExportingData}
        query={query}
        setQuery={setQuery}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        vehicles={vehicles}
        employees={employees}
        districts={districts}
        serviceType={serviceType}
        columnFilter={columnFilter}
        setColumnFilter={setColumnFilter}
        employeeFilter={employeeFilter}
        setEmployeeFilter={setEmployeeFilter}
        vehicleFilter={vehicleFilter}
        setVehicleFilter={setVehicleFilter}
        districtFilter={districtFilter}
        setDistrictFilter={setDistrictFilter}
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
                  isLoadingData={showSkeleton}
                  setSelectedId={setSelectedId}
                  key={value}
                  job={dummyJob}
                  setOpenDialog={setOpenDialog}
                  setMessage={setMessage}
                  onEditJob={handleOnEdit(index)}
                  onViewJob={handleViewJob(index)}
                  handleSnackbar={handleSnackbar}
                  columns={columns}
                />
              ))
            ) : jobs.length > 0 ? (
              jobs.map((job, index) => (
                <BodyRow
                  isLoadingData={showSkeleton}
                  setSelectedId={setSelectedId}
                  key={job.jobId}
                  job={job}
                  setOpenDialog={setOpenDialog}
                  setMessage={setMessage}
                  onEditJob={handleOnEdit(index)}
                  onViewJob={handleViewJob(job.jobId)}
                  handleSnackbar={handleSnackbar}
                  columns={columns}
                />
              ))
            ) : (
              <TableRow>
                <BodyCell colSpan={14}>
                  <Typography variant='body2' style={{ textAlign: 'center' }}>
                    No matching result
                  </Typography>
                </BodyCell>
              </TableRow>
            )}
          </TableBody>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            count={count}
            rowsPerPage={rowsPerPage}
            page={currentPage}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Table>
      </div>
      <StandardConfirmationDialog
        variant={'warning'}
        message={message}
        open={openDialog}
        handleClose={handleCloseDialog}
        onConfirm={() => confirmJob(selectedId!)}
      />
    </Fragment>
  );
};

export default JobsPageTable;
