import React, { FC, useState, useCallback } from 'react';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/styles';
import { Fade, Paper, Theme } from '@material-ui/core';
import NotificationList from './components/NotificationList';

import ActionSnackbar from 'components/ActionSnackbar';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

interface Props {
  openPopper: boolean;
  setOpenPopper?: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: any;
  placement: any;
  isLoadingData?: boolean;
  notifications: NotificationModel[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationModel[]>>;
  setTotalNotification: React.Dispatch<React.SetStateAction<number>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  popper: {
    marginRight: theme.spacing(1),
    width: 650
  },
  paper: {
    borderRadius: '5px'
  }
}));

const NotificationPopper: FC<Props> = props => {
  const classes = useStyles(props);
  const { openPopper, setOpenPopper, anchorEl, placement, isLoadingData, notifications, setNotifications, setTotalNotification } = props;

  // Snackbar (same API as your Invoice page)
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleCloseSnackbar = useCallback(() => setOpenSnackbar(false), []);
  const handleSnackbar = useCallback((variant: 'success' | 'error', message: string) => {
    setSnackbarVarient(variant);
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  }, []);

  return (
    <>
      <Popper open={openPopper} anchorEl={anchorEl} placement={placement} className={classes.popper} transition disablePortal>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper className={classes.paper}>
              <NotificationList
                isLoadingData={isLoadingData}
                notifications={notifications}
                setNotifications={setNotifications}
                setTotalNotification={setTotalNotification}
                setOpenPopper={setOpenPopper}
                handleSnackbar={handleSnackbar} // ✅ pass down
              />
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* ✅ Snackbar is now at the parent, so it won't disappear when dialogs open */}
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </>
  );
};

export default NotificationPopper;
