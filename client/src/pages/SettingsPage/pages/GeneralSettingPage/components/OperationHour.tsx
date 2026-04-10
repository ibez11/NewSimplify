import React, { useState } from 'react';
import { Button, Typography, Grid, makeStyles, Theme, Tooltip, IconButton } from '@material-ui/core';
import ClockIcon from '@material-ui/icons/AccessTimeOutlined';
import EditIcon from '@material-ui/icons/Edit';

import { grey } from '@material-ui/core/colors';
import { format, isValid } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';

import axios, { CancelTokenSource } from 'axios';
import { GET_SETTING_UPDATE_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';

interface Props {
  operatingId: number;
  startOperatingHour: string;
  setStartOperatingHour: React.Dispatch<React.SetStateAction<string>>;
  endOperatingHour: string;
  setEndOperatingHour: React.Dispatch<React.SetStateAction<string>>;
  handleOpenSnackbar: (type: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  paddingRight: {
    paddingRight: theme.spacing(1)
  },
  marginGrid: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  paddingTextField: {
    paddingTop: 0,
    paddingBottom: 0
  },
  secondText: {
    color: grey[500]
  }
}));

const OperationHour: React.FC<Props> = props => {
  const classes = useStyles();

  const { operatingId, startOperatingHour, setStartOperatingHour, endOperatingHour, setEndOperatingHour, handleOpenSnackbar } = props;

  const time1 = startOperatingHour ? `${format(new Date(), 'yyyy-MM-dd')} ${startOperatingHour}` : `${format(new Date(), 'yyyy-MM-dd')} 00:00:00`;
  const time2 = endOperatingHour ? `${format(new Date(), 'yyyy-MM-dd')} ${endOperatingHour}` : `${format(new Date(), 'yyyy-MM-dd')} 00:00:00`;

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const handleStartTimeChange = (date: Date | null) => {
    if (isValid(date)) {
      const startTime = format(date ? date : new Date(), 'HH:mm:00');
      setStartOperatingHour(startTime);
    }
  };

  const handleEndTimeChange = (date: Date | null) => {
    if (isValid(date)) {
      const endTime = format(date ? date : new Date(), 'HH:mm:00');
      setEndOperatingHour(endTime);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let cancelTokenSource: CancelTokenSource;
      cancelTokenSource = axios.CancelToken.source();

      const value = startOperatingHour.concat(',', endOperatingHour);
      await axios.put(`${GET_SETTING_UPDATE_BASE_URL(operatingId)}`, { value }, { cancelToken: cancelTokenSource.token });

      handleOpenSnackbar('success', 'Successfully updated setting data.');
      setIsEdit(!isEdit);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
      handleOpenSnackbar('error', 'Error update setting data.');
    }
  };

  return (
    <Grid container spacing={2} className={classes.marginGrid}>
      <Grid item xs={6}>
        <Typography variant='h5'>Operation Hours</Typography>
        <Typography variant='body1' className={classes.secondText}>
          Office operation hours daily
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Grid container spacing={1} alignItems='center'>
          <Grid item xs={5}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardTimePicker
                required
                fullWidth
                margin='dense'
                id='startTime'
                label='Start Time'
                disabled={!isEdit}
                value={new Date(time1)}
                variant='dialog'
                inputVariant='outlined'
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
          <Grid item xs={5}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardTimePicker
                required
                fullWidth
                margin='dense'
                id='endTime'
                label='End Time'
                disabled={!isEdit}
                value={new Date(time2)}
                variant='dialog'
                inputVariant='outlined'
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
          {isEdit ? (
            <Grid item xs={10}>
              <Grid container spacing={1}>
                <Grid item xs={6} className={classes.paddingRight}>
                  <Button fullWidth variant='contained' disableElevation onClick={() => setIsEdit(!isEdit)}>
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button fullWidth variant='contained' disableElevation color='primary' onClick={handleSubmit}>
                    Save
                    <LoadingButtonIndicator isLoading={isLoading} />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid item xs={1}>
              <Tooltip title={'Edit'} placement='top'>
                <IconButton size='small' onClick={() => setIsEdit(!isEdit)}>
                  <EditIcon color='primary' />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OperationHour;
