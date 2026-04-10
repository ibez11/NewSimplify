import React, { FC, useState, useEffect } from 'react';
import {
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  Grid,
  TextField,
  MenuItem,
  Fab,
  Theme,
  Typography
} from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import InfoIcon from '@material-ui/icons/Info';
import { format, isValid, getDaysInMonth, setMonth, lastDayOfMonth } from 'date-fns';
import { makeStyles } from '@material-ui/styles';
import { disablePrevDates } from 'utils';
import { RepeatType } from 'constants/enum';

interface Props {
  schedule: ScheduleModel;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleModel>>;
  dateFormat: string;
  setDateFormat: React.Dispatch<React.SetStateAction<string>>;
  termStart: Date;
  termEnd: Date;
}

const useStyles = makeStyles((theme: Theme) => ({
  controlDiv: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  termContractInfo: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.secondary.light
  },
  cancelButton: {
    marginRight: theme.spacing(2),
    width: 100
  },
  addButton: {
    color: '#FFFFFF',
    width: 100
  },
  topField: {
    marginTop: 0
  },
  fabButton: {
    boxShadow: 'none',
    marginLeft: 5,
    marginRight: 5
  },
  justifyClass: {
    justifyContent: 'space-around',
    paddingLeft: theme.spacing(1),
    marginTop: theme.spacing(2)
  },
  paddingRight: {
    paddingRight: theme.spacing(1)
  },
  dateFieldFont: {
    fontSize: 12,
    marginLeft: -12
  },
  gridMargin: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  iconSize: {
    fontSize: 30,
    position: 'absolute'
  },
  contentGrid: {
    padding: theme.spacing(1)
  }
}));

