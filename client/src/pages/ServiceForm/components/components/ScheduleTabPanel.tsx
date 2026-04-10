import React, { FC, useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  CardContent,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { scheduleLabelGenerate } from 'utils';
import { ServiceBody } from 'typings/body/ServiceBody';
import { isValid, format, addMinutes, startOfYear, startOfMonth } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers';
import { RepeatType, ServiceType } from 'constants/enum';
import theme from 'theme';
import HeaderRow from 'components/HeaderRow';
import { dummySchedule, dummyServiceItem } from 'constants/dummy';
import AddIcon from '@material-ui/icons/Add';
import ClockIcon from '@material-ui/icons/Alarm';
import RecurranceIcon from '@material-ui/icons/Update';
import ServiceItemModal from './ServiceItemModal';
import ServiceItemRow from './ServiceItemRow';
import NumberFormat from 'react-number-format';
import CustomizedDialog from 'components/CustomizedDialog';
import RecurrenceForm from './RecurrenceForm';

interface Props {
  serviceItemMaster: ServiceItemModel[];
  equipmentMaster: EquipmentModel[];
  service: ServiceBody;
  setService: React.Dispatch<React.SetStateAction<ServiceBody>>;
  scheduleIndex: number;
  schedules: ScheduleModel[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleModel[]>>;
  setActiveGenerate: React.Dispatch<React.SetStateAction<boolean>>;
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
  scheduleLabel: {
    fontSize: '0.8rem',
    color: 'rgba(0, 0, 0, 0.54)'
  }
}));

