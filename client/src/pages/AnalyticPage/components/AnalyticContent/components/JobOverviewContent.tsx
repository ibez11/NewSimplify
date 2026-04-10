import React, { FC, useState, useEffect, useCallback } from 'react';
import { Grid, makeStyles, Paper, Typography, Theme } from '@material-ui/core';
import { StackedColumnChart } from 'bizcharts';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { format, isValid, startOfMonth, endOfMonth } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import axios, { CancelTokenSource } from 'axios';
import { ANALYTIC_OVERVIEW_JOB_URL } from 'constants/url';

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
  },
  dateFieldFont: {
    fontSize: 12,
    marginLeft: -12
  }
}));

const JobOverviewContent: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { setIsLoadingData } = props;

  const [date, setDate] = useState<Date | null>(startOfMonth(new Date()));

  const [data, setData] = useState<[]>([]);

  const getQueryParams = () => {
    const params = new URLSearchParams();

    params.append('sd', format(startOfMonth(date!), 'yyyy-MM-dd'));
    params.append('ed', format(endOfMonth(date!), 'yyyy-MM-dd'));

    return params.toString();
  };

  const fetchData = useCallback(() => {
    setIsLoadingData(true);

    const getPopularItemData = async () => {
      const url = `${ANALYTIC_OVERVIEW_JOB_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
      setData(data);

      setIsLoadingData(false);
    };

    getPopularItemData();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = (date: Date | null) => {
    if (isValid(date)) {
      setDate(date);
    }
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container>
        <Grid item sm={10}>
          <Typography variant='h5' className={classes.headerTitle}>
            All Job Overview
          </Typography>
        </Grid>
        <Grid item sm={2} className={classes.gridFilter}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              clearable
              fullWidth
              margin='dense'
              id='serviceDate'
              value={date}
              variant='dialog'
              inputVariant='outlined'
              views={['month', 'year']}
              onChange={handleDateChange}
              KeyboardButtonProps={{
                'aria-label': 'change date'
              }}
              InputProps={{
                classes: {
                  input: classes.dateFieldFont
                }
              }}
              InputAdornmentProps={{ position: 'start' }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid container spacing={1}>
          <StackedColumnChart
            data={data}
            autoFit
            height={320}
            padding={[50, 30, 50, 50]}
            xField='x'
            yField='y'
            maxColumnWidth={50}
            yAxis={{
              min: 0
            }}
            color={(d: any) => {
              if (d.type === 'UNASSIGNED') {
                return '#979797';
              } else if (d.type === 'ASSIGNED') {
                return '#53A0BE';
              } else if (d.type === 'COMPLETED') {
                return '#4CAF50';
              } else if (d.type === 'PAUSED') {
                return '#3963FF';
              } else if (d.type === 'CONFIRMED') {
                return '#EF965A';
              } else {
                return '#b20808';
              }
            }}
            stackField='type'
            legend={{
              position: 'right-top',
              layout: 'horizontal',
              offsetX: -50,
              reversed: false,
              marker: { symbol: 'circle' },
              maxWidth: 900,
              flipPage: false
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default JobOverviewContent;
