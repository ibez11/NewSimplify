import { FC, useState, useEffect } from 'react';
import { Grid, TextField, Theme, Typography, Button, DialogActions, MenuItem, Chip, Checkbox, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import {
  JOB_BASE_URL,
  GET_EDIT_JOB_URL,
  GET_CANCEL_JOB_URL,
  JOB_LABEL_TEMPLATE_BASE_URL,
  GET_ACTIVE_VEHICLE_URL,
  GET_ACTIVE_TECHNICIANS_URL,
  TIMEOFF_BASE_URL,
  GET_SETTING_CODE_BASE_URL,
  GET_SETTING_UPDATE_BASE_URL
} from 'constants/url';
import axios, { CancelTokenSource } from 'axios';
import theme from 'theme';
import { JobStatus } from 'constants/enum';
import { disablePrevDates, ucWords } from 'utils';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { format, isValid, isAfter, isBefore } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import ClockIcon from '@material-ui/icons/Alarm';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import TechIcon from '@material-ui/icons/GroupAdd';
import { getUnique } from 'utils';
import { JobBody } from 'typings/body/JobBody';
import { dummyJobBody } from 'constants/dummy';
import CancelConfirmation from '../CancelConfirmation';
import PasswordConfirmation from 'components/PasswordConfirmation';
import { StandardConfirmationDialog } from 'components/AppDialog';
import SmartRankingForm from 'components/SmartRankingForm';
import SettingCodes from 'typings/SettingCodes';

interface Props {
  job: JobDetailModel;
  setJob: React.Dispatch<React.SetStateAction<JobDetailModel>>;
  publicHolidays: any[];
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  fetchData(): void;
  setOpenCollectedConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  required: {
    color: 'red'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  }
}));

const EditJobForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const { job, setJob, publicHolidays, handleClose, handleSnackbar, fetchData, setOpenCollectedConfirmation } = props;

  const statusMaster = Object.keys(JobStatus);
  const [jobLabelMaster, setJobLabelMasater] = useState<Select[]>([]);
  const [employeeMaster, setEmployeeMaster] = useState<Select[]>([]);
  const [vehicleMaster, setVehicleMaster] = useState<Select[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editJob, setEditJob] = useState<JobBody>(dummyJobBody);

  const [confirmOverlapping, setConfirmOverlapping] = useState<boolean>(false);
  const [userOverlapping, setUserOverlapping] = useState<string>('');
  const [vehilceOverlapping, setVehicleOverlapping] = useState<string>('');
  const [confirmHoliday, setConfirmHoliday] = useState<boolean>(false);
  const [timeOffOverlapping, setTimeOffOverlapping] = useState<string>('');
  const [confirmTimeOffOverlapping, setConfirmTimeOffOverlapping] = useState<boolean>(false);
  const [cancelConfirmation, setCancelConfirmation] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);
  const [isDeduct, setIsDeduct] = useState<boolean>(false);

  const [employeeError, setEmployeeError] = useState<string>('');
  const [vehicleError, setVehicleError] = useState<string>('');
  const [startTimeError, setStartTimeError] = useState<string>('');
  const [endTimeError, setEndTimeError] = useState<string>('');
  const [startDateError, setStartDateError] = useState<string>('');
  const [endDateError, setEndDateError] = useState<string>('');
  const [jobLabelError, setJobLabelError] = useState<string>('');

  const [assignOpen, setAssignOpen] = useState<boolean>(false);
  const [smartSkill, setSmartSkill] = useState<boolean>(true);
  const [smartProximity, setSmartProximity] = useState<boolean>(true);
  const [smartSettingId, setSmartSettingId] = useState<number | null>(null);
  const [isSmartRanking, setIsSmartRanking] = useState<boolean>(false);

  useEffect(() => {
    if (!job) {
      return;
    }
    const {
      jobId,
      jobStatus,
      startDateTime,
      endDateTime,
      jobRemarks,
      selectedEmployees,
      selectedVehicles,
      JobLabels,
      Skills,
      clientName,
      serviceAddress,
      postalCode
    } = job;

    const getVehicles: any = [];
    const getEmployees: any = [];

    if (selectedVehicles) {
      selectedVehicles.map((value: any) => {
        return getVehicles.push({ id: value.id, name: value.name });
      });
    }

    const getJobLabel: any = [];
    if (JobLabels) {
      JobLabels.map((value: any) => {
        return getJobLabel.push({ id: value.id, name: value.name, color: value.color });
      });
    }

    const getEmployeeTemplates = async () => {
      const { data } = await axios.get(`${GET_ACTIVE_TECHNICIANS_URL}?s=${Skills}`, { cancelToken: cancelTokenSource.token });

      let employeeData: Select[] = [];
      data.activeUsers.map((value: any) => {
        let displayName: string = value.displayName;
        // const matchSkillCount = value.matchSkills ? value.matchSkills.length : 0;
        // displayName = displayName + ` - ${matchSkillCount}/${Skills.length} Skill Matched`;

        // if (value.matchSkills) {
        //   value.matchSkills
        //     .slice()
        //     .reverse()
        //     .forEach((skill: any) => {
        //       const getIndex = Skills.findIndex(value => value === skill);
        //       displayName = displayName + ` (${getIndex + 1})`;
        //     });
        // }

        return employeeData.push({ id: value.id, name: displayName });
      });

      if (selectedEmployees) {
        selectedEmployees.map((value: any) => {
          const getIndex = employeeData.findIndex(master => value.id === master.id);

          return getEmployees.push({
            id: value.id,
            name: employeeData[getIndex] ? employeeData[getIndex].name : `${value.displayName} (Inactive)`
          });
        });
      }
      setEmployeeMaster(employeeData);
    };

    const getVehicleTemplates = async () => {
      const { data } = await axios.get(GET_ACTIVE_VEHICLE_URL, { cancelToken: cancelTokenSource.token });
      let vehicleData: Select[] = [];
      data.vehicles.map((value: any) => {
        return vehicleData.push({ id: value.id, name: value.carplateNumber });
      });
      setVehicleMaster(vehicleData);
    };

    const getJobLabelTemplates = async () => {
      const { data } = await axios.get(JOB_LABEL_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });
      let jobLabelData: Select[] = [];
      data.JobLabelTemplates.map((value: any) => {
        return jobLabelData.push({ id: value.id, name: value.name, color: value.color });
      });
      setJobLabelMasater(jobLabelData);
    };

    getEmployeeTemplates();
    getVehicleTemplates();
    getJobLabelTemplates();

    setEditJob({
      jobId,
      jobStatus,
      clientName,
      serviceAddress,
      postalCode,
      selectedEmployees: getEmployees,
      selectedVehicles: getVehicles,
      startDateTime,
      endDateTime,
      JobLabels: getJobLabel,
      remarks: jobRemarks
    });

    // Load smart ranking setting on component mount
    loadSmartRankingSetting();

    // eslint-disable-next-line
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

  const onCloseSmartRankingForm = () => {
    setAssignOpen(false);
  };

  const handleSmartRankingFormSave = (data: { technicianIds: number[]; selectedTechnicians: Select[]; selectedVehicles: Select[] }) => {
    const { selectedTechnicians, selectedVehicles } = data;

    // Update editJob with selected technicians and vehicles
    setEditJob({
      ...editJob,
      selectedEmployees: selectedTechnicians,
      selectedVehicles: selectedVehicles,
      jobStatus: selectedTechnicians.length > 0 ? JobStatus.ASSIGNED : JobStatus.UNASSIGNED
    });

    setAssignOpen(false);
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

  const handleSetEmployee = (employees: Select[]) => {
    const selectedEmployee: any = [];
    const { jobStatus } = editJob;
    if (employees) {
      const clearEmployee = getUnique(employees, 'id');
      clearEmployee.map(employee => {
        return selectedEmployee.push({ id: employee.id, name: employee.name });
      });
    }

    setEditJob({
      ...editJob,
      selectedEmployees: selectedEmployee,
      jobStatus:
        selectedEmployee.length > 0
          ? jobStatus === JobStatus.UNASSIGNED || jobStatus === JobStatus.CONFIRMED
            ? JobStatus.ASSIGNED
            : jobStatus
          : JobStatus.UNASSIGNED
    });
    setEmployeeError('');
  };

  const handleSetVehicle = (vehicles: Select[]) => {
    const selectedVehicles: any = [];
    if (vehicles) {
      const clearVehicle = getUnique(vehicles, 'id');
      clearVehicle.map(vehicle => {
        return selectedVehicles.push({ id: vehicle.id, name: vehicle.name });
      });
    }

    // setVehicle(selectedVehicles);
    setEditJob({ ...editJob, selectedVehicles: selectedVehicles });
    setVehicleError('');
  };

  const handleStartJobDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const startDateTime = new Date(`${format(date!, 'yyyy-MM-dd')} ${format(new Date(editJob.startDateTime!), 'HH:mm:00')}`);
      const endDateTime = new Date(`${format(new Date(editJob.endDateTime!), 'yyyy-MM-dd')} ${format(new Date(editJob.endDateTime!), 'HH:mm:00')}`);
      if (isBefore(startDateTime, endDateTime)) {
        setEditJob({ ...editJob, startDateTime });
        // setStartDate(date ? date : new Date());
        setStartDateError('');
      } else {
        setEditJob({
          ...editJob,
          startDateTime,
          endDateTime: new Date(`${format(new Date(date), 'yyyy-MM-dd')} ${format(new Date(editJob.endDateTime!), 'HH:mm:00')}`)
        });
        // setStartDate(date ? date : new Date());
        // setEndDate(date ? date : new Date());
        setStartDateError('');
      }
    }
  };

  const handleEndJobDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const startDateTime = new Date(
        `${format(new Date(editJob.startDateTime!), 'yyyy-MM-dd')} ${format(new Date(editJob.startDateTime!), 'HH:mm:00')}`
      );
      const endDateTime = new Date(`${format(date!, 'yyyy-MM-dd')} ${format(new Date(editJob.endDateTime!), 'HH:mm:00')}`);
      if (isAfter(endDateTime, startDateTime)) {
        setEditJob({ ...editJob, endDateTime });
        // setEndDate(date ? date : new Date());
        setEndDateError('');
      } else {
        setEndDateError('End date cannot be earlier start date');
      }
    }
  };

  const handleStartTimeChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const startDateTime = new Date(`${format(new Date(editJob.startDateTime!), 'yyyy-MM-dd')} ${format(date!, 'HH:mm:00')}`);
      const endDateTime = new Date(`${format(new Date(editJob.endDateTime!), 'yyyy-MM-dd')} ${format(new Date(editJob.endDateTime!), 'HH:mm:00')}`);

      if (isBefore(startDateTime!, endDateTime)) {
        setStartTimeError('');
      } else {
        setStartTimeError('Start time cannot be later than end time');
      }

      if (isAfter(endDateTime, startDateTime!)) {
        setStartTimeError('');
      } else {
        setStartTimeError('End time cannot be earlier than start time');
      }

      setEditJob({ ...editJob, startDateTime });
      // setStartTime(date ? date : new Date());
    }
  };

  const handleEndTimeChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const startDateTime = new Date(
        `${format(new Date(editJob.startDateTime!), 'yyyy-MM-dd')} ${format(new Date(editJob.startDateTime!), 'HH:mm:00')}`
      );
      const endDateTime = new Date(`${format(new Date(editJob.endDateTime!), 'yyyy-MM-dd')} ${format(date!, 'HH:mm:00')}`);

      if (isAfter(endDateTime!, startDateTime)) {
        setEndTimeError('');
      } else {
        setEndTimeError('End time cannot be earlier than start time');
      }

      if (isBefore(startDateTime, endDateTime!)) {
        setStartTimeError('');
      } else {
        setStartTimeError('Start time cannot be later than end time');
      }
      setEditJob({ ...editJob, endDateTime });
      // setEndTime(date ? date : new Date());
    }
  };

  const handleSetJobLabel = (jobLabels: Select[]) => {
    const selectedJobLabels: any = [];
    if (jobLabels) {
      const clearJobLabel = getUnique(jobLabels, 'id');
      clearJobLabel.map(label => {
        return selectedJobLabels.push({ id: label.id, name: label.name, color: label.color });
      });
    }
    if (selectedJobLabels.length <= 2) {
      setEditJob({ ...editJob, JobLabels: selectedJobLabels });
      // setJobLabel(selectedJobLabels);
      setJobLabelError('');
    } else {
      setJobLabelError('maximum only 2 label');
    }
  };

  const overlappingUserValidation = async () => {
    let result = false;
    const { jobId, startDateTime, endDateTime, selectedEmployees } = editJob;
    const currentJobDateStart = new Date(`${startDateTime}`);
    const currentJobDateEnd = new Date(`${endDateTime}`);
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    let userOverlap: string[] = [];

    if (selectedEmployees && selectedEmployees.length > 0) {
      await Promise.all(
        selectedEmployees.map(async (emp: any) => {
          const getQueryParams = () => {
            const params = new URLSearchParams();
            params.append('ei', emp.id.toString());
            params.append('j', '2');
            params.append('fb', '5');
            params.append('sd', startDateTime ? format(new Date(startDateTime), 'yyyy-MM-dd').toString() : '');
            params.append('ed', endDateTime ? format(new Date(endDateTime), 'yyyy-MM-dd').toString() : '');

            return params.toString();
          };

          const url = `${JOB_BASE_URL}?${getQueryParams()}`;
          const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
          const { jobs } = data;

          await jobs.forEach((job: JobDetailModel) => {
            if (job.jobId !== jobId) {
              const startDate = new Date(`${job.startDateTime}`);
              const endDate = new Date(`${job.endDateTime}`);
              if (
                (currentJobDateStart >= startDate && currentJobDateStart <= endDate) ||
                (currentJobDateEnd >= startDate && currentJobDateEnd <= endDate)
              ) {
                const checking = userOverlap.some(value => value === emp.name);
                if (!checking) {
                  userOverlap.push(emp.name);
                }
                result = true;
                return true;
              }
            }
          });
        })
      );
      setUserOverlapping(userOverlap.join(', '));
    }

    return result;
  };

  const overlappingVehicleValidation = async () => {
    let result = false;
    const { jobId, startDateTime, endDateTime, selectedVehicles } = editJob;
    const currentJobDateStart = new Date(`${startDateTime}`);
    const currentJobDateEnd = new Date(`${endDateTime}`);
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    let vehicleOverlap: string[] = [];

    if (selectedVehicles && selectedVehicles.length > 0) {
      await Promise.all(
        selectedVehicles.map(async (vh: any) => {
          const getQueryParams = () => {
            const params = new URLSearchParams();
            params.append('vi', vh.id.toString());
            params.append('j', '2');
            params.append('fb', '5');
            params.append('sd', startDateTime ? format(new Date(startDateTime), 'yyyy-MM-dd').toString() : '');
            params.append('ed', endDateTime ? format(new Date(endDateTime), 'yyyy-MM-dd').toString() : '');

            return params.toString();
          };

          const url = `${JOB_BASE_URL}?${getQueryParams()}`;
          const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
          const { jobs } = data;

          await jobs.forEach((job: JobDetailModel) => {
            if (job.jobId !== jobId) {
              const startDate = new Date(`${job.startDateTime}`);
              const endDate = new Date(`${job.endDateTime}`);
              if (
                (currentJobDateStart >= startDate && currentJobDateStart <= endDate) ||
                (currentJobDateEnd >= startDate && currentJobDateEnd <= endDate)
              ) {
                const checking = vehicleOverlap.some(value => value === vh.name);
                if (!checking) {
                  vehicleOverlap.push(vh.name);
                }
                result = true;
                return true;
              }
            }
          });
        })
      );
      setVehicleOverlapping(vehicleOverlap.join(', '));
    }

    return result;
  };

  const publicHolidayValidation = () => {
    if (!editJob.startDateTime) {
      return false;
    }

    const getPublicHoliday = publicHolidays.find((holidayDate: any) => holidayDate.date === format(new Date(editJob.startDateTime!), 'yyyy-MM-dd'));
    return getPublicHoliday ? true : false;
  };

  const timeOffValidation = async () => {
    let isValidTimeOff = false;

    const { startDateTime, endDateTime, selectedEmployees } = editJob;

    if (selectedEmployees.length > 0) {
      const getQueryParams = () => {
        const params = new URLSearchParams();
        params.append('sd', format(new Date(startDateTime), 'yyyy-MM-dd'));
        params.append('ed', format(new Date(endDateTime), 'yyyy-MM-dd'));

        return params.toString();
      };

      let timeOffOverlapping: string[] = [];

      const { data } = await axios.get(`${TIMEOFF_BASE_URL}?${getQueryParams()}`, { cancelToken: cancelTokenSource.token });
      const timeOffData = data.timeOff;

      // Function to check if an employee id exists in the selectedEmployee array
      const hasSameId = (employeeId: number) => {
        return selectedEmployees.some(employee => employee.id === employeeId);
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

  const validateForm = async () => {
    let ret = true;

    const { jobStatus, selectedEmployees } = editJob;
    if (jobStatus === JobStatus.COMPLETED || jobStatus === JobStatus.ASSIGNED || jobStatus === JobStatus.IN_PROGRESS) {
      if (!selectedEmployees || selectedEmployees.length === 0) {
        setEmployeeError('Technician cannot be empty');
        setIsLoading(false);
        ret = false;
        // } else if (!selectedVehicles || selectedVehicles.length === 0) {
        //   setVehicleError('Vehicle cannot be empty');
        //   setIsLoading(false);
        //   ret = false;
      } else {
        if (jobStatus !== JobStatus.COMPLETED) {
          if (await overlappingUserValidation()) {
            setConfirmOverlapping(true);
            ret = false;
          } else if (await overlappingVehicleValidation()) {
            setConfirmOverlapping(true);
            ret = false;
          } else if (publicHolidayValidation()) {
            setConfirmHoliday(true);
            ret = false;
          } else if (await timeOffValidation()) {
            setConfirmTimeOffOverlapping(true);
            ret = false;
          }
        }
      }
    }

    return ret;
  };

  const handleOverlappingConfirm = () => {
    setConfirmOverlapping(false);

    const inPublicHoliday = publicHolidayValidation();
    if (inPublicHoliday) {
      setConfirmHoliday(true);
      return;
    }

    handleSubmit();
  };

  const handleReschedule = () => {
    setIsLoading(false);
    setConfirmHoliday(false);
    setConfirmOverlapping(false);
    setConfirmTimeOffOverlapping(false);
  };

  const handleHolidayConfirm = () => {
    setConfirmHoliday(false);
    handleSubmit();
  };

  const handleTimeOffConfirm = () => {
    setConfirmTimeOffOverlapping(false);
    handleSubmit();
  };

  const handleValidation = async () => {
    const { jobStatus } = editJob;

    if (jobStatus === JobStatus.CANCELLED) {
      setCancelConfirmation(true);
    } else {
      if (await validateForm()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    const { jobId, startDateTime, endDateTime, jobStatus } = editJob;
    const newStartDateTime = `${format(new Date(startDateTime), 'yyyy-MM-dd HH:mm:00')}`;
    const newEndDateTime = `${format(new Date(endDateTime), 'yyyy-MM-dd HH:mm:00')}`;

    try {
      const { data } = await axios.put(
        GET_EDIT_JOB_URL(Number(jobId)),
        {
          ...editJob,
          startDateTime: newStartDateTime,
          endDateTime: newEndDateTime
        },
        { cancelToken: cancelTokenSource.token }
      );

      setJob(data.job);
      setIsLoading(false);
      handleSnackbar('success', 'Successfully edit job');
      handleClose();

      if (jobStatus === 'COMPLETED') {
        setOpenCollectedConfirmation(true);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      handleSnackbar('error', 'Failed to edit job');
    }
  };

  return (
    <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
      <Grid item xs={12} sm={4}>
        <Typography variant='h6'>
          Job Status <span className={classes.required}>*</span>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          variant='outlined'
          margin='dense'
          select
          id='jobStatus'
          value={editJob.jobStatus}
          onChange={event => setEditJob({ ...editJob, jobStatus: event.target.value })}
        >
          {statusMaster.map((status, index) => (
            <MenuItem key={index} value={status}>
              {ucWords(status.replace('_', ' '))}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant='h6'>
          Technician(s) <span className={classes.required}>*</span>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        {isSmartRanking ? (
          <Grid container spacing={1} alignItems='center'>
            <Grid item xs={12}>
              <Box display='flex' flexWrap='wrap'>
                {editJob.selectedEmployees.map((employee, index) => (
                  <Chip
                    key={index}
                    label={employee.name}
                    size='small'
                    onDelete={() => {
                      const updatedEmployees = editJob.selectedEmployees.filter((_, i) => i !== index);
                      handleSetEmployee(updatedEmployees);
                    }}
                    style={{
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.light,
                      marginRight: theme.spacing(1),
                      marginBottom: theme.spacing(1)
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button variant='outlined' color='primary' startIcon={<TechIcon />} onClick={() => setAssignOpen(true)} disabled={isLoading}>
                Assign Technician
              </Button>
            </Grid>
            {employeeError && (
              <Grid item xs={12}>
                <Typography color='error' variant='caption'>
                  {employeeError}
                </Typography>
              </Grid>
            )}
          </Grid>
        ) : (
          <Autocomplete
            multiple
            id='employee'
            disableCloseOnSelect
            options={employeeMaster}
            getOptionLabel={option => option.name}
            value={editJob.selectedEmployees}
            getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
            onChange={(_, value) => handleSetEmployee(value)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={`${option.name}`}
                  size='small'
                  {...getTagProps({ index })}
                  style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                />
              ))
            }
            renderOption={(option, { selected }) => (
              <>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon />}
                  checkedIcon={<CheckBoxIcon />}
                  color='primary'
                  disableRipple
                  className={classes.checkBox}
                  checked={selected}
                />
                {option.name}
              </>
            )}
            renderInput={params => (
              <TextField
                {...params}
                fullWidth
                id='technicians'
                label='Technician(s)'
                variant='outlined'
                autoComplete='off'
                margin='dense'
                error={employeeError ? true : false}
                helperText={employeeError}
              />
            )}
          />
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant='h6'>Vehicle(s)</Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Autocomplete
          multiple
          id='Vehicle'
          disableCloseOnSelect
          options={vehicleMaster}
          getOptionLabel={option => option.name}
          value={editJob.selectedVehicles}
          getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
          onChange={(_, value) => handleSetVehicle(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={`${option.name}`}
                size='small'
                {...getTagProps({ index })}
                style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
              />
            ))
          }
          renderOption={(option, { selected }) => (
            <>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                color='primary'
                disableRipple
                className={classes.checkBox}
                checked={selected}
              />
              {option.name}
            </>
          )}
          renderInput={params => (
            <TextField
              {...params}
              fullWidth
              id='vehicle'
              label='Vehicle'
              variant='outlined'
              autoComplete='off'
              margin='dense'
              error={vehicleError ? true : false}
              helperText={vehicleError}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant='h6'>
          Start & End Date <span className={classes.required}>*</span>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            clearable
            required
            fullWidth
            id='serviceDate'
            label='Start Date'
            margin='dense'
            value={editJob.startDateTime}
            variant='dialog'
            inputVariant='outlined'
            format='dd-MM-yyyy'
            onChange={handleStartJobDateChange}
            error={startDateError ? true : false}
            helperText={startDateError}
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
            InputAdornmentProps={{ position: 'start' }}
          />
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid item xs={12} sm={4}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            clearable
            required
            fullWidth
            id='serviceDate'
            label='End Date'
            margin='dense'
            value={editJob.endDateTime}
            variant='dialog'
            inputVariant='outlined'
            format='dd-MM-yyyy'
            shouldDisableDate={disablePrevDates(new Date(editJob.startDateTime!))}
            minDate={new Date(editJob.startDateTime!)}
            onChange={handleEndJobDateChange}
            error={endDateError ? true : false}
            helperText={endDateError}
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
            InputAdornmentProps={{ position: 'start' }}
          />
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant='h6'>
          Start & End Time <span className={classes.required}>*</span>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={4}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardTimePicker
            required
            fullWidth
            id='startTime'
            label='Start Time'
            margin='dense'
            value={editJob.startDateTime}
            variant='dialog'
            inputVariant='outlined'
            error={startTimeError ? true : false}
            helperText={startTimeError}
            onChange={handleStartTimeChange}
            keyboardIcon={<ClockIcon />}
            minutesStep={15}
            KeyboardButtonProps={{
              'aria-label': 'change start time'
            }}
            InputAdornmentProps={{ position: 'start' }}
          />
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid item xs={12} sm={4}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardTimePicker
            required
            fullWidth
            id='endTime'
            label='End Time'
            margin='dense'
            value={editJob.endDateTime}
            variant='dialog'
            inputVariant='outlined'
            error={endTimeError ? true : false}
            helperText={endTimeError}
            onChange={handleEndTimeChange}
            keyboardIcon={<ClockIcon />}
            minutesStep={15}
            KeyboardButtonProps={{
              'aria-label': 'change start time'
            }}
            InputAdornmentProps={{ position: 'start' }}
          />
        </MuiPickersUtilsProvider>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant='h6'>Job Label(s)</Typography>
        <Typography variant='caption' color={jobLabelError ? 'error' : 'textSecondary'}>
          maximum only 2 label
        </Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <Autocomplete
          multiple
          id='jobLabel'
          disableCloseOnSelect
          options={jobLabelMaster}
          getOptionLabel={option => option.name}
          value={editJob.JobLabels}
          getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
          onChange={(_, value) => handleSetJobLabel(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip label={`${option.name}`} style={{ color: option.color, backgroundColor: `${option.color}40` }} {...getTagProps({ index })} />
            ))
          }
          renderOption={(option, { selected }) => (
            <>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                color='primary'
                disableRipple
                className={classes.checkBox}
                checked={selected}
              />
              {option.name}
            </>
          )}
          renderInput={params => (
            <TextField
              {...params}
              fullWidth
              id='jobLabels'
              label='Job Labels'
              variant='outlined'
              autoComplete='off'
              margin='dense'
              error={jobLabelError ? true : false}
              helperText={jobLabelError}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <Typography variant='h6'>Job Remarks</Typography>
      </Grid>
      <Grid item xs={12} sm={8}>
        <TextField
          fullWidth
          variant='outlined'
          multiline
          rows={3}
          id='remakrs'
          label='Job Remarks'
          margin='dense'
          value={editJob.remarks || ''}
          onChange={event => setEditJob({ ...editJob, remarks: event.target.value })}
        />
      </Grid>
      <Grid item container xs={12} md={12} justify='flex-end'>
        <DialogActions>
          <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='contained' disableElevation color='primary' disabled={isLoading} onClick={handleValidation}>
            Save
            {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
          </Button>
        </DialogActions>
      </Grid>

      {confirmHoliday && (
        <StandardConfirmationDialog
          variant={'warning'}
          title='Assign Job on Public Holiday?'
          okLabel='CONTINUE'
          cancelLabel='CANCEL'
          message='There is Jobs assigned on Public Holiday.'
          secondMessage='Please re-schedule if it necessary'
          open={confirmHoliday}
          handleClose={handleReschedule}
          onConfirm={handleHolidayConfirm}
        />
      )}

      {confirmOverlapping && (
        <StandardConfirmationDialog
          variant={'warning'}
          title='Assign Job with Overlapping Schedule'
          okLabel='Continue'
          cancelLabel='Cancel'
          message='You are about to assign job with overlapping schedule.'
          boldMessage={`${userOverlapping ? userOverlapping : ''} ${userOverlapping && vehilceOverlapping ? '&' : ''} ${
            vehilceOverlapping ? vehilceOverlapping : ''
          } is overlapping.`}
          secondMessage='Please re-schedule if it necessary'
          open={confirmOverlapping}
          handleClose={handleReschedule}
          onConfirm={handleOverlappingConfirm}
        />
      )}

      {cancelConfirmation && (
        <CancelConfirmation
          open={cancelConfirmation}
          handleClose={() => {
            setCancelConfirmation(false);
            setEditJob({ ...editJob, jobStatus: job.jobStatus });
          }}
          setOpenPasswordConfirmation={setOpenPasswordDialog}
          isDeduct={isDeduct}
          setIsDeduct={setIsDeduct}
          invoiceNumber={job.invoiceNumber}
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
          handleClose={handleReschedule}
          onConfirm={handleTimeOffConfirm}
        />
      )}

      {openPasswordDialog && (
        <PasswordConfirmation
          open={openPasswordDialog}
          handleClose={() => {
            setOpenPasswordDialog(false);
            setCancelConfirmation(false);
            handleClose();
          }}
          url={GET_CANCEL_JOB_URL(Number(job.jobId))}
          isEdit={true}
          editData={{ isRecalculate: Boolean(isDeduct) }}
          fetchData={fetchData}
          title='Cancel Job'
          message='cancel job'
          handleSnackbar={handleSnackbar}
        />
      )}

      {assignOpen && (
        <SmartRankingForm
          open={assignOpen}
          onClose={onCloseSmartRankingForm}
          job={job}
          onSave={handleSmartRankingFormSave}
          initialSelectedTechnicians={editJob.selectedEmployees}
          initialSelectedVehicles={editJob.selectedVehicles}
          smartSkill={smartSkill}
          smartProximity={smartProximity}
          smartSettingId={smartSettingId}
          onSmartSkillChange={handleSmartSkillChange}
          onSmartProximityChange={handleSmartProximityChange}
          handleSnackbar={handleSnackbar}
        />
      )}
    </Grid>
  );
};

export default EditJobForm;
