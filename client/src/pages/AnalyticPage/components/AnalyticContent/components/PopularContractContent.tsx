import React, { FC, useState, useEffect, useCallback } from 'react';
import { Grid, makeStyles, Paper, Typography, Theme } from '@material-ui/core';
import { DonutChart } from 'bizcharts';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import { format, isValid, startOfMonth, endOfMonth } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import axios, { CancelTokenSource } from 'axios';
import { ANALYTIC_POPULAR_CONTRACT_URL } from 'constants/url';

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

const PopularContractContent: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { setIsLoadingData } = props;

  const [date, setDate] = useState<Date | null>(startOfMonth(new Date()));
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');

  const [data, setData] = useState<[]>([]);
  const [totalContractType, setTotalContractType] = useState<number>(0);

  const getQueryParams = () => {
    const params = new URLSearchParams();

    params.append('sd', format(startOfMonth(date!), 'yyyy-MM-dd'));
    params.append('ed', format(endOfMonth(date!), 'yyyy-MM-dd'));

    return params.toString();
  };

  const fetchData = useCallback(() => {
    setIsLoadingData(true);

    const getPopularItemData = async () => {
      const url = `${ANALYTIC_POPULAR_CONTRACT_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
      setData(data);

      let newPercent: number = 0;
      let newSubtitle: string = '';
      let totalType: number = 0;
      if (data.length > 0) {
        // eslint-disable-next-line array-callback-return
        data.map((value: any) => {
          if (newPercent < value.percent) {
            newPercent = value.percent;
            newSubtitle = value.type;
          }
          totalType = totalType + value.value;
        });
      }
      setTitle(
        data.length > 0
          ? `<h1 style="font-size:50px;margin-bottom:0px;">${newPercent}%</h1>`
          : '<h1 style="font-size:50px;margin-bottom:0px;">No Data</h1>'
      );
      setSubtitle(data.length > 0 ? `<p style="font-size:14px">${newSubtitle}</p>` : '<p style="font-size:18px"></p>');
      setTotalContractType(totalType);

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
        <Grid item sm={8}>
          <Typography variant='h5' className={classes.headerTitle}>
            Most Popular Contract Type
          </Typography>
        </Grid>
        <Grid item sm={4} className={classes.gridFilter}>
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
      </Grid>
      <Grid container spacing={1}>
        <DonutChart
          data={data || []}
          autoFit
          height={350}
          radius={0.8}
          angleField='value'
          colorField='type'
          color={['#53a0be', '#F7C137', '#2E5BFF']}
          pieStyle={{ stroke: 'white', lineWidth: 0 }}
          legend={{ position: 'right', offsetX: -80 }}
          statistic={{
            title: {
              customHtml: () => (title ? title : '<h1 style="font-size:50px;margin-bottom:0px;">No Data</h1>')
            },
            content: {
              customHtml: () => (subtitle ? subtitle : '<p style="font-size:18px"></p>')
            }
          }}
          tooltip={{
            formatter: d => {
              return { name: 'Percentage Used', value: `${((d.value / totalContractType) * 100).toFixed(2)}%` };
            },
            title: (title, d) => {
              return d.type;
            },
            showTitle: true
          }}
        />
      </Grid>
    </Paper>
  );
};

export default PopularContractContent;