const RecurrenceForm: FC<Props> = props => {
  const classes = useStyles();
  const { schedule, setSchedule, setDateFormat, termStart, termEnd } = props;

  const {
    repeatEvery,
    repeatType,
    repeatOnDay,
    repeatOnDate,
    repeatOnWeek,
    repeatOnMonth,
    repeatEndType,
    repeatEndAfter,
    repeatEndOnDate
  } = schedule;

  const repeats = [
    { name: 'Days', value: 'Daily' },
    { name: 'Weeks', value: 'Weekly' },
    { name: 'Months', value: 'Monthly' },
    { name: 'Years', value: 'Yearly' }
  ];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeks = ['1st', '2nd', '3rd', '4th'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentRepeatType = repeatType === 'Yearly' ? 'Years' : repeatType === 'Weekly' ? 'Weeks' : repeatType === 'Monthly' ? 'Months' : 'Days';

  const [repeatOnType, setRepeatOnType] = useState<string>('byDate');

  const [isSunday, setIsSunday] = useState<boolean>(false);
  const [isMonday, setIsMonday] = useState<boolean>(false);
  const [isTuesday, setIsTuesday] = useState<boolean>(false);
  const [isWednesday, setIsWednesday] = useState<boolean>(false);
  const [isThursday, setIsThursday] = useState<boolean>(false);
  const [isFriday, setIsFriday] = useState<boolean>(false);
  const [isSaturday, setIsSaturday] = useState<boolean>(false);
  const [repeatOnDayLabel, setRepeatOnDayLabel] = useState<string>();

  useEffect(() => {
    if (schedule.repeatType === 'Weekly' && schedule.repeatOnDay) {
      const currentRepeatOnDayLabel: string[] = [];
      const currentDays = schedule.repeatOnDay.split(',');
      currentDays.map((day: any) => {
        currentRepeatOnDayLabel.push(days[day - 1]);

        if (day === '1') {
          setIsSunday(true);
        } else if (day === '2') {
          setIsMonday(true);
        } else if (day === '3') {
          setIsTuesday(true);
        } else if (day === '4') {
          setIsWednesday(true);
        } else if (day === '5') {
          setIsThursday(true);
        } else if (day === '6') {
          setIsFriday(true);
        } else if (day === '7') {
          setIsSaturday(true);
        }

        return day;
      });

      setRepeatOnDayLabel(currentRepeatOnDayLabel.join(','));
    }

    if (schedule.scheduleLabel !== '-') {
      const currentOnType = schedule.repeatOnDate < 1 ? 'byDay' : 'byDate';
      setRepeatOnType(currentOnType);
      if (currentOnType === 'byDay') {
        // setRepeatOnDate(0);

        if (schedule.repeatType === 'Monthly' || schedule.repeatType === 'Yearly') {
          setRepeatOnDayLabel(days[Number(schedule.repeatOnDay) - 1]);
          // setRepeatOnWeekLabel(weeks[schedule.repeatOnWeek - 1]);
        }
      }
    }
    // eslint-disable-next-line
  }, []);

  const handleRepeatEveryNumberChange = (value: number) => {
    setSchedule({ ...schedule, repeatEvery: value });
  };

  const handleRepeatEveryChange = (value: string) => {
    setDateFormat(value);
    setSchedule({ ...schedule, repeatType: value });
  };

  const handleRepeatOnTypeChange = (event: any) => {
    const value = event.target.value;
    setRepeatOnType(value);

    if (value === 'byDate') {
      setRepeatOnDayLabel('');
      setSchedule({ ...schedule, repeatOnDate: 1, repeatOnWeek: 0 });
    } else {
      setRepeatOnDayLabel(` ${days[0]}`);
      setSchedule({ ...schedule, repeatOnDate: 0, repeatOnWeek: 1 });
    }
  };

  const handleEndTypeChange = (event: any) => {
    if (event.target.value === 'DATE') {
      setSchedule({ ...schedule, repeatEndType: event.target.value, repeatEndAfter: 1 });
    } else {
      setSchedule({ ...schedule, repeatEndType: event.target.value, repeatEndOnDate: termStart });
    }
  };

  const handleServiceEndDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      if (currentRepeatType === 'Months') {
        setSchedule({ ...schedule, repeatEndOnDate: lastDayOfMonth(date) });
      } else {
        setSchedule({ ...schedule, repeatEndOnDate: date });
      }
    }
  };

  const handleDayButton = (day: string) => {
    const dayNumber = days.findIndex(d => d === day) + 1;
    let currentRepeatOnDay: string[] = [];
    let currentRepeatOnDayLabel: string[] = [];
    if (repeatOnDay !== '') {
      currentRepeatOnDay = repeatOnDay.split(',');
      currentRepeatOnDayLabel = repeatOnDayLabel ? repeatOnDayLabel!.split(',') : [];
    }

    const indexDay = currentRepeatOnDay.indexOf(`${dayNumber}`);
    const indexLabel = currentRepeatOnDayLabel.indexOf(day);
    if (indexDay >= 0 && indexLabel >= 0) {
      currentRepeatOnDay.splice(indexDay, 1);
      currentRepeatOnDayLabel.splice(indexLabel, 1);
    } else {
      currentRepeatOnDay.push(`${dayNumber}`);
      currentRepeatOnDayLabel.push(day);
    }

    if (day === 'Sunday') {
      setIsSunday(!isSunday);
    } else if (day === 'Monday') {
      setIsMonday(!isMonday);
    } else if (day === 'Tuesday') {
      setIsTuesday(!isTuesday);
    } else if (day === 'Wednesday') {
      setIsWednesday(!isWednesday);
    } else if (day === 'Thursday') {
      setIsThursday(!isThursday);
    } else if (day === 'Friday') {
      setIsFriday(!isFriday);
    } else if (day === 'Saturday') {
      setIsSaturday(!isSaturday);
    }

    setSchedule({ ...schedule, repeatOnDay: currentRepeatOnDay.join(',') });
    // setRepeatOnDay(currentRepeatOnDay.join(','));
    setRepeatOnDayLabel(currentRepeatOnDayLabel.join(','));
  };

  const handleChangeRepeatOnDay = (value: any) => {
    setSchedule({ ...schedule, repeatOnDay: value });
    setRepeatOnDayLabel(` ${days[Number(value) - 1]}`);
  };

  const handleRepeatOnDateChange = (date: number) => {
    setSchedule({ ...schedule, repeatOnDate: date });
  };

  const handleChangeRepeatOnWeek = (value: any) => {
    // setRepeatOnWeekLabel(weeks[Number(value) - 1]);
    setSchedule({ ...schedule, repeatOnWeek: value });
  };

  const handleRepeatOnMonthChange = (month: number) => {
    setSchedule({ ...schedule, repeatOnMonth: month });
  };

  // const validation = () => {
  //   let valid = true;

  //   if (!repeatEvery || repeatEvery < 1) {
  //     setRepeatEveryError('Please enter repeat every');
  //     valid = false;
  //     return valid;
  //   }

  //   if (!currentRepeatType) {
  //     setEveryError('Please enter repeat type');
  //     valid = false;
  //     return valid;
  //   }

  //   if (repeatEndType === 'AFTER') {
  //     if (!repeatEndAfter || repeatEndAfter < 1) {
  //       valid = false;
  //       setRepeatEndAfterError('Please enter repeat end after number');
  //     }
  //   } else {
  //     if (!repeatEndOnDate) {
  //       valid = false;
  //       setRepeatEndOnDateError('Please enter date of last service');
  //     }
  //   }

  //   if (currentRepeatType === 'Days') {
  //     // note: done at above
  //   } else if (currentRepeatType === 'Weeks') {
  //     if (!repeatOnDayLabel) {
  //       valid = false;
  //       // handleOpenSnackbar('Please select repeat on day', 'error');
  //     }
  //   } else if (currentRepeatType === 'Months') {
  //     if (repeatOnType === 'byDate') {
  //       if (!repeatOnDate) {
  //         valid = false;
  //         setRepeatOnDateError('Please enter repeat on date');
  //       }
  //     } else {
  //       if (!repeatOnDay || Number(repeatOnDay) < 1) {
  //         valid = false;
  //         setRepeatOnDayError('Please enter repeat on day');
  //       }

  //       if (!repeatOnWeekLabel) {
  //         valid = false;
  //         setRepeatOnWeekError('Please enter repeat on week');
  //       }
  //     }
  //   } else if (currentRepeatType === 'Years') {
  //     if (!repeatOnMonth) {
  //       valid = false;
  //       setRepeatOnMonthError('Please enter repeat on month');
  //     }

  //     if (repeatOnType === 'byDate') {
  //       if (!repeatOnDate) {
  //         valid = false;
  //         setRepeatOnDateError('Please enter repeat on date');
  //       }
  //     } else {
  //       if (!repeatOnDay || Number(repeatOnDay) < 1) {
  //         valid = false;
  //         setRepeatOnDayError('Please enter repeat on day');
  //       }

  //       if (!repeatOnWeekLabel) {
  //         valid = false;
  //         setRepeatOnWeekError('Please enter repeat on week');
  //       }
  //     }
  //   }

  //   return valid;
  // };

  const renderWeekly = () => {
    return (
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='subtitle1'>Repeat On</Typography>
          </Grid>
          <Grid container item xs={12} justify='center'>
            <Fab size='small' color={isSunday ? 'primary' : 'default'} className={classes.fabButton} onClick={() => handleDayButton('Sunday')}>
              S
            </Fab>
            <Fab size='small' color={isMonday ? 'primary' : 'default'} className={classes.fabButton} onClick={() => handleDayButton('Monday')}>
              M
            </Fab>
            <Fab size='small' color={isTuesday ? 'primary' : 'default'} className={classes.fabButton} onClick={() => handleDayButton('Tuesday')}>
              T
            </Fab>
            <Fab size='small' color={isWednesday ? 'primary' : 'default'} className={classes.fabButton} onClick={() => handleDayButton('Wednesday')}>
              W
            </Fab>
            <Fab size='small' color={isThursday ? 'primary' : 'default'} className={classes.fabButton} onClick={() => handleDayButton('Thursday')}>
              T
            </Fab>
            <Fab size='small' color={isFriday ? 'primary' : 'default'} className={classes.fabButton} onClick={() => handleDayButton('Friday')}>
              F
            </Fab>
            <Fab size='small' color={isSaturday ? 'primary' : 'default'} className={classes.fabButton} onClick={() => handleDayButton('Saturday')}>
              S
            </Fab>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderRepeatOn = () => {
    let dates = [];
    let numberOfDaysInMonth = 0;
    if (repeatType !== 'Years') {
      numberOfDaysInMonth = getDaysInMonth(new Date(termStart));
    } else {
      const newFirstDateService = setMonth(new Date(termStart), repeatOnMonth - 1);
      numberOfDaysInMonth = getDaysInMonth(new Date(newFirstDateService));
    }

    for (let i = 1; i <= numberOfDaysInMonth; i++) {
      if (i === 1 || i === 21 || i === 31) {
        dates.push(`${i}st`);
      } else if (i === 2 || i === 22) {
        dates.push(`${i}nd`);
      } else if (i === 3 || i === 23) {
        dates.push(`${i}rd`);
      } else {
        dates.push(`${i}th`);
      }
    }
    return (
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <FormControl component='fieldset'>
              <RadioGroup aria-label='repeaton' name='repeaton' value={repeatOnType} onChange={handleRepeatOnTypeChange}>
                <FormControlLabel value='byDate' control={<Radio color='primary' />} label='By Date' />
                <FormControlLabel value='byDay' control={<Radio color='primary' />} label='By Day' />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  margin='dense'
                  id='repeat'
                  label='Date'
                  disabled={repeatOnType === 'byDate' ? false : true}
                  value={repeatOnDate}
                  onChange={event => handleRepeatOnDateChange(Number(event.target.value))}
                  variant='outlined'
                  autoComplete='off'
                  className={classes.topField}
                >
                  {dates.map((value, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  margin='dense'
                  id='repeat'
                  label='Week'
                  disabled={repeatOnType === 'byDay' ? false : true}
                  value={repeatOnWeek}
                  onChange={event => handleChangeRepeatOnWeek(Number(event.target.value))}
                  variant='outlined'
                  autoComplete='off'
                  className={classes.paddingRight}
                >
                  {weeks.map((value, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  margin='dense'
                  id='repeat'
                  label='Day'
                  disabled={repeatOnType === 'byDay' ? false : true}
                  value={repeatOnDay}
                  onChange={event => handleChangeRepeatOnDay(event.target.value)}
                  variant='outlined'
                  autoComplete='off'
                >
                  {days.map((value, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderMonthly = () => {
    return (
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='subtitle1'>Repeat On</Typography>
          </Grid>
          {renderRepeatOn()}
        </Grid>
      </Grid>
    );
  };

  const renderYearly = () => {
    return (
      <Grid item xs={12}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant='subtitle1'>Repeat On</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              margin='dense'
              id='repeat'
              label='Month'
              value={repeatOnMonth}
              onChange={event => handleRepeatOnMonthChange(Number(event.target.value))}
              variant='outlined'
              autoComplete='off'
            >
              {months.map((value, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {renderRepeatOn()}
        </Grid>
      </Grid>
    );
  };

  return (
    <>
      <Grid container spacing={1} className={classes.termContractInfo}>
        <Grid container className={classes.gridMargin}>
          <Grid container item xs={2} justify='center' alignItems='center'>
            <InfoIcon color='secondary' className={classes.iconSize} />
          </Grid>
          <Grid item xs={10}>
            <Typography variant='subtitle1'>Contract Terms</Typography>
            <Typography variant='body1'>
              {format(new Date(termStart), 'dd MMM yyyy')} - {format(new Date(termEnd), 'dd MMM yyyy')}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={1} className={classes.contentGrid}>
        <Grid item xs={12}>
          <Typography variant='subtitle1'>Repeat Every</Typography>
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            margin='dense'
            id='endsafter'
            value={repeatEvery}
            onChange={event => handleRepeatEveryNumberChange(Number(event.target.value))}
            onBlur={event => {
              if (Number(event.target.value) < 1) {
                setSchedule({ ...schedule, repeatEvery: 1 });
              }
            }}
            variant='outlined'
            autoComplete='off'
            type='number'
            InputProps={{
              inputProps: { min: 1 }
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            select
            fullWidth
            margin='dense'
            id='repeat'
            value={repeatType}
            onChange={event => handleRepeatEveryChange(event.target.value)}
            variant='outlined'
            autoComplete='off'
          >
            {repeats.map((value, index) => (
              <MenuItem key={index} value={value.value}>
                {value.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {repeatType === RepeatType.WEEKLY
          ? renderWeekly()
          : repeatType === RepeatType.MONTHLY
          ? renderMonthly()
          : repeatType === RepeatType.YEARLY
          ? renderYearly()
          : ''}
        <Grid item xs={12}>
          <Typography variant='subtitle1'>Ends</Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <FormControl component='fieldset'>
                <RadioGroup aria-label='ends' name='ends' value={repeatEndType} onChange={handleEndTypeChange}>
                  <FormControlLabel value='AFTER' control={<Radio color='primary' />} label='After' />
                  <FormControlLabel value='DATE' control={<Radio color='primary' />} label='On Date' />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id='endsafter'
                    label='Ends After'
                    margin='dense'
                    disabled={repeatEndType === 'AFTER' ? false : true}
                    className={classes.topField}
                    value={repeatEndAfter}
                    onChange={event => setSchedule({ ...schedule, repeatEndAfter: Number(event.target.value) })}
                    onBlur={event => {
                      if (Number(event.target.value) === 0) {
                        setSchedule({ ...schedule, repeatEndAfter: 1 });
                      }
                    }}
                    variant='outlined'
                    autoComplete='off'
                    type='number'
                    InputProps={{
                      endAdornment: <InputAdornment position='end'>Time(s)</InputAdornment>,
                      inputProps: { min: 1 }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      clearable
                      required
                      fullWidth
                      id='lastdateservice'
                      label='Date of last service'
                      margin='dense'
                      disabled={repeatEndType === 'DATE' ? false : true}
                      value={repeatEndOnDate}
                      shouldDisableDate={disablePrevDates(termStart)}
                      minDate={termStart}
                      maxDate={termEnd}
                      variant='dialog'
                      inputVariant='outlined'
                      format={repeatType === 'Months' ? 'MM/yyyy' : repeatType === 'Years' ? 'yyyy' : 'dd-MM-yyyy'}
                      views={repeatType === 'Months' ? ['year', 'month'] : repeatType === 'Years' ? ['year'] : ['year', 'month', 'date']}
                      openTo={repeatType === 'Months' ? 'month' : repeatType === 'Years' ? 'year' : 'date'}
                      onChange={handleServiceEndDateChange}
                      KeyboardButtonProps={{
                        'aria-label': 'change date'
                      }}
                      InputAdornmentProps={{ position: 'start' }}
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default RecurrenceForm;
