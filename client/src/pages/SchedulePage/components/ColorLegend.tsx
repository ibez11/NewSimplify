import { FC } from 'react';
import { Grid, Typography, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { JobStatus } from 'constants/enum';
import { ucWords } from 'utils';

const colors: Record<JobStatus, string> = {
  UNASSIGNED: '#979797',
  CONFIRMED: '#EF965A',
  ASSIGNED: '#3788D8',
  IN_PROGRESS: '#53A0BE',
  PAUSED: '#BCD4D4',
  COMPLETED: '#4CAF50',
  CANCELLED: '#B20808'
};

const labels: Record<JobStatus, string> = {
  UNASSIGNED: 'UNASSIGNED',
  CONFIRMED: 'CONFIRMED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN PROGRESS',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

interface Props {
  status: JobStatus;
}

const useStyles = makeStyles((theme: Theme) => ({
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    marginBottom: 4
  }
}));

const ColorLegend: FC<Props> = props => {
  const { status } = props;
  const classes = useStyles();

  return (
    <Grid container xs={1} direction='column' alignItems='center' style={{ marginRight: 4, marginLeft: 4 }}>
      <Grid className={classes.dot} style={{ backgroundColor: colors[status] }} />
      <Typography variant='body2'>{ucWords(labels[status])}</Typography>
    </Grid>
  );
};

export default ColorLegend;
