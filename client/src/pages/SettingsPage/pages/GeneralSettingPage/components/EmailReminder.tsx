import React, { useState, useEffect } from 'react';
import {
  withStyles,
  createStyles,
  Button,
  Typography,
  Grid,
  makeStyles,
  Theme,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton
} from '@material-ui/core';

import { grey } from '@material-ui/core/colors';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import EditIcon from '@material-ui/icons/Edit';
import axios, { CancelTokenSource } from 'axios';
import { GET_SETTING_UPDATE_BASE_URL } from 'constants/url';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import CustomizedDialog from 'components/CustomizedDialog';
import NumberFormatCustom from 'components/NumberFormatCustom';

interface Props {
  isLoading: boolean;
  reminderIdEmail: number;
  remiderDayEmail: number;
  reminderIsActiveEmail: boolean;
  setReminderDayEmail: React.Dispatch<React.SetStateAction<number>>;
  setReminderIsActiveEmail: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenSnackbar: (type: 'success' | 'error', message: string) => void;
}

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface IProps extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1)
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#53A0BE',
          opacity: 1,
          border: 'none'
        }
      },
      '&$focusVisible $thumb': {
        color: '#53A0BE',
        border: '6px solid #fff'
      }
    },
    thumb: {
      width: 24,
      height: 24
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border'])
    },
    checked: {},
    focusVisible: {}
  })
)(({ classes, ...props }: IProps) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  );
});

const useStyles = makeStyles((theme: Theme) => ({
  paddingRight: {
    paddingRight: theme.spacing(1)
  },
  marginGrid: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  secondText: {
    color: grey[500],
    display: 'flex'
  }
}));

const EmailConfirmation: React.FC<Props> = props => {
  const classes = useStyles();

  const {
    isLoading,
    reminderIdEmail,
    remiderDayEmail,
    reminderIsActiveEmail,
    setReminderDayEmail,
    setReminderIsActiveEmail,
    handleOpenSnackbar
  } = props;

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [value, setValue] = useState<number>(0);
  const [status, setStatus] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const { reminderIsActiveEmail, remiderDayEmail } = props;

    setValue(remiderDayEmail);
    setStatus(reminderIsActiveEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleCancelWA = () => {
    setIsEdit(!isEdit);
    setValue(remiderDayEmail);
    setStatus(reminderIsActiveEmail);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      let cancelTokenSource: CancelTokenSource;
      cancelTokenSource = axios.CancelToken.source();

      const { data } = await axios.put(
        `${GET_SETTING_UPDATE_BASE_URL(reminderIdEmail)}`,
        { value, isActive: isEdit ? status : !status },
        { cancelToken: cancelTokenSource.token }
      );

      setReminderDayEmail(value);
      setReminderIsActiveEmail(data.isActive);
      setStatus(data.isActive);
      setOpenConfirm(false);
      handleOpenSnackbar('success', 'Successfully updated setting data.');
    } catch (err) {
      console.log(err);
      handleOpenSnackbar('error', 'Error update setting data.');
    }
    setIsProcessing(false);
  };

  const handleChangeStatusWhatsAppReminder = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked === false) {
      setOpenConfirm(true);
    } else {
      setStatus(!status);
      handleSubmit();
    }
  };

  return (
    <>
      <Grid item xs={4}>
        <Typography variant='h5'>Email Appointment Reminder</Typography>
        <Typography variant='body1' className={classes.secondText}>
          Settings for automatic email to your clients before upcoming jobs
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <FormControlLabel
          control={<IOSSwitch checked={status} onChange={handleChangeStatusWhatsAppReminder} name='status' />}
          disabled={isProcessing}
          labelPlacement='end'
          label={status ? 'Active' : 'Inactive'}
        />
      </Grid>
      <Grid item xs={6}>
        <Grid container spacing={1}>
          <Grid item xs={7}>
            <Typography variant='h5'>Schedule Appointment Reminder</Typography>
            <Typography variant='body1' className={classes.secondText}>
              Set the number of days in advance to send appointment reminder messages via email
            </Typography>
          </Grid>
          <Grid item xs={5}>
            <Grid container spacing={1} alignItems='center'>
              <Grid item xs={isEdit ? 12 : 9}>
                <TextField
                  fullWidth
                  id='value'
                  label='set days'
                  margin='dense'
                  disabled={!isEdit}
                  value={value}
                  onChange={event => setValue(Number(event.target.value))}
                  onBlur={event => {
                    if (Number(event.target.value) < 1) {
                      setValue(1);
                    } else if (Number(event.target.value) > 99) {
                      setValue(99);
                    } else {
                      setValue(Number(event.target.value));
                    }
                  }}
                  variant='outlined'
                  autoComplete='off'
                  InputProps={{
                    inputComponent: NumberFormatCustom as any,
                    endAdornment: <InputAdornment position='end'>Day(s)</InputAdornment>,
                    inputProps: { min: 1, max: 99 }
                  }}
                />
              </Grid>
              {isEdit ? (
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs={6} className={classes.paddingRight}>
                      <Button fullWidth variant='contained' disableElevation onClick={handleCancelWA}>
                        Cancel
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant='contained'
                        disableElevation
                        color='primary'
                        onClick={() => {
                          handleSubmit();
                          setIsEdit(!isEdit);
                        }}
                      >
                        Save
                        <LoadingButtonIndicator isLoading={isProcessing} />
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              ) : (
                <Grid item xs={1}>
                  <Tooltip title={'Edit'} placement='top'>
                    <IconButton size='small' disabled={!status} onClick={() => setIsEdit(!isEdit)}>
                      <EditIcon color={!status ? 'disabled' : 'primary'} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {openConfirm && (
        <CustomizedDialog
          isLoading={isProcessing}
          open={openConfirm}
          isConfirmation
          variant='warning'
          title={'Are you sure want to Inactive Email Appointment Confirmation?'}
          message=''
          secondMessage='This will affect ALL Clients, if you want to deactivate Email reminder on specific Client, you can go to Client Profile'
          primaryButtonLabel='Ok'
          secondaryButtonLabel='Cancel'
          primaryActionButton={() => {
            handleSubmit();
            setOpenConfirm(false);
          }}
          secondaryActionButton={() => setOpenConfirm(false)}
          handleClose={() => setOpenConfirm(false)}
        />
      )}
    </>
  );
};

export default EmailConfirmation;
