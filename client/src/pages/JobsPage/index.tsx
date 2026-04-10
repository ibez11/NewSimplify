import React, { FC, useState, useEffect, useCallback, useContext } from 'react';
import axios, { CancelTokenSource } from 'axios';
import clsx from 'clsx';
import useDebounce from 'hooks/useDebounce';
import { Container, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { format } from 'date-fns';
import {
  JOB_BASE_URL,
  JOB_BASE_INFO_URL,
  JOB_BASE_INFO_COLUMNFILTER_URL,
  GET_JOB_CSV_URL,
  GET_EDIT_JOB_URL,
  TIMEOFF_BASE_URL,
  GET_SETTING_CODE_BASE_URL,
  GET_SETTING_UPDATE_BASE_URL
} from 'constants/url';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import ActionSnackbar from 'components/ActionSnackbar';
import CustomizedTabs from 'components/CustomizedTabs';
import InformationContent from 'components/InformationContent';
import JobsPageTable from './components/JobsPageTable';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import ExportCsvProgress from 'components/ExportCsvProgress';
import { dummyInformationContent, dummyJobColumn } from 'constants/dummy';
import { CurrentPageContext } from 'contexts/CurrentPageContext';
import { TableColumnSettingContext } from 'contexts/TableColumnSettingContext';
import CustomizedDialog from 'components/CustomizedDialog';
import AssignForm from './components/AssignForm';
import { ucWords } from 'utils';
import { StandardConfirmationDialog } from 'components/AppDialog';
import SettingCodes from 'typings/SettingCodes';
import SmartRankingForm from 'components/SmartRankingForm';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(3)
    }
  },
  spacing: {
    marginLeft: theme.spacing(1)
  },
  paper: {
    margin: 'auto'
  }
}));