const ScheduleTabPanel: FC<Props> = props => {
  const classes = useStyles();
  const {
    serviceItemMaster,
    equipmentMaster,
    service,
    setService,
    scheduleIndex,
    schedules,
    setSchedules,
    setActiveGenerate,
    handleSnackbar
  } = props;

  const { serviceType } = service;
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel>(dummySchedule);

  const hourMaster = Array.from(Array(24).keys());
  const minuteMaster = [0, 15, 30, 45];
  let totalAmount = 0;

  const [dateFormat, setDateFormat] = useState<string>('Days');

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [openItemModal, setOpenItemModal] = useState<boolean>(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [openRepeatModal, setOpenRepeatModal] = useState<boolean>(false);

  useEffect(() => {
    setSelectedSchedule(schedules[scheduleIndex]);
  }, [scheduleIndex, schedules]);

  const handleFirstDateChange = (date: Date | null) => {
    const currentSchedules = schedules;
    const { hour, minute } = selectedSchedule;
    if (date && isValid(date)) {
      if (currentSchedules[scheduleIndex].repeatType === RepeatType.YEARLY) {
        date = startOfYear(date);
      } else if (currentSchedules[scheduleIndex].repeatType === RepeatType.MONTHLY) {
        date = startOfMonth(date);
      }
      const newStartDateTime = date;
      const newEndDateTime = addMinutes(newStartDateTime, hour! * 60 + minute!);
      currentSchedules[scheduleIndex].startDateTime = newStartDateTime;
      currentSchedules[scheduleIndex].endDateTime = newEndDateTime;
      if (serviceType === ServiceType.ADHOC) {
        setService({ ...service, termStart: date, termEnd: date });
      }
      setSelectedSchedule({ ...selectedSchedule, startDateTime: newStartDateTime, endDateTime: newEndDateTime });
      setSchedules(currentSchedules);
    }
    setActiveGenerate(true);
  };

  const handleFirstTimeChange = (date: Date | null) => {
    const currentSchedules = schedules;
    const { startDateTime, hour, minute } = selectedSchedule;
    if (date && isValid(date)) {
      const newStartDateTime = new Date(`${format(new Date(startDateTime!), 'yyyy-MM-dd')} ${format(date!, 'HH:mm:00')}`);
      const newEndDateTime = addMinutes(newStartDateTime, hour! * 60 + minute!);
      currentSchedules[scheduleIndex].startDateTime = newStartDateTime;
      currentSchedules[scheduleIndex].endDateTime = newEndDateTime;
      setSelectedSchedule({ ...selectedSchedule, startDateTime: newStartDateTime, endDateTime: newEndDateTime });
      setSchedules(currentSchedules);
    }
    setActiveGenerate(true);
  };

  const handleChangeHourDuration = (value: number) => {
    const currentSchedules = schedules;
    const { startDateTime, minute } = selectedSchedule;
    const newEndDateTime = addMinutes(startDateTime!, value * 60 + minute!);
    currentSchedules[scheduleIndex].hour = value;
    currentSchedules[scheduleIndex].endDateTime = newEndDateTime;
    setSelectedSchedule({ ...selectedSchedule, hour: value, endDateTime: newEndDateTime });
    setSchedules(currentSchedules);
    setActiveGenerate(true);
  };

  const handleChangeMinuteDuration = (value: number) => {
    const currentSchedules = schedules;
    const { startDateTime, hour } = selectedSchedule;
    const newEndDateTime = addMinutes(startDateTime!, hour! * 60 + value);
    currentSchedules[scheduleIndex].minute = value;
    currentSchedules[scheduleIndex].endDateTime = newEndDateTime;
    setSelectedSchedule({ ...selectedSchedule, minute: value, endDateTime: newEndDateTime });
    setSchedules(currentSchedules);
    setActiveGenerate(true);
  };

  const handleEditServiceItem = (index: number) => {
    setIsEdit(true);
    setSelectedItemIndex(index);
    setOpenItemModal(true);
  };

  const handleDeleteServiceItems = (index: number) => {
    const currentSchedules = [...schedules];
    // Deep clone the ServiceItems array to avoid mutating the original state
    const updatedServiceItems = [...currentSchedules[scheduleIndex].ServiceItems];

    // Delete the item at the specified index from the cloned ServiceItems array
    updatedServiceItems.splice(index, 1);

    // Update the cloned schedules array with the updated ServiceItems array
    currentSchedules[scheduleIndex] = {
      ...currentSchedules[scheduleIndex],
      ServiceItems: updatedServiceItems
    };

    // Set the state with the updated schedules array
    setSchedules(currentSchedules);
    setActiveGenerate(true);
  };

  const handleMoveServiceItem = (index: number, direction: number) => {
    setSchedules(prev => {
      const copy = [...prev];
      const items = [...copy[scheduleIndex].ServiceItems];
      const target = index + direction;
      if (target < 0 || target >= items.length) return copy;
      const temp = items[target];
      items[target] = items[index];
      items[index] = temp;
      copy[scheduleIndex] = { ...copy[scheduleIndex], ServiceItems: items };
      return copy;
    });
    setActiveGenerate(true);
  };

  const handleSubmitModal = (item: ServiceItemModel) => {
    const { ServiceItems } = selectedSchedule;

    if (item.name) {
      if (isEdit) {
        const findSameIndex = ServiceItems.findIndex(
          value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim()
        );

        if (findSameIndex === selectedItemIndex) {
          setSchedules(prev => {
            prev[scheduleIndex].ServiceItems[selectedItemIndex] = item;
            return [...prev];
          });
        } else {
          const findSame = ServiceItems.some(value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim());

          if (!findSame) {
            setSchedules(prev => {
              prev[scheduleIndex].ServiceItems[selectedItemIndex] = item;
              return [...prev];
            });
          } else {
            handleSnackbar('error', 'This item is already added');
            return;
          }
        }
      } else {
        const findSame = ServiceItems.some(value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim());

        if (!findSame) {
          setSchedules(prev => {
            prev[scheduleIndex].ServiceItems = [...prev[scheduleIndex].ServiceItems, item];

            return [...prev];
          });
        } else {
          handleSnackbar('error', 'This item is already added');
          return;
        }
      }

      setActiveGenerate(true);
      setIsEdit(false);
      setOpenItemModal(false);
    } else {
      handleSnackbar('error', 'Please input item');
      return;
    }
  };

  const validateRecurrence = () => {
    let ret = true;
    const { repeatType, repeatOnDay } = selectedSchedule;
    if (repeatType === RepeatType.WEEKLY) {
      if (!repeatOnDay || !repeatOnDay.trim()) {
        handleSnackbar('error', 'Please select at least one day of the week for recurring schedule');
        return (ret = false);
      }
    }
    return ret;
  };

  const handleSubmitRecurrence = () => {
    if (!validateRecurrence()) {
      return;
    }
    const scheduleLabel = scheduleLabelGenerate(selectedSchedule);
    selectedSchedule.scheduleLabel = scheduleLabel;

    setActiveGenerate(true);
    setSchedules(prev => {
      prev[scheduleIndex] = selectedSchedule;

      return [...prev];
    });
    setOpenRepeatModal(false);
  };

  const renderServiceItems = () => {
    return (
      <Grid container spacing={2} alignItems='center' style={{ marginTop: 32 }}>
        <Grid item xs={8}>
          <Typography variant='h6'>Service Items</Typography>
          <Typography variant='body1' color='textSecondary'>
            Please add service items for this schedule on this quotation by click add new service item button
          </Typography>
        </Grid>
        <Grid item container justify='flex-end' xs={4}>
          <Button color='primary' onClick={() => setOpenItemModal(true)}>
            <AddIcon />
            Add Service Items
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Card variant='outlined' className={classes.card}>
            <CardContent style={{ padding: 0 }}>
              <Table component='table'>
                <TableHead>
                  <HeaderRow
                    headers={[
                      { label: '', verticalAlign: 'top' },
                      { label: 'Item & Description', verticalAlign: 'top' },
                      { label: 'Qty', verticalAlign: 'top' },
                      { label: 'Unit Price', verticalAlign: 'top' },
                      { label: 'Amount', verticalAlign: 'top', textAlign: 'right' },
                      { label: 'Action', verticalAlign: 'top', textAlign: 'center' }
                    ]}
                  />
                </TableHead>
                <TableBody>
                  {selectedSchedule.ServiceItems.length > 0 ? (
                    <>
                      {selectedSchedule.ServiceItems.map((value, index) => {
                        totalAmount = totalAmount + value.unitPrice * value.quantity;
                        return (
                          <ServiceItemRow
                            key={index}
                            index={index}
                            item={value}
                            actionButton
                            handleEdit={() => handleEditServiceItem(index)}
                            handleDelete={() => handleDeleteServiceItems(index)}
                            handleMove={handleMoveServiceItem}
                            totalCount={selectedSchedule.ServiceItems.length}
                          />
                        );
                      })}
                      <TableRow>
                        <TableCell colSpan={5} className={classes.noneBorder}>
                          <Grid container spacing={1}>
                            <Grid item container justify='flex-end' xs={11}>
                              <Typography variant='body1'>Total Amount</Typography>
                            </Grid>
                            <Grid item container justify='flex-end' xs={1}>
                              <Typography variant='body1'>
                                <NumberFormat
                                  value={totalAmount || 0}
                                  displayType={'text'}
                                  thousandSeparator={true}
                                  prefix={'$'}
                                  decimalScale={2}
                                  fixedDecimalScale={true}
                                />
                              </Typography>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Typography variant='body1' color='textSecondary'>
                          No Service Items
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <CardContent>
      <Grid container spacing={2} alignItems='center'>
        {serviceType === ServiceType.CONTRACT && (
          <>
            <Grid item xs={12} md={4}>
              <Typography variant='h6'>
                Job Recurrences <span className={classes.required}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              <Button variant='outlined' fullWidth className={classes.scheduleLabel} onClick={() => setOpenRepeatModal(true)}>
                <Grid container>
                  <Grid item container justify='flex-start' xs={11}>
                    {selectedSchedule.scheduleLabel}
                  </Grid>
                  <Grid item container justify='flex-end' xs={1}>
                    <RecurranceIcon />
                  </Grid>
                </Grid>
              </Button>
            </Grid>
          </>
        )}
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>
            First Job Date & Time <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  clearable
                  fullWidth
                  id='serviceDate'
                  label='Start Date'
                  margin='dense'
                  value={selectedSchedule.startDateTime}
                  variant='dialog'
                  inputVariant='outlined'
                  format={
                    selectedSchedule.repeatType === RepeatType.MONTHLY
                      ? 'MM/yyyy'
                      : selectedSchedule.repeatType === RepeatType.YEARLY
                      ? 'yyyy'
                      : 'dd-MM-yyyy'
                  }
                  views={
                    selectedSchedule.repeatType === RepeatType.MONTHLY
                      ? ['year', 'month']
                      : selectedSchedule.repeatType === RepeatType.YEARLY
                      ? ['year']
                      : ['year', 'month', 'date']
                  }
                  openTo={
                    selectedSchedule.repeatType === RepeatType.MONTHLY ? 'month' : selectedSchedule.repeatType === RepeatType.YEARLY ? 'year' : 'date'
                  }
                  // shouldDisableDate={disablePrevDates(new Date(termStart && new Date(termStart).getTime() - 864e5))}
                  // minDate={termStart}
                  // minDateMessage='First Date Service should not be earlier than Term Start Contract'
                  // error={firstDateError !== ''}
                  // helperText={firstDateError}
                  onChange={handleFirstDateChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change date'
                  }}
                  InputAdornmentProps={{ position: 'start' }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardTimePicker
                  fullWidth
                  id='serviceStartTime'
                  label='Start Time'
                  margin='dense'
                  value={selectedSchedule.startDateTime}
                  variant='dialog'
                  inputVariant='outlined'
                  onChange={handleFirstTimeChange}
                  // error={startTimeError !== ''}
                  // helperText={startTimeError}
                  keyboardIcon={<ClockIcon />}
                  minutesStep={15}
                  KeyboardButtonProps={{
                    'aria-label': 'change start time'
                  }}
                  InputAdornmentProps={{ position: 'start' }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>
            Job Duration <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                id='hour'
                label='Hour'
                margin='dense'
                value={selectedSchedule.hour}
                onChange={event => handleChangeHourDuration(Number(event.target.value))}
                variant='outlined'
                autoComplete='off'
              >
                {hourMaster.map(value => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                id='minute'
                label='Minute'
                margin='dense'
                value={selectedSchedule.minute}
                onChange={event => handleChangeMinuteDuration(Number(event.target.value))}
                variant='outlined'
                autoComplete='off'
              >
                {minuteMaster.map(value => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {renderServiceItems()}
      {openItemModal && (
        <ServiceItemModal
          open={openItemModal}
          serviceItemMaster={serviceItemMaster}
          equipmentMaster={equipmentMaster}
          serviceItem={isEdit ? selectedSchedule.ServiceItems[selectedItemIndex] : dummyServiceItem}
          isEdit={isEdit}
          handleSubmitModal={handleSubmitModal}
          handleClose={() => {
            setIsEdit(false);
            setOpenItemModal(false);
          }}
        />
      )}
      {openRepeatModal && (
        <CustomizedDialog
          isLoading={false}
          open={openRepeatModal}
          isConfirmation={false}
          header='Custom Recurrence'
          message=''
          primaryButtonLabel='Save'
          secondaryButtonLabel='Cancel'
          primaryActionButton={handleSubmitRecurrence}
          secondaryActionButton={() => {
            setOpenRepeatModal(false);
          }}
          handleClose={() => {
            setOpenRepeatModal(false);
          }}
        >
          <RecurrenceForm
            schedule={selectedSchedule}
            setSchedule={setSelectedSchedule}
            dateFormat={dateFormat}
            setDateFormat={setDateFormat}
            termStart={service.termStart}
            termEnd={service.termEnd}
          />
        </CustomizedDialog>
      )}
    </CardContent>
  );
};

export default ScheduleTabPanel;
