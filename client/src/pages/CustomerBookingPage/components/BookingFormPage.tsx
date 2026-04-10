import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  makeStyles,
  Paper,
  Typography,
  useMediaQuery,
  Theme,
  useTheme,
  MenuItem,
  Select,
  IconButton,
  Popover
} from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import BookingConfirmationPage from './BookingConfirmationPage';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import illustration from 'images/illustration_calendar.png';
import axios, { CancelTokenSource } from 'axios';
import { BOOKING_JOB_WEBHOOKS_URL, GCALANDER_HOLIDAY_URL, GET_BOOKING_JOB_WEBHOOKS_URL, GET_BOOKING_TIME_SLOTS_WEBHOOKS_URL } from 'constants/url';
import Skeleton from 'react-loading-skeleton';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import BookingSummaryDialog from './BookingSummaryDialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2)
  },
  paper: {
    width: '100%',
    maxWidth: 480,
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2)
    }
  },
  serviceInfoBox: {
    backgroundColor: theme.palette.primary.light,
    borderRadius: 8,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  warningBox: {
    backgroundColor: theme.palette.secondary.light,
    borderRadius: 8,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  jobInfoBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3)
  },
  calendar: {
    width: '100%',
    '& .MuiPickersStaticWrapper-root': {
      width: '100%'
    },
    '& .MuiPickersBasePicker-pickerView': {
      width: '100%',
      maxWidth: '100%'
    },
    '& .MuiPickersCalendarTransitionContainer-root': {
      width: '100%'
    }
  },
  timeSlotButton: {
    margin: theme.spacing(1, 0.5),
    minWidth: 90
  },
  footer: {
    marginTop: theme.spacing(3)
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2)
  },
  illustrationContainer: {
    textAlign: 'center',
    marginBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      marginBottom: theme.spacing(5)
    }
  },
  jobDropdown: {
    marginBottom: theme.spacing(2),
    width: '100%'
  }
}));

const format12Hour = (date: Date): string => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

const format12HourString = (timeStr: string): string => {
  const [hour, minute] = timeStr.split(':');
  const date = new Date();
  date.setHours(Number(hour), Number(minute));
  return format12Hour(date);
};

