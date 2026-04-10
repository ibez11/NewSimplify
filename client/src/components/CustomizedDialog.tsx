import React, { FC } from 'react';
import { Button, Dialog, DialogContent, DialogActions, Grid, makeStyles, Theme, Typography, DialogTitle, IconButton } from '@material-ui/core';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import DangerIcon from '@material-ui/icons/ErrorOutlined';
import CloseIcon from '@material-ui/icons/Close';
import { green } from '@material-ui/core/colors';
import { orange } from '@material-ui/core/colors';
import { red } from '@material-ui/core/colors';
import LoadingButtonIndicator from './LoadingButtonIndicator';

interface Props {
  open: boolean;
  isLoading: boolean;
  isConfirmation: boolean;
  variant?: string;
  header?: string;
  title?: string;
  message: string;
  secondMessage?: string;
  boldMessage?: string;
  children?: JSX.Element;
  primaryButtonLabel: string;
  secondaryButtonLabel: string;
  primaryActionButton(): void;
  secondaryActionButton(): void;
  handleClose(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  },
  successAvatarIcon: {
    fontSize: 80,
    color: green[500],
    marginBottom: theme.spacing(2)
  },
  warnigAvatarIcon: {
    fontSize: 80,
    color: orange[500],
    marginBottom: theme.spacing(2)
  },
  dangerAvatarIcon: {
    fontSize: 80,
    color: red[500],
    marginBottom: theme.spacing(2)
  },
  buttonAciton: {
    margin: 8
  }
}));

const CustomizedDialog: FC<Props> = props => {
  const classes = useStyles();
  const {
    isLoading,
    open,
    isConfirmation,
    variant,
    header,
    title,
    message,
    secondMessage,
    boldMessage,
    children,
    primaryButtonLabel,
    secondaryButtonLabel,
    secondaryActionButton,
    primaryActionButton,
    handleClose
  } = props;

  return (
    <Dialog open={open} scroll='body' fullWidth maxWidth='xs'>
      {!isConfirmation && (
        <DialogTitle>
          <Typography variant='h5' id='invoice-modal'>
            {header}
          </Typography>
          <IconButton size='small' className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent dividers={!isConfirmation ? true : false}>
        {isConfirmation && (
          <Grid container justify='center' alignItems='center'>
            {variant === 'success' ? (
              <SuccessIcon className={classes.successAvatarIcon} />
            ) : variant === 'warning' ? (
              <WarningIcon className={classes.warnigAvatarIcon} />
            ) : (
              <DangerIcon className={classes.dangerAvatarIcon} />
            )}
          </Grid>
        )}
        {title && (
          <Grid container justify='center' alignItems='center'>
            <Typography variant='h4' align='center' gutterBottom>
              {title}
            </Typography>
          </Grid>
        )}
        <Typography variant='h6' align='center' style={{ whiteSpace: 'pre-line' }}>
          {message}
        </Typography>
        <Typography variant='subtitle1' align='center'>
          {boldMessage}
        </Typography>
        <Typography variant='h6' align='center' color='textSecondary' style={{ whiteSpace: 'pre-line' }}>
          {secondMessage}
        </Typography>
        {children || <></>}
        <DialogActions>
          <Grid container justify={isConfirmation ? 'center' : 'flex-end'} alignItems='center'>
            {secondaryButtonLabel !== '' && (
              <Button variant='contained' onClick={secondaryActionButton} disabled={isLoading} disableElevation className={classes.buttonAciton}>
                {secondaryButtonLabel ? secondaryButtonLabel : 'Cancel'}
              </Button>
            )}
            <Button
              variant='contained'
              color='primary'
              onClick={primaryActionButton}
              disabled={isLoading}
              disableElevation
              className={classes.buttonAciton}
            >
              {primaryButtonLabel ? primaryButtonLabel : 'Ok'}
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
          </Grid>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizedDialog;
