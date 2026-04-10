import React, { useContext } from 'react';
import clsx from 'clsx';
import { Button, Container, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import useRouter from 'hooks/useRouter';
import notfound from 'images/notfound.png';
import { AppDrawerContext } from 'contexts/AppDrawerContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(2)
    }
  },
  firstText: {
    textAlign: 'center',
    color: '#53A0BE',
    fontSize: 40,
    marginBottom: theme.spacing(1)
  },
  secondText: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: theme.spacing(1)
  },
  buttonGrid: {
    display: 'flex',
    justifyContent: 'center'
  },
  image: {
    heigt: '35%',
    width: '35%',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto'
  }
}));

const NotFoundPage: React.FC<{ hideBackButton?: boolean }> = ({ hideBackButton }) => {
  const classes = useStyles();
  const { history } = useRouter();
  const { firstActiveMenu } = useContext(AppDrawerContext); // Get the first active menu from context

  const handleBackButton = () => {
    history.push({ pathname: firstActiveMenu });
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <img src={notfound} alt='logo' className={classes.image} />
          <Typography variant='h3' className={classes.firstText}>
            Sorry, Page Not Found!
          </Typography>
          <Typography className={classes.secondText}>The page you requested could not be found. Please go back.</Typography>
        </Grid>
        {!hideBackButton && (
          <Grid item xs={12} className={classes.buttonGrid}>
            <Button variant='contained' color='primary' disableElevation onClick={handleBackButton}>
              Go Back
            </Button>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default NotFoundPage;
