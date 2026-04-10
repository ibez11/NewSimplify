import React, { FC, Fragment, useState, useEffect, useRef, useContext } from 'react';
import { Button, Chip, CircularProgress, Fade, Grid, IconButton, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';

import { format } from 'date-fns';
import CalendarIcon from '@material-ui/icons/EventNote';
import DeleteIcon from '@material-ui/icons/Cancel';
import ExportIcon from '@material-ui/icons/GetApp';
import ViewColumn from '@material-ui/icons/ViewColumn';
import PositionedPopper from 'components/PositionedPopper';
import FilterTable from 'components/FilterTable';
import SearchInput from 'components/SearchInput';
import { CSVLink } from 'react-csv';
import theme from 'theme';
import SelectColumn from 'components/SelectColumn';
import ExportColumnPicker from './ExportColumnPicker';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants } from 'selectors';
import { hasAccessPermission } from 'utils';

interface Props {
  isProcessing: boolean;
  isExportingData: boolean;
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
  districts: Select[];
  serviceType: Select[];
  columnFilter: ColumnFilter[];
  setColumnFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  employeeFilter: ColumnFilter[];
  setEmployeeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  vehicleFilter: ColumnFilter[];
  setVehicleFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  districtFilter: ColumnFilter[];
  setDistrictFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  selectedTabId: number;
  csv: CSVJobModel[];
  handleCsvClick: () => void;
  columns: SelectedColumn[];
  setColumns: React.Dispatch<React.SetStateAction<SelectedColumn[]>>;
  tableSettingId: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  exportIcon: {
    fontSize: 20
  },
  calendarIcon: (props: Props) => ({
    fontSize: 20,
    color: props.filterBy ? theme.palette.primary.main : ''
  }),
  icon: {
    fontSize: 20
  },
  deleteIcon: {
    color: '#53A0BE'
  },
  filterChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  marginTop: {
    marginTop: theme.spacing(2)
  }
}));

