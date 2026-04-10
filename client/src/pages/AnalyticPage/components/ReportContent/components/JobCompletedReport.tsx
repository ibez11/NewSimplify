import React, { FC, useState, useEffect, useCallback } from 'react';
import { Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';

import { Chart, Line, Point, Tooltip, Legend } from 'bizcharts';
import axios, { CancelTokenSource } from 'axios';

import { format, setMonth } from 'date-fns';
import NumberFormat from 'react-number-format';
import { REPORT_JOB_COMPLETED_URL } from 'constants/url';

interface Props {
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  activeButton: string;
  selectedId: number;
  filterBy: number;
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
    margin: theme.spacing(2),
    marginBottom: theme.spacing(4)
  },
  calendarIcon: {
    fontSize: 20
  },
  dateField: {
    margin: theme.spacing(1)
  }
}));

const JobCompletedReport: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const { setIsLoadingData, activeButton, selectedId, filterBy, firstDate, secondDate } = props;

  const [data, setData] = useState<[]>([]);

  const fetchData = useCallback(() => {
    setIsLoadingData(true);
    const getQueryParams = () => {
      const params = new URLSearchParams();

      if (selectedId !== 0) {
        if (activeButton === 'technician') {
          params.append('tc', selectedId.toString());
        } else {
          params.append('vh', selectedId.toString());
        }
      }

      if (filterBy === 3) {
        params.append('cp', '1');
      } else {
        params.append('cp', '0');
      }

      params.append('sd', format(firstDate!, 'yyyy-MM-dd'));
      params.append('ed', format(secondDate!, 'yyyy-MM-dd'));

      return params.toString();
    };

    const getReportData = async () => {
      const url = `${REPORT_JOB_COMPLETED_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
      setData(data);
    };

    getReportData();

    setIsLoadingData(false);
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDate, secondDate, selectedId, activeButton]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderHeaderLabel = () => {
    if (filterBy) {
      if (filterBy === 2 && firstDate && secondDate) {
        return (
          <Typography variant='h6' color='primary' className={classes.subtitle}>
            ({format(new Date(firstDate), 'dd/MM/yyyy')} - {format(new Date(secondDate), 'dd/MM/yyyy')})
          </Typography>
        );
      } else if (filterBy === 3 && firstDate && secondDate) {
        return (
          <Typography variant='h6' color='primary' className={classes.subtitle}>
            ({format(new Date(firstDate), 'MMMM-yyyy')} & {format(new Date(secondDate), 'MMMM-yyyy')})
          </Typography>
        );
      }
    }
  };

  const scale = {
    y: { min: 0 }
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container>
        <Grid item sm={6}>
          <Typography variant='h5' className={classes.headerTitle}>
            By Job Completed
          </Typography>
          {renderHeaderLabel()}
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Chart scale={scale} padding={[50, 50, 50, 80]} autoFit height={320} data={data} interactions={['element-active']}>
          <Point position='x*y' color={['type', ['#53a0be', '#F7C137']]} shape='circle' />
          <Line shape='smooth' position='x*y' color={['type', ['#53a0be', '#F7C137']]} />
          <Tooltip shared showCrosshairs>
            {(title, items) => {
              return (
                <div>
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
                        {title} {format(setMonth(new Date(), Number(value.name) - 1), 'MMM')},{' '}
                        <NumberFormat value={value.value} displayType={'text'} thousandSeparator={true} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }}
          </Tooltip>
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
                return format(setMonth(new Date(), Number(text) - 1), 'MMM');
              }
            }}
          />
        </Chart>
      </Grid>
    </Paper>
  );
};

export default JobCompletedReport;
