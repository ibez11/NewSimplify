import React, { FC, useContext, useEffect, useState } from 'react';
import { Checkbox, Chip, Grid, TextField } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { disablePrevDates, getUnique } from 'utils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { TimeOffBody } from 'typings/body/TimeOffBody';
import { format, isBefore, isValid } from 'date-fns';
import CustomizedDialog from 'components/CustomizedDialog';
import { dummyTimeOff } from 'constants/dummy';
import axios, { CancelTokenSource } from 'axios';
import { TIMEOFF_BASE_URL, GET_EDIT_TIMEOFF_BY_ID_URLL } from 'constants/url';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditTimeOff: boolean;
  setIsEditTimeOff: React.Dispatch<React.SetStateAction<boolean>>;
  employeeMaster: Select[];
  timeOffEvent?: CalendarEventModel;
  loadData(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const TimeOffForm: FC<Props> = props => {
  const { currentUser } = useContext(CurrentUserContext);
  const { open, setOpen, isEditTimeOff, setIsEditTimeOff, employeeMaster, timeOffEvent, loadData, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [timeOff, setTimeOff] = useState<TimeOffBody>(dummyTimeOff);
  const [statusError, setStatusError] = useState<string>('');
  const [employeeError, setEmployeeError] = useState<string>('');
  const [startDateError, setStartDateError] = useState<string>('');
  const [endDateError, setEndDateError] = useState<string>('');

  useEffect(() => {
    if (!timeOffEvent) {
      return;
    }

    const { jobId, start, end, title, employeesSelected, remarks } = timeOffEvent;
    const getEmployees: any = [];

    if (employeesSelected) {
      employeesSelected.map((value: any) => {
        return getEmployees.push({ id: value.id, name: value.displayName });
      });
    }

    setTimeOff({ id: jobId, status: title, startDateTime: new Date(start), endDateTime: new Date(end), remarks, Employees: getEmployees });
  }, [timeOffEvent]);

  const handleOnBlurStatus = () => {
    if (timeOff.status.trim() === '') {
      setStatusError('Please input the status of this Time Off Request');
    } else {
      setStatusError('');
    }
  };

  const handleSetEmployee = (employees: Select[]) => {
    const selectedEmployee: any = [];
    if (employees) {
      const clearEmployee = getUnique(employees, 'id');
      clearEmployee.map(employee => {
        return selectedEmployee.push({ id: employee.id, name: employee.name });
      });
    }

    setTimeOff({ ...timeOff, Employees: selectedEmployee });
  };

  const handleOnBlurEmployee = () => {
    if (timeOff.Employees.length === 0) {
      setEmployeeError('Please select a Technician');
    } else {
      setEmployeeError('');
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const { endDateTime } = timeOff;
      if (isBefore(date, endDateTime)) {
        setTimeOff({ ...timeOff, startDateTime: date });
        setStartDateError('');
      } else {
        setTimeOff({
          ...timeOff,
          startDateTime: date,
          endDateTime: date
        });
        setStartDateError('');
      }
    }
  };

  const handleEndJobDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      setTimeOff({ ...timeOff, endDateTime: date });
      setEndDateError('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (timeOff.status === '') {
      setStatusError('Please input the status of this Time Off Request');
      setIsLoading(false);
      return;
    }

    if (timeOff.Employees.length === 0) {
      setEmployeeError('Please select a Technician');
      setIsLoading(false);
      return;
    }

    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      const { startDateTime, endDateTime } = timeOff;
      const newStartDateTime = `${format(new Date(startDateTime), 'yyyy-MM-dd 00:00:00')}`;
      const newEndDateTime = `${format(new Date(endDateTime), 'yyyy-MM-dd 23:59:00')}`;

      if (isEditTimeOff) {
        await axios.put(
          GET_EDIT_TIMEOFF_BY_ID_URLL(timeOff.id),
          { ...timeOff, startDateTime: newStartDateTime, endDateTime: newEndDateTime },
          { cancelToken: cancelTokenSource.token }
        );
        handleSnackbar('success', 'Successfully edit time off request');
        setOpen(false);
        setIsEditTimeOff(false);
        loadData();
      } else {
        await axios.post(
          TIMEOFF_BASE_URL,
          { ...timeOff, startDateTime: newStartDateTime, endDateTime: newEndDateTime },
          { cancelToken: cancelTokenSource.token }
        );
        CreateLogEvent('create_timeoff', currentUser!);
        handleSnackbar('success', 'Successfully create time off request');
        setOpen(false);
        setIsEditTimeOff(false);
        loadData();
      }
    } catch (err) {
      handleSnackbar('error', isEditTimeOff ? 'Failed to edit time off request' : 'Failed create time off request');
    }

    setIsLoading(false);
  };

  return (
    <CustomizedDialog
      isLoading={isLoading}
      open={open}
      isConfirmation={false}
      header='Schedule Time Off'
      message=''
      primaryButtonLabel='Save'
      secondaryButtonLabel='Cancel'
      primaryActionButton={() => handleSubmit()}
      secondaryActionButton={() => {
        setOpen(false);
        setTimeOff(dummyTimeOff);
        setIsEditTimeOff(false);
      }}
      handleClose={() => {
        setOpen(false);
        setTimeOff(dummyTimeOff);
        setIsEditTimeOff(false);
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            margin='dense'
            fullWidth
            id='timeOff-status'
            label='Status'
            required
            value={timeOff.status}
            helperText={statusError}
            error={statusError !== ''}
            onChange={event => setTimeOff({ ...timeOff, status: event.target.value })}
            onBlur={handleOnBlurStatus}
            variant='outlined'
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            id='technician-time-off'
            disableCloseOnSelect
            options={employeeMaster}
            getOptionLabel={option => option.name}
            value={timeOff.Employees}
            getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
            onChange={(_, value) => handleSetEmployee(value)}
            onBlur={handleOnBlurEmployee}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={`${option.name}`} size='small' {...getTagProps({ index })} />)
            }
            renderOption={(option, { selected }) => (
              <>
                <Checkbox icon={<CheckBoxOutlineBlankIcon />} checkedIcon={<CheckBoxIcon />} color='primary' disableRipple checked={selected} />
                {option.name}
              </>
            )}
            renderInput={params => (
              <TextField
                {...params}
                fullWidth
                required
                id='Technician'
                label='Technician'
                variant='outlined'
                autoComplete='off'
                margin='dense'
                error={employeeError !== ''}
                helperText={employeeError}
                style={{ marginBottom: 24 }}
              />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              autoOk
              clearable
              required
              fullWidth
              id='timeOffStartDate'
              label='Start Date'
              margin='dense'
              value={timeOff.startDateTime}
              variant='inline'
              inputVariant='outlined'
              format='dd-MM-yyyy'
              onChange={handleStartDateChange}
              error={startDateError ? true : false}
              helperText={startDateError}
              KeyboardButtonProps={{
                'aria-label': 'change date'
              }}
              InputAdornmentProps={{ position: 'start' }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              autoOk
              required
              fullWidth
              id='timeOffEndDate'
              label='End Date'
              margin='dense'
              value={timeOff.endDateTime}
              variant='inline'
              inputVariant='outlined'
              format='dd-MM-yyyy'
              shouldDisableDate={disablePrevDates(new Date(timeOff.startDateTime))}
              minDate={new Date(timeOff.startDateTime!)}
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
        <Grid item xs={12}>
          <TextField
            margin='dense'
            fullWidth
            id='timeOff-remarks'
            multiline
            rows={4}
            label='Remarks'
            value={timeOff.remarks}
            onChange={event => setTimeOff({ ...timeOff, remarks: event.target.value })}
            variant='outlined'
            autoComplete='off'
          />
        </Grid>
      </Grid>
    </CustomizedDialog>
  );
};

export default TimeOffForm;
