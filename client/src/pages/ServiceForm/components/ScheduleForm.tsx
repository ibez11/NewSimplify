import React, { FC, Fragment, MouseEventHandler, useContext, useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
  Chip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { convertTz, disablePrevDates, getNewDate, getNumberWithOrdinal, ucWords } from 'utils';
import { grey } from '@material-ui/core/colors';
import { ServiceBody } from 'typings/body/ServiceBody';
import { isValid, addMonths, format, isBefore, addHours, getDay, isSameDay, addDays } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { RepeatType, ServiceType } from 'constants/enum';
import theme from 'theme';
import HeaderRow from 'components/HeaderRow';
import { dummySchedule } from 'constants/dummy';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { GENERATE_SCHEDULE_URL, GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL } from 'constants/url';
import axios, { CancelTokenSource } from 'axios';
import ScheduleTabPanel from './components/ScheduleTabPanel';
import { Skeleton } from '@material-ui/lab';
import NumberFormat from 'react-number-format';
import NumberFormatCustom from 'components/NumberFormatCustom';
import { PublicHolidayContext } from 'contexts/PublicHolidayContext';
import CustomizedDialog from 'components/CustomizedDialog';

interface Props {
  serviceItemMaster: ServiceItemModel[];
  service: ServiceBody;
  setService: React.Dispatch<React.SetStateAction<ServiceBody>>;
  jobGenerate: JobGenerateModel[];
  setJobGenerate: React.Dispatch<React.SetStateAction<JobGenerateModel[]>>;
  error: any[];
  setError: React.Dispatch<React.SetStateAction<any[]>>;
  handleSnackbar(variant: 'success' | 'error', message: string, isCountdown?: boolean): void;
}

const useStyles = makeStyles(() => ({
  card: {
    margin: 'auto',
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  required: {
    color: 'red'
  },
  noneBorder: {
    borderStyle: 'none'
  },
  discountField: {
    textAlign: 'right',
    width: 50,
    padding: 8
  }
}));

const ScheduleForm: FC<Props> = props => {
  const classes = useStyles();
  const { serviceItemMaster, service, setService, jobGenerate, setJobGenerate, handleSnackbar } = props;

  const { serviceType, termStart, termEnd, contractAmount, discountAmount, needGST, gstTax, gstAmount, totalAmount } = service;
  const { holidays } = useContext(PublicHolidayContext);

  const [equipmentMaster, setEquipmentMaster] = useState<EquipmentModel[]>([]);

  const termDurationMaster = [
    { value: 6, name: '6 Months' },
    { value: 12, name: '1 Year' },
    { value: 24, name: '2 Year' },
    { value: 0, name: 'Custom' }
  ];
  const defaultStartTime = getNewDate(termStart);
  const currentMinute = getNewDate(termStart).getMinutes();
  const modMinute = currentMinute % 15;
  const newStartMinute = modMinute === 0 ? currentMinute : currentMinute + (15 - modMinute);
  defaultStartTime.setMinutes(newStartMinute);
  const defaultEndTime = addHours(defaultStartTime, 1);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [termDuration, setTermDuration] = useState<number>(12);
  const [selectedTab, setSelectedTab] = useState<any>(0);
  const [activeGenerate, setActiveGenerate] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<ScheduleModel[]>([{ ...dummySchedule, startDateTime: defaultStartTime, endDateTime: defaultEndTime }]);
  const [firstDateTimeService, setFirstDateTimeService] = useState<Date>(defaultStartTime);

  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [tempGenerate, setTempGenerate] = useState<any>({ jobGenerate: [], schedules: [], firstJobDate: '', lastJobDate: '' });
  const [holidaysDate, setHolidaysDate] = useState<any[]>([]);

  useEffect(() => {
    if (!service) {
      return;
    }

    const { serviceAddressId, Schedules } = service;

    if (Schedules[0].ServiceItems.length > 0) {
      setSchedules(Schedules);
    }

    const getEquipmentsTemplate = async () => {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      const { data } = await axios.get(`${GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL(serviceAddressId)}`, { cancelToken: cancelTokenSource.token });

      let equipmentData: EquipmentModel[] = [];
      if (data.equipments.length > 0) {
        equipmentData = data.equipments;
      }
      equipmentData = equipmentData.sort((a, b) => a.brand.localeCompare(b.brand));
      setEquipmentMaster(equipmentData);
    };

    getEquipmentsTemplate();
    const element = document.getElementById('settingUp');
    element!.scrollIntoView();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeServiceType = (value: string) => {
    if (value === ServiceType.ADHOC) {
      const startDateTime = new Date(`${format(new Date(), 'yyyy-MM-dd')} ${format(firstDateTimeService, 'HH:mm:00')}`);
      setFirstDateTimeService(startDateTime);
      setSchedules(schedules => {
        schedules.map(value => (value.repeatType = RepeatType.ADHOC));
        return [...schedules];
      });
    } else {
      setSchedules(schedules => {
        schedules.map(value => (value.repeatType = RepeatType.DAILY));
        return [...schedules];
      });
    }
    setTermDuration(value === ServiceType.ADHOC ? 0 : 12);
    setService({ ...service, serviceType: value, termEnd: value === ServiceType.ADHOC ? new Date() : addMonths(new Date(termStart), 12) });
  };

  const handleChangeDuration = (value: number) => {
    if (value !== 0) {
      const newTermEnd = addMonths(new Date(termStart), value);
      setService({
        ...service,
        termEnd: newTermEnd
      });
    } else {
      setService({
        ...service,
        termEnd: termStart
      });
    }
    setTermDuration(value);
  };

  const handleTermStartChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const newTermEnd = addMonths(new Date(date), termDuration);
      if (isBefore(firstDateTimeService, termStart)) {
        const startDateTime = new Date(`${format(new Date(date), 'yyyy-MM-dd')} ${format(firstDateTimeService, 'HH:mm:00')}`);
        setFirstDateTimeService(startDateTime);
      }
      setService({
        ...service,
        termStart: date,
        termEnd: newTermEnd
      });
    }
  };

  const handleTermEndChange = (date: Date | null) => {
    if (date && isValid(date)) {
      setService({
        ...service,
        termEnd: date
      });
    }

    // setTermEndError('');
  };

  const handleAddSchedule = () => {
    const currentSchedules = [...schedules];
    const repeatType = serviceType === ServiceType.ADHOC ? ServiceType.ADHOC : RepeatType.DAILY;
    const newSchedule = { ...dummySchedule, repeatType, startDateTime: defaultStartTime, endDateTime: defaultEndTime };
    currentSchedules.push({ ...newSchedule });
    setSelectedTab(currentSchedules.length - 1);
    // setSelectedSchedule(currentSchedules[currentSchedules.length - 1]);
    setSchedules(currentSchedules);
    setActiveGenerate(true);
  };

  const handleDeleteSchedule = (index: number): MouseEventHandler => event => {
    event.stopPropagation();
    const currentSchedules = [...schedules];
    currentSchedules.splice(index, 1);
    setSelectedTab(currentSchedules.length - 1);
    setSchedules(currentSchedules);
    setActiveGenerate(true);
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const validateSchedule = () => {
    return schedules.every(value => value.ServiceItems.length > 0);
  };

  const saveData = (jobs: any[], schedules: ScheduleModel[], isNextDay: boolean, holidayData?: any[]) => {
    const jobsData: JobGenerateModel[] = [];
    let contractAmount = 0;
    const gst = gstTax || 0;
    let totalGstAmount = 0;
    let totalDiscountAmount = discountAmount ? discountAmount : 0;
    let totalAmountServiceItem = 0;

    jobs.map((job: any) => {
      return job.ServiceItems.map((value: any) => {
        return (contractAmount = Number((contractAmount + value.totalPrice).toFixed(2)));
      });
    });

    totalAmountServiceItem = Number((contractAmount - totalDiscountAmount).toFixed(2));

    if (needGST) {
      totalGstAmount = Number(((totalAmountServiceItem * gst) / 100).toFixed(2));
    }

    jobs.map((job: any) => {
      return jobsData.push({
        id: 0,
        startDateTime: job.startDateTime,
        endDateTime: job.endDateTime,
        jobStatus: 'UNASSIGNED',
        ServiceItems: job.ServiceItems,
        occurance: job.occurance,
        duration: job.duration
      });
    });

    setJobGenerate(jobsData);
    // setSchedules(schedules);
    setService({
      ...service,
      contractAmount: contractAmount,
      gstAmount: totalGstAmount,
      totalAmount: Number((totalAmountServiceItem + totalGstAmount).toFixed(2)),
      Schedules: schedules,
      isNextDay,
      holidaysDate: holidayData
    });
    setIsLoading(false);
  };

  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    if (!validateSchedule()) {
      handleSnackbar('error', 'Please enter service item into schedule');
      setIsLoading(false);
      return;
    }
    try {
      const newSchedules: ScheduleModel[] = JSON.parse(JSON.stringify(schedules));
      Promise.all(
        newSchedules.map(value => {
          value.startDateTime = convertTz(new Date(value.startDateTime!));
          value.endDateTime = convertTz(new Date(value.endDateTime!));
          return value;
        })
      );
      const { data } = await axios.post(`${GENERATE_SCHEDULE_URL}`, { Schedules: newSchedules }, { cancelToken: cancelTokenSource.token });
      const generatedJobs = data.jobs;
      const firstJobDate = format(new Date(data.firstJobDate), 'yyyy-MM-dd');
      const lastJobDate = format(new Date(data.lastJobDate), 'yyyy-MM-dd');

      let isHoliday = false;
      let holidaysDate: any[] = [];
      // eslint-disable-next-line array-callback-return
      generatedJobs.map((job: any) => {
        //check date is sunday or ph
        const isSunday = getDay(new Date(job.startDateTime)) === 0;
        const isPublicHoliday = holidays.some(value => isSameDay(new Date(value.date), new Date(job.startDateTime)));

        if (isSunday || isPublicHoliday) {
          isHoliday = true;
          holidaysDate.push({ date: new Date(job.startDateTime), name: format(new Date(job.startDateTime), 'dd-MM-yyyy') });
        }
      });

      if (!isHoliday) {
        saveData(generatedJobs, newSchedules, false);
      } else {
        setTempGenerate({ jobGenerate: generatedJobs, schedules: newSchedules, firstJobDate, lastJobDate });
        setHolidaysDate(holidaysDate);
        setOpenConfirmation(true);
      }
    } catch (err) {
      console.log(err);
    }

    setIsLoading(false);
    setActiveGenerate(false);
  };

  const handleConfirmNextDay = () => {
    setIsLoading(true);
    const { jobGenerate, schedules, firstJobDate, lastJobDate } = tempGenerate;
    const newJobs = jobGenerate;
    let newFirstJobDate = new Date(firstJobDate);

    let holidayData: any[] = holidaysDate;

    holidaysDate.map(value => {
      const getIndex = newJobs.findIndex((job: any) => isSameDay(new Date(job.startDateTime), new Date(value.date)));
      const getJob = newJobs.find((job: any) => isSameDay(new Date(job.startDateTime), new Date(value.date)));
      if (getIndex !== -1) {
        let newStartJobDate = new Date(getJob.startDateTime);
        let newEndJobDate = new Date(getJob.endDateTime);

        // eslint-disable-next-line no-loop-func
        while (getDay(newStartJobDate) === 0 || holidays.some(value => isSameDay(new Date(value.date), newStartJobDate))) {
          newStartJobDate = addDays(newStartJobDate, 1);
          newEndJobDate = addDays(newEndJobDate, 1);
          // eslint-disable-next-line no-loop-func
          const newHolidayDate = holidays.find(value => isSameDay(new Date(value.date), newStartJobDate));
          if (newHolidayDate) {
            holidayData.push({ date: new Date(newHolidayDate.date), name: format(new Date(newHolidayDate.date), 'dd-MM-yyyy') });
          }
        }

        newJobs[getIndex].startDateTime = newStartJobDate;
        newJobs[getIndex].endDateTime = newEndJobDate;
      }
      return newJobs;
    });

    // eslint-disable-next-line no-loop-func
    while (getDay(newFirstJobDate) === 0 || holidays.some(value => isSameDay(new Date(value.date), newFirstJobDate))) {
      newFirstJobDate = addDays(newFirstJobDate, 1);
    }

    if (isSameDay(new Date(firstJobDate), new Date(lastJobDate))) {
      saveData(newJobs, schedules, true, holidayData);
    } else {
      saveData(newJobs, schedules, true, holidayData);
    }
    setOpenConfirmation(false);
    setIsLoading(false);
  };

  const handleChangeDiscount = (value: number) => {
    let totalDiscountAmount = 0;
    let totalGstAmount = 0;
    let grandTotal = totalAmount;

    totalDiscountAmount = value > contractAmount ? contractAmount : value;
    grandTotal = contractAmount - totalDiscountAmount;

    if (needGST) {
      totalGstAmount = Number(((grandTotal * gstTax) / 100).toFixed(2));
      grandTotal = grandTotal + totalGstAmount;
    }

    setService({ ...service, discountAmount: totalDiscountAmount, gstAmount: totalGstAmount, totalAmount: grandTotal });
  };

  const renderSettingUp = () => {
    return (
      <Card variant='outlined' className={classes.card}>
        <CardHeader
          id='settingUp'
          title={<Typography variant='subtitle2'>Setting Up Quotation</Typography>}
          style={{ backgroundColor: grey[200], height: 35 }}
        />
        <CardContent>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={4}>
              <Typography variant='h6'>
                Quotation Type <span className={classes.required}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <FormControl component='fieldset'>
                <RadioGroup
                  aria-label='contractType'
                  name='contractType'
                  value={serviceType}
                  onChange={event => handleChangeServiceType(event.target.value)}
                >
                  <FormControlLabel
                    value={ServiceType.ADHOC}
                    control={<Radio color='primary' />}
                    // disabled={jobGenerate.length > 0 ? true : false}
                    label={
                      <>
                        <Typography variant='body1'>Ad-hoc Service</Typography>
                        <FormHelperText>A job that is done only once without any recurring tasks</FormHelperText>
                      </>
                    }
                  />
                  <FormControlLabel
                    value={ServiceType.CONTRACT}
                    // disabled={jobGenerate.length > 0 ? true : false}
                    control={<Radio color='primary' />}
                    label={
                      <>
                        <Typography variant='body1'>Service Contract</Typography>
                        <FormHelperText>
                          A job that occurs repeatedly based on a pre-defined iteration by specific parameters such as daily, monthly, or yearly.
                        </FormHelperText>
                      </>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {serviceType === ServiceType.CONTRACT && (
              <>
                <Grid item xs={12} md={4}>
                  <Typography variant='h6'>
                    Quotation Term <span className={classes.required}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={1} style={{ marginTop: 8 }}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        select
                        fullWidth
                        required
                        margin='dense'
                        id='termDuration'
                        label='Quotation Duration'
                        value={termDuration}
                        onChange={event => handleChangeDuration(Number(event.target.value))}
                        variant='outlined'
                        autoComplete='off'
                      >
                        {termDurationMaster.map((value, index) => {
                          return (
                            <MenuItem key={index} value={value.value}>
                              {ucWords(value.name)}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          clearable
                          required
                          fullWidth
                          id='termStart'
                          label='Term Start'
                          margin='dense'
                          value={termStart}
                          variant='dialog'
                          inputVariant='outlined'
                          format='dd-MM-yyyy'
                          // error={termStartError !== ''}
                          // helperText={termStartError}
                          onChange={handleTermStartChange}
                          InputAdornmentProps={{ position: 'start' }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          clearable
                          required
                          fullWidth
                          id='termEnd'
                          label='Term End'
                          margin='dense'
                          disabled={termDuration !== 0}
                          shouldDisableDate={disablePrevDates(new Date(termStart !== null ? new Date(termStart).getTime() - 864e5 : ''))}
                          minDate={termStart}
                          value={termEnd}
                          variant='dialog'
                          inputVariant='outlined'
                          format='dd-MM-yyyy'
                          // error={termStartError !== ''}
                          // helperText={termStartError}
                          onChange={handleTermEndChange}
                          InputAdornmentProps={{ position: 'start' }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSettingSchedule = () => {
    return (
      <Card variant='outlined' className={classes.card}>
        <Tabs value={selectedTab} onChange={handleChange} textColor='primary' indicatorColor='primary' selectionFollowsFocus variant='scrollable'>
          {schedules.map((_, index) => (
            <Tab
              value={index}
              label={
                schedules.length > 1 ? (
                  <Fragment key={index}>
                    <Typography variant='body1' style={{ textTransform: 'capitalize' }}>
                      Schedule {index + 1}
                      <Tooltip title='Delete Schedule'>
                        <IconButton size='small' component='span' onClick={handleDeleteSchedule(index)} style={{ marginLeft: 8 }}>
                          <CloseIcon color='error' fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                  </Fragment>
                ) : (
                  <Typography variant='body1' style={{ textTransform: 'capitalize' }}>
                    Schedule {index + 1}
                  </Typography>
                )
              }
            />
          ))}
          <Tooltip title='Add More Schedule'>
            <Button onClick={handleAddSchedule}>
              <AddIcon fontSize='small' color='disabled' />
            </Button>
          </Tooltip>
        </Tabs>
        <Divider />
        <ScheduleTabPanel
          serviceItemMaster={serviceItemMaster}
          equipmentMaster={equipmentMaster}
          service={service}
          setService={setService}
          scheduleIndex={selectedTab}
          schedules={schedules}
          setSchedules={setSchedules}
          setActiveGenerate={setActiveGenerate}
          handleSnackbar={handleSnackbar}
        />
      </Card>
    );
  };

  const renderScheduleSummary = () => {
    const renderFooterSummary = (title: string, value: any) => {
      return (
        <>
          <Grid item container justify='flex-end' xs={11}>
            <Typography variant='body1'>{title}</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={1}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='body1'>
                <NumberFormat
                  value={value || 0}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </Grid>
        </>
      );
    };

    return (
      <Card variant='outlined' className={classes.card}>
        <CardHeader
          title={<Typography variant='subtitle2'>Schedules Summary</Typography>}
          style={{ backgroundColor: theme.palette.primary.main, color: 'white', height: 35 }}
        />
        <CardContent>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={6}>
              <Typography variant='h6'>Generate your schedules for this quotation</Typography>
              <Typography variant='body1' color='textSecondary'>
                After setting up for the schedules and adding service items, continue by click generate to see your schedules summary
              </Typography>
            </Grid>
            <Grid item container justify='flex-end' xs={12} md={6}>
              <Button variant='contained' disableElevation disabled={!activeGenerate} color='secondary' onClick={handleGenerateSchedule}>
                Generate Schedule
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Card variant='outlined' className={classes.card}>
                <CardContent style={{ padding: 0 }}>
                  <Table component='table'>
                    <TableHead>
                      <HeaderRow
                        headers={[
                          { label: 'Schedule', verticalAlign: 'top' },
                          { label: 'Job Occurances', verticalAlign: 'top' },
                          { label: 'Start Date & Time', verticalAlign: 'top' },
                          { label: 'Duration', verticalAlign: 'top' },
                          { label: 'Item & Description', verticalAlign: 'top' },
                          { label: 'Qty', verticalAlign: 'top' },
                          { label: 'Unit Price', verticalAlign: 'top' },
                          { label: 'Amount', verticalAlign: 'top', textAlign: 'right' }
                        ]}
                      />
                    </TableHead>
                    <TableBody>
                      {jobGenerate.length > 0 ? (
                        jobGenerate.map(job =>
                          job.ServiceItems.map((item, itemindex) => (
                            <TableRow>
                              {itemindex === 0 && (
                                <>
                                  <TableCell width={'5%'} rowSpan={job.ServiceItems.length}>
                                    {isLoading ? (
                                      <Skeleton width={'50%'} />
                                    ) : (
                                      <Chip
                                        label={`#${item.scheduleIndex! + 1}`}
                                        style={{ color: theme.palette.secondary.main, background: theme.palette.secondary.light }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell width={'5%'} rowSpan={job.ServiceItems.length}>
                                    {isLoading ? (
                                      <Skeleton width={'50%'} />
                                    ) : (
                                      <Typography variant='body2'>{getNumberWithOrdinal(job.occurance || 1)}</Typography>
                                    )}
                                  </TableCell>
                                  <TableCell width={'15%'} rowSpan={job.ServiceItems.length}>
                                    {isLoading ? (
                                      <Skeleton width={'50%'} />
                                    ) : (
                                      <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                                        {format(new Date(job.startDateTime), `EEE, dd MMM yyyy'\n'hh:mm a`)}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell width={'10%'} rowSpan={job.ServiceItems.length}>
                                    {isLoading ? (
                                      <Skeleton width={'50%'} />
                                    ) : (
                                      <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                                        {(job.duration || 60) / 60 || 1} Hrs
                                      </Typography>
                                    )}
                                  </TableCell>
                                </>
                              )}
                              <TableCell width={'20%'}>
                                {isLoading ? (
                                  <Skeleton width={'50%'} />
                                ) : (
                                  <>
                                    <Typography variant='body2'>{item.name}</Typography>
                                    <Typography variant='caption' color='textSecondary' style={{ whiteSpace: 'pre-line' }}>
                                      {item.description}
                                    </Typography>
                                  </>
                                )}
                              </TableCell>
                              <TableCell width={'8%'}>
                                {isLoading ? (
                                  <Skeleton width={'50%'} />
                                ) : (
                                  <>
                                    <Typography variant='body2'>{item.quantity}</Typography>
                                  </>
                                )}
                              </TableCell>
                              <TableCell width={'10%'}>
                                {isLoading ? (
                                  <Skeleton width={'50%'} />
                                ) : (
                                  <>
                                    <Typography variant='body2'>
                                      <NumberFormat
                                        value={item.unitPrice}
                                        displayType={'text'}
                                        thousandSeparator={true}
                                        prefix={'$'}
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                      />
                                    </Typography>
                                  </>
                                )}
                              </TableCell>
                              <TableCell width={'12%'}>
                                {isLoading ? (
                                  <Skeleton width={'50%'} />
                                ) : (
                                  <>
                                    <Typography variant='body2' align='right'>
                                      <NumberFormat
                                        value={item.totalPrice}
                                        displayType={'text'}
                                        thousandSeparator={true}
                                        prefix={'$'}
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                      />
                                    </Typography>
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align='center'>
                            <Typography variant='body1' color='textSecondary'>
                              No Scheduling Summary
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell colSpan={8} className={classes.noneBorder}>
                          <Grid container spacing={1}>
                            {renderFooterSummary('Quotation Amount', contractAmount)}
                            <Grid item container justify='flex-end' alignItems='center' xs={11}>
                              <Typography variant='body1'>Discount</Typography>
                            </Grid>
                            <Grid item container justify='flex-end' xs={1}>
                              <TextField
                                variant='outlined'
                                margin='dense'
                                id='discountAmount'
                                value={discountAmount}
                                onChange={event => handleChangeDiscount(Number(event.target.value))}
                                InputProps={{
                                  classes: {
                                    input: classes.discountField
                                  },
                                  inputComponent: NumberFormatCustom as any,
                                  inputProps: {
                                    prefix: '$',
                                    thousandSeparator: true,
                                    decimalScale: 2,
                                    fixedDecimalScale: true,
                                    allowNegative: false
                                  }
                                }}
                              />
                            </Grid>
                            {renderFooterSummary('Total Amount', contractAmount - discountAmount)}
                            {renderFooterSummary(`GST ${gstTax}%`, gstAmount)}
                            {renderFooterSummary('Grand Total', totalAmount)}
                          </Grid>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {renderSettingUp()}
      {renderSettingSchedule()}
      {renderScheduleSummary()}
      {openConfirmation && (
        <CustomizedDialog
          isLoading={isLoading}
          open={openConfirmation}
          isConfirmation={true}
          variant='warning'
          message='There is a job(s) that falls on a Sunday/Public Holiday at'
          boldMessage={holidaysDate.length > 0 ? holidaysDate.map(value => value.name).join(', ') : ''}
          secondMessage='Do you want to schedule the job(s) to the next working day?'
          primaryButtonLabel='Yes'
          secondaryButtonLabel='No'
          primaryActionButton={handleConfirmNextDay}
          secondaryActionButton={() => {
            setOpenConfirmation(false);
            saveData(tempGenerate.jobGenerate, tempGenerate.schedules, false);
          }}
          handleClose={() => setOpenConfirmation(false)}
        />
      )}
    </>
  );
};

export default ScheduleForm;