const JobsPage: FC = () => {
  useCurrentPageTitleUpdater('Job List');
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { currentPageTitle } = useContext(CurrentPageContext);
  const { tableColumn } = useContext(TableColumnSettingContext);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<number>(1);

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isSearchingJob, setSearchingJob] = useState<boolean>(false);

  const [jobs, setJobs] = useState<JobModel[]>([]);
  const [infomationContents, setInformationContents] = useState<InformationContentModel[]>(dummyInformationContent);
  const [count, setCount] = useState<number>(0);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('startDateTime');
  const [filterBy, setFilterBy] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [vehicles, setVehicles] = useState<Select[]>([]);
  const [employees, setEmployees] = useState<Select[]>([]);
  const [serviceType, setServiceType] = useState<Select[]>([]);
  const [districts, setDistricts] = useState<Select[]>([]);

  const [csv, setCsv] = useState<CSVJobModel[]>([]);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const [columnFilter, setColumnFilter] = useState<ColumnFilter[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<ColumnFilter[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<ColumnFilter[]>([]);
  const [districtFilter, setDistrictFilter] = useState<ColumnFilter[]>([]);

  const [isDelete, setDelete] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openAssignModal, setOpenAssignModal] = useState<boolean>(false);
  const [jobIndex, setJobIndex] = useState<number>(0);
  const [selectedEmployees, setSelectedEmployees] = useState<Select[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Select[]>([]);
  const [assignError, setAssignError] = useState<any[]>([{ message: '' }, { message: '' }]);
  const [isOverlapping, setIsOverlapping] = useState<boolean>(false);
  const [timeOffOverlapping, setTimeOffOverlapping] = useState<string>('');
  const [confirmTimeOffOverlapping, setConfirmTimeOffOverlapping] = useState<boolean>(false);

  const [column, setColumn] = useState<any[]>(dummyJobColumn);
  const [tableSettingId, setTableSettingId] = useState<number>(6);

  const [smartSkill, setSmartSkill] = useState<boolean>(true);
  const [smartProximity, setSmartProximity] = useState<boolean>(true);
  const [smartSettingId, setSmartSettingId] = useState<number | null>(null);
  const [isSmartRanking, setIsSmartRanking] = useState<boolean>(false);

  const getQueryParams = (exportCsv?: boolean, newOffset?: number) => {
    const params = new URLSearchParams();

    if (queryString) {
      params.append('q', queryString);
    }

    if (selectedTab) {
      params.append('j', selectedTab.toString());
    }

    if (orderBy) {
      params.append('ob', orderBy === 'id' ? 'jobId' : orderBy);
      params.append('ot', order);
    }

    if (filterBy) {
      params.append('fb', filterBy.toString());

      if (filterBy === '5') {
        if (startDate || endDate) {
          params.append('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd').toString() : '');
          params.append('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd').toString() : '');
        }
      }
    }

    if (columnFilter.length > 0) {
      columnFilter.map(value => {
        if (value.columnValue === 2) {
          return params.append('fj', value.columnValue.toString());
        } else {
          return params.append('st', value.columnValue.toString());
        }
      });
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

    if (districtFilter.length > 0) {
      districtFilter.map(value => {
        return params.append('pd', value.columnValue.toString());
      });
    }

    if (exportCsv) {
      params.append('s', newOffset ? newOffset.toString() : '0');
      params.append('l', '200');
      params.set('ob', orderBy);
      params.set('ot', 'asc');
    } else {
      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());
    }

    return params.toString();
  };

  const fetchJobInfo = async () => {
    try {
      const { data } = await axios.get(`${JOB_BASE_INFO_URL}`, { cancelToken: cancelTokenSource.token });
      const jobStats = [
        { label: 'Total Jobs Today', count: data.jobsToday.count, unassignedCount: data.jobsUnAssignedToday.count, isPrice: false },
        { label: 'Total Jobs This Week', count: data.jobsThisWeek.count, unassignedCount: data.jobsUnAssignedThisWeek.count, isPrice: false },
        { label: 'Total Value Jobs Today', value: data.jobsToday.value, count: data.jobsToday.count, isPrice: true },
        { label: 'Total Value Jobs This Week', value: data.jobsThisWeek.value, count: data.jobsThisWeek.count, isPrice: true }
      ];

      const infoContents = jobStats.map(stat => ({
        header: stat.label,
        value: stat.isPrice ? stat.value : stat.count,
        isPrice: stat.isPrice,
        subheader: stat.isPrice ? `From ${stat.count} jobs` : `${stat.unassignedCount} job unassigned`
      }));
      setInformationContents(infoContents);
    } catch (err) {
      console.log(err);
    }
    setSearchingJob(false);
    setDelete(false);
  };

  const fetchFilter = async () => {
    setSearchingJob(true);
    try {
      const districtsData: Select[] = [];
      const filter = await axios.get(`${JOB_BASE_INFO_COLUMNFILTER_URL}`, { cancelToken: cancelTokenSource.token });

      if (filter.data.districts) {
        filter.data.districts.map((value: any) => {
          return districtsData.push({
            id: value.id,
            name: `D${value.postalDistrict} - ${value.generalLocation.join(' / ')}`,
            value: value.postalDistrict
          });
        });
      }

      setVehicles(filter.data.vehicles.sort((a: any, b: any) => a.name > b.name));
      setEmployees(filter.data.employes.sort((a: any, b: any) => a.name > b.name));
      setDistricts(districtsData);
      setServiceType([
        { id: 0, name: ucWords('SERVICE CONTRACT') },
        { id: 1, name: ucWords('AD-HOC SERVICE') }
        // { id: 2, name: 'FIRST JOB' }
      ]);
    } catch (err) {
      console.log(err);
    }
    setSearchingJob(false);
  };

  // Search Job whenever rowsPerPage, currentPage, queryString, job, and filter by changes
  const fetchData = useCallback(() => {
    const searchJob = async () => {
      setSearchingJob(true);

      try {
        const url = `${JOB_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        setCount(data.count);
        setJobs(data.jobs);
      } catch (err) {
        console.log(err);
      }
      setSearchingJob(false);
      setDelete(false);
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
    selectedTab,
    columnFilter,
    employeeFilter,
    vehicleFilter,
    districtFilter,
    filterBy,
    order,
    orderBy,
    startDate,
    endDate
  ]);

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
    fetchJobInfo();
    fetchFilter();
    loadSmartRankingSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  // Load Job data if search not empty and populate on search list
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

  // Load job data if job data has been deleted
  useEffect(() => {
    if (isDelete) {
      fetchData();
      fetchJobInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDelete, fetchData]);

  useEffect(() => {
    if (tableColumn.length > 0) {
      const { column, id } = tableColumn.find(value => value.tableName === 'JOB');

      setColumn(column);
      setTableSettingId(id);
    }
  }, [tableColumn]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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

    if (await timeOffValidation(selectedTechnicians)) {
      setConfirmTimeOffOverlapping(true);
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

  const handleViewJob = (jobId: number): React.MouseEventHandler => () => {
    window.open(`/jobs/${jobId}`, '_blank');
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

  const timeOffValidation = async (employeesToCheck: Select[] = selectedEmployees) => {
    let isValidTimeOff = false;

    const currentJob: JobModel = jobs[jobIndex];
    const { startDateTime, endDateTime } = currentJob;

    if (employeesToCheck.length > 0) {
      const getQueryParams = () => {
        const params = new URLSearchParams();
        params.append('sd', format(new Date(startDateTime), 'yyyy-MM-dd'));
        params.append('ed', format(new Date(endDateTime), 'yyyy-MM-dd'));

        return params.toString();
      };

      let timeOffOverlapping: string[] = [];

      const { data } = await axios.get(`${TIMEOFF_BASE_URL}?${getQueryParams()}`, { cancelToken: cancelTokenSource.token });
      const timeOffData = data.timeOff;

      // Function to check if an employee id exists in the employeesToCheck array
      const hasSameId = (employeeId: number) => {
        return employeesToCheck.some(employee => employee.id === employeeId);
      };

      // Iterate through the timeOff array and check if any employee id matches with selectedEmployee
      timeOffData.forEach((timeOffEntry: any) => {
        timeOffEntry.Employees.forEach((employee: any) => {
          if (hasSameId(employee.id)) {
            isValidTimeOff = true;
            timeOffOverlapping.push(employee.displayName);
          }
        });
      });
      setTimeOffOverlapping(timeOffOverlapping.join(', '));
    }
    return isValidTimeOff;
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
    } else if (await timeOffValidation()) {
      setConfirmTimeOffOverlapping(true);
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
      fetchData();
      fetchJobInfo();
    } catch (err) {
      handleSnackbar('error', 'Failed to assign technician');
      setIsLoading(false);
    }
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
      let csvData: CSVJobModel[] = [];

      let counter = 0;
      const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
      while (counter < count) {
        const url = `${GET_JOB_CSV_URL}?${getQueryParams(true, counter)}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        const jobs: CSVJobModel[] = data.jobs || [];

        csvData = csvData.concat(jobs);

        counter += 200;
        const progress = Math.min((counter / count) * 100, 100);
        setExportProgress(progress);
        await sleep(5);
      }

      setCsv(csvData);
      setExportProgress(100);
      setIsExportingData(false);
      handleSnackbar('success', 'Successfully exported CSV');
    } catch (error) {
      console.log(error);
      setIsExportingData(false);
      handleSnackbar('error', 'Failed to export');
      setIsExportingData(false);
      setCsv([]);
    }
  };

  const detailDate = format(new Date(), 'cccc, dd MMMM yyyy').toString();

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container alignItems='center'>
        <Grid item md={6}>
          <Typography variant='h4' display='inline'>
            {currentPageTitle}
          </Typography>
        </Grid>
        <Grid item container md={6} justify='flex-end'>
          <Typography variant='subtitle1' display='inline' className={classes.spacing}>
            {detailDate}
          </Typography>
        </Grid>
      </Grid>
      <InformationContent isLoading={isSearchingJob} infomationContents={infomationContents} />
      <CustomizedTabs
        tabs={[
          { id: 0, name: 'All' },
          { id: 1, name: 'Unassigned' },
          { id: 10, name: 'Confirmed' },
          { id: 2, name: 'Assigned' },
          { id: 3, name: 'In Progress' },
          { id: 4, name: 'Completed' },
          { id: 5, name: 'Overdue' },
          { id: 8, name: 'Cancelled' }
        ]}
        selectedTabId={selectedTab}
        onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
      />
      <Paper variant='outlined' className={classes.paper}>
        <JobsPageTable
          isLoadingData={isSearchingJob}
          isExportingData={isExportingData}
          jobs={jobs}
          count={count}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleChangePage={(event, page) => setCurrentPage(page)}
          handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          vehicles={vehicles}
          employees={employees}
          districts={districts}
          serviceType={serviceType}
          setDelete={setDelete}
          handleOnEdit={handleOnEdit}
          query={query}
          setQuery={setQuery}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          vehicleFilter={vehicleFilter}
          setVehicleFilter={setVehicleFilter}
          districtFilter={districtFilter}
          setDistrictFilter={setDistrictFilter}
          handleViewJob={handleViewJob}
          handleCsvClick={handleCsvClick}
          selectedTab={selectedTab}
          csv={csv}
          handleSnackbar={handleSnackbar}
          column={column}
          setColumn={setColumn}
          tableSettingId={tableSettingId}
        />

        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={handleCloseSnackbar}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        />
      </Paper>
      {isExportingData && <ExportCsvProgress open={isExportingData} progress={exportProgress} />}
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
          primaryActionButton={() => {
            handleSubmit();
            setIsOverlapping(false);
          }}
          secondaryActionButton={() => setIsOverlapping(false)}
          handleClose={() => setIsOverlapping(false)}
        />
      )}
      {confirmTimeOffOverlapping && (
        <StandardConfirmationDialog
          variant={'warning'}
          title='Assign Job to Time Off Day?'
          okLabel='Continue'
          cancelLabel='Cancel'
          message='You are about to assign job to Time Off Day'
          boldMessage={`${timeOffOverlapping ? timeOffOverlapping : ''}.`}
          secondMessage='Please re-schedule if it necessary'
          open={confirmTimeOffOverlapping}
          handleClose={() => setConfirmTimeOffOverlapping(false)}
          onConfirm={() => {
            handleSubmit();
            setConfirmTimeOffOverlapping(false);
          }}
        />
      )}
    </Container>
  );
};

export default JobsPage;
