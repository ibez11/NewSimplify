import { FC, Fragment } from 'react';
import { makeStyles, Theme, Typography } from '@material-ui/core';
import { format } from 'date-fns';

const useStyles = makeStyles((theme: Theme) => ({
  spacing: {
    marginLeft: theme.spacing(1)
  }
}));

const Greeting: FC = () => {
  const classes = useStyles();

  const detailDate = format(new Date(), 'cccc, dd MMMM yyyy').toString();
  const renderGreeting = () => {
    const now = format(new Date(), 'aa').toString();
    if (now === 'AM') {
      return 'Good Morning,';
    } else if (now === 'PM') {
      return 'Good Afternoon,';
    }
  };
  return (
    <Fragment>
      <Typography variant='h4' color='primary' display='inline'>
        {renderGreeting()} Admin
      </Typography>
      <Typography variant='body1' color='primary' display='inline' className={classes.spacing}>
        {detailDate}
      </Typography>
    </Fragment>
  );
};

export default Greeting;
