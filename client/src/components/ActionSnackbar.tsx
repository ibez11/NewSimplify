import React, { useEffect, useState } from 'react';
import { Snackbar, makeStyles, Theme, SnackbarContent, IconButton } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import clsx from 'clsx';
import CloseIcon from '@material-ui/icons/Close';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import useRouter from 'hooks/useRouter';

interface Props {
  variant?: 'success' | 'error';
  message: string;
  open: boolean;
  handleClose(): void;
  Icon: React.ComponentType<SvgIconProps>;
  isCountdown?: boolean;
  redirectPath?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: 'flex',
    alignItems: 'center'
  }
}));

const ActionSnackBar: React.FC<Props> = props => {
  const classes = useStyles();
  const { history } = useRouter();

  const { variant, message, open, handleClose, Icon, isCountdown, redirectPath } = props;
  const isSuccessVariant = variant === 'success';
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    if (!isCountdown) {
      return;
    }
    const intervalId = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [countdown, isCountdown]);

  const onClose = () => {
    if (isCountdown) {
      history.push({ pathname: `/${redirectPath}/` });
    }
    handleClose();
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
    >
      <SnackbarContent
        className={isSuccessVariant ? classes.success : classes.error}
        aria-describedby='client-snackbar'
        message={
          isCountdown ? (
            <span id='client-snackbar' className={classes.message}>
              <Icon className={clsx(classes.icon, classes.iconVariant)} />
              {message}... {countdown} seconds
            </span>
          ) : (
            <span id='client-snackbar' className={classes.message}>
              <Icon className={clsx(classes.icon, classes.iconVariant)} />
              {message}
            </span>
          )
        }
        action={[
          <IconButton key='close' aria-label='Close' color='inherit' onClick={onClose}>
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
      />
    </Snackbar>
  );
};

export default ActionSnackBar;
