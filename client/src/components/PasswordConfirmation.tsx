import React, { FC, useState, useEffect } from 'react';
import {
  Button,
  InputAdornment,
  IconButton,
  Theme,
  Grid,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import CloseIcon from '@material-ui/icons/Close';
import axios, { CancelTokenSource } from 'axios';
import { GET_USER_VERIFY_PASSWORD_URL } from 'constants/url';

interface Props {
  open: boolean;
  handleClose(): void;
  title: string;
  url: string;
  isEdit?: boolean;
  editData?: any;
  message: string;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  fetchData?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  }
}));

const PasswordConfirmation: FC<Props> = props => {
  const classes = useStyles();

  const { open, handleClose, url, isEdit, editData, title, message, handleSnackbar, fetchData } = props;

  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isShowPassword, setShowPassword] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const resetFormValues = () => {
    setPassword('');
    setPasswordError('');
    setReason('');
    setIsConfirmed(false);
  };

  const handleOnClose = () => {
    resetFormValues();
    handleClose();
  };

  const handlePasswordBlur = () => {
    setPasswordError('');
    if (!password) {
      setPasswordError(`Please input current password`);
    }
  };

  useEffect(() => {
    resetFormValues();
  }, []);

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    setLoading(true);

    if (!isConfirmed) {
      setLoading(false);
      handleSnackbar('error', 'Please tick to confirm the action before proceeding.');
      return;
    }

    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

      if (password) {
        const { data } = await axios.post(GET_USER_VERIFY_PASSWORD_URL, { password }, { cancelToken: cancelTokenSource.token });

        if (data) {
          if (isEdit) {
            await axios.put(url, { ...editData }, { cancelToken: cancelTokenSource.token });
          } else {
            await axios.delete(url, { data: { reason: reason }, cancelToken: cancelTokenSource.token });
          }

          if (fetchData) {
            fetchData();
          }

          handleSnackbar('success', `Successfully ${message}`, true);
          handleOnClose();
        }
      } else {
        setPasswordError('Please input current password');
      }
    } catch (err) {
      console.log(err);
      const error = err as any;
      const { errorCode } = error.data;

      if (errorCode === 2) {
        setPasswordError('Invalid credentials');
        handleSnackbar('error', 'Invalid credentials');
      } else if (errorCode === 24) {
        handleSnackbar('error', 'Cannot proceed because there is an in-progress job.');
      } else if (errorCode === 25) {
        handleSnackbar('error', 'Cannot proceed because there is an in-progress job.');
      } else if (errorCode === 58) {
        handleSnackbar('error', 'Cannot proceed due to an unpaid invoice.');
      } else {
        handleSnackbar('error', `Failed to ${message}`);
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} fullWidth maxWidth='xs'>
      <DialogTitle>
        <Typography variant='h5'>{title}</Typography>
        <IconButton size='small' onClick={handleOnClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <form noValidate onSubmit={handleOnSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='body1'>
                <em>Please enter your current account password</em>
              </Typography>
              <TextField
                fullWidth
                margin='dense'
                variant='outlined'
                autoComplete='off'
                id='password'
                label='Current Password'
                type={isShowPassword ? 'text' : 'password'}
                error={passwordError !== ''}
                helperText={passwordError}
                onChange={event => setPassword(event.target.value)}
                onBlur={handlePasswordBlur}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' aria-label='toggle password visibility' onClick={() => setShowPassword(!isShowPassword)}>
                        {isShowPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1'>
                <em>Please enter your reason</em>
              </Typography>
              <TextField
                margin='dense'
                fullWidth
                id='deleteReasoon'
                variant='outlined'
                label='Reason'
                multiline
                rows={5}
                value={reason}
                onChange={event => setReason(event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox checked={isConfirmed} onChange={event => setIsConfirmed(event.target.checked)} color='primary' />}
                label='I confirm that I want to proceed with this action.'
              />
            </Grid>
          </Grid>
          <DialogActions style={{ marginTop: 16 }}>
            <Button variant='contained' disableElevation onClick={handleOnClose} disabled={isLoading}>
              Cancel
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
            <Button type='submit' variant='contained' color='primary' disableElevation disabled={isLoading}>
              Confirm
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordConfirmation;
