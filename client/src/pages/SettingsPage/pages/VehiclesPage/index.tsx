import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import ActionSnackbar from 'components/ActionSnackbar';
import VehicleTable from './components/VehicleTable';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { GET_ACTIVE_USERS_URL, VEHICLE_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import SideBarContent from 'components/SideBarContent';
import VehicleForm from './components/VehicleForm';
import { dummyVehicle } from 'constants/dummy';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto'
  },
  addButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  }
}));

const VehiclesPage: FC = () => {
  useCurrentPageTitleUpdater('Vehicles');

  const classes = useStyles();

  const [employeeMaster, setEmployeeMaster] = useState<Select[]>([]);

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingVehicle, setSearchingVehicle] = useState<boolean>(false);
  const [, setSearchVehicleError] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [currentEditingVehicleIndex, setCurrentEditingVehicleIndex] = useState<number>(0);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  // Loading all the employee to populate the select components
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getAllUsers = async () => {
      try {
        const { data } = await axios.get(GET_ACTIVE_USERS_URL, { cancelToken: cancelTokenSource.token });

        let employeeData: Select[] = [];
        data.activeUsers.map((value: any) => {
          return employeeData.push({ id: value.id, name: value.displayName });
        });
        setEmployeeMaster(employeeData);
      } catch (err) {
        console.log(err);
      }
    };

    getAllUsers();

    return () => {
      // Canceling the request if component is unmounted
      cancelTokenSource.cancel();
    };
  }, []);

  // Search Vehicle whenever rowsPerPage, currentPage, queryString changes
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }

      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchVehicle = async () => {
      setSearchingVehicle(true);
      setSearchVehicleError(false);

      try {
        const url = `${VEHICLE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setVehicles(data.vehicles);
      } catch (err) {
        setSearchVehicleError(true);
      }

      setSearchingVehicle(false);
    };

    searchVehicle();

    return () => {
      cancelTokenSource.cancel();
    };
  }, [rowsPerPage, currentPage, queryString]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  const handleSearch = useCallback((searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  }, []);

  const debouncedSearchTerm = useDebounce(query, 1000);
  // Load client data to populate on search list
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const handleOpenEditVehicle = (vehicleIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingVehicleIndex(vehicleIndex);
    setOpenForm(true);
    setIsEdit(true);
  };

  const addNewVehicle = (vehicle: VehicleModel) => {
    vehicle.new = true;
    vehicles.unshift(vehicle);
    setVehicles([...vehicles]);
    setCount(c => c + 1);
  };

  const updateIndividualVehicle = (vehicleIndex: number) => {
    return (updatedVehicleProperties: Partial<VehicleModel>) => {
      setVehicles(
        vehicles!.map((vehicle, index) => {
          if (index !== vehicleIndex) {
            return vehicle;
          }

          return Object.assign({}, vehicle, updatedVehicleProperties);
        })
      );
    };
  };

  const deleteIndividualVehicle = (vehicleIndex: number) => {
    vehicles.splice(vehicleIndex, 1);
    setVehicles([...vehicles]);
    setCount(c => c - 1);
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Vehicle...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingVehicle}
          disableElevation
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
        >
          Add Vehicle
          <LoadingButtonIndicator isLoading={isSearchingVehicle} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <VehicleTable
        isLoadingData={isSearchingVehicle}
        vehicles={vehicles}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        addNewVehicle={addNewVehicle}
        deleteIndividualVehicle={deleteIndividualVehicle}
        handleOpenEditVehicle={handleOpenEditVehicle}
        updateIndividualVehicle={updateIndividualVehicle}
        handleSnackbar={handleSnackbar}
      />
      <SideBarContent title={isEdit ? 'Edit Vehicle' : 'Add Vehicle'} open={openForm} onClickDrawer={() => setOpenForm(false)} width={'55%'}>
        <VehicleForm
          vehicle={isEdit ? vehicles[currentEditingVehicleIndex] : dummyVehicle}
          employeeMaster={employeeMaster}
          isEdit={isEdit}
          addNewVehicle={addNewVehicle}
          updateIndividualVehicle={updateIndividualVehicle(currentEditingVehicleIndex)}
          handleClose={() => {
            setOpenForm(false);
            setIsEdit(false);
            setCurrentEditingVehicleIndex(0);
          }}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={() => setOpenSnackbar(false)}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </Paper>
  );
};

export default VehiclesPage;
