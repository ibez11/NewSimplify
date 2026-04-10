import React, { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  makeStyles,
  MenuItem,
  Radio,
  RadioGroup,
  SvgIcon,
  TextField,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';

import InfoIcon from '@material-ui/icons/Info';
import BackIcon from '@material-ui/icons/NavigateBefore';
import NextIcon from '@material-ui/icons/NavigateNext';
import DateFnsUtils from '@date-io/date-fns';
import DeleteIcon from '@material-ui/icons/Cancel';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import ColorLegend from './ColorLegend';

import { isValid, subDays, addDays, isSameDay, subMonths, subWeeks, addMonths, addWeeks, format, startOfWeek, endOfWeek } from 'date-fns';
import { JobStatus, ScheduleView } from 'constants/enum';
import { ucWords } from 'utils';
import FilterTable from 'components/FilterTable';
import theme from 'theme';
import FilterDialog from 'components/FilterDialog';

interface Props {
  selectedTab: number;
  initialView: string;
  handleChangeScheduleView: (value: string) => void;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  active: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  publicHoliday: string;
  employeeMaster: Select[];
  employeeFilter: ColumnFilter[];
  setEmployeeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  vehicleMaster: Select[];
  vehicleFilter: ColumnFilter[];
  setVehicleFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  districtMaster: Select[];
  districtFilter: ColumnFilter[];
  setDistrictFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  isUnassignedJobs: boolean;
  setIsUnassignedJobs: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  datePicker: {
    width: '45%'
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginBottom: 4
  }
}));

