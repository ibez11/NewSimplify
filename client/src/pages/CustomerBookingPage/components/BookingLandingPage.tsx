import React, { useState } from 'react';
import { Typography, TextField, Button, makeStyles, Paper, Theme, Grid } from '@material-ui/core';
import logo from 'images/simplify_logo2C.png'; // adjust path if needed
import illustration from 'images/illustration_calendar.png'; // import your custom image

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2)
  },
  paper: {
    maxWidth: 460,
    width: '100%',
    textAlign: 'center',
    padding: theme.spacing(4, 3),
    boxShadow: 'none',
    backgroundColor: 'transparent'
  },
  logo: {
    height: 75
  },
  image: {
    maxWidth: '100%',
    height: 200,
    marginBottom: theme.spacing(4)
  },
  inputContainer: {
    marginTop: theme.spacing(2)
  },
  textField: {
    marginBottom: theme.spacing(2)
  },
  bookButton: {
    textTransform: 'none',
    padding: theme.spacing(1.5),
    fontWeight: 600,
    borderRadius: 8
  }
}));

const BookingLandingPage: React.FC<{ bookingSetting: any; onSubmitQuotation: (code: string) => void }> = ({ bookingSetting, onSubmitQuotation }) => {
  const classes = useStyles();
  const [quotation, setQuotation] = useState('');

  const handleSubmit = () => {
    if (quotation) {
      onSubmitQuotation(quotation.trim());
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item xs={12} container justify='center'>
            <img src={bookingSetting.LogoUrl ? bookingSetting.LogoUrl : logo} alt='Simplify Logo' className={classes.logo} />
          </Grid>
          <Grid item xs={12} container justify='center'>
            <img src={illustration} alt='Calendar Illustration' className={classes.image} />
          </Grid>
        </Grid>

        <Typography variant='h6' gutterBottom>
          Skip the line. Book online.
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          To continue, please provide your quotation number.
        </Typography>
        <div className={classes.inputContainer}>
          <TextField
            label='Quotation Number'
            variant='outlined'
            fullWidth
            value={quotation}
            onChange={e => setQuotation(e.target.value)}
            className={classes.textField}
          />
          <Button fullWidth variant='contained' disableElevation color='primary' onClick={handleSubmit} className={classes.bookButton}>
            {'Continue →'}
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default BookingLandingPage;
