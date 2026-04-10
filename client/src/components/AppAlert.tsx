import { FC, useContext, useState, useEffect } from 'react';
import { Collapse, IconButton, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { isThisWeek, isAfter } from 'date-fns';

import { Alert, AlertTitle } from '@material-ui/lab';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentExpiredDate } from 'selectors';

const useStyles = makeStyles((theme: Theme) => ({
  margin: {
    margin: theme.spacing(2),
    borderStyle: 'solid',
    borderWidth: 'thin'
  }
}));

const AppAlert: FC = () => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);

  const currentExpDate = getCurrentExpiredDate(currentUser);

  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const checkExpireSoon = isThisWeek(new Date(currentExpDate), { weekStartsOn: 1 });
    const checkExpired = isAfter(new Date(), new Date(currentExpDate));

    if (checkExpired) {
      setOpen(true);
      setIsExpired(true);
      setAlertMessage('Your Simplify subscription has expired, please contact sales/support to prevent sudden cessation of usage.');
    } else if (checkExpireSoon) {
      setOpen(true);
      setAlertMessage(
        'Your Simplify subscription is approaching expiry, please contact sales/support to renew if you wish to continue using Simplify.'
      );
    } else {
      setOpen(false);
      setIsExpired(false);
      setAlertMessage('');
    }
  }, [currentExpDate]);

  return (
    <Collapse in={open}>
      <Alert
        severity={isExpired ? 'error' : 'warning'}
        className={classes.margin}
        style={{ borderColor: isExpired ? 'red' : 'orange' }}
        action={
          isExpired ? (
            ''
          ) : (
            <IconButton
              aria-label='close'
              color='inherit'
              size='small'
              onClick={() => {
                setOpen(false);
              }}
            >
              <CloseIcon fontSize='inherit' />
            </IconButton>
          )
        }
      >
        <AlertTitle>Warning</AlertTitle>
        <strong>{alertMessage}</strong>
      </Alert>
    </Collapse>
  );
};

export default AppAlert;
