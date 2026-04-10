import React, { FC, Fragment, useEffect, useState } from 'react';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import {
  ButtonBase,
  Checkbox,
  createStyles,
  FormControlLabel,
  Grid,
  makeStyles,
  MenuItem,
  TextField,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';
// import { convertToHTML } from 'draft-convert';
// import MUIRichTextEditor from 'mui-rte';
import ActionSnackbar from 'components/ActionSnackbar';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import LoadingButton from 'components/LoadingButton';
import UploadIcon from '@material-ui/icons/AddPhotoAlternate';
import ClockIcon from '@material-ui/icons/Alarm';
import theme from 'theme';
import { KeyboardTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import NumberFormatCustom from 'components/NumberFormatCustom';
import axios, { CancelTokenSource } from 'axios';
import { BOOKING_SETTINGS_URL } from 'constants/url';
// import { convertHtml } from 'utils';
import { dummyBookingSetting } from 'constants/dummy';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    required: {
      color: 'red'
    },
    label: {
      width: '10em',
      height: '10em'
    },
    image: {
      position: 'relative',
      width: '100%',
      height: '100%',
      [theme.breakpoints.down('xs')]: {
        width: '100% !important', // Overrides inline-style
        height: '100% !important'
      },
      '&:hover, &$focusVisible': {
        zIndex: 1,
        '& $imageButton': {
          opacity: 0.7
        },
        '& $imageMarked': {
          opacity: 0
        }
      }
    },
    imageView: {
      width: '10em',
      height: '10em',
      objectFit: 'contain',
      backgroundColor: theme.palette.primary.light,
      borderRadius: 5,
      border: `1px solid ${theme.palette.grey[300]}`
    },
    imageSrc: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundSize: 'cover',
      backgroundPosition: 'center 40%'
    },
    imageButton: {
      width: '10em',
      height: '10em',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: theme.palette.primary.light,
      borderRadius: 5
    },
    editorGrid: {
      border: 'solid 1px grey',
      borderRadius: 5,
      marginBottom: theme.spacing(2),
      marginTop: theme.spacing(2),
      paddingBottom: '100px !important',
      paddingLeft: theme.spacing(2),
      overflow: 'auto',
      maxHeight: 500,
      height: 200
    },
    inputRoot: {
      lineHeight: '20px'
    }
  })
);

