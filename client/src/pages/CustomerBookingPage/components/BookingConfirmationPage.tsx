import React from 'react';
import { Box, Typography, makeStyles, Paper, Theme, useMediaQuery } from '@material-ui/core';
import confirmationImage from 'images/confirmation_complete.png'; // replace with your asset path

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2)
  },
  paper: {
    maxWidth: 480,
    width: '100%',
    textAlign: 'center',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    padding: theme.spacing(4)
  },
  image: {
    width: '100%',
    marginBottom: theme.spacing(4)
  },
  message: {
    fontWeight: 600,
    marginBottom: theme.spacing(1)
  },
  subText: {
    color: theme.palette.text.secondary
  }
}));

const BookingConfirmationPage: React.FC = () => {
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box className={classes.root}>
      <Paper className={classes.paper}>
        <img src={confirmationImage} alt='Booking Complete' className={classes.image} />
        <Typography variant={isMobile ? 'h6' : 'h5'} className={classes.message}>
          Saved!
        </Typography>
        <Typography variant='body1' className={classes.subText}>
          Your schedule is saved and confirmed. For changes, please contact the admin.
        </Typography>
      </Paper>
    </Box>
  );
};

export default BookingConfirmationPage;
