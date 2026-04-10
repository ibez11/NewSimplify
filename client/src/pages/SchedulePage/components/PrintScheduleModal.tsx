import { FC, useContext, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Theme,
  Grid,
  Typography,
  TextField,
  Chip
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DateFnsUtils from '@date-io/date-fns';
import { format, isValid } from 'date-fns';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import axios from 'axios';
import { GET_EXPORT_SCHEDULE_JOBS_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getUnique } from 'utils';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';

interface Props {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDate: Date;
  selectedEmployeeFilter: Select[];
  selectedVehilceFilter: Select[];
  employeeMaster: Select[];
  vehicleMaster: Select[];
  isRemarksShow: boolean;
  setIsRemarksShow: React.Dispatch<React.SetStateAction<boolean>>;
  isNotesShow: boolean;
  setIsNotesShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  buttonAciton: {
    margin: 8
  },
  checkboxList: {
    width: '100%'
  }
}));

const PrintScheduleModal: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);

  const {
    openModal,
    selectedDate,
    selectedEmployeeFilter,
    selectedVehilceFilter,
    employeeMaster,
    vehicleMaster,
    setOpenModal,
    isRemarksShow,
    isNotesShow,
    setIsRemarksShow,
    setIsNotesShow
  } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [scheduleDate, setScheduleDate] = useState<Date>(selectedDate);
  const [selectedEmployees, setSelectedEmployees] = useState<Select[]>(selectedEmployeeFilter);
  const [selectedVehicles, setSelectedVehicles] = useState<Select[]>(selectedVehilceFilter);

  const clearForm = () => {
    setScheduleDate(selectedDate);
    setSelectedEmployees([]);
    setSelectedVehicles([]);
    setOpenModal(false);
  };

  const handleClose = () => {
    clearForm();
    setOpenModal(false);
  };

  const handleChangeDate = (date: Date | null) => {
    if (isValid(date)) {
      setScheduleDate(date ? date : new Date());
    }
  };

  const handleSetEmployee = (employees: Select[]) => {
    const selectedEmployee: any = [];
    if (employees) {
      const clearEmployee = getUnique(employees, 'id');
      clearEmployee.map(employee => {
        return selectedEmployee.push({ id: employee.id, name: employee.name });
      });
    }

    setSelectedEmployees(selectedEmployee);
  };

  const handleSetVehicle = (vehicles: Select[]) => {
    const selectedVehicle: any = [];
    if (vehicles) {
      const clearVehicle = getUnique(vehicles, 'id');
      clearVehicle.map(vehicle => {
        return selectedVehicle.push({ id: vehicle.id, name: vehicle.name, carplateNumber: vehicle.name });
      });
    }

    setSelectedVehicles(selectedVehicle);
  };

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    try {
      setIsLoading(true);
      await axios
        .post(
          `${GET_EXPORT_SCHEDULE_JOBS_URL}`,
          {
            scheduleDate: format(scheduleDate, 'yyyy-MM-dd'),
            ei: selectedEmployees.length > 0 ? selectedEmployees.map(value => value.id) : null,
            vi: selectedVehicles.length > 0 ? selectedVehicles.map(value => value.id) : null,
            isRemarksShow,
            isNotesShow
          },
          {
            responseType: 'blob'
          }
        )
        .then(response => {
          const file = new Blob([response.data && response.data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);

          const newwindow = window.open(fileURL, 'name', 'height=700,width=750');
          if (newwindow) {
            newwindow.focus();
            setIsLoading(false);
          }
        });

      CreateLogEvent('print_schedule', currentUser!);
      clearForm();
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={openModal} scroll='body' fullWidth maxWidth='xs'>
      <DialogTitle>
        <Typography variant='h5' id='modal-title'>
          Print Schedule Report
        </Typography>
        <IconButton size='small' className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                  disableToolbar
                  required
                  autoOk
                  fullWidth
                  margin='dense'
                  id='scheduleDate'
                  label='Select Date'
                  value={scheduleDate}
                  variant='inline'
                  inputVariant='outlined'
                  format='EEE, dd MMMM yyyy'
                  onChange={handleChangeDate}
                  disabled={isLoading}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                id='employee'
                disableCloseOnSelect
                disabled={isLoading || selectedVehicles.length > 0}
                options={employeeMaster}
                getOptionLabel={option => option.name}
                value={selectedEmployees}
                getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
                onChange={(_, value) => handleSetEmployee(value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => <Chip label={`${option.name}`} size='small' {...getTagProps({ index })} />)
                }
                renderOption={(option, { selected }) => (
                  <>
                    <Checkbox icon={<CheckBoxOutlineBlankIcon />} checkedIcon={<CheckBoxIcon />} color='primary' disableRipple checked={selected} />
                    {option.name}
                  </>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    fullWidth
                    id='Technician'
                    placeholder={selectedEmployees.length < 1 ? 'All Technicians' : ''}
                    variant='outlined'
                    autoComplete='off'
                    margin='dense'
                  />
                )}
              />
            </Grid>
            <Grid item sm={12}>
              <Autocomplete
                multiple
                id='Vehicle'
                disableCloseOnSelect
                disabled={isLoading || selectedEmployees.length > 0}
                options={vehicleMaster}
                getOptionLabel={option => option.name}
                value={selectedVehicles}
                getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
                onChange={(_, value) => handleSetVehicle(value)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => <Chip label={`${option.name}`} size='small' {...getTagProps({ index })} />)
                }
                renderOption={(option, { selected }) => (
                  <>
                    <Checkbox icon={<CheckBoxOutlineBlankIcon />} checkedIcon={<CheckBoxIcon />} color='primary' disableRipple checked={selected} />
                    {option.name}
                  </>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    fullWidth
                    margin='dense'
                    id='vehicle'
                    placeholder={selectedVehicles.length < 1 ? 'All Vehicles' : ''}
                    variant='outlined'
                    autoComplete='off'
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='body1'>Include on schedule report :</Typography>
              <FormControlLabel
                className={classes.checkboxList}
                control={<Checkbox checked={isRemarksShow} name='checkedE' color='primary' onChange={() => setIsRemarksShow(!isRemarksShow)} />}
                label={'Job Remarks & Internal Notes'}
                disabled={isLoading}
              />
              <FormControlLabel
                className={classes.checkboxList}
                control={<Checkbox checked={isNotesShow} name='checkedE' color='primary' onChange={() => setIsNotesShow(!isNotesShow)} />}
                label={'Job Notes'}
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        </form>
        <DialogActions>
          <Grid container justify='flex-end' alignItems='center'>
            <Button variant='contained' disableElevation onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant='contained' disableElevation color='primary' onClick={handleSubmit} disabled={isLoading} className={classes.buttonAciton}>
              Print
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
          </Grid>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default PrintScheduleModal;
