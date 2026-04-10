import React, { FC, useEffect, Fragment, useState } from 'react';
import {
  Backdrop,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Link,
  makeStyles,
  Popover,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';

import InfoIcon from '@material-ui/icons/Info';
import EditIcon from '@material-ui/icons/Edit';
import MarkerIcon from '@material-ui/icons/LocationOn';
import EditInvoiceIcon from '@material-ui/icons/Edit';
import SendIcon from '@material-ui/icons/Send';

import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import adaptivePlugin from '@fullcalendar/adaptive';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import timeGridPlugin from '@fullcalendar/timegrid';
import axios, { CancelTokenSource } from 'axios';
import { GET_EDIT_JOB_URL } from 'constants/url';
import { format } from 'date-fns';
import { JobStatus } from 'constants/enum';
import NumberFormat from 'react-number-format';
import { ucWords } from 'utils';
import theme from 'theme';

interface Props {
  isLoadingData: boolean;
  initialView: string;
  selectedDate: Date;
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
  resources: any[];
  startOperatingHour: string;
  endOperatingHour: string;
  active: boolean;
  checkPublicHoliday: (date: Date) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenSendJobMessage: React.Dispatch<React.SetStateAction<boolean>>;
  setForm: React.Dispatch<React.SetStateAction<'job' | 'service'>>;
  setOpenInvoiceForm: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedData: React.Dispatch<React.SetStateAction<any>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  fetchData(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  },
  eventTextHeader: {
    whiteSpace: 'break-spaces',
    fontWeight: 'bold',
    paddingLeft: theme.spacing(1),
    marginTop: 4
  },
  eventText: {
    whiteSpace: 'break-spaces',
    paddingLeft: theme.spacing(1)
  },
  eventSequence: {
    whiteSpace: 'break-spaces',
    fontWeight: 'bold',
    paddingLeft: theme.spacing(1)
  },
  eventFooter: {
    whiteSpace: 'break-spaces',
    fontWeight: 'bold',
    padding: theme.spacing(1)
  },
  buttonInfo: {
    color: '#737373',
    padding: 0,
    marginRight: 4,
    marginTop: 4
  },
  unassignedColor: {
    backgroundColor: '#979797',
    width: '100%',
    height: 10
  },
  confirmedColor: {
    backgroundColor: '#EF965A',
    width: '100%',
    height: 10
  },
  assignedColor: {
    backgroundColor: '#3788D8',
    width: '100%',
    height: 10
  },
  inprogressColor: {
    backgroundColor: '#53A0BE',
    width: '100%',
    height: 10
  },
  pausedColor: {
    backgroundColor: '#BCD4D4',
    width: '100%',
    height: 10
  },
  completedColor: {
    backgroundColor: '#4CAF50',
    width: '100%',
    height: 10
  },
  cancelledColor: {
    backgroundColor: '#B20808',
    width: '100%',
    height: 10
  },
  chip: {
    margin: '6px 0 4px 6px',
    minWidth: 50
  }
}));

