import React, { FC, useState, useEffect, useCallback } from 'react';
import { Grid, IconButton, InputAdornment, makeStyles, MenuItem, OutlinedInput, Paper, Theme, Typography, TextField } from '@material-ui/core';
import TooltipMaterial from '@material-ui/core/Tooltip';
import { Axis, Chart, Line, Point, Tooltip, Legend } from 'bizcharts';
import axios, { CancelTokenSource } from 'axios';

import { format, setMonth } from 'date-fns';
import NumberFormat from 'react-number-format';
import CalendarIcon from '@material-ui/icons/EventNote';
import { PopperPlacementType } from '@material-ui/core/Popper';
import AnalyticDateFilter from 'components/AnalyticDateFilter';
import { REPORT_JOB_VALUE_COMPLETED_URL } from 'constants/url';

interface Props {
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
  selectMaster: Select[];
  activeButton: string;
  selectedId: number;
  setSelectedId: React.Dispatch<React.SetStateAction<number>>;
  filterBy: number;
  setFilterBy: React.Dispatch<React.SetStateAction<number>>;
  firstDate: Date | null;
  setFirstDate: React.Dispatch<React.SetStateAction<Date | null>>;
  secondDate: Date | null;
  setSecondDate: React.Dispatch<React.SetStateAction<Date | null>>;
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

const JobValueCompletedReport: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const {
    setIsLoadingData,
    selectMaster,
    activeButton,
    selectedId,
    setSelectedId,
    filterBy,
    setFilterBy,
    firstDate,
    setFirstDate,
    secondDate,
    setSecondDate
  } = props;

  const [data, setData] = useState<[]>([]);

  const [openCalendarPopper, setOpenCalendarPopper] = useState(false);
  const [anchorElCalendarPopper, setAnchorElCalendarPopper] = useState<HTMLElement | null>(null);
  const [placementCalendarPopper, setPlacementCalendarPopper] = useState<PopperPlacementType>();

  const [fieldLabel, setFieldLabel] = useState<string>('This Month');

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
      const url = `${REPORT_JOB_VALUE_COMPLETED_URL}?${getQueryParams()}`;
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

  const handleCalendarFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCalendarPopper(!openCalendarPopper);
    setAnchorElCalendarPopper(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

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

  const handleSelectChange = (event: any) => {
    setSelectedId(event);
  };

  const scale = {
    y: { min: 0 }
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container>
        <Grid item sm={6}>
          <Typography variant='h5' className={classes.headerTitle}>
            By Job Value Completed
          </Typography>
          {renderHeaderLabel()}
        </Grid>
        <Grid item sm={6} className={classes.gridFilter}>
          <Grid container>
            <Grid item sm={6}>
              <TextField
                select
                fullWidth
                margin='dense'
                id='vehicle'
                label={activeButton === 'technician' ? 'Technician' : 'Vehicle'}
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
              <OutlinedInput
                value={fieldLabel}
                disabled
                margin='dense'
                fullWidth
                className={classes.dateField}
                endAdornment={
                  <InputAdornment position='end'>
                    <TooltipMaterial title='Calendar filter' placement='top'>
                      <IconButton size='small' onClick={event => handleCalendarFilterClick(event)}>
                        <CalendarIcon className={classes.calendarIcon} color={filterBy ? 'primary' : 'inherit'} />
                      </IconButton>
                    </TooltipMaterial>
                  </InputAdornment>
                }
              />
            </Grid>
          </Grid>
          <AnalyticDateFilter
            openPopper={openCalendarPopper}
            setOpenPopper={setOpenCalendarPopper}
            anchorEl={anchorElCalendarPopper}
            placement={placementCalendarPopper}
            containerWidth={300}
            fadeTransition={350}
            options={[
              { key: 0, label: 'This Month' },
              { key: 1, label: 'Last Month' },
              { key: 2, label: 'Custom Date' },
              { key: 3, label: 'Compare Date' }
            ]}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            startDate={firstDate}
            setStartDate={setFirstDate}
            endDate={secondDate}
            setEndDate={setSecondDate}
            setFieldLabel={setFieldLabel}
          />
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
                        <NumberFormat value={value.value} displayType={'text'} thousandSeparator={true} prefix={'$'} fixedDecimalScale={true} />
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
              formatter: val => `$${val}`
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
                return format(setMonth(new Date(), Number(text) - 1), 'MMM');
              }
            }}
          />
        </Chart>
      </Grid>
    </Paper>
  );
};

export default JobValueCompletedReport;
