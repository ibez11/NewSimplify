import React, { FC } from 'react';
import { Button, Dialog, DialogContent, DialogActions, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import SuccessIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import DangerIcon from '@material-ui/icons/ErrorOutlined';
import { green } from '@material-ui/core/colors';
import { orange } from '@material-ui/core/colors';
import { red } from '@material-ui/core/colors';

interface Props {
  variant: string;
  message: string;
  secondMessage?: string;
  boldMessage?: string;
  title?: string;
  okLabel?: string;
  cancelLabel?: string;
  open: boolean;
  handleClose(): void;
  onConfirm: React.MouseEventHandler<HTMLButtonElement>;
  isLoading?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
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
  cancelButton: {
    marginRight: theme.spacing(2),
    width: 100
  },
  okButton: {
    width: 100
  },
  dialogActions: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1)
  },
  dialogContent: {
    minWidth: '25vw'
  }
}));

export const StandardConfirmationDialog: FC<Props> = props => {
  const classes = useStyles();
  const { variant, message, open, handleClose, onConfirm, title, okLabel, cancelLabel, secondMessage, boldMessage, isLoading } = props;

  return (
    <Dialog open={open}>
      <DialogContent className={classes.dialogContent}>
        <Grid container justify='center' alignItems='center'>
          {variant === 'success' ? (
            <SuccessIcon className={classes.successAvatarIcon} />
          ) : variant === 'warning' ? (
            <WarningIcon className={classes.warnigAvatarIcon} />
          ) : (
            <DangerIcon className={classes.dangerAvatarIcon} />
          )}
        </Grid>
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
        <Typography variant='h6' align='center'>
          {secondMessage}
        </Typography>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Grid container justify='center' alignItems='center'>
          {cancelLabel !== '' && (
            <Button variant='contained' className={classes.cancelButton} onClick={handleClose} disabled={isLoading} disableElevation>
              {cancelLabel ? cancelLabel : 'Cancel'}
            </Button>
          )}
          <Button variant='contained' color='primary' className={classes.okButton} onClick={onConfirm} disabled={isLoading} disableElevation>
            {okLabel ? okLabel : 'Ok'}
          </Button>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
