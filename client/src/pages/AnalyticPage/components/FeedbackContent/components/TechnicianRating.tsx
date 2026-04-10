import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Grid, makeStyles, MenuItem, Paper, Theme, Typography, TextField } from '@material-ui/core';
import { Axis, Chart, Line, Point, Tooltip, Legend } from 'bizcharts';
import axios, { CancelTokenSource } from 'axios';

import { format, setYear, isValid, startOfYear, endOfYear, subYears } from 'date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import NumberFormat from 'react-number-format';
import { RATING_TECHNICIAN_URL } from 'constants/url';

interface Props {
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  selectMaster: Select[];
  selectedId: number;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
  firstDate: Date | null;
  setFirstDate: React.Dispatch<React.SetStateAction<Date | null>>;
  secondDate: Date | null;
  setSecondDate: React.Dispatch<React.SetStateAction<Date | null>>;
  openFeedback: boolean;
  setOpenFeedback: React.Dispatch<React.SetStateAction<boolean>>;
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
  },
  viewButton: {
    paddingRight: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  dateFilter: {
    paddingLeft: theme.spacing(2)
  },
  dateFieldFont: {
    fontSize: 12,
    marginLeft: -12
  }
}));

const TechnicianRating: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const {
    setIsLoadingData,
    selectMaster,
    selectedId,
    setSelectedId,
    firstDate,
    setFirstDate,
    secondDate,
    setSecondDate,
    openFeedback,
    setOpenFeedback
  } = props;

  const [data, setData] = useState<[]>([]);

  const [date, setDate] = useState<Date | null>(new Date());

  const fetchData = useCallback(() => {
    setIsLoadingData(true);
    const getQueryParams = () => {
      const params = new URLSearchParams();

      if (selectedId !== 0) {
        params.append('tc', selectedId.toString());
      }

      params.append('sd', format(firstDate!, 'yyyy-MM-dd'));
      params.append('ed', format(secondDate!, 'yyyy-MM-dd'));

      return params.toString();
    };

    const getReportData = async () => {
      const url = `${RATING_TECHNICIAN_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
      setData(data);
    };

    getReportData();

    setIsLoadingData(false);
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstDate, secondDate, selectedId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = (date: Date | null) => {
    if (isValid(date)) {
      setDate(date);
      const lastYear = subYears(date!, 1);
      setFirstDate(startOfYear(lastYear));
      setSecondDate(endOfYear(date!));
    }
  };

  const handleSelectChange = (event: any) => {
    setSelectedId(event);
  };

  const handleOpenFeedback = () => {
    setOpenFeedback(!openFeedback);
  };

  const scale = {
    y: { min: 0, max: 4, ticks: [0, 1, 2, 3, 4, 5], tickInterval: 1 }
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container>
        <Grid item sm={6}>
          <Typography variant='h5' className={classes.headerTitle}>
            Technician Rating
          </Typography>
        </Grid>
        <Grid item sm={6} className={classes.gridFilter}>
          <Grid container>
            <Grid item sm={6}>
              <TextField
                select
                fullWidth
                margin='dense'
                id='vehicle'
                label={'Technician'}
                value={selectedId}
                onChange={event => handleSelectChange(event.target.value)}
                variant='outlined'
                autoComplete='off'
                InputLabelProps={{
                  shrink: selectedId === 0 ? false : true
                }}
              >
                {selectMaster.map(value => {
                  return (
                    <MenuItem key={value.id} value={value.id}>
                      {value.name}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
            <Grid item sm={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  clearable
                  fullWidth
                  margin='dense'
                  id='serviceDate'
                  value={date}
                  variant='dialog'
                  inputVariant='outlined'
                  views={['year']}
                  onChange={handleDateChange}
                  className={classes.dateFilter}
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
        </Grid>
      </Grid>
      <Grid container justify='flex-end' className={classes.viewButton}>
        <Button color='primary' onClick={handleOpenFeedback}>
          {openFeedback ? 'Close Feedback' : 'View Feedback'}
        </Button>
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

export default TechnicianRating;