const BookingPage: FC = () => {
  useCurrentPageTitleUpdater('Customer Booking');

  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [bookingSetting, setBookingSetting] = useState<any>(dummyBookingSetting);
  const [timeSlots, setTimeSlots] = useState<string[]>(dummyBookingSetting.TimeSlots);
  const [timeSlotsHoliday, setTimeSlotsHoliday] = useState<string[]>(dummyBookingSetting.TimeSlotsHoliday);

  const [uploadLogo, setUploadLogo] = useState<boolean>(false);
  const [logo, setLogo] = useState<string>('');
  const [logoView, setLogoView] = useState<string>('');
  const [error, setError] = useState<any[]>([
    { field: 'logo', message: '' },
    { field: 'name', message: '' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [currentInstruction, setCurrentInstruction] = useState<string>('');
  // let instructionData = '';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(BOOKING_SETTINGS_URL);
        const data = res.data;

        const updatedSettings = {
          ...data,
          TimeSlots: data.TimeSlots.split(','),
          TimeSlotsHoliday: data.TimeSlotsHoliday.split(',')
        };

        setBookingSetting(updatedSettings);
        setTimeSlots(updatedSettings.TimeSlots);
        setTimeSlotsHoliday(updatedSettings.TimeSlotsHoliday);

        // if (data.Instructions) {
        //   setCurrentInstruction(convertHtml(data.Instructions));
        // }
        if (data.LogoUrl) {
          setLogoView(data.LogoUrl);
          setLogo(data.Logo);
        }
      } catch (error) {
        handleOpenSnackbar('error', 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleOpenSnackbar = (type: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(type);
    setSnackbarMessage(message);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleChooseImage = (event: any) => {
    let image;
    let imageView;
    if (event.target.files[0] === undefined) {
      image = '';
      imageView = '';
    } else {
      image = event.target.files[0];
      imageView = URL.createObjectURL(event.target.files[0]);
    }
    setUploadLogo(true);
    setLogo(image);
    setLogoView(imageView);
    setError(prev => {
      prev[0].message = '';
      return [...prev];
    });
  };

  // const handleChangeInstruction = (event: any) => {
  //   let data = JSON.stringify(convertToHTML(event.getCurrentContent()));
  //   data = data.replace(/"/g, '');
  //   data = data.replace(/<p><\/p>/g, '<div>&shy;</div>');
  //   instructionData = data;
  //   setBookingSetting({ ...bookingSetting, Instructions: data });
  // };

  // const handleBlurInstruction = () => {
  //   if (instructionData === '<div>&shy;</div>') {
  //     setBookingSetting({ ...bookingSetting, Instructions: '' });
  //     setCurrentInstruction('');
  //   } else {
  //     setBookingSetting({ ...bookingSetting, Instructions: instructionData });
  //     setCurrentInstruction(convertHtml(instructionData));
  //   }
  // };

  const hanldeCheckBoxChange = () => {
    setBookingSetting({ ...bookingSetting, IncludePublicHoliday: !bookingSetting.IncludePublicHoliday });
  };

  // Helper to update time slot
  const handleTimeSlotChange = (index: number, newTime: Date | null) => {
    if (!newTime) return;
    const formattedTime = newTime.toTimeString().slice(0, 5); // HH:mm format
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = formattedTime;
    setTimeSlots(updatedSlots);
    setBookingSetting({ ...bookingSetting, TimeSlots: updatedSlots });
  };

  const handleAddTimeSlot = () => {
    const lastSlot = timeSlots[timeSlots.length - 1];
    const [hours, minutes] = lastSlot.split(':').map(Number);
    const lastDate = new Date();
    lastDate.setHours(hours);
    lastDate.setMinutes(minutes);
    lastDate.setSeconds(0);
    lastDate.setMilliseconds(0);

    // Add 30 minutes
    lastDate.setMinutes(lastDate.getMinutes() + 30);

    const newHours = String(lastDate.getHours()).padStart(2, '0');
    const newMinutes = String(lastDate.getMinutes()).padStart(2, '0');
    const newTime = `${newHours}:${newMinutes}`;

    setTimeSlots(prev => [...prev, newTime]);
    setBookingSetting({ ...bookingSetting, TimeSlots: [...timeSlots, newTime] });
  };

  const handleRemoveTimeSlot = (index: number) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
    setBookingSetting({ ...bookingSetting, TimeSlots: updatedSlots });
  };

  const handleTimeSlotHolidayChange = (index: number, newTime: Date | null) => {
    if (!newTime) return;
    const formattedTime = newTime.toTimeString().slice(0, 5);
    const updatedSlots = [...timeSlotsHoliday];
    updatedSlots[index] = formattedTime;
    setTimeSlotsHoliday(updatedSlots);
    setBookingSetting({ ...bookingSetting, TimeSlotsHoliday: updatedSlots });
  };

  const handleAddTimeSlotHoliday = () => {
    const lastSlot = timeSlotsHoliday[timeSlotsHoliday.length - 1] || '08:00';
    const [hours, minutes] = lastSlot.split(':').map(Number);
    const lastDate = new Date();
    lastDate.setHours(hours, minutes, 0, 0);
    lastDate.setMinutes(lastDate.getMinutes() + 30);
    const newTime = lastDate.toTimeString().slice(0, 5);
    setTimeSlotsHoliday(prev => [...prev, newTime]);
    setBookingSetting({ ...bookingSetting, TimeSlotsHoliday: [...timeSlotsHoliday, newTime] });
  };

  const handleRemoveTimeSlotHoliday = (index: number) => {
    const updatedSlots = timeSlotsHoliday.filter((_, i) => i !== index);
    setTimeSlotsHoliday(updatedSlots);
    setBookingSetting({ ...bookingSetting, TimeSlotsHoliday: updatedSlots });
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      let newLogoKey = logo;
      let fileExtension = '';

      if (uploadLogo && logo) {
        // @ts-ignore
        const imageType = logo ? logo.type : '';
        fileExtension = imageType ? imageType.split('/').pop()! : '';
        newLogoKey = `${Date.now()}.${fileExtension}`;
      }

      const payload = {
        ...bookingSetting,
        Logo: newLogoKey
      };

      const config = { cancelToken: cancelTokenSource.token };
      const { data } = await axios.put(BOOKING_SETTINGS_URL, payload, config);

      if (uploadLogo && logo && data.logoUrl) {
        const myHeaders = new Headers();
        myHeaders.append('Content-Type', `image/${fileExtension}`);

        const config = {
          method: 'PUT',
          headers: myHeaders,
          body: logo
        };

        await fetch(data.logoUrl, config);
      }

      handleOpenSnackbar('success', 'Settings updated successfully');
    } catch (error) {
      handleOpenSnackbar('error', 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid spacing={1} item container xs={12} sm={10} alignItems='center'>
          <Grid item xs={12} sm={3}>
            <Typography variant='h6'>
              Upload Business Logo <span className={classes.required}>*</span>
            </Typography>
            <Typography variant='caption' color='textSecondary'>
              SVG, PNG, OR JPG
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Grid container direction='row' alignItems='center'>
              <input
                accept='image/*'
                style={{ display: 'none' }}
                id='contained-button-file'
                multiple
                type='file'
                onChange={event => handleChooseImage(event)}
              />
              <label htmlFor='contained-button-file' className={classes.label}>
                <ButtonBase focusRipple key={'Upload'} className={classes.image} component='span' disabled={isLoading}>
                  <Tooltip title='Change image' placement='top'>
                    {logoView ? (
                      <img src={logoView} alt='logo' className={classes.imageView} />
                    ) : (
                      <span
                        className={classes.imageButton}
                        style={{
                          color: error[0].message !== '' ? theme.palette.error.main : theme.palette.grey[700],
                          border: error[0].message !== '' ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.grey[300]}`
                        }}
                      >
                        <Grid container>
                          <Grid item xs style={{ textAlign: 'center' }}>
                            <Grid container justify='center' alignItems='center'>
                              <Grid item xs={12}>
                                <UploadIcon fontSize='large' />
                              </Grid>
                              <Grid item xs={12}>
                                <Typography component='span' variant='subtitle1' color='inherit'>
                                  {error[0].message !== '' ? error[0].message : 'Upload'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Grid>
                      </span>
                    )}
                  </Tooltip>
                </ButtonBase>
              </label>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant='h6'>
              Business Name <span className={classes.required}>*</span>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              variant='outlined'
              margin='dense'
              required
              fullWidth
              id='name'
              label='Bussiness Name'
              value={bookingSetting ? bookingSetting.BusinessName : ''}
              onChange={event => setBookingSetting({ ...bookingSetting, BusinessName: event.target.value })}
            />
          </Grid>
          {/* <Grid item xs={12} sm={3}>
            <Typography variant='h6'>Scheduling Instruction</Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <MUIRichTextEditor
              label='Scheduling Instructions'
              controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
              defaultValue={currentInstruction}
              onChange={handleChangeInstruction}
              onBlur={handleBlurInstruction}
              classes={{ editor: classes.inputRoot, container: classes.editorGrid }}
            />
          </Grid> */}
          <Grid item xs={12} sm={3}>
            <Typography variant='h6'>Working Day</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              margin='dense'
              variant='outlined'
              fullWidth
              id='working-day'
              label='Choose'
              value={bookingSetting ? bookingSetting.WorkingDays : 'monday to saturday'}
              onChange={event => setBookingSetting({ ...bookingSetting, WorkingDays: event.target.value })}
            >
              <MenuItem key={'all'} value='all'>
                All Day
              </MenuItem>
              <MenuItem key={'monday to saturday'} value='monday to saturday'>
                Monday to Saturday
              </MenuItem>
              <MenuItem key={'monday to friday'} value='monday to friday'>
                Monday to Friday
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={bookingSetting ? Boolean(bookingSetting.IncludePublicHoliday) : false}
                  color='primary'
                  onChange={hanldeCheckBoxChange}
                />
              }
              label={
                <Typography variant='caption' color='textSecondary'>
                  Include Public Holiday
                </Typography>
              }
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant='h6'>Number of Job per Time Slot</Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              id='limit-jos'
              label='Set limit'
              margin='dense'
              value={bookingSetting ? bookingSetting.LimitTimeSlot : 1}
              onChange={event => setBookingSetting({ ...bookingSetting, LimitTimeSlot: Number(event.target.value) })}
              onBlur={event => {
                if (Number(event.target.value) < 1) {
                  setBookingSetting({ ...bookingSetting, LimitTimeSlot: 1 });
                } else if (Number(event.target.value) > 99) {
                  setBookingSetting({ ...bookingSetting, LimitTimeSlot: 99 });
                } else {
                  setBookingSetting({ ...bookingSetting, LimitTimeSlot: Number(event.target.value) });
                }
              }}
              variant='outlined'
              autoComplete='off'
              InputProps={{
                inputComponent: NumberFormatCustom as any,
                inputProps: { min: 1, max: 99 }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}></Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant='h6'>Working Day Time Slot</Typography>
            <Typography variant='caption' color='textSecondary'>
              This working day time slot is job start time
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9} style={{ marginBottom: theme.spacing(3) }}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid container spacing={2}>
                {timeSlots.map((slot, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <KeyboardTimePicker
                      fullWidth
                      margin='dense'
                      inputVariant='outlined'
                      label={`Time Slot #${index + 1}`}
                      value={new Date(`1970-01-01T${slot}:00`)}
                      minutesStep={15}
                      onChange={date => handleTimeSlotChange(index, date)}
                      keyboardIcon={<ClockIcon />}
                      KeyboardButtonProps={{ 'aria-label': 'change start time' }}
                      InputAdornmentProps={{ position: 'start' }}
                    />
                    {index > 0 && (
                      <ButtonBase onClick={() => handleRemoveTimeSlot(index)}>
                        <Typography color='error'>Remove</Typography>
                      </ButtonBase>
                    )}
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <ButtonBase onClick={handleAddTimeSlot}>
                    <Typography color='primary'>+ Add Time Slot</Typography>
                  </ButtonBase>
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant='h6'>Weekend Time Slots</Typography>
            <Typography variant='caption' color='textSecondary'>
              These slots apply during Saturday, Sunday or public holidays
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Grid container spacing={2}>
                {timeSlotsHoliday.map((slot, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <KeyboardTimePicker
                      fullWidth
                      margin='dense'
                      inputVariant='outlined'
                      label={`Holiday Slot #${index + 1}`}
                      value={new Date(`1970-01-01T${slot}:00`)}
                      minutesStep={15}
                      onChange={date => handleTimeSlotHolidayChange(index, date)}
                      keyboardIcon={<ClockIcon />}
                      KeyboardButtonProps={{ 'aria-label': 'change holiday time' }}
                      InputAdornmentProps={{ position: 'start' }}
                    />
                    {index > 0 && (
                      <ButtonBase onClick={() => handleRemoveTimeSlotHoliday(index)}>
                        <Typography color='error'>Remove</Typography>
                      </ButtonBase>
                    )}
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <ButtonBase onClick={handleAddTimeSlotHoliday}>
                    <Typography color='primary'>+ Add Holiday Slot</Typography>
                  </ButtonBase>
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider>
          </Grid>

          <Grid item xs={12} container justify='flex-end'>
            <LoadingButton delay={0} isLoading={isLoading} disableElevation onClick={handleSaveSettings} variant='contained' color='primary'>
              Save
            </LoadingButton>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={2}></Grid>
        {openSnackbar && (
          <ActionSnackbar
            variant={snackbarVarient}
            message={snackbarMessage}
            open={openSnackbar}
            handleClose={handleCloseSnackbar}
            Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
          />
        )}
      </Grid>
    </Fragment>
  );
};

export default BookingPage;
