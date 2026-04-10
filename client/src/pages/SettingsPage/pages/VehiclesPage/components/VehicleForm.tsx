import { FC, useEffect, useState } from 'react';
import { Grid, TextField, Button, Theme, Typography, DialogActions, MenuItem } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import axios, { CancelTokenSource } from 'axios';
import { dummyVehicle } from 'constants/dummy';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { isValid } from 'date-fns';
import { GET_EDIT_VEHICLE_URL, VEHICLE_BASE_URL } from 'constants/url';

interface Props {
  vehicle: VehicleModel;
  isEdit: boolean;
  employeeMaster: Select[];
  handleClose(): void;
  addNewVehicle(user: VehicleModel): void;
  updateIndividualVehicle: (updatedVehicleProperties: Partial<VehicleModel>) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  required: {
    color: 'red'
  },
  inputAdornmentClass: {
    marginLeft: theme.spacing(2)
  },
  checkBoxIcon: {
    fontSize: '16px'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  }
}));

const VehicleForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { vehicle, employeeMaster, isEdit, handleClose, addNewVehicle, updateIndividualVehicle, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleModel>(dummyVehicle);
  const [error, setError] = useState<any[]>([
    { field: 'vehicleNumber', message: '' },
    { field: 'employeeInCharge', message: '' }
  ]);

  useEffect(() => {
    if (!vehicle) {
      return;
    }
    setCurrentVehicle({ ...vehicle, employeeInCharge: vehicle.employeeInCharge === null ? 0 : vehicle.employeeInCharge });
  }, [vehicle]);

  const handleCoeExpiryDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      setCurrentVehicle({ ...currentVehicle, coeExpiryDate: date });
    }
  };

  const validateForm = () => {
    let ret = true;

    if (!currentVehicle.carplateNumber || !currentVehicle.carplateNumber.trim()) {
      setError(prev => {
        prev[0].message = 'Please enter vehicle number';
        return [...prev];
      });
      ret = false;
    }

    return ret;
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    let message = '';

    try {
      if (isEdit) {
        const response = await axios.put(
          `${GET_EDIT_VEHICLE_URL(vehicle!.id)}`,
          {
            ...currentVehicle,
            employeeId: currentVehicle.employeeInCharge === 0 ? null : currentVehicle.employeeInCharge
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualVehicle(response.data);
        message = 'Successfully edited vehicle';
      } else {
        const response = await axios.post(
          `${VEHICLE_BASE_URL}`,
          {
            ...currentVehicle,
            employeeId: currentVehicle.employeeInCharge === 0 ? null : currentVehicle.employeeInCharge
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewVehicle(response.data);
        message = 'Successfully added new vehicle';
      }
      handleSnackbar('success', message);
      handleClose();
    } catch (err) {
      const error = err as any;
      const { errorCode } = error.data;

      if (errorCode === 9) {
        message = 'Vehicle number is duplicated';
      } else {
        if (isEdit) {
          message = 'Failed to edit a vehicle';
        } else {
          message = 'Failed to add a new vehicle';
        }
      }
      handleSnackbar('error', message);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Vehicle Number <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='vehicleNumber'
            label='Vehicle Number'
            error={error[0].message !== ''}
            helperText={error[0].message}
            value={currentVehicle.carplateNumber}
            onChange={event => setCurrentVehicle({ ...currentVehicle, carplateNumber: event.target.value })}
            onBlur={event => {
              if (event.target.value) {
                setError(prev => {
                  prev[0].message = '';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[0].message = 'Please enter vehicle number';
                  return [...prev];
                });
              }
            }}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Type & Make</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            variant='outlined'
            margin='dense'
            fullWidth
            id='model'
            label='Type & Make'
            value={currentVehicle.model}
            onChange={event => setCurrentVehicle({ ...currentVehicle, model: event.target.value })}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>COE Expire Date</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              margin='dense'
              required
              fullWidth
              id='coeExpiryDate'
              label='Coe Expiry Date'
              value={currentVehicle.coeExpiryDate}
              variant='dialog'
              inputVariant='outlined'
              format='dd/MM/yyyy'
              onChange={handleCoeExpiryDateChange}
              InputAdornmentProps={{ position: 'start' }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Employee in Charge</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            select
            margin='dense'
            variant='outlined'
            fullWidth
            id='employeeInCharge'
            label='Employee Name'
            error={error[1].message !== ''}
            helperText={error[1].message}
            value={currentVehicle.employeeInCharge}
            onChange={event => setCurrentVehicle({ ...currentVehicle, employeeInCharge: Number(event.target.value) })}
            autoComplete='off'
            InputLabelProps={{
              shrink: currentVehicle.employeeInCharge === null ? false : true
            }}
          >
            <MenuItem key={0} value={0}>
              none
            </MenuItem>
            {employeeMaster.map(value => (
              <MenuItem key={value.id} value={value.id}>
                {value.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' disableElevation color='primary' disabled={isLoading} onClick={handleSubmit}>
          Save
          {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
        </Button>
      </DialogActions>
    </>
  );
};

export default VehicleForm;
