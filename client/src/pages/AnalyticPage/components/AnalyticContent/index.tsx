import React, { FC, Fragment, useState } from 'react';
import { Backdrop, CircularProgress, Grid, makeStyles, Theme } from '@material-ui/core';

import RevenueContent from './components/RevenueContent';
import PopularContractContent from './components/PopularContractContent';
import PopularServiceItemContent from './components/PopularServiceItemContent';
import JobOverviewContent from './components/JobOverviewContent';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  },
  button: {
    width: 150
  }
}));

const AnalyticReport: FC = () => {
  const classes = useStyles();

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  return (
    <Fragment>
      <Backdrop className={classes.backdrop} open={isLoadingData}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Grid container spacing={1}>
        <Grid item md={12}>
          <RevenueContent setIsLoadingData={setIsLoadingData} />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item md={6}>
          <PopularContractContent setIsLoadingData={setIsLoadingData} />
        </Grid>
        <Grid item md={6}>
          <PopularServiceItemContent setIsLoadingData={setIsLoadingData} />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item md={12}>
          <JobOverviewContent setIsLoadingData={setIsLoadingData} />
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default AnalyticReport;
