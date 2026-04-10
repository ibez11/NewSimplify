import React, { FC } from 'react';
import { Grid, makeStyles, Paper, Typography, Theme } from '@material-ui/core';
import { DonutChart } from 'bizcharts';

interface Props {
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerTitle: {
    margin: theme.spacing(4),
    color: '#7c7c7c',
    textTransform: 'uppercase'
  },
  gridFilter: {
    padding: theme.spacing(2)
  },
  paper: {
    margin: theme.spacing(2)
  }
}));

const data = [
  {
    type: 'Renewal',
    value: 215
  },
  {
    type: 'Contract',
    value: 100
  }
];

const RenewalContent: FC<Props> = props => {
  const classes = useStyles();

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container>
        <Grid item sm={8}>
          <Typography variant='h5' className={classes.headerTitle}>
            Renewal Quotation
          </Typography>
        </Grid>
        <Grid item sm={4} className={classes.gridFilter}></Grid>
      </Grid>
      <Grid container spacing={1}>
        <DonutChart
          data={data || []}
          autoFit
          height={350}
          radius={0.8}
          angleField='value'
          colorField='type'
          color={['#53a0be', '#F7C137']}
          pieStyle={{ stroke: 'white', lineWidth: 0 }}
          legend={{ position: 'bottom' }}
          statistic={{
            title: {
              customHtml: () => '<h1 style="font-size:50px;margin-bottom:0px">60%</h1>'
            },
            content: {
              customHtml: () => '<p style="font-size:18px">RENEWAL</p>'
            }
          }}
        />
      </Grid>
    </Paper>
  );
};

export default RenewalContent;