const ToolBar: FC<Props> = props => {
  const classes = useStyles(props);

  const { isExportingData, vehicles, employees, districts, serviceType, columns, setColumns, tableSettingId } = props;
  const { query, setQuery } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const {
    columnFilter,
    setColumnFilter,
    employeeFilter,
    setEmployeeFilter,
    vehicleFilter,
    setVehicleFilter,
    districtFilter,
    setDistrictFilter
  } = props;
  const { selectedTabId, handleCsvClick, csv } = props;
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);
  const isExportActive = hasAccessPermission('JOBS', 'EXPORT', currentRoleGrants);

  const [openCalendarPopper, setOpenCalendarPopper] = useState(false);
  const [anchorElCalendarPopper, setAnchorElCalendarPopper] = useState<HTMLElement | null>(null);
  const [placementCalendarPopper, setPlacementCalendarPopper] = useState<PopperPlacementType>();

  const [selectedData, setSelectedData] = useState<Select[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Select[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Select[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<Select[]>([]);

  const [csvData, setCsvData] = useState<CSVJobModel[]>(csv);
  const [csvDownload, setCsvDownload] = useState<boolean>(false);
  const csvInstance = useRef<any | null>(null);
  const [exportHeaders, setExportHeaders] = useState<{ label: string; key: string }[] | null>(null);
  const [openExportPopper, setOpenExportPopper] = useState(false);
  const [anchorElExport, setAnchorElExport] = useState<HTMLElement | null>(null);
  const today = format(new Date(), 'dd-MM-yyyy');
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [openColumnPopper, setOpenColumnPopper] = useState(false);
  const [anchorElColumn, setAnchorElColumn] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (selectedTabId === 0) {
      setSelectedTab('All');
    } else if (selectedTabId === 1) {
      setSelectedTab('Unassigned');
    } else if (selectedTabId === 2) {
      setSelectedTab('Assigned');
    } else if (selectedTabId === 3) {
      setSelectedTab('In_Progress');
    } else if (selectedTabId === 4) {
      setSelectedTab('Completed');
    } else if (selectedTabId === 5) {
      setSelectedTab('Overdue');
    } else if (selectedTabId === 8) {
      setSelectedTab('Cancelled');
    } else if (selectedTabId === 10) {
      setSelectedTab('Confirmed');
    }
  }, [selectedTabId]);

  useEffect(() => {
    if (!csvDownload || !csv || csv.length < 1) {
      return;
    }

    setCsvData(csv);
  }, [csv, csvDownload]);

  useEffect(() => {
    if (csvDownload && csvData.length > 0 && csvInstance.current && csvInstance.current.link) {
      setTimeout(() => {
        csvInstance.current.link.click();
        setCsvData([]);
        setCsvDownload(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvData]);

  // const handleCsvIconClick = async () => {
  //   handleCsvClick();
  //   setCsvDownload(true);
  // };

  const handleCalendarFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCalendarPopper(!openCalendarPopper);
    setAnchorElCalendarPopper(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

  const handleClearFilter = () => {
    setColumnFilter([]);
    setSelectedData([]);
    setEmployeeFilter([]);
    setSelectedEmployee([]);
    setVehicleFilter([]);
    setSelectedVehicle([]);
    setDistrictFilter([]);
    setSelectedDistrict([]);
  };

  const handleDelete = (index: number) => {
    const currentFilter = [...columnFilter];
    const currentSelectedData = [...selectedData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setColumnFilter(currentFilter);
    setSelectedData(currentSelectedData);
  };

  const handleDeleteEmployeeFilter = (index: number) => {
    const currentFilter = [...employeeFilter];
    const currentSelectedData = [...selectedEmployee];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setEmployeeFilter(currentFilter);
    setSelectedEmployee(currentSelectedData);
  };

  const handleDeleteVehicleFilter = (index: number) => {
    const currentFilter = [...vehicleFilter];
    const currentSelectedData = [...selectedVehicle];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setVehicleFilter(currentFilter);
    setSelectedVehicle(currentSelectedData);
  };

  const handleDeleteDistrictFilter = (index: number) => {
    const currentFilter = [...districtFilter];
    const currentSelectedData = [...selectedDistrict];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setDistrictFilter(currentFilter);
    setSelectedDistrict(currentSelectedData);
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
      <div>
        <SearchInput
          withBorder
          withTransition={false}
          width={200}
          placeHolder='Search ID, Client, Quotation'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
      </div>
    );
  };

  const renderRightHeader = () => {
    return (
      <Fragment>
        <FilterTable
          masterData={serviceType}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          label='Filter Job'
        />
        <FilterTable
          masterData={employees}
          selectedData={selectedEmployee}
          setSelectedData={setSelectedEmployee}
          columnFilter={employeeFilter}
          setColumnFilter={setEmployeeFilter}
          label='Filter Employee'
        />
        <FilterTable
          masterData={vehicles}
          selectedData={selectedVehicle}
          setSelectedData={setSelectedVehicle}
          columnFilter={vehicleFilter}
          setColumnFilter={setVehicleFilter}
          label='Filter Vehicle'
        />
        <FilterTable
          masterData={districts}
          selectedData={selectedDistrict}
          setSelectedData={setSelectedDistrict}
          columnFilter={districtFilter}
          setColumnFilter={setDistrictFilter}
          label='Filter District'
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
            { key: '9', label: 'Last Month' },
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
        {selectedTabId !== 0 && isExportActive && (
          <Fragment>
            <Tooltip title='Export to CSV' placement='top'>
              <IconButton
                disabled={isExportingData}
                onClick={event => {
                  setOpenExportPopper(true);
                  setAnchorElExport(event.currentTarget);
                }}
              >
                <ExportIcon className={classes.exportIcon} />
                {isExportingData && (
                  <Fade in={isExportingData} style={{ transitionDelay: '0ms' }} unmountOnExit>
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  </Fade>
                )}
              </IconButton>
            </Tooltip>

            <ExportColumnPicker
              open={openExportPopper}
              anchorEl={anchorElExport}
              setOpen={setOpenExportPopper}
              onExport={(selected: any) => {
                setExportHeaders(selected);
                handleCsvClick();
                setCsvDownload(true);
              }}
            />

            <div style={{ display: 'none' }}>
              <CSVLink
                headers={exportHeaders && exportHeaders.length > 0 ? exportHeaders : undefined}
                filename={`Job_List_${selectedTab}_${today}.csv`}
                asyncOnClick={true}
                onClick={(event: any) => {
                  setCsvDownload(true);
                  return false;
                }}
                ref={csvInstance}
                data={csvData}
              >
                Download
              </CSVLink>
            </div>
          </Fragment>
        )}
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
    if (columnFilter.length > 0 || employeeFilter.length > 0 || vehicleFilter.length > 0 || districtFilter.length > 0) {
      return (
        <Grid container>
          <Grid item xs={1}>
            <Button color='primary' onClick={handleClearFilter}>
              <Typography variant='body1'>Clear Filter</Typography>
            </Button>
          </Grid>
          <Grid item xs={11}>
            {columnFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDelete(index)}
              />
            ))}
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
            {districtFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteDistrictFilter(index)}
              />
            ))}
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Grid container spacing={2} style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
      <Grid item xs={3} container justify='flex-start' alignItems='center' className={classes.marginTop}>
        {renderLeftHeader()}
      </Grid>
      <Grid item xs={9} container direction='row' justify='flex-end' alignItems='center' className={classes.marginTop}>
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