const ToolBar = forwardRef<{}, Props>((props, ref) => {
  const classes = useStyles();
  const {
    selectedTab,
    initialView,
    handleChangeScheduleView,
    selectedDate,
    setSelectedDate,
    active,
    setActive,
    publicHoliday,
    employeeMaster,
    employeeFilter,
    setEmployeeFilter,
    vehicleMaster,
    vehicleFilter,
    setVehicleFilter,
    districtMaster,
    districtFilter,
    setDistrictFilter,
    isUnassignedJobs,
    setIsUnassignedJobs
  } = props;

  const today = new Date();
  const jobStatus = Object.values(JobStatus);
  const scheduleView = Object.entries(ScheduleView).map(([key, value]) => ({ key, value }));

  const [selectedEmployee, setSelectedEmployee] = useState<Select[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Select[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<Select[]>([]);

  const [employeeFilterTemp, setEmployeeFilterTemp] = useState<ColumnFilter[]>([]);
  const [vehilceFilterTemp, setVehicleFilterTemp] = useState<ColumnFilter[]>([]);
  const [districtFilterTemp, setDistrictFilterTemp] = useState<ColumnFilter[]>([]);
  const [isUnassignedJobsTemp, setIsUnassignedJobsTemp] = useState<boolean>(isUnassignedJobs);

  const [openFilter, setOpenFilter] = useState<boolean>(false);

  const handleTodayButton = () => {
    setSelectedDate(new Date());
  };

  const handleBackButton = () => {
    let newDate = today;
    if (initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay')) {
      newDate = subDays(selectedDate, 1);
    } else if (!initialView.includes('dayGridWeek')) {
      newDate = subMonths(selectedDate, 1);
    } else {
      newDate = subWeeks(startOfWeek(selectedDate, { weekStartsOn: 1 }), 1);
    }
    setSelectedDate(newDate);
  };

  const handleNextButton = () => {
    let newDate = today;
    if (initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay')) {
      newDate = addDays(selectedDate, 1);
    } else if (!initialView.includes('dayGridWeek')) {
      newDate = addMonths(selectedDate, 1);
    } else {
      newDate = addWeeks(startOfWeek(selectedDate, { weekStartsOn: 1 }), 1);
    }
    setSelectedDate(newDate);
  };

  const handleChangeDate = (date: Date | null) => {
    if (isValid(date)) {
      setSelectedDate(date ? date : new Date());
    }
  };

  const handleSwitch = () => {
    setActive(!active);
  };

  const handleClearFilter = () => {
    setEmployeeFilter([]);
    setSelectedEmployee([]);
    setEmployeeFilterTemp([]);
    setVehicleFilter([]);
    setSelectedVehicle([]);
    setVehicleFilterTemp([]);
    setDistrictFilter([]);
    setSelectedDistrict([]);
    setDistrictFilterTemp([]);
    setIsUnassignedJobs(true);
    setIsUnassignedJobsTemp(true);
  };

  const handleDeleteEmployeeFilter = (index: number) => {
    const currentFilter = [...employeeFilter];
    const currentSelectedData = [...selectedEmployee];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setEmployeeFilter(currentFilter);
    setEmployeeFilterTemp(currentFilter);
    setSelectedEmployee(currentSelectedData);
  };

  const handleDeleteVehicleFilter = (index: number) => {
    const currentFilter = [...vehicleFilter];
    const currentSelectedData = [...selectedVehicle];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setVehicleFilter(currentFilter);
    setVehicleFilterTemp(currentFilter);
    setSelectedVehicle(currentSelectedData);
  };

  const handleDeleteDistrictFilter = (index: number) => {
    const currentFilter = [...districtFilter];
    const currentSelectedData = [...selectedDistrict];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setDistrictFilter(currentFilter);
    setDistrictFilterTemp(currentFilter);
    setSelectedDistrict(currentSelectedData);
  };

  const handleSubmit = () => {
    setEmployeeFilter(employeeFilterTemp);
    setVehicleFilter(vehilceFilterTemp);
    setDistrictFilter(districtFilterTemp);
    setIsUnassignedJobs(isUnassignedJobsTemp);
    setOpenFilter(false);
  };

  useImperativeHandle(ref, () => ({
    handleResetFilter: () => {
      return handleClearFilter();
    }
  }));

  const renderFilterHeader = () => {
    if (employeeFilter.length > 0 || vehicleFilter.length > 0 || districtFilter.length > 0) {
      return (
        <Grid container>
          <Grid item xs={1}>
            <Button color='primary' onClick={handleClearFilter}>
              <Typography variant='body1'>Clear Filter</Typography>
            </Button>
          </Grid>
          <Grid item xs={11}>
            {employeeFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon color='disabled' />
                  </Tooltip>
                }
                style={{ margin: '0 8px 8px 0' }}
                onDelete={() => handleDeleteEmployeeFilter(index)}
              />
            ))}
            {vehicleFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon color='disabled' />
                  </Tooltip>
                }
                style={{ margin: '0 8px 8px 0' }}
                onDelete={() => handleDeleteVehicleFilter(index)}
              />
            ))}
            {districtFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon color='disabled' />
                  </Tooltip>
                }
                style={{ margin: '0 8px 8px 0' }}
                onDelete={() => handleDeleteDistrictFilter(index)}
              />
            ))}
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <>
      <Grid container spacing={2} alignItems='center'>
        <Grid item container xs={12} sm={6}>
          <Grid item xs={10}>
            <Button
              variant='contained'
              disableElevation
              onClick={handleTodayButton}
              color='primary'
              disabled={isSameDay(selectedDate, today) ? true : false}
            >
              Today
            </Button>
            <Tooltip
              title={
                initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay')
                  ? 'Previous Date'
                  : !initialView.includes('dayGridWeek')
                  ? 'Previous Month'
                  : 'Previous Week'
              }
            >
              <IconButton onClick={handleBackButton} style={{ margin: '0 8px' }}>
                <BackIcon />
              </IconButton>
            </Tooltip>
            {initialView.includes('dayGridWeek') ? (
              <TextField
                variant='outlined'
                disabled
                margin='dense'
                id='date'
                value={`${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'dd-MM-yyyy')} to ${format(
                  endOfWeek(selectedDate, { weekStartsOn: 1 }),
                  'dd-MM-yyyy'
                )}`}
              />
            ) : (
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  disableToolbar
                  clearable
                  autoOk
                  margin='dense'
                  id='date'
                  value={selectedDate}
                  variant='inline'
                  inputVariant='outlined'
                  format={initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay') ? 'EEE, dd MMMM yyyy' : 'MMMM yyyy'}
                  views={
                    initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay')
                      ? ['year', 'month', 'date']
                      : ['year', 'month']
                  }
                  openTo={initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay') ? 'date' : 'month'}
                  onChange={handleChangeDate}
                  className={classes.datePicker}
                  InputProps={{
                    endAdornment: publicHoliday && (initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay')) && (
                      <InputAdornment position='end'>
                        <Tooltip title={publicHoliday}>
                          <InfoIcon color='error' />
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
              </MuiPickersUtilsProvider>
            )}

            <Tooltip
              title={
                initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay')
                  ? 'Next Date'
                  : !initialView.includes('dayGridWeek')
                  ? 'Next Month'
                  : 'Next Week'
              }
            >
              <IconButton onClick={handleNextButton} style={{ margin: '0 8px' }}>
                <NextIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid container justify='flex-end' alignItems='center'>
            <Button
              variant='outlined'
              disableElevation
              color='primary'
              startIcon={
                <SvgIcon {...props}>
                  <path d='M4.25 5.66C4.35 5.79 9.99 12.99 9.99 12.99V19C9.99 19.55 10.44 20 11 20H13.01C13.56 20 14.02 19.55 14.02 19V12.98C14.02 12.98 19.51 5.96 19.77 5.64C20.03 5.32 20 5 20 5C20 4.45 19.55 4 18.99 4H5.01C4.4 4 4 4.48 4 5C4 5.2 4.06 5.44 4.25 5.66Z' />
                </SvgIcon>
              }
              onClick={() => setOpenFilter(true)}
            >
              Filter
            </Button>
            <TextField
              select
              margin='dense'
              id='option'
              label='Schedule View'
              value={initialView}
              onChange={event => handleChangeScheduleView(event.target.value)}
              variant='outlined'
              autoComplete='off'
              style={{ minWidth: 120, marginLeft: theme.spacing(1), marginBottom: 0, marginTop: 0 }}
            >
              {scheduleView.map((option: any) => (
                <MenuItem key={option.key} value={option.value}>
                  {ucWords(option.key)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={1} alignItems='center' style={{ marginTop: 16, marginBottom: 8 }}>
        {renderFilterHeader()}
      </Grid>
      <Grid container spacing={1} alignItems='center' style={{ marginTop: 16, marginBottom: 8 }}>
        <Grid item xs={3}>
          {(initialView.includes('resourceTimeline') || initialView.includes('resourceTimeGridDay')) && (
            <Grid container>
              <ButtonGroup size='small'>
                <Button variant='outlined' color={active ? 'primary' : 'default'} onClick={handleSwitch}>
                  All Day (12AM-12AM)
                </Button>
                <Button variant='outlined' color={active ? 'default' : 'primary'} onClick={handleSwitch}>
                  Operating Hours
                </Button>
              </ButtonGroup>
            </Grid>
          )}
        </Grid>
        <Grid item xs={9} container direction='row' justify='flex-end'>
          {jobStatus.map((value: any) => (
            <ColorLegend status={value} key={value} />
          ))}
          <Grid container xs={1} direction='column' alignItems='center' style={{ marginRight: 4, marginLeft: 4 }}>
            <Grid className={classes.dot} style={{ backgroundColor: '#967969' }} />
            <Typography variant='body2'>Time Off</Typography>
          </Grid>
        </Grid>
      </Grid>
      {openFilter && (
        <FilterDialog
          open={openFilter}
          title='Filter Job Schedule'
          handleClose={() => setOpenFilter(false)}
          handleSubmit={handleSubmit}
          children={
            <form noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {selectedTab === 0 ? (
                    <>
                      <Typography variant='subtitle1'>Filter Employee:</Typography>
                      <Typography variant='body1' color='textSecondary'>
                        Quickly find employees by filtering through names.
                      </Typography>
                      <FilterTable
                        masterData={employeeMaster}
                        selectedData={selectedEmployee}
                        setSelectedData={setSelectedEmployee}
                        columnFilter={employeeFilterTemp}
                        setColumnFilter={setEmployeeFilterTemp}
                        label='Filter Employee'
                        isShowValue
                        fullwidth
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant='subtitle1'>Filter Vehicle:</Typography>
                      <Typography variant='body1' color='textSecondary'>
                        Quickly find vehicle by filtering through vehicle number.
                      </Typography>
                      <FilterTable
                        masterData={vehicleMaster}
                        selectedData={selectedVehicle}
                        setSelectedData={setSelectedVehicle}
                        columnFilter={vehilceFilterTemp}
                        setColumnFilter={setVehicleFilterTemp}
                        label='Filter Vehicle'
                        isShowValue
                        fullwidth
                      />
                    </>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1'>Filter District:</Typography>
                  <Typography variant='body1' color='textSecondary'>
                    Find jobs by district name and status.
                  </Typography>
                  <FilterTable
                    masterData={districtMaster}
                    selectedData={selectedDistrict}
                    setSelectedData={setSelectedDistrict}
                    columnFilter={districtFilterTemp}
                    setColumnFilter={setDistrictFilterTemp}
                    label='Filter District'
                    isShowValue
                    fullwidth
                  />
                  <FormControl component='fieldset'>
                    <RadioGroup
                      aria-label='clientType'
                      name='clientType'
                      value={isUnassignedJobsTemp === true ? 'true' : 'false'}
                      onChange={event => setIsUnassignedJobsTemp(event.target.value === 'true')}
                      row
                    >
                      <FormControlLabel value='true' control={<Radio color='primary' />} label='Unassigned Job' labelPlacement='end' />
                      <FormControlLabel value='false' control={<Radio color='primary' />} label='All Job' labelPlacement='end' />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </form>
          }
        />
      )}
    </>
  );
});

export default ToolBar;
