import React, { FC, useState, useEffect, useCallback, useContext } from 'react';
import { Paper, Theme, makeStyles } from '@material-ui/core';

import useRouter from 'hooks/useRouter';
import useDebounce from 'hooks/useDebounce';
import axios, { CancelTokenSource } from 'axios';
import { format } from 'date-fns';
import JobTable from './components/JobTable';
import {
  JOB_BASE_URL,
  JOB_BASE_INFO_COLUMNFILTER_URL,
  GET_EDIT_JOB_URL,
  GET_SETTING_CODE_BASE_URL,
  GET_SETTING_UPDATE_BASE_URL
} from 'constants/url';

import ActionSnackbar from 'components/ActionSnackbar';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { TableColumnSettingContext } from 'contexts/TableColumnSettingContext';
import CustomizedDialog from 'components/CustomizedDialog';
import AssignForm from './components/AssignForm';
import SettingCodes from 'typings/SettingCodes';
import SmartRankingForm from 'components/SmartRankingForm';

interface Props {
  serviceAddressMaster: Select[];
}

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

const JobContent: FC<Props> = props => {
  const classes = useStyles();
  const { serviceAddressMaster } = props;
  const { match, history } = useRouter();
  const clientId = match.params.id;
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { tableColumn } = useContext(TableColumnSettingContext);

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingJob, setSearchingJob] = useState<boolean>(false);

  const [jobs, setJobs] = useState<JobModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('startDateTime');
  const [filterBy, setFilterBy] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [vehicles, setVehicles] = useState<Select[]>([]);
  const [employees, setEmployees] = useState<Select[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<ColumnFilter[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<ColumnFilter[]>([]);
  const [serviceAddressFilter, setServiceAddressFilter] = useState<ColumnFilter[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openAssignModal, setOpenAssignModal] = useState<boolean>(false);
  const [jobIndex, setJobIndex] = useState<number>(0);
  const [selectedEmployees, setSelectedEmployees] = useState<Select[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Select[]>([]);
  const [assignError, setAssignError] = useState<any[]>([{ message: '' }, { message: '' }]);
  const [isOverlapping, setIsOverlapping] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [column, setColumn] = useState<any[]>([]);
  const [tableSettingId, setTableSettingId] = useState<number>(0);

  const [smartSkill, setSmartSkill] = useState<boolean>(true);
  const [smartProximity, setSmartProximity] = useState<boolean>(true);
  const [smartSettingId, setSmartSettingId] = useState<number | null>(null);
  const [isSmartRanking, setIsSmartRanking] = useState<boolean>(false);

  // Search Job whenever rowsPerPage, currentPage, queryString
  const fetchData = useCallback(() => {
    const getQueryParams = () => {
      const params = new URLSearchParams();
      // params.append('j', '9');
      if (queryString) {
        params.append('q', queryString);
      }

      if (orderBy) {
        params.append('ob', orderBy === 'id' ? 'jobId' : orderBy);
        params.append('ot', order);
      }

      if (filterBy) {
        if (startDate || endDate) {
          params.append('fb', filterBy.toString());
          params.append('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd').toString() : '');
          params.append('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd').toString() : '');
        }
      }

      if (employeeFilter.length > 0) {
        employeeFilter.map(value => {
          return params.append('ei', value.columnValue.toString());
        });
      }

      if (vehicleFilter.length > 0) {
        vehicleFilter.map(value => {
          return params.append('vi', value.columnValue.toString());
        });
      }

      if (serviceAddressFilter.length > 0) {
        serviceAddressFilter.map(value => {
          return params.append('si', value.columnValue.toString());
        });
      }

      params.append('ci', clientId);
      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchJob = async () => {
      setSearchingJob(true);

      try {
        const url = `${JOB_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        if (data.jobs) {
          setCount(data.count);
          setJobs(data.jobs);
        } else {
          history.push({ pathname: `/notfound/` });
        }
      } catch (err) {
        console.log(err);
      }

      setSearchingJob(false);
    };

    searchJob();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rowsPerPage,
    currentPage,
    queryString,
    employeeFilter,
    vehicleFilter,
    serviceAddressFilter,
    filterBy,
    clientId,
    startDate,
    endDate,
    order,
    orderBy
  ]);

  const fetchFilter = async () => {
    const getEmployeeVehicle = async () => {
      const { data } = await axios.get(`${JOB_BASE_INFO_COLUMNFILTER_URL}`, { cancelToken: cancelTokenSource.token });

      setVehicles(data.vehicles.sort((a: any, b: any) => a.name > b.name));
      setEmployees(data.employes.sort((a: any, b: any) => a.name > b.name));
    };

    getEmployeeVehicle();

    return () => {
      cancelTokenSource.cancel();
    };
  };

  useEffect(() => {
    fetchFilter();
    loadSmartRankingSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSmartRankingSetting = async () => {
    try {
      const cancelTokenSource = axios.CancelToken.source();
      const { data } = await axios.get(`${GET_SETTING_CODE_BASE_URL(SettingCodes.SMARTRANKING)}`, {
        cancelToken: cancelTokenSource.token
      });

      const value = String(data.value || data).toUpperCase();
      // determine flags
      if (value === 'BOTH') {
        setSmartSkill(true);
        setSmartProximity(true);
      } else if (value === 'SKILL') {
        setSmartSkill(true);
        setSmartProximity(false);
      } else if (value === 'PROXIMITY') {
        setSmartSkill(false);
        setSmartProximity(true);
      } else {
        // default: both false
        setSmartSkill(false);
        setSmartProximity(false);
      }

      // Set the setting ID for later updates
      if (data.id) {
        setSmartSettingId(data.id);
        setIsSmartRanking(data.isActive);
      }
    } catch (err) {
      console.error('failed to load smart ranking setting', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tableColumn.length > 0) {
      const { column, id } = tableColumn.find(value => value.tableName === 'CLIENT_JOB');
      setColumn(column);
      setTableSettingId(id);
    }
  }, [tableColumn]);

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

  const handleViewJob = (jobId: number): React.MouseEventHandler => () => {
    window.open(`/jobs/${jobId}`, '_blank');
  };

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  const handleCloseSmartRankingForm = () => {
    setOpenAssignModal(false);
  };

  const handleSmartRankingFormSave = async (data: { technicianIds: number[]; selectedTechnicians: Select[]; selectedVehicles: Select[] }) => {
    const { selectedTechnicians, selectedVehicles } = data;

    // Validate form
    if (selectedTechnicians.length === 0) {
      setAssignError(prev => {
        prev[0].message = 'Please select an Employee';
        return [...prev];
      });
      return;
    }

    const userOverlapping = await handleOverlappingUser(selectedTechnicians);
    const vehicleOverlapping = await handleOverlappingVehicle(selectedVehicles);

    if (userOverlapping || vehicleOverlapping) {
      setIsOverlapping(true);
      return;
    }

    handleSubmit(selectedTechnicians, selectedVehicles);
  };

  const saveSmartRankingSetting = async (skillOn: boolean, proximityOn: boolean) => {
    if (!smartSettingId) return;
    try {
      let value = '';
      if (skillOn && proximityOn) value = 'BOTH';
      else if (skillOn) value = 'SKILL';
      else if (proximityOn) value = 'PROXIMITY';
      else value = 'NONE';

      const cancelTokenSource = axios.CancelToken.source();
      await axios.put(`${GET_SETTING_UPDATE_BASE_URL(smartSettingId)}`, { value }, { cancelToken: cancelTokenSource.token });
    } catch (err) {
      console.error('failed to save smart ranking setting', err);
    }
  };

  const handleSmartSkillChange = (checked: boolean) => {
    setSmartSkill(checked);
    saveSmartRankingSetting(checked, smartProximity);
  };

  const handleSmartProximityChange = (checked: boolean) => {
    setSmartProximity(checked);
    saveSmartRankingSetting(smartSkill, checked);
  };

  const handleOnEdit = (jobIndex: number): React.MouseEventHandler => () => {
    setOpenAssignModal(true);
    setJobIndex(jobIndex);
  };

  const handleOverlappingUser = async (employeesToCheck: Select[] = selectedEmployees) => {
    let result = false;
    const currentJob: JobModel = jobs[jobIndex];
    const { jobId, startDateTime, endDateTime } = currentJob;
    const currentJobDateStart = new Date(`${startDateTime}`);
    const currentJobDateEnd = new Date(`${endDateTime}`);

    if (employeesToCheck && employeesToCheck.length > 0) {
      await Promise.all(
        employeesToCheck.map(async (emp: any) => {
          const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

          const getQueryParams = () => {
            const params = new URLSearchParams();
            params.append('ei', emp.id.toString());
            params.append('j', '2');
            params.append('fb', '5');
            params.append('sd', startDateTime !== null ? format(new Date(startDateTime), 'yyyy-MM-dd').toString() : '');
            params.append('ed', endDateTime !== null ? format(new Date(endDateTime), 'yyyy-MM-dd').toString() : '');

            return params.toString();
          };

          const url = `${JOB_BASE_URL}?${getQueryParams()}`;
          const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
          const { jobs } = data;

          await jobs.forEach((job: JobDetailModelOld) => {
            if (job.jobId !== jobId) {
              const startDate = new Date(`${job.startDateTime}`);
              const endDate = new Date(`${job.endDateTime}`);
              if (
                (currentJobDateStart >= startDate && currentJobDateStart <= endDate) ||
                (currentJobDateEnd >= startDate && currentJobDateEnd <= endDate)
              ) {
                result = true;
                return true;
              }
            }
          });
        })
      );
    }

    return result;
  };

  const handleOverlappingVehicle = async (vehiclesToCheck: Select[] = selectedVehicles) => {
    let result = false;
    const currentJob: JobModel = jobs[jobIndex];
    const { jobId, startDateTime, endDateTime } = currentJob;
    const currentJobDateStart = new Date(`${startDateTime}`);
    const currentJobDateEnd = new Date(`${endDateTime}`);
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    if (vehiclesToCheck && vehiclesToCheck.length > 0) {
      await Promise.all(
        vehiclesToCheck.map(async (vehicle: any) => {
          const getQueryParams = () => {
            const params = new URLSearchParams();
            params.append('vi', vehicle.id.toString());
            params.append('j', '2');
            params.append('fb', '5');
            params.append('sd', startDateTime !== null ? format(new Date(startDateTime), 'yyyy-MM-dd').toString() : '');
            params.append('ed', endDateTime !== null ? format(new Date(endDateTime), 'yyyy-MM-dd').toString() : '');

            return params.toString();
          };

          const url = `${JOB_BASE_URL}?${getQueryParams()}`;
          const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
          const { jobs } = data;

          await jobs.forEach((job: JobDetailModelOld) => {
            if (job.jobId !== jobId) {
              const startDate = new Date(`${job.startDateTime}`);
              const endDate = new Date(`${job.endDateTime}`);
              if (
                (currentJobDateStart >= startDate && currentJobDateStart <= endDate) ||
                (currentJobDateEnd >= startDate && currentJobDateEnd <= endDate)
              ) {
                result = true;
                return true;
              }
            }
          });
        })
      );
    }

    return result;
  };

  const validateForm = () => {
    let ret = true;
    if (selectedEmployees.length === 0) {
      setAssignError(prev => {
        prev[0].message = 'Please select an Employee';
        return [...prev];
      });
      ret = false;
      // } else if (selectedVehicles.length === 0) {
      //   setAssignError(prev => {
      //     prev[1].message = 'Please select an Vehicle';
      //     return [...prev];
      //   });
      //   ret = false;
    }
    return ret;
  };

  const handleAssignAction = async () => {
    if (!validateForm()) {
      return;
    }

    const userOverlapping = await handleOverlappingUser();
    const vehicleOverlapping = await handleOverlappingVehicle();

    if (userOverlapping || vehicleOverlapping) {
      setIsOverlapping(true);
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async (technicianIds?: Select[], vehicleIds?: Select[]) => {
    try {
      setIsLoading(true);
      const employees = technicianIds || selectedEmployees;
      const vehicles = vehicleIds || selectedVehicles;
      await axios.put(
        `${GET_EDIT_JOB_URL(jobs[jobIndex].jobId)}`,
        {
          jobStatus: 'ASSIGNED',
          selectedVehicles: vehicles,
          selectedEmployees: employees
        },
        { cancelToken: cancelTokenSource.token }
      );
      handleSnackbar('success', 'Successfully assign technician');
      setOpenAssignModal(false);
      setSelectedEmployees([]);
      setSelectedVehicles([]);
      setIsLoading(false);
      setIsOverlapping(false);
      fetchData();
    } catch (err) {
      handleSnackbar('error', 'Failed to assign technician');
      setIsLoading(false);
    }
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <JobTable
        isLoadingData={isSearchingJob}
        jobs={jobs}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        query={query}
        setQuery={setQuery}
        order={order}
        setOrder={setOrder}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        employeeFilter={employeeFilter}
        setEmployeeFilter={setEmployeeFilter}
        vehicleFilter={vehicleFilter}
        setVehicleFilter={setVehicleFilter}
        serviceAddressFilter={serviceAddressFilter}
        setServiceAddressFilter={setServiceAddressFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        vehicles={vehicles}
        employees={employees}
        serviceAddressMaster={serviceAddressMaster}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        handleViewJob={handleViewJob}
        handleOnEdit={handleOnEdit}
        handleSnackbar={handleSnackbar}
        fetchData={fetchData}
        column={column}
        setColumn={setColumn}
        tableSettingId={tableSettingId}
      />
      {openSnackbar && (
        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={() => setOpenSnackbar(false)}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        />
      )}
      {openAssignModal && isSmartRanking ? (
        <SmartRankingForm
          open={openAssignModal}
          onClose={handleCloseSmartRankingForm}
          job={jobs[jobIndex]}
          onSave={handleSmartRankingFormSave}
          initialSelectedTechnicians={selectedEmployees}
          initialSelectedVehicles={selectedVehicles}
          smartSkill={smartSkill}
          smartProximity={smartProximity}
          smartSettingId={smartSettingId}
          onSmartSkillChange={handleSmartSkillChange}
          onSmartProximityChange={handleSmartProximityChange}
          handleSnackbar={handleSnackbar}
        />
      ) : (
        <CustomizedDialog
          isLoading={isLoading}
          open={openAssignModal}
          isConfirmation={false}
          header='Assign Technician & Vehicle'
          message=''
          primaryButtonLabel='Save'
          secondaryButtonLabel='Cancel'
          primaryActionButton={handleAssignAction}
          secondaryActionButton={() => setOpenAssignModal(false)}
          handleClose={() => setOpenAssignModal(false)}
        >
          <AssignForm
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
            assignError={assignError}
            setAssignError={setAssignError}
          />
        </CustomizedDialog>
      )}
      {isOverlapping && (
        <CustomizedDialog
          isLoading={isLoading}
          open={isOverlapping}
          isConfirmation
          variant='warning'
          title='Assign Job with Overlapping Schedule'
          message='You are about to assign job with overlapping schedule.'
          secondMessage='Please re-schedule if it necessary'
          primaryButtonLabel='Continue'
          secondaryButtonLabel='Cancel'
          primaryActionButton={handleSubmit}
          secondaryActionButton={() => setIsOverlapping(false)}
          handleClose={() => setIsOverlapping(false)}
        />
      )}
    </Paper>
  );
};

export default JobContent;
