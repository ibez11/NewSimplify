import React, { FC, Fragment, useState } from 'react';
import { Button, Chip, Grid, IconButton, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';
import { format } from 'date-fns';

import CalendarIcon from '@material-ui/icons/EventNote';
import DeleteIcon from '@material-ui/icons/Cancel';
import PositionedPopper from 'components/PositionedPopper';
import FilterTable from 'components/FilterTable';
import SearchInput from 'components/SearchInput';
import SelectColumn from 'components/SelectColumn';
import ViewColumn from '@material-ui/icons/ViewColumn';
import theme from 'theme';

interface Props {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  filterBy: string;
  setFilterBy: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  vehicles: Select[];
  employees: Select[];
  serviceAddressMaster: Select[];
  employeeFilter: ColumnFilter[];
  setEmployeeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  vehicleFilter: ColumnFilter[];
  setVehicleFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  serviceAddressFilter: ColumnFilter[];
  setServiceAddressFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  columns: SelectedColumn[];
  setColumns: React.Dispatch<React.SetStateAction<SelectedColumn[]>>;
  tableSettingId: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: 20
  },
  deleteIcon: {
    color: '#53A0BE'
  },
  calendarIcon: (props: Props) => ({
    fontSize: 20,
    color: props.filterBy ? theme.palette.primary.main : ''
  }),
  filterChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

const ToolBar: FC<Props> = props => {
  const classes = useStyles(props);
  const [openCalendarPopper, setOpenCalendarPopper] = useState(false);
  const [anchorElCalendarPopper, setAnchorElCalendarPopper] = useState<HTMLElement | null>(null);
  const [placementCalendarPopper, setPlacementCalendarPopper] = useState<PopperPlacementType>();
  const { vehicles, employees, serviceAddressMaster, columns, setColumns, tableSettingId } = props;
  const { query, setQuery } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const { employeeFilter, setEmployeeFilter, vehicleFilter, setVehicleFilter, serviceAddressFilter, setServiceAddressFilter } = props;

  const [selectedEmployeeData, setSelectedEmployeeData] = useState<Select[]>([]);
  const [selectedVehicleData, setSelectedVehicleData] = useState<Select[]>([]);
  const [selectedServiceAddressData, setSelectedServiceAddressData] = useState<Select[]>([]);
  const [openColumnPopper, setOpenColumnPopper] = useState(false);
  const [anchorElColumn, setAnchorElColumn] = useState<HTMLElement | null>(null);

  const handleCalendarFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCalendarPopper(!openCalendarPopper);
    setAnchorElCalendarPopper(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

  const handleClearFilter = () => {
    setEmployeeFilter([]);
    setSelectedEmployeeData([]);
    setVehicleFilter([]);
    setSelectedVehicleData([]);
    setServiceAddressFilter([]);
    setSelectedServiceAddressData([]);
  };

  const handleDeleteEmployeeFilter = (index: number) => {
    const currentFilter = [...employeeFilter];
    const currentSelectedData = [...selectedEmployeeData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setEmployeeFilter(currentFilter);
    setSelectedEmployeeData(currentSelectedData);
  };

  const handleDeleteVehicleFilter = (index: number) => {
    const currentFilter = [...vehicleFilter];
    const currentSelectedData = [...selectedVehicleData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setVehicleFilter(currentFilter);
    setSelectedVehicleData(currentSelectedData);
  };

  const handleDeleteServiceAddressFilter = (index: number) => {
    const currentFilter = [...serviceAddressFilter];
    const currentSelectedData = [...selectedServiceAddressData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setServiceAddressFilter(currentFilter);
    setSelectedServiceAddressData(currentSelectedData);
  };

  const handleShowHideColumnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenColumnPopper(!openColumnPopper);
    setAnchorElColumn(event.currentTarget);
  };

  const renderHeaderLabel = () => {
    if (filterBy) {
      if (filterBy === '5' && startDate && endDate) {
        return (
          <Typography variant='h6'>
            (by start date {format(new Date(startDate), 'dd-MM-yyyy')} - {format(new Date(endDate), 'dd-MM-yyyy')})
          </Typography>
        );
      } else if (filterBy === 'termEnd' && startDate && endDate) {
        return (
          <Typography variant='h6'>
            (by end date {format(new Date(startDate), 'dd-MM-yyyy')} - {format(new Date(endDate), 'dd-MM-yyyy')})
          </Typography>
        );
      }
    }
  };

  const renderLeftHeader = () => {
    return (
      <SearchInput
        withBorder
        withTransition={false}
        width={200}
        placeHolder='Search ID, Quotation Title'
        iconColor='#989898'
        tableSearchValue={query}
        setTableSearchValue={setQuery}
      />
    );
  };

  const renderRightHeader = () => {
    return (
      <Fragment>
        <FilterTable
          masterData={employees}
          selectedData={selectedEmployeeData}
          setSelectedData={setSelectedEmployeeData}
          columnFilter={employeeFilter}
          setColumnFilter={setEmployeeFilter}
          label='Filter Employee'
        />
        <FilterTable
          masterData={vehicles}
          selectedData={selectedVehicleData}
          setSelectedData={setSelectedVehicleData}
          columnFilter={vehicleFilter}
          setColumnFilter={setVehicleFilter}
          label='Filter Vehicle'
        />
        <FilterTable
          masterData={serviceAddressMaster}
          selectedData={selectedServiceAddressData}
          setSelectedData={setSelectedServiceAddressData}
          columnFilter={serviceAddressFilter}
          setColumnFilter={setServiceAddressFilter}
          label='Filter Service Address'
        />
        <PositionedPopper
          openPopper={openCalendarPopper}
          setOpenPopper={setOpenCalendarPopper}
          anchorEl={anchorElCalendarPopper}
          placement={placementCalendarPopper}
          containerWidth={320}
          fadeTransition={350}
          popperComponent='dateRangePicker'
          options={[
            { key: '1', label: 'Today' },
            { key: '2', label: 'Tomorrow' },
            { key: '3', label: 'This Week' },
            { key: '4', label: 'This Month' },
            { key: '5', label: 'Custom Date' }
          ]}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        <Tooltip title='Calendar filter' placement='top'>
          <IconButton onClick={event => handleCalendarFilterClick(event)}>
            <CalendarIcon className={classes.calendarIcon} />
          </IconButton>
        </Tooltip>
        <SelectColumn
          open={openColumnPopper}
          setOpen={setOpenColumnPopper}
          anchorEl={anchorElColumn}
          columns={columns}
          setColumns={setColumns}
          tableSettingId={tableSettingId}
        />
        <Tooltip title='Show/Hide Column' placement='top'>
          <IconButton onClick={event => handleShowHideColumnClick(event)}>
            <ViewColumn className={classes.icon} />
          </IconButton>
        </Tooltip>
      </Fragment>
    );
  };

  const renderFilterHeader = () => {
    if (employeeFilter.length > 0 || vehicleFilter.length > 0 || serviceAddressFilter.length > 0) {
      return (
        <Grid container>
          <Grid item xs={1}>
            <Button color='primary' onClick={handleClearFilter}>
              <Typography variant='body1'>Clear Filter</Typography>
            </Button>
          </Grid>
          <Grid item xs={11}>
            {employeeFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteEmployeeFilter(index)}
              />
            ))}
            {vehicleFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteVehicleFilter(index)}
              />
            ))}
            {serviceAddressFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteServiceAddressFilter(index)}
              />
            ))}
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Grid container spacing={2} style={{ padding: theme.spacing(2), paddingBottom: 0 }}>
      <Grid item xs={5} container justify='flex-start' alignItems='center'>
        {renderLeftHeader()}
      </Grid>
      <Grid item xs={7} container justify='flex-end' alignItems='center'>
        {renderRightHeader()}
      </Grid>
      <Grid item xs={12}>
        {renderHeaderLabel()}
      </Grid>
      <Grid item xs={12} container justify='flex-start' alignItems='center'>
        {renderFilterHeader()}
      </Grid>
    </Grid>
  );
};

export default ToolBar;
