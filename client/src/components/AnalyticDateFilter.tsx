import React, { FC, Fragment, useState } from 'react';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/styles';
import { Fade, Paper, Theme, Grid, Button, withStyles, MenuItem, TextField } from '@material-ui/core';

import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { startOfMonth, endOfMonth, getMonth, setMonth } from 'date-fns';

export interface Option {
  key: number;
  label: string;
}

interface Props {
  openPopper: boolean;
  setOpenPopper: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: HTMLElement | null;
  placement: any;
  containerWidth: number;
  fadeTransition: number;
  options: Option[];
  filterBy: number;
  setFilterBy: React.Dispatch<React.SetStateAction<number>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  isLoading?: boolean;
  setFieldLabel: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  popper: (props: Props) => ({
    width: props.containerWidth,
    zIndex: 99
  }),
  paper: {
    borderRadius: '5px',
    padding: theme.spacing(2),
    paddingTop: 0
  },
  clearButton: {
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
  filterButton: {
    padding: theme.spacing(2)
  },
  clearAndCloseButton: {
    color: '#89BED3',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#53A0BE'
    },
    padding: theme.spacing(0)
  }
}));

const ClearButton = withStyles({
  label: {
    textTransform: 'capitalize',
    margin: 16
  }
})(Button);

const CloseButton = withStyles({
  label: {
    textTransform: 'capitalize',
    margin: 16
  }
})(Button);

const AnalyticDateFilter: FC<Props> = props => {
  const classes = useStyles(props);
  const { openPopper, setOpenPopper, anchorEl, placement, options, fadeTransition } = props;

  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;

  const { setFieldLabel } = props;

  const [selectedFilterBy, setSelectedFilterBy] = useState<number>(0);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(startDate === undefined ? new Date() : startDate);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(endDate === undefined ? new Date() : endDate);
  const [disabledDate, setDisabledDate] = useState<boolean>(filterBy === 0 || filterBy === 1 ? true : false);
  const [maxDate, setMaxDate] = useState<Date>(endOfMonth(new Date()));

  const clearValue = () => {
    setFilterBy(0);
    setSelectedFilterBy(0);
    setDisabledDate(true);
    setFieldLabel('This Month');
    setSelectedStartDate(startOfMonth(new Date()));
    setSelectedEndDate(endOfMonth(new Date()));
    setMaxDate(endOfMonth(new Date()));
  };

  const handleClickClearButton = () => {
    clearValue();
  };

  const handleCloseCalendarPopper = () => {
    setOpenPopper(false);
  };

  const handleDone = (value: number) => {
    setFilterBy(value);

    if (value === 0) {
      setFieldLabel('This Month');
    } else if (value === 1) {
      setFieldLabel('Last Month');
    } else if (value === 2) {
      setFieldLabel('Custom');
    } else {
      setFieldLabel('Compare');
    }

    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
    setOpenPopper(false);
  };

  const handleFilterByChange = (event: any) => {
    setSelectedFilterBy(event.target.value);
    if (event.target.value === 0) {
      setDisabledDate(true);
      setSelectedStartDate(startOfMonth(new Date()));
      setSelectedEndDate(endOfMonth(new Date()));
      setMaxDate(endOfMonth(new Date()));
    } else if (event.target.value === 1) {
      setDisabledDate(true);
      const currentMonth = new Date();
      const lastMonth = setMonth(currentMonth, getMonth(currentMonth) - 1);

      setSelectedStartDate(startOfMonth(lastMonth));
      setSelectedEndDate(endOfMonth(lastMonth));
      setMaxDate(endOfMonth(lastMonth));
    } else if (event.target.value === 2) {
      const currentDate = selectedStartDate;

      setSelectedEndDate(endOfMonth(currentDate!));
      setMaxDate(endOfMonth(currentDate!));
      setDisabledDate(false);
    } else {
      setDisabledDate(false);
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setSelectedStartDate(date);
      setSelectedEndDate(endOfMonth(date));
      setMaxDate(endOfMonth(date));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setSelectedEndDate(date);
  };

  const renderContent = () => {
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
        <Grid container spacing={1}>
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
            >
              {options.map(option => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                fullWidth
                autoOk
                allowKeyboardControl
                disabled={disabledDate}
                margin='dense'
                id='startDate'
                label={selectedFilterBy === 3 ? 'First Month' : 'Start Date'}
                value={selectedStartDate}
                variant='inline'
                inputVariant='outlined'
                format={selectedFilterBy === 3 ? 'MMM-yyy' : 'dd-MM-yyyy'}
                views={selectedFilterBy === 3 ? ['month', 'year'] : ['date']}
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
              <DatePicker
                fullWidth
                autoOk
                allowKeyboardControl
                disabled={disabledDate}
                margin='dense'
                id='endDate'
                label={selectedFilterBy === 3 ? 'Second Month' : 'End Date'}
                value={selectedEndDate}
                minDate={selectedStartDate}
                maxDate={selectedFilterBy === 2 ? maxDate : new Date('2100-01-01')}
                variant='inline'
                inputVariant='outlined'
                format={selectedFilterBy === 3 ? 'MMM-yyy' : 'dd-MM-yyyy'}
                views={selectedFilterBy === 3 ? ['month', 'year'] : ['date']}
                onChange={handleEndDateChange}
                InputProps={{
                  classes: {
                    input: classes.textFieldFont
                  }
                }}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant='contained' onClick={handleCloseCalendarPopper}>
              Cancel
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant='contained' color='primary' onClick={() => handleDone(selectedFilterBy)}>
              Done
            </Button>
          </Grid>
        </Grid>
      </Fragment>
    );
  };

  return (
    <Popper open={openPopper} anchorEl={anchorEl} placement={placement} className={classes.popper} transition disablePortal>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={fadeTransition}>
          <Paper className={classes.paper}>{renderContent()}</Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default AnalyticDateFilter;
