import React, { FC, useState, useEffect, useCallback, Fragment } from 'react';
import { Divider, Grid, makeStyles, Paper, Typography, Theme } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import Rating from '@material-ui/lab/Rating';

import { format, isValid, startOfMonth, endOfMonth } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import axios, { CancelTokenSource } from 'axios';
import { RATING_FEEDBACK_URL } from 'constants/url';

interface Props {
  setIsLoadingData: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerTitle: {
    margin: theme.spacing(4),
    marginLeft: theme.spacing(2),
    color: '#7c7c7c',
    textTransform: 'uppercase'
  },
  gridFilter: {
    padding: theme.spacing(2)
  },
  paper: {
    margin: theme.spacing(2),
    marginLeft: 0
  },
  dateFieldFont: {
    fontSize: 12,
    marginLeft: -12
  },
  gridFeedbackGeneral: {
    overflow: 'auto',
    maxHeight: 365,
    width: '99%'
  },
  gridFeedback: {
    margin: 0,
    width: '99%'
  },
  clientText: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  jobText: {
    marginLeft: theme.spacing(2),
    color: '#7c7c7c'
  },
  dateTimeText: {
    marginRight: theme.spacing(2),
    color: '#7c7c7c',
    textAlign: 'right'
  },
  rating: {
    marginLeft: theme.spacing(2)
  },
  feedbackText: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  divider: {
    marginBottom: theme.spacing(1),
    width: '90%'
  },
  noDataSummaryGrid: {
    display: 'flex',
    height: 365
  },
  formSubtitle: {
    color: '#b2b2b2'
  }
}));

const FeedbackCustomer: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { setIsLoadingData } = props;

  const [date, setDate] = useState<Date | null>(startOfMonth(new Date()));
  const [data, setData] = useState<FeedbackModel[]>([]);

  const getQueryParams = () => {
    const params = new URLSearchParams();

    params.append('sd', format(startOfMonth(date!), 'yyyy-MM-dd'));
    params.append('ed', format(endOfMonth(date!), 'yyyy-MM-dd'));

    return params.toString();
  };

  const fetchData = useCallback(() => {
    setIsLoadingData(true);

    const getFeedback = async () => {
      const url = `${RATING_FEEDBACK_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
      setData(data.rows);

      setIsLoadingData(false);
    };

    getFeedback();
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
        <Grid item sm={7}>
          <Typography variant='h5' className={classes.headerTitle}>
            Feedback Customers
          </Typography>
        </Grid>
        <Grid item sm={5} className={classes.gridFilter}>
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
      <Grid container spacing={1} className={classes.gridFeedbackGeneral}>
        {data.length > 0 ? (
          data.map(value => (
            <Fragment>
              <Grid container spacing={1} className={classes.gridFeedback}>
                <Grid item xs={8}>
                  <Typography variant='h5' color='primary' display='inline' className={classes.clientText}>
                    {value.Job.Service.Client.name}
                  </Typography>
                  <Typography variant='subtitle1' className={classes.jobText}>
                    {`Job ID - ${value.jobId}`}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant='subtitle1' className={classes.dateTimeText}>
                    {format(new Date(value.createdAt), 'EEE, dd-MM-yyyy')}
                  </Typography>
                  <Typography variant='subtitle1' className={classes.dateTimeText}>
                    {format(new Date(value.createdAt), 'hh:mm a')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Rating name='read-only' value={value.rate} readOnly size='small' className={classes.rating} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' className={classes.feedbackText}>
                    {value.feedback}
                  </Typography>
                </Grid>
              </Grid>
              <Divider className={classes.divider} variant='middle' />
            </Fragment>
          ))
        ) : (
          <Fragment>
            <Grid container justify='center' alignItems='center' className={classes.noDataSummaryGrid}>
              <Typography variant='subtitle2' id='form-subtitle' className={classes.formSubtitle}>
                No Feedback
              </Typography>
            </Grid>
          </Fragment>
        )}
      </Grid>
    </Paper>
  );
};

export default FeedbackCustomer;
