import React, { useState, useEffect, FC } from 'react';
import { Checkbox, Chip, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { getUnique } from 'utils';
import axios, { CancelTokenSource } from 'axios';
import { GET_ACTIVE_TECHNICIANS_URL, GET_ACTIVE_VEHICLE_URL } from 'constants/url';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
  selectedEmployees: Select[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<Select[]>>;
  selectedVehicles: Select[];
  setSelectedVehicles: React.Dispatch<React.SetStateAction<Select[]>>;
  assignError: any[];
  setAssignError: React.Dispatch<React.SetStateAction<any[]>>;
  serviceType: string;
  isAssignFirstJob: boolean;
  setIsAssignFirstJob: React.Dispatch<React.SetStateAction<boolean>>;
}

const AssignForm: FC<Props> = props => {
  const {
    selectedEmployees,
    setSelectedEmployees,
    selectedVehicles,
    setSelectedVehicles,
    assignError,
    setAssignError,
    serviceType,
    isAssignFirstJob,
    setIsAssignFirstJob
  } = props;
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [employeeMaster, setEmployeeMaster] = useState<Select[]>([]);
  const [vehicleMaster, setVehicleMaster] = useState<Select[]>([]);

  useEffect(() => {
    const loadMasterData = async () => {
      const employees = await axios.get(`${GET_ACTIVE_TECHNICIANS_URL}`, { cancelToken: cancelTokenSource.token });

      let employeeData: Select[] = [];
      employees.data.activeUsers.map((value: any) => {
        let displayName: string = value.displayName;

        return employeeData.push({ id: value.id, name: displayName });
      });

      const vehicles = await axios.get(GET_ACTIVE_VEHICLE_URL, { cancelToken: cancelTokenSource.token });
      let vehicleData: Select[] = [];
      vehicles.data.vehicles.map((value: any) => {
        return vehicleData.push({ id: value.id, name: value.carplateNumber });
      });

      setEmployeeMaster(employeeData);
      setVehicleMaster(vehicleData);
    };

    loadMasterData();
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleOnBlur = (field: string) => {
    if (field === 'employee') {
      if (selectedEmployees.length === 0) {
        setAssignError(prev => {
          prev[0].message = 'Please select an Employee';
          return [...prev];
        });
      } else {
        setAssignError(prev => {
          prev[0].message = '';
          return [...prev];
        });
      }
      // } else if (field === 'vehicle') {
      //   if (selectedVehicles.length === 0) {
      //     setAssignError(prev => {
      //       prev[1].message = 'Please select an Vehicle';
      //       return [...prev];
      //     });
      //   } else {
      //     setAssignError(prev => {
      //       prev[1].message = '';
      //       return [...prev];
      //     });
      //   }
    } else {
      setAssignError([{ message: '' }, { message: '' }]);
    }
  };

  return (
    <Grid container spacing={1}>
      {serviceType === 'CONTRACT' && (
        <Grid container spacing={1} alignItems='center'>
          <Grid item xs={3}>
            <Typography>Assign for:</Typography>
          </Grid>
          <Grid item xs={9}>
            <FormControl component='fieldset'>
              <RadioGroup
                aria-label='clientType'
                name='clientType'
                value={isAssignFirstJob === true ? 'true' : 'false'}
                onChange={event => setIsAssignFirstJob(event.target.value === 'true')}
                row
              >
                <FormControlLabel value='true' control={<Radio color='primary' />} label='First Job' labelPlacement='end' />
                <FormControlLabel value='false' control={<Radio color='primary' />} label='All Job(s)' labelPlacement='end' />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      )}
      <Grid item xs={12}>
        <Autocomplete
          multiple
          id='employee'
          disableCloseOnSelect
          options={employeeMaster}
          getOptionLabel={option => option.name}
          value={selectedEmployees}
          getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
          onChange={(_, value) => handleSetEmployee(value)}
          onBlur={() => handleOnBlur('employee')}
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
              required
              id='Technician'
              label='Technician'
              variant='outlined'
              autoComplete='off'
              margin='dense'
              error={assignError[0].message !== ''}
              helperText={assignError[0].message}
              style={{ marginBottom: 24 }}
            />
          )}
        />
        <Autocomplete
          multiple
          id='Vehicle'
          disableCloseOnSelect
          options={vehicleMaster}
          getOptionLabel={option => option.name}
          value={selectedVehicles}
          getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
          onChange={(_, value) => handleSetVehicle(value)}
          onBlur={() => handleOnBlur('vehicle')}
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
              label='Vehicle'
              variant='outlined'
              autoComplete='off'
              error={assignError[1].message !== ''}
              helperText={assignError[1].message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default AssignForm;
