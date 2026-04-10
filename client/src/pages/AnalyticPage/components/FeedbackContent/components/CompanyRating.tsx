import React, { FC, useState, useEffect, useCallback } from 'react';
import { Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';

import { Axis, Chart, Line, Point, Tooltip, Legend } from 'bizcharts';
import axios, { CancelTokenSource } from 'axios';

import { format, setYear } from 'date-fns';
import NumberFormat from 'react-number-format';
import { RATING_COMPANY_URL } from 'constants/url';

interface Props {
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  firstDate: Date | null;
  secondDate: Date | null;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerTitle: {
    margin: theme.spacing(4),
    marginBottom: theme.spacing(1),
    color: '#7c7c7c',
    textTransform: 'uppercase'
  },
  subtitle: {
    marginLeft: theme.spacing(4),
    textTransform: 'uppercase'
  },
  gridFilter: {
    padding: theme.spacing(2)
  },
  paper: {
    margin: theme.spacing(2)
  },
  calendarIcon: {
    fontSize: 20
  },
  dateField: {
    margin: theme.spacing(1)
  }
}));

const CompanyRating: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const { setIsLoadingData, firstDate, secondDate } = props;

  const [data, setData] = useState<[]>([]);

  const fetchData = useCallback(() => {
    setIsLoadingData(true);
    const getQueryParams = () => {
      const params = new URLSearchParams();

      params.append('sd', format(firstDate!, 'yyyy-MM-dd'));
      params.append('ed', format(secondDate!, 'yyyy-MM-dd'));

      return params.toString();
    };

    const getReportData = async () => {
      const url = `${RATING_COMPANY_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
      setData(data);
    };

    getReportData();

    setIsLoadingData(false);
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDate, secondDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scale = {
    y: { min: 0, max: 4, ticks: [0, 1, 2, 3, 4, 5], tickInterval: 1 }
  };
  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container>
        <Grid item sm={12}>
          <Typography variant='h5' className={classes.headerTitle}>
            Company Rating
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Chart scale={scale} padding={[50, 50, 50, 50]} autoFit height={320} data={data} interactions={['element-active']}>
          <Point position='x*y' color={['type', ['#53a0be', '#F7C137']]} shape='circle' />
          <Line shape='smooth' position='x*y' color={['type', ['#53a0be', '#F7C137']]} />
          <Tooltip shared showCrosshairs>
            {(title, items) => {
              return (
                <div>
                  <p style={{ marginBottom: 8, marginTop: 8 }}>{title}</p>
                  <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                    {items!.map((value, index) => (
                      <li style={{ marginBottom: 8 }} key={index}>
                        <span
                          style={{
                            backgroundColor: value.color,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            display: 'inline-block',
                            marginRight: 8
                          }}
                        />
                        {format(setYear(new Date(), Number(value.name)), 'yyyy')}:
                        <NumberFormat
                          value={value.value}
                          displayType={'text'}
                          thousandSeparator={true}
                          suffix={String.fromCharCode(11088)}
                          fixedDecimalScale={true}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }}
          </Tooltip>
          <Axis
            name='y'
            label={{
              formatter: val => `${val} ${String.fromCharCode(11088)}`
            }}
          />
          <Legend
            position='top-right'
            background={{
              padding: [0, 80, 5, 100],
              style: {
                fill: null,
                stroke: '#fff'
              }
            }}
            marker={{
              symbol: 'circle'
            }}
            itemName={{
              formatter: text => {
                return format(setYear(new Date(), Number(text)), 'yyyy');
              }
            }}
          />
        </Chart>
      </Grid>
    </Paper>
  );
};

export default CompanyRating;
