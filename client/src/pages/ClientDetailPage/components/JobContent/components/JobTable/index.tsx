import React, { FC, useState, useEffect, Fragment } from 'react';
import { Divider, Table, TableRow, TableBody, TableHead, TablePagination, Typography, makeStyles, createStyles } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';
import BodyRow from './components/BodyRow';
import ToolBar from './components/ToolBar';
import { StandardConfirmationDialog } from 'components/AppDialog';
import BodyCell from 'components/BodyCell';

import axios, { CancelTokenSource } from 'axios';
import { GET_EDIT_JOB_URL } from 'constants/url';
import { dummyJob } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  jobs: JobModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  query: string;
  order: 'asc' | 'desc';
  setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  orderBy: string;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  filterBy: string;
  setFilterBy: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  vehicles: Select[];
  employees: Select[];
  serviceAddressMaster: Select[];
  employeeFilter: ColumnFilter[];
  setEmployeeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  vehicleFilter: ColumnFilter[];
  setVehicleFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  serviceAddressFilter: ColumnFilter[];
  setServiceAddressFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleOnEdit: (jobIndex: number) => React.MouseEventHandler;
  handleViewJob: (jobId: number) => React.MouseEventHandler;
  fetchData: () => void;
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

const JobTable: FC<Props> = props => {
  const classes = useStyles();
  const {
    isLoadingData,
    jobs,
    count,
    currentPage,
    rowsPerPage,
    query,
    setQuery,
    filterBy,
    setFilterBy,
    vehicles,
    employees,
    serviceAddressMaster,
    employeeFilter,
    setEmployeeFilter,
    vehicleFilter,
    setVehicleFilter,
    serviceAddressFilter,
    setServiceAddressFilter,
    handleChangeRowsPerPage,
    handleChangePage,
    handleViewJob,
    handleOnEdit,
    fetchData,
    handleSnackbar,
    column,
    setColumn,
    tableSettingId
  } = props;

  const { order, setOrder, orderBy, setOrderBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number>();
  const [message, setMessage] = useState<string>('');

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
      handleSnackbar('success', `Successfully ${actionMessage}`);
    } catch (err) {
      handleCloseDialog();
      handleSnackbar('error', `Failed to ${actionMessage}`);
    }

    setProcessing(false);
  };

  const confirmJob = async (selectedId: number) => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    await actionWrapper(async () => {
      await axios.put(
        `${GET_EDIT_JOB_URL(selectedId)}`,
        {
          jobStatus: 'CONFIRMED'
        },
        { cancelToken: cancelTokenSource.token }
      );
    }, 'confirm Jobs');
    fetchData();
  };

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Fragment>
      <ToolBar
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
        serviceAddressMaster={serviceAddressMaster}
        employeeFilter={employeeFilter}
        setEmployeeFilter={setEmployeeFilter}
        vehicleFilter={vehicleFilter}
        setVehicleFilter={setVehicleFilter}
        serviceAddressFilter={serviceAddressFilter}
        setServiceAddressFilter={setServiceAddressFilter}
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
              [1, 2, 3, 4, 5].map(index => (
                <BodyRow
                  key={index}
                  job={dummyJob}
                  isLoadingData={showSkeleton}
                  setSelectedId={setSelectedId}
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
                  key={job.jobId}
                  job={job}
                  isLoadingData={showSkeleton}
                  setSelectedId={setSelectedId}
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
      {openDialog && (
        <StandardConfirmationDialog
          variant={'warning'}
          isLoading={isProcessing}
          message={message}
          open={openDialog}
          handleClose={handleCloseDialog}
          onConfirm={() => confirmJob(selectedId!)}
        />
      )}
    </Fragment>
  );
};

export default JobTable;
