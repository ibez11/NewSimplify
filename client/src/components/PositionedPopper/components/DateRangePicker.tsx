import React, { FC, Fragment, useState } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { makeStyles, withStyles } from '@material-ui/styles';
import { Button, Grid, MenuItem, TextField, Theme } from '@material-ui/core';
import { Option } from 'components/PositionedPopper';

interface Props {
  setOpenPopper: React.Dispatch<React.SetStateAction<boolean>>;
  options: Option[];
  filterBy?: string;
  setFilterBy?: React.Dispatch<React.SetStateAction<string>>;
  startDate?: Date | null;
  setStartDate?: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate?: Date | null;
  setEndDate?: React.Dispatch<React.SetStateAction<Date | null>>;
  setFieldLabel?: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  clearAndCloseButton: {
    color: '#89BED3',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#53A0BE'
    },
    padding: theme.spacing(0)
  },
  textFieldFont: {
    fontSize: '12px',
    height: 18
  },
  paddingField: {
    paddingRight: 4
  }
}));

const ClearButton = withStyles({
  label: {
    textTransform: 'capitalize',
    marginRight: 25
  }
})(Button);

const CloseButton = withStyles({
  label: {
    textTransform: 'capitalize',
    marginLeft: 25
  }
})(Button);

const DateRangePicker: FC<Props> = props => {
  const classes = useStyles(props);
  const { setOpenPopper, options } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const { setFieldLabel } = props;

  const [selectedFilterBy, setSelectedFilterBy] = useState<string>(filterBy === undefined ? '' : filterBy);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(startDate === undefined ? new Date() : startDate);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(endDate === undefined ? new Date() : endDate);
  const [disabledDate, setDisabledDate] = useState<boolean>(filterBy === '5' || filterBy === '6' || filterBy === 'termEnd' ? false : true);

  const clearValue = () => {
    setSelectedFilterBy('');
    setSelectedStartDate(new Date());
    setSelectedEndDate(new Date());
    setDisabledDate(true);
  };

  const functionChangeStartDate = (date: Date | null) => {
    setSelectedStartDate(date);
    setSelectedEndDate(date);
  };

  const handleFilterByChange = (event: any) => {
    setSelectedFilterBy(event.target.value);
    if (event.target.value === '5' || event.target.value === '6' || event.target.value === 'termStart' || event.target.value === 'termEnd') {
      setDisabledDate(false);
    } else {
      setDisabledDate(true);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    functionChangeStartDate(date);
  };

  const handleEndDateChange = (date: Date | null) => {
    setSelectedEndDate(date);
  };

  const handleClickClearButton = () => {
    clearValue();
  };

  const handleCloseCalendarPopper = () => {
    setOpenPopper(false);
  };

  const handleDoneCalendarPopper = () => {
    setFilterBy && setFilterBy(selectedFilterBy);
    setStartDate && setStartDate(selectedStartDate);
    setEndDate && setEndDate(selectedEndDate);
    setFieldLabel &&
      setFieldLabel(
        selectedFilterBy === ''
          ? 'None'
          : selectedFilterBy === '1'
          ? 'Today'
          : selectedFilterBy === '2'
          ? 'This Week'
          : selectedFilterBy === '3'
          ? 'This Month'
          : ''
      );
    handleCloseCalendarPopper();
  };

  const disablePrevDates = (startDate: Date) => {
    const startSeconds = Date.parse(startDate.toDateString());
    return (date: any) => {
      return Date.parse(date) < startSeconds;
    };
  };

  return (
    <Fragment>
      <Grid container direction='row' justify='space-between' alignItems='flex-start'>
        <ClearButton size='small' className={classes.clearAndCloseButton} onClick={handleClickClearButton} disableRipple>
          Clear
        </ClearButton>
        <CloseButton size='small' className={classes.clearAndCloseButton} onClick={handleCloseCalendarPopper} disableRipple>
          Close
        </CloseButton>
      </Grid>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <TextField
            select
            margin='dense'
            fullWidth
            id='option'
            label='Choose'
            value={selectedFilterBy}
            onChange={event => handleFilterByChange(event)}
            variant='outlined'
            autoComplete='off'
            InputProps={{
              classes: {
                input: classes.textFieldFont
              }
            }}
            InputLabelProps={{
              className: classes.textFieldFont,
              shrink: selectedFilterBy === '' ? false : true
            }}
          >
            <MenuItem key={'None'} value=''>
              <em>None</em>
            </MenuItem>
            {options.map(option => (
              <MenuItem key={option.key} value={option.key}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} className={classes.paddingField}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              clearable
              required
              fullWidth
              autoOk
              disabled={disabledDate}
              id='startDate'
              label='From'
              margin='dense'
              value={selectedStartDate}
              variant='inline'
              inputVariant='outlined'
              format='dd-MM-yyyy'
              onChange={handleStartDateChange}
              InputProps={{
                classes: {
                  input: classes.textFieldFont
                }
              }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={6}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              disableToolbar
              clearable
              required
              fullWidth
              autoOk
              disabled={disabledDate}
              id='endDate'
              label='To'
              margin='dense'
              value={selectedEndDate}
              shouldDisableDate={disablePrevDates(new Date(selectedStartDate !== null ? new Date(selectedStartDate).getTime() - 864e5 : ''))}
              minDate={selectedStartDate}
              variant='inline'
              inputVariant='outlined'
              format='dd-MM-yyyy'
              onChange={handleEndDateChange}
              InputProps={{
                classes: {
                  input: classes.textFieldFont
                }
              }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12}>
          <Button fullWidth variant='contained' disableElevation color='primary' onClick={handleDoneCalendarPopper}>
            Done
          </Button>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default DateRangePicker;
