import { FC, Fragment, useState, useEffect } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import { Button, Divider, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import TimePickerIcon from '@material-ui/icons/WatchLaterOutlined';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';
import ActionSnackbar from 'components/ActionSnackbar';

const useStyles = makeStyles((theme: Theme) => ({
  textFieldFont: {
    fontSize: '13px',
    height: 18
  },
  innerDisplay: {
    display: 'flex'
  },
  wrapper: {
    position: 'relative'
  },
  dividerStyle: {
    marginTop: theme.spacing(1.5)
  }
}));

const BusinessDetails: FC = () => {
  const classes = useStyles();

  const [startTime, setStartTime] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<Date | null>(new Date());

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const fetchSettings = async () => {
      try {
        // const url = `${SETTING_BASE_URL}/${SettingCodes.OPERATING_TIME}`;
        // const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        // const duplicateClient = data.settings.find((setting: any) => setting.code === SettingCodes.DUPLICATECLIENT);
        // setSettingDuplicateClient(duplicateClient);
        // setDuplicateClient(duplicateClient.value);
      } catch (err) {
        handleOpenSnackbar('error', 'Error fetch setting data.');
      }
    };

    fetchSettings();

    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  const handleOpenSnackbar = (type: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(type);
    setSnackbarMessage(message);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleStartTimeChange = (time: Date | null) => {
    setStartTime(time);
  };

  const handleEndTimeChange = (time: Date | null) => {
    setEndTime(time);
  };

  const handleSubmit = async () => {
    try {
      // const { data } = await axios.put(
      //   `${GET_SETTING_UPDATE_BASE_URL(settingDuplicateClient!.id)}`,
      //   { cancelToken: cancelTokenSource.token }
      // );

      // setSettingDuplicateClient(data);
      handleOpenSnackbar('success', 'Successfully updated data.');
    } catch (err) {
      console.log(err);
      handleOpenSnackbar('error', 'Error update setting data.');
    }
  };

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} container alignItems='center'>
          <Grid container item xs={2} justify='flex-end'>
            <Typography variant='body1'>Operating Hours :</Typography>
          </Grid>
          <Grid container item xs={3} justify='center'>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardTimePicker
                margin='normal'
                id='startTime'
                label='Start Time'
                ampm={false}
                value={startTime}
                onChange={handleStartTimeChange}
                KeyboardButtonProps={{
                  'aria-label': 'change time'
                }}
                InputProps={{
                  classes: {
                    input: classes.textFieldFont
                  }
                }}
                keyboardIcon={<TimePickerIcon />}
              />
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid container item xs={3} justify='center'>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardTimePicker
                margin='normal'
                id='endTime'
                label='End Time'
                ampm={false}
                value={endTime}
                onChange={handleEndTimeChange}
                KeyboardButtonProps={{
                  'aria-label': 'change time'
                }}
                InputProps={{
                  classes: {
                    input: classes.textFieldFont
                  }
                }}
                keyboardIcon={<TimePickerIcon />}
              />
            </MuiPickersUtilsProvider>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Divider className={classes.dividerStyle} />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction='row' justify='flex-end' alignItems='flex-end'>
            <Button variant='contained' color='secondary' onClick={handleSubmit}>
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </Fragment>
  );
};

export default BusinessDetails;