const VehicleSchedule: FC<Props> = props => {
  const classes = useStyles();
  const {
    isLoadingData,
    initialView,
    selectedDate,
    events,
    setEvents,
    resources,
    startOperatingHour,
    endOperatingHour,
    active,
    checkPublicHoliday,
    setSelectedIndex,
    setOpenForm,
    setOpenSendJobMessage,
    setForm,
    setOpenInvoiceForm,
    setClickedData,
    handleSnackbar,
    fetchData
  } = props;
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openEvent, setOpenEvent] = useState<boolean>(false);
  const [selectedInfo, setSelectedInfo] = useState<any>();

  useEffect(() => {
    checkPublicHoliday(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleOpenEditJobModal = (jobIndex: number) => {
    setSelectedIndex(jobIndex);
    setOpenForm(true);
    setForm('job');
    setOpenEvent(false);
  };
  const handleViewInvoice = (invoiceId: number) => {
    window.open(`/invoices/${invoiceId}`, '_blank');
    setOpenEvent(false);
  };

  const handleOpenInvoiceForm = (jobIndex: number) => {
    setSelectedIndex(jobIndex);
    setOpenInvoiceForm(true);
    setOpenEvent(false);
  };

  const handleSendJobMessage = (jobIndex: number) => {
    setSelectedIndex(jobIndex);
    setAnchorEl(null);
    setOpenSendJobMessage(true);
  };

  const handleUnassigned = async (jobId: number, start?: Date, end?: Date) => {
    const newStartDateTime = `${format(new Date(start!), 'yyyy-MM-dd HH:mm:00')}`;
    const newEndDateTime = `${format(new Date(end!), 'yyyy-MM-dd HH:mm:00')}`;

    try {
      await axios.put(
        GET_EDIT_JOB_URL(jobId),
        {
          employee: [],
          vehicleJobs: [],
          jobStatus: 'UNASSIGNED',
          startDateTime: newStartDateTime,
          endDateTime: newEndDateTime
        },
        { cancelToken: cancelTokenSource.token }
      );
      handleSnackbar('success', 'Successfully edit job');
      fetchData();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed to edit job');
    }
  };

  const handleDrop = (jobIndex: number, resource: string[], start: Date, end?: Date) => {
    const getResource = resources.filter(res => resource.includes(res.id.toString()));
    const currentEvent = [...events];
    if (getResource[0].id !== 0) {
      const newVehicleSelected = getResource.map(value => ({ id: value.id, name: value.title }));

      currentEvent[jobIndex].vehicleSelected = newVehicleSelected;
      currentEvent[jobIndex].jobStatus = JobStatus.ASSIGNED;
      currentEvent[jobIndex].start = start;
      currentEvent[jobIndex].end = end;
      currentEvent[jobIndex].start = start;
      currentEvent[jobIndex].end = end;
      setSelectedIndex(jobIndex);
      setOpenForm(true);
    } else {
      currentEvent[jobIndex].employeesSelected = [];
      currentEvent[jobIndex].vehicleSelected = [];
      currentEvent[jobIndex].resourceIds = ['0'];
      currentEvent[jobIndex].employees = '-';
      currentEvent[jobIndex].vehicles = '-';
      currentEvent[jobIndex].color = '#ffffff';
      currentEvent[jobIndex].textColor = '#000000';
      currentEvent[jobIndex].jobStatus = JobStatus.UNASSIGNED;
      currentEvent[jobIndex].start = start;
      currentEvent[jobIndex].end = end;
      handleUnassigned(currentEvent[jobIndex].jobId, new Date(start), new Date(end!));
      setEvents(currentEvent);
      handleSnackbar('success', 'Successfully edit job');
    }
  };

  const renderInnerContent = (innerProps: any) => {
    const jobStatus = innerProps.event.extendedProps.jobStatus;
    const jobLabels = innerProps.event.extendedProps.jobLabels;
    return (
      <div className='fc-event-main-frame'>
        {innerProps.timeText && <div className='fc-event-time'>{innerProps.timeText}</div>}
        <div className='fc-event-title-container'>
          <div
            className='fc-event-title fc-sticky'
            style={{
              width: '100%',
              paddingLeft: 0,
              paddingRight: 0,
              border: '#C4C4C4 solid 1px',
              borderRadius: 4,
              height: initialView.includes('resourceTimeGridDay') ? '100%' : ''
            }}
          >
            <Divider
              className={
                jobStatus === 'COMPLETED'
                  ? classes.completedColor
                  : jobStatus === 'ASSIGNED'
                  ? classes.assignedColor
                  : jobStatus === 'IN_PROGRESS'
                  ? classes.inprogressColor
                  : jobStatus === 'PAUSED'
                  ? classes.pausedColor
                  : jobStatus === 'CONFIRMED'
                  ? classes.confirmedColor
                  : jobStatus === 'CANCELLED'
                  ? classes.cancelledColor
                  : classes.unassignedColor
              }
            />
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <div className={classes.eventTextHeader}>{innerProps.event.title || <Fragment>&nbsp;</Fragment>}</div>
                <div className={classes.eventSequence}>Sequence: {innerProps.event.extendedProps.jobSequence || <Fragment>&nbsp;</Fragment>}</div>
                <div className={classes.eventText}>{innerProps.event.extendedProps.serviceAddress || <Fragment>&nbsp;</Fragment>}</div>
                <div className={classes.eventText}>Technicians: {innerProps.event.extendedProps.employees || <Fragment>&nbsp;</Fragment>}</div>
                <div className={classes.eventText}>Vehicles: {innerProps.event.extendedProps.vehicles || <Fragment>&nbsp;</Fragment>}</div>
                <div className={classes.eventText}>
                  {jobLabels &&
                    jobLabels.map((value: any) => (
                      <Chip
                        label={value.name}
                        color='primary'
                        size='small'
                        style={{ color: value.color, backgroundColor: `${value.color}40`, width: 70 }}
                        className={classes.chip}
                      />
                    ))}
                </div>
              </Grid>
              <Grid item xs={2}>
                <Grid container direction='row' justify='flex-end' alignItems='center'>
                  <Tooltip title='View Job Detail' arrow placement='right'>
                    <IconButton
                      className={classes.buttonInfo}
                      onClick={() => {
                        window.open(`/jobs/${innerProps.event.extendedProps.jobId}`, '_blank');
                        setOpenEvent(false);
                      }}
                    >
                      <InfoIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='View on Map' arrow placement='right'>
                    <IconButton
                      className={classes.buttonInfo}
                      onClick={() => {
                        window.open(`https://maps.google.com/maps?q=Singapore ${innerProps.event.extendedProps.postalCode}`, '_blank');
                        setOpenEvent(false);
                      }}
                    >
                      <MarkerIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                  {innerProps.event.extendedProps.jobStatus !== 'COMPLETED' && (
                    <Tooltip title='Edit Job' arrow placement='right'>
                      <IconButton
                        className={classes.buttonInfo}
                        onClick={() => {
                          handleOpenEditJobModal(innerProps.event.extendedProps.index);
                          setOpenEvent(false);
                        }}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title='Send Job Message' arrow placement='right'>
                    <IconButton className={classes.buttonInfo} onClick={() => handleSendJobMessage(innerProps.event.extendedProps.index)}>
                      <SendIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider />
                <div className={classes.eventFooter}>
                  <Typography variant='caption' style={{ fontSize: 10, fontWeight: 'bold' }}>
                    Job Amount Collected:
                    {innerProps.event.extendedProps.collectedAmount ? (
                      <NumberFormat
                        value={innerProps.event.extendedProps.collectedAmount}
                        displayType={'text'}
                        thousandSeparator={true}
                        prefix={'$'}
                        fixedDecimalScale={true}
                      />
                    ) : (
                      <NumberFormat value={0} displayType={'text'} thousandSeparator={true} prefix={'$'} fixedDecimalScale={true} />
                    )}{' '}
                    {innerProps.event.extendedProps.paymentMethod
                      ? `(${innerProps.event.extendedProps.jobAmount > 0 ? ucWords(innerProps.event.extendedProps.paymentMethod) : 'Not Chargeable'})`
                      : `(${innerProps.event.extendedProps.jobAmount === 0 ? 'Not Chargeable' : 'Unpaid'})`}
                  </Typography>
                </div>
                <div className={classes.eventFooter}>
                  {innerProps.event.extendedProps.invoiceNumber ? (
                    <>
                      <Typography variant='caption' style={{ fontSize: 11 }}>
                        Inv.{' '}
                      </Typography>
                      <Tooltip title='View Invoice Detail'>
                        <Link
                          component='button'
                          color='primary'
                          style={{ textAlign: 'left', fontSize: 11 }}
                          onClick={() => handleViewInvoice(innerProps.event.extendedProps.invoiceId)}
                        >
                          <Typography variant='caption' style={{ fontSize: 11 }}>
                            {innerProps.event.extendedProps.invoiceNumber}
                          </Typography>
                        </Link>
                      </Tooltip>
                      <Tooltip title={'Edit Invoice Number'}>
                        <IconButton size='small' onClick={() => handleOpenInvoiceForm(innerProps.event.extendedProps.index)}>
                          <EditInvoiceIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <div>
                        <Typography
                          variant='caption'
                          style={{
                            fontSize: 11,
                            fontStyle: 'italic',
                            fontWeight: 'bold',
                            color:
                              innerProps.event.extendedProps.invoiceStatus === 'FULLY PAID'
                                ? theme.palette.success.main
                                : innerProps.event.extendedProps.invoiceStatus === 'PARTIALLY PAID'
                                ? theme.palette.secondary.main
                                : theme.palette.error.main
                          }}
                        >
                          {ucWords(innerProps.event.extendedProps.invoiceStatus)}
                        </Typography>
                      </div>
                    </>
                  ) : (
                    <Button
                      color='primary'
                      variant='contained'
                      size='small'
                      disableElevation
                      style={{ textTransform: 'none', fontSize: 11 }}
                      onClick={() => handleOpenInvoiceForm(innerProps.event.extendedProps.index)}
                    >
                      Generate Inv.
                    </Button>
                  )}
                </div>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    );
  };

  const handleClick = (info: any) => {
    setSelectedInfo(info);
    setAnchorEl(info.el);
    setOpenEvent(true);
  };

  const handleClose = (event: any) => {
    event.preventDefault();
    setOpenEvent(false);
  };

  const renderPopoverEvent = (innerProps: any) => {
    const jobStatus = innerProps.event.extendedProps.jobStatus;
    const jobLabels = innerProps.event.extendedProps.jobLabels;

    return (
      <Popover
        id='popover'
        open={openEvent}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableRestoreFocus
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        PaperProps={{
          style: { width: 350 }
        }}
      >
        <div className='fc-event-main-frame'>
          {innerProps.timeText && <div className='fc-event-time'>{innerProps.timeText}</div>}
          <div className='fc-event-title-container'>
            <div
              className='fc-event-title fc-sticky'
              style={{ width: '100%', paddingLeft: 0, paddingRight: 0, border: '#C4C4C4 solid 1px', borderRadius: 4 }}
            >
              <Divider
                className={
                  jobStatus === 'COMPLETED'
                    ? classes.completedColor
                    : jobStatus === 'ASSIGNED'
                    ? classes.assignedColor
                    : jobStatus === 'IN_PROGRESS'
                    ? classes.inprogressColor
                    : jobStatus === 'PAUSED'
                    ? classes.pausedColor
                    : jobStatus === 'CONFIRMED'
                    ? classes.confirmedColor
                    : jobStatus === 'CANCELLED'
                    ? classes.cancelledColor
                    : classes.unassignedColor
                }
              />
              <Grid container spacing={2}>
                <Grid item xs={10}>
                  <div className={classes.eventTextHeader}>{innerProps.event.title || <Fragment>&nbsp;</Fragment>}</div>
                  <div className={classes.eventSequence}>Sequence: {innerProps.event.extendedProps.jobSequence || <Fragment>&nbsp;</Fragment>}</div>
                  <div className={classes.eventText}>{innerProps.event.extendedProps.serviceAddress || <Fragment>&nbsp;</Fragment>}</div>
                  <div className={classes.eventText}>Technicians: {innerProps.event.extendedProps.employees || <Fragment>&nbsp;</Fragment>}</div>
                  <div className={classes.eventText}>Vehicles: {innerProps.event.extendedProps.vehicles || <Fragment>&nbsp;</Fragment>}</div>
                  <div className={classes.eventText}>
                    {jobLabels &&
                      jobLabels.map((value: any) => (
                        <Chip
                          label={value.name}
                          color='primary'
                          size='small'
                          style={{ color: value.color, backgroundColor: `${value.color}40` }}
                          className={classes.chip}
                        />
                      ))}
                  </div>
                </Grid>
                <Grid item xs={2}>
                  <Grid container direction='row' justify='flex-end' alignItems='center'>
                    <Tooltip title='View Job Detail' arrow placement='right'>
                      <IconButton
                        className={classes.buttonInfo}
                        onClick={() => {
                          window.open(`/jobs/${innerProps.event.extendedProps.jobId}`, '_blank');
                          setOpenEvent(false);
                        }}
                      >
                        <InfoIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='View on Map' arrow placement='right'>
                      <IconButton
                        className={classes.buttonInfo}
                        onClick={() => {
                          window.open(`https://maps.google.com/maps?q=Singapore ${innerProps.event.extendedProps.postalCode}`, '_blank');
                          setOpenEvent(false);
                        }}
                      >
                        <MarkerIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    {innerProps.event.extendedProps.jobStatus !== 'COMPLETED' && (
                      <Tooltip title='Edit Job' arrow placement='right'>
                        <IconButton
                          className={classes.buttonInfo}
                          onClick={() => {
                            handleOpenEditJobModal(innerProps.event.extendedProps.index);
                            setOpenEvent(false);
                          }}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title='Send Job Message' arrow placement='right'>
                      <IconButton className={classes.buttonInfo} onClick={() => handleSendJobMessage(innerProps.event.extendedProps.index)}>
                        <SendIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                  <div className={classes.eventFooter}>
                    <Typography variant='caption' style={{ fontWeight: 'bold' }}>
                      Job Amount Collected:
                      {innerProps.event.extendedProps.collectedAmount ? (
                        <NumberFormat
                          value={innerProps.event.extendedProps.collectedAmount}
                          displayType={'text'}
                          thousandSeparator={true}
                          prefix={'$'}
                          fixedDecimalScale={true}
                        />
                      ) : (
                        <NumberFormat value={0} displayType={'text'} thousandSeparator={true} prefix={'$'} fixedDecimalScale={true} />
                      )}{' '}
                      {innerProps.event.extendedProps.paymentMethod
                        ? `(${
                            innerProps.event.extendedProps.jobAmount > 0 ? ucWords(innerProps.event.extendedProps.paymentMethod) : 'Not Chargeable'
                          })`
                        : `(${innerProps.event.extendedProps.jobAmount === 0 ? 'Not Chargeable' : 'Unpaid'})`}
                    </Typography>
                  </div>
                  <div className={classes.eventFooter}>
                    {innerProps.event.extendedProps.invoiceNumber ? (
                      <Grid container spacing={1}>
                        <Grid item xs={9}>
                          <Typography variant='caption'>Inv. </Typography>
                          <Tooltip title='View Invoice Detail'>
                            <Link
                              component='button'
                              color='primary'
                              style={{ textAlign: 'left' }}
                              onClick={() => handleViewInvoice(innerProps.event.extendedProps.invoiceId)}
                            >
                              <Typography variant='caption'>{innerProps.event.extendedProps.invoiceNumber}</Typography>
                            </Link>
                          </Tooltip>
                          <Tooltip title={'Edit Invoice Number'}>
                            <IconButton size='small' onClick={() => handleOpenInvoiceForm(innerProps.event.extendedProps.index)}>
                              <EditInvoiceIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                        <Grid item container xs={3} justify='flex-end'>
                          <div>
                            <Typography
                              variant='caption'
                              style={{
                                fontStyle: 'italic',
                                fontWeight: 'bold',
                                color:
                                  innerProps.event.extendedProps.invoiceStatus === 'FULLY PAID'
                                    ? theme.palette.success.main
                                    : innerProps.event.extendedProps.invoiceStatus === 'PARTIALLY PAID'
                                    ? theme.palette.secondary.main
                                    : theme.palette.error.main
                              }}
                            >
                              {ucWords(innerProps.event.extendedProps.invoiceStatus)}
                            </Typography>
                          </div>
                        </Grid>
                      </Grid>
                    ) : (
                      <Button
                        color='primary'
                        variant='contained'
                        size='small'
                        disableElevation
                        style={{ textTransform: 'none', fontSize: 11 }}
                        onClick={() => handleOpenInvoiceForm(innerProps.event.extendedProps.index)}
                      >
                        Generate Inv.
                      </Button>
                    )}
                  </div>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      </Popover>
    );
  };

  const handleDateClick = (args: any) => {
    setClickedData({
      employeeId: 0,
      employeeName: '',
      vehicleId: Number(args.resource.id),
      vehicleNumber: args.resource.title,
      startDateTime: args.start,
      endDateTime: args.end
    });
    setOpenForm(true);
    setForm('service');
  };

  return (
    <Fragment>
      <Backdrop className={classes.backdrop} open={isLoadingData}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <style>
        {`/* Custom CSS styles here */
            .fc-day-today {
                    background-color: #ffffff !important;
                }
        `}
      </style>
      <FullCalendar
        schedulerLicenseKey='CC-Attribution-NonCommercial-NoDerivatives'
        expandRows={true}
        height={700}
        editable={true}
        selectable={initialView === 'resourceTimeline' || initialView === 'resourceTimeGridDay'}
        selectOverlap={false}
        plugins={[
          resourceTimelinePlugin,
          resourceTimeGridPlugin,
          dayGridPlugin,
          timeGridPlugin,
          listPlugin,
          multiMonthPlugin,
          interactionPlugin,
          adaptivePlugin
        ]}
        initialDate={selectedDate}
        initialView={initialView}
        allDaySlot={false}
        weekends={true}
        views={{
          resourceTimeline: {
            slotLabelFormat: { hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: true }
          },
          resourceTimeGrid: {
            slotLabelFormat: { hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: true },
            eventTimeFormat: { hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: true }
          },
          dayGridWeek: {
            dayHeaderContent: ({ date }) => {
              return format(date, 'EEE, dd-MM-yyyy');
            },
            eventTimeFormat: { hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: true }
          },
          dayGridMonth: { eventTimeFormat: { hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: true } },
          listMonth: { eventTimeFormat: { hour: 'numeric', minute: '2-digit', omitZeroMinute: false, meridiem: true } }
        }}
        nowIndicator={true}
        firstDay={1}
        scrollTime={new Date().toTimeString()}
        stickyHeaderDates
        slotMinWidth={40}
        slotDuration='00:30:00'
        slotMinTime={active ? '00:00:00' : startOperatingHour}
        slotMaxTime={active ? '24:00:00' : endOperatingHour}
        dayMaxEventRows={false}
        headerToolbar={false}
        stickyFooterScrollbar={true}
        resourceAreaHeaderContent='Vehicles'
        resources={resources}
        resourceOrder='index'
        resourceAreaWidth='10%'
        events={events}
        eventDurationEditable={false}
        eventDrop={info => {
          handleDrop(
            info.event.extendedProps.index,
            info.event._def.resourceIds ? info.event._def.resourceIds : [],
            info.event.start || new Date(),
            info.event.end || new Date()
          );
        }}
        eventClick={info => {
          handleClick(info);
        }}
        eventContent={value => {
          return (
            <Tooltip
              arrow
              placement='top'
              enterDelay={500}
              title={
                <Grid container>
                  <Grid spacing={2}>
                    <Typography variant='subtitle1' align='center'>
                      JOB ID #{value.event.extendedProps.jobId} ({value.event.extendedProps.jobStatus}) - {value.event.extendedProps.jobSequence}
                    </Typography>
                  </Grid>
                  <Grid component='label' container spacing={2}>
                    <Grid item xs={4}>
                      Client Name:
                    </Grid>
                    <Grid item xs={8}>
                      {value.event.extendedProps.clientName}
                    </Grid>
                  </Grid>
                  <Grid component='label' container spacing={2}>
                    <Grid item xs={4}>
                      Service Address:
                    </Grid>
                    <Grid item xs={8}>
                      {value.event.extendedProps.serviceAddress}
                    </Grid>
                  </Grid>
                  <Grid component='label' container spacing={2}>
                    <Grid item xs={4}>
                      Quotation:
                    </Grid>
                    <Grid item xs={8}>
                      {value.event.extendedProps.contract}
                    </Grid>
                  </Grid>
                  <Grid component='label' container spacing={2}>
                    <Grid item xs={4}>
                      Technicians:
                    </Grid>
                    <Grid item xs={8}>
                      {value.event.extendedProps.employees}
                    </Grid>
                  </Grid>
                  <Grid component='label' container spacing={2}>
                    <Grid item xs={4}>
                      Vehicles:
                    </Grid>
                    <Grid item xs={8}>
                      {value.event.extendedProps.vehicles}
                    </Grid>
                  </Grid>
                  <Grid component='label' container spacing={2}>
                    <Grid item xs={4}>
                      Service Items:
                    </Grid>
                    <Grid item xs={8}>
                      {value.event.extendedProps.serviceItems}
                    </Grid>
                  </Grid>
                </Grid>
              }
            >
              {renderInnerContent(value)}
            </Tooltip>
          );
        }}
        select={handleDateClick}
      />
      {openEvent && renderPopoverEvent(selectedInfo)}
    </Fragment>
  );
};

export default VehicleSchedule;