const format12HourRange = (timeStr: string): string => {
  const [hour, minute] = timeStr.split(':').map(Number);
  const start = new Date();
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start);
  end.setMinutes(start.getMinutes() + 30);
  return `${format(start, 'h:mm')} - ${format(end, 'h:mm a')}`;
};

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayNum = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayNum}`;
};

const BookingFormPage: React.FC<{ quotationCode: string; tenant: string; bookingSetting: any; onBack: () => void }> = ({
  quotationCode,
  tenant,
  bookingSetting,
  onBack
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [holidayDates, setHolidayDates] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(true);

  const generateInitialJobs = (): any[] => {
    return [0, 1, 2].map(i => ({
      id: i + 1,
      label: `Job ${i + 1} of 3`,
      selectedDateTime: new Date(),
      endDateTime: new Date(),
      defaultDateTime: new Date(),
      jobDuration: 0,
      isConfirmed: false
    }));
  };

  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [serviceInfo, setServiceInfo] = useState<{
    id: number;
    serviceNumber: string;
    serviceAddress: string;
    clientName: string;
    contactPerson: string;
    countryCode: string;
    contactNumber: string;
    entityContactNumber: string;
  } | null>(null);

  const [jobs, setJobs] = useState(generateInitialJobs);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Popover state and anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!quotationCode) {
      return;
    } else {
      const fetchQuotationJobs = async () => {
        try {
          const { data } = await axios.get(`${GET_BOOKING_JOB_WEBHOOKS_URL(tenant, quotationCode)}`, {
            cancelToken: cancelTokenSource.token
          });

          if (data) {
            const service = data;

            // Set extra info
            setServiceInfo({
              id: service.id,
              serviceNumber: service.serviceNumber,
              serviceAddress: service.serviceAddress,
              clientName: service.clientName,
              contactPerson: service.contactPerson,
              countryCode: service.countryCode,
              contactNumber: service.contactNumber,
              entityContactNumber: service.entityContactNumber
            });

            // Format jobs
            const formattedJobs = (service.Jobs || []).map((job: any) => ({
              id: job.id,
              label: `Job ${job.jobSequence} of ${service.Jobs.length}`,
              selectedDateTime: new Date(job.startDateTime),
              endDateTime: new Date(job.endDateTime),
              defaultDateTime: new Date(job.startDateTime),
              jobStatus: job.jobStatus,
              jobDuration: job.durationMinutes,
              isConfirmed: false
            }));

            setJobs(formattedJobs);

            const firstUnassignedIndex = formattedJobs.findIndex((job: any) => job.jobStatus === 'UNASSIGNED');
            if (firstUnassignedIndex >= 0) {
              setSelectedJobIndex(firstUnassignedIndex);
            }
          }
        } catch (err) {
          console.error('❌ Failed to fetch quotation jobs:', err);
          const error = err as any;
          const serverMessage = error?.data?.message || 'Failed to load quotation jobs. Please try again later.';

          alert(serverMessage);
          onBack();
          setJobs(generateInitialJobs());
        }
      };

      fetchQuotationJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotationCode]);

  useEffect(() => {
    if (!bookingSetting.IncludePublicHoliday) {
      axios
        .get(GCALANDER_HOLIDAY_URL)
        .then(({ data }) => {
          const now = new Date();
          const nextYear = new Date(now.getFullYear() + 1, 11, 31);
          const filtered = data.items.filter((value: any) => {
            if (value.description?.toLowerCase().includes('observance')) return false;
            const date = new Date(value.start.date);
            return date >= now && date <= nextYear;
          });
          const dates = filtered.map((item: any) => item.start.date);
          setHolidayDates(dates);
        })
        .catch(error => {
          console.error('Failed to fetch holidays', error);
        });
    }
  }, [bookingSetting.IncludePublicHoliday]);

  const selectedJob = jobs[selectedJobIndex];
  const selectedDateOnly = format(selectedJob.selectedDateTime, 'yyyy-MM-dd');

  useEffect(() => {
    const selectedDate = selectedJob.selectedDateTime;
    if (!selectedDate) return;

    const fetchAvailableSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await axios.get(`${GET_BOOKING_TIME_SLOTS_WEBHOOKS_URL(tenant)}`, {
          params: { sd: toLocalIsoDate(selectedDate) }
        });
        setAvailableTimeSlots(res.data || []);
      } catch (error) {
        console.error('❌ Failed to load time slots:', error);
        setAvailableTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateOnly]); // ✅ now only runs when DATE part changes

  const setSelectedDate = (date: Date | null) => {
    if (date) {
      const updatedJobs = [...jobs];
      updatedJobs[selectedJobIndex].selectedDateTime = date;
      setJobs(updatedJobs);
    }
  };

  const setSelectedTime = (time: string) => {
    const updatedJobs = [...jobs];
    const currentDate = updatedJobs[selectedJobIndex].selectedDateTime || new Date();
    const [hours, minutes] = time.split(':');
    const startDateTime = new Date(currentDate);
    startDateTime.setHours(Number(hours), Number(minutes), 0, 0);

    const jobDuration = updatedJobs[selectedJobIndex].jobDuration || 0;
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + jobDuration);

    // Validate if end time is after 6:00 PM
    const sixPm = new Date(startDateTime);
    sixPm.setHours(17, 30, 0, 0);
    if (endDateTime > sixPm) {
      alert('Selected time would end after 5:30 PM. Please choose an earlier time slot.');
      return;
    }

    updatedJobs[selectedJobIndex].selectedDateTime = startDateTime;
    updatedJobs[selectedJobIndex].endDateTime = endDateTime;
    updatedJobs[selectedJobIndex].isConfirmed = startDateTime.getTime() !== updatedJobs[selectedJobIndex].defaultDateTime.getTime();
    setJobs(updatedJobs);
  };

  const handleSubmit = async () => {
    if (!tenant || !quotationCode) {
      alert('Tenant or quotation code is missing.');
      return;
    }

    if (jobs.length === 0) {
      alert('No jobs available for booking.');
      return;
    }

    const payload = {
      Jobs: jobs.map(job => ({
        id: job.id,
        startDateTime: format(job.selectedDateTime, 'yyyy-MM-dd HH:mm'),
        isConfirmed: job.isConfirmed
      }))
    };

    try {
      setIsSaving(true);
      await axios.post(BOOKING_JOB_WEBHOOKS_URL(tenant), payload);
      setIsSubmitted(true);
      setSummaryOpen(false);
      setIsSaving(false);
    } catch (err) {
      console.error('❌ Failed to submit booking:', err);
      setIsSaving(false);
      setSummaryOpen(false);
      const error = err as any;
      const serverMessage = error?.data?.message || 'Failed to submit booking. Please try again.';

      alert(serverMessage);
    }
  };

  const shouldDisableDate = (day: Date | null): boolean => {
    if (!hasUnassignedJob) return true;
    if (!day) return false;

    const dayOfWeek = day.getDay();
    const isoDate = toLocalIsoDate(day);
    const isHoliday = !bookingSetting.IncludePublicHoliday && holidayDates.includes(isoDate);

    const isWeekendRestriction = () => {
      switch (bookingSetting.WorkingDays) {
        case 'monday to saturday':
          return dayOfWeek === 0;
        case 'monday to friday':
          return dayOfWeek === 0 || dayOfWeek === 6;
        default:
          return false;
      }
    };

    const windowStart = startOfDay(new Date(selectedJob.defaultDateTime));
    const windowEnd = startOfDay(new Date(selectedJob.defaultDateTime));
    windowEnd.setDate(windowEnd.getDate() + 45);

    const normalizedDay = startOfDay(day);
    const isOutOfWindow = isBefore(normalizedDay, windowStart) || isAfter(normalizedDay, windowEnd);

    return isHoliday || isWeekendRestriction() || isOutOfWindow;
  };

  if (isSubmitted) {
    return <BookingConfirmationPage />;
  }

  const hasUnassignedJob = jobs.some(job => job.jobStatus === 'UNASSIGNED');

  const isDropdownDisabled = (jobIndex: number): boolean => {
    // Disable if any previous job is not confirmed
    for (let i = 0; i < jobIndex; i++) {
      if (!jobs[i]?.isConfirmed) return true;
    }
    return false;
  };

  const renderJobInfoBox = () => {
    const today = startOfDay(new Date());
    const deadline = startOfDay(new Date(selectedJob.defaultDateTime));
    deadline.setDate(deadline.getDate() + 45);
    const isOverdue = isAfter(today, deadline);

    return (
      <>
        <Typography variant='body2'>{format(new Date(selectedJob.defaultDateTime), `EEE, dd MMM yyyy hh:mm a`)}</Typography>
        <Typography variant='body2' color='textSecondary' style={{ display: 'block', marginTop: 8 }}>
          Available dates: {format(selectedJob.defaultDateTime, 'dd MMM yyyy')} –{' '}
          {format(new Date(selectedJob.defaultDateTime.getTime() + 45 * 86400000), 'dd MMM yyyy')}
        </Typography>

        {isOverdue && (
          <Typography color='error' variant='body2' style={{ marginTop: theme.spacing(2) }}>
            We are unable to process this booking as your scheduled date is overdue. Please contact our admin at{' '}
            <strong>
              <a href={`tel:+65${serviceInfo?.entityContactNumber}`} style={{ color: theme.palette.error.main, textDecoration: 'underline' }}>
                +65 {serviceInfo?.entityContactNumber || 'your admin contact'}
              </a>
            </strong>{' '}
            for assistance with scheduling. Thank you!
          </Typography>
        )}
      </>
    );
  };

  return (
    <Box className={classes.root}>
      <Grid container spacing={isMobile ? 2 : 4} justify='center' alignItems='center'>
        {!isMobile && (
          <Grid item sm={6} className={classes.illustrationContainer}>
            <Box display='flex' flexDirection='column' alignItems='center'>
              <img src={bookingSetting.LogoUrl} alt='Company Logo' style={{ height: 75, marginBottom: theme.spacing(3) }} />
              <img src={illustration} alt='Booking Illustration' style={{ width: '100%', maxWidth: 320 }} />
              <Typography variant='h5' style={{ marginTop: theme.spacing(4), textAlign: 'center' }}>
                Skip the line. Book online.
              </Typography>
            </Box>
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={4}>
          <Paper className={classes.paper}>
            <Box className={classes.backButton}>
              <Button color='primary' onClick={onBack}>
                <ArrowBackIosIcon fontSize='small' style={{ marginRight: 4 }} />
                <Typography variant='body2'>Back</Typography>
              </Button>
              <Grid container justify='flex-end' alignItems='center'>
                <Grid item>
                  <IconButton onClick={handlePopoverOpen} size='small'>
                    <InfoIcon />
                  </IconButton>
                  <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handlePopoverClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    <Box p={2} maxWidth={220}>
                      <Typography variant='body2'>Once saved, the date can't be changed. Please contact admin if you need to edit it.</Typography>
                    </Box>
                  </Popover>
                </Grid>
              </Grid>
            </Box>

            {serviceInfo && (
              <Box mb={2} className={classes.serviceInfoBox}>
                <Typography variant='subtitle1'>
                  <strong>Name:</strong> {serviceInfo.clientName}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Contact:</strong> {serviceInfo.contactPerson} ({serviceInfo.countryCode} {serviceInfo.contactNumber})
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Address:</strong> {serviceInfo.serviceAddress}
                </Typography>
                <Typography variant='subtitle1'>
                  <strong>Quotation No.:</strong> {serviceInfo.serviceNumber}
                </Typography>
              </Box>
            )}

            {!hasUnassignedJob ? (
              <Box mb={2} className={classes.warningBox}>
                <Typography variant='body2' color='error' gutterBottom>
                  All jobs have been confirmed. If you need to make changes, please contact admin.
                </Typography>
              </Box>
            ) : (
              <Typography variant='body1' align='center' style={{ marginBottom: theme.spacing(1) }}>
                Please select your job below, You must schedule the previous job before moving on to the next.
              </Typography>
            )}

            <Select
              value={selectedJobIndex}
              onChange={e => setSelectedJobIndex(Number(e.target.value))}
              variant='outlined'
              className={classes.jobDropdown}
              disabled={!hasUnassignedJob}
            >
              {jobs.map((job, index) => {
                const isDisabled = job.jobStatus !== 'UNASSIGNED' || isDropdownDisabled(index);

                let statusLabel = '';
                if (job.jobStatus !== 'UNASSIGNED') {
                  statusLabel = ` (✅ ${job.jobStatus})`;
                }

                return (
                  <MenuItem key={job.id} value={index} disabled={isDisabled}>
                    {job.label}
                    {statusLabel}
                  </MenuItem>
                );
              })}
            </Select>

            <Typography variant='body1' align='center' style={{ marginBottom: theme.spacing(1) }}>
              Please select a date and time for each job.
            </Typography>

            <Box className={classes.jobInfoBox}>
              <Typography variant='subtitle2' gutterBottom>
                Tentative Date & Time
              </Typography>
              {renderJobInfoBox()}
            </Box>

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Box className={classes.calendar}>
                <DatePicker
                  fullWidth
                  variant='static'
                  openTo='date'
                  disableToolbar
                  value={selectedJob.selectedDateTime}
                  onChange={setSelectedDate}
                  disablePast
                  shouldDisableDate={shouldDisableDate}
                  style={{ maxWidth: '100%' }}
                />
              </Box>
            </MuiPickersUtilsProvider>

            <Typography variant='subtitle1' gutterBottom style={{ marginTop: theme.spacing(2) }}>
              Estimated Arrival Time
            </Typography>

            <Grid container spacing={1}>
              {loadingSlots
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Grid item xs={4} sm={3} key={i}>
                      <Skeleton width={'100%'} />
                    </Grid>
                  ))
                : availableTimeSlots.map(({ time, available }) => (
                    <Grid item xs={6} key={time}>
                      <Button
                        variant={
                          selectedJob.selectedDateTime && format12Hour(selectedJob.selectedDateTime) === format12HourString(time)
                            ? 'contained'
                            : 'outlined'
                        }
                        disableElevation
                        color='primary'
                        fullWidth
                        disabled={!available || !hasUnassignedJob}
                        onClick={() => setSelectedTime(time)}
                        className={classes.timeSlotButton}
                      >
                        {format12HourRange(time)}
                      </Button>
                    </Grid>
                  ))}
            </Grid>

            <Box className={classes.footer}>
              <Button
                fullWidth
                color='primary'
                variant='contained'
                disableElevation
                onClick={() => setSummaryOpen(true)}
                disabled={!selectedJob.selectedDateTime || !hasUnassignedJob}
              >
                Save
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {summaryOpen && (
        <BookingSummaryDialog
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          onSave={handleSubmit}
          jobs={jobs}
          acceptTerms={acceptTerms}
          setAcceptTerms={setAcceptTerms}
          isSaving={isSaving}
        />
      )}
    </Box>
  );
};

export default BookingFormPage;
