import React, { FC, Fragment, useState } from 'react';

import { format } from 'date-fns';
import { Button, Chip, Grid, IconButton, makeStyles, MenuItem, TextField, Theme, Tooltip, Typography } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';

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
  entities: Select[];
  serviceAddresses: Select[];
  contractTypes: Select[];
  contractTypeFilter: ColumnFilter[];
  setContractTypeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  entityFilter: ColumnFilter[];
  setEntityFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  invoiceFilter: ColumnFilter[];
  setInvoiceFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  serviceAddressFilter: ColumnFilter[];
  setServiceAddressFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  renewFilter: ColumnFilter[];
  setRenewFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  selectedStatus: number;
  setSelectedStatus: React.Dispatch<React.SetStateAction<number>>;
  columns: SelectedColumn[];
  setColumns: React.Dispatch<React.SetStateAction<SelectedColumn[]>>;
  tableSettingId: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: 20
  },
  calendarIcon: (props: Props) => ({
    fontSize: 20,
    color: props.filterBy ? theme.palette.primary.main : ''
  }),
  deleteIcon: {
    color: '#53A0BE'
  },
  filterChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  selectField: {
    width: 180,
    paddingBottom: 5,
    marginRight: theme.spacing(1)
  }
}));
const ToolBar: FC<Props> = props => {
  const classes = useStyles(props);

  const [openCalendarPopper, setOpenCalendarPopper] = useState(false);
  const [anchorElCalendarPopper, setAnchorElCalendarPopper] = useState<HTMLElement | null>(null);
  const [placementCalendarPopper, setPlacementCalendarPopper] = useState<PopperPlacementType>();

  const { entities, contractTypes, serviceAddresses, columns, setColumns, tableSettingId } = props;
  const { query, setQuery } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const {
    contractTypeFilter,
    setContractTypeFilter,
    entityFilter,
    setEntityFilter,
    invoiceFilter,
    setInvoiceFilter,
    serviceAddressFilter,
    setServiceAddressFilter,
    renewFilter,
    setRenewFilter,
    selectedStatus,
    setSelectedStatus
  } = props;

  const [selectedData, setSelectedData] = useState<Select[]>([]);
  const [selectedEntityData, setSelectedEntityData] = useState<Select[]>([]);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<Select[]>([]);
  const [selectedServiceAddressData, setSelectedServiceAddressData] = useState<Select[]>([]);
  const [selectedRenewData, setSelectedRenewData] = useState<Select[]>([]);
  const [selectedStatusName, setSelectedStatusName] = useState<string>('');
  const [openColumnPopper, setOpenColumnPopper] = useState(false);
  const [anchorElColumn, setAnchorElColumn] = useState<HTMLElement | null>(null);

  const invoiceFilterParams: Select[] = [
    { id: 1, name: 'Has Invoice', value: 'true' },
    { id: 2, name: 'No Invoice', value: 'false' }
  ];
  const statusFilterParams: Select[] = [
    { id: 1, name: 'Active' },
    { id: 2, name: 'Expiring' },
    { id: 3, name: 'Expired' },
    { id: 4, name: 'Completed' },
    { id: 6, name: 'Pending' }
  ];
  const renewFilterParams: Select[] = [
    { id: 1, name: 'Renewed', value: 'true' },
    { id: 2, name: 'Not Renewed', value: 'false' }
  ];

  const handleCalendarFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCalendarPopper(!openCalendarPopper);
    setAnchorElCalendarPopper(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

  const handleClearFilter = () => {
    setContractTypeFilter([]);
    setSelectedData([]);
    setEntityFilter([]);
    setSelectedEntityData([]);
    setInvoiceFilter([]);
    setServiceAddressFilter([]);
    setSelectedServiceAddressData([]);
    setSelectedInvoiceData([]);
    setRenewFilter([]);
    setSelectedRenewData([]);
    setSelectedStatus(0);
    setSelectedStatusName('');
  };

  const handleDelete = (index: number) => {
    const currentFilter = [...contractTypeFilter];
    const currentSelectedData = [...selectedData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setContractTypeFilter(currentFilter);
    setSelectedData(currentSelectedData);
  };

  const handleDeleteEntityFilter = (index: number) => {
    const currentFilter = [...entityFilter];
    const currentSelectedData = [...selectedEntityData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setEntityFilter(currentFilter);
    setSelectedEntityData(currentSelectedData);
  };

  const handleDeleteInvoiceFilter = (index: number) => {
    const currentFilter = [...invoiceFilter];
    const currentSelectedData = [...selectedInvoiceData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setInvoiceFilter(currentFilter);
    setSelectedInvoiceData(currentSelectedData);
  };

  const handleDeleteServiceAddressFilter = (index: number) => {
    const currentFilter = [...serviceAddressFilter];
    const currentSelectedData = [...selectedServiceAddressData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setServiceAddressFilter(currentFilter);
    setSelectedServiceAddressData(currentSelectedData);
  };

  const handleDeleteRenewFilter = (index: number) => {
    const currentFilter = [...renewFilter];
    const currentSelectedData = [...selectedRenewData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setRenewFilter(currentFilter);
    setSelectedRenewData(currentSelectedData);
  };

  const handleDeleteStatusFilter = () => {
    setSelectedStatus(0);
    setSelectedStatusName('');
  };

  const handleChangeStatus = (value: number) => {
    setSelectedStatusName(
      value === 1 ? 'Active' : value === 2 ? 'Expiring' : value === 3 ? 'Expired' : value === 4 ? 'Completed' : value === 6 ? 'Pending' : ''
    );
    setSelectedStatus(value);
    setFilterBy('');
  };

  const handleShowHideColumnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenColumnPopper(!openColumnPopper);
    setAnchorElColumn(event.currentTarget);
  };

  const renderHeaderLabel = () => {
    if (filterBy) {
      if (filterBy === 'termStart' && startDate && endDate) {
        return (
          <Typography variant='body1'>
            (by start date {format(new Date(startDate), 'dd/MM/yyyy')} - {format(new Date(endDate), 'dd/MM/yyyy')})
          </Typography>
        );
      } else if (filterBy === 'termEnd' && startDate && endDate) {
        return (
          <Typography variant='body1'>
            (by end date {format(new Date(startDate), 'dd/MM/yyyy')} - {format(new Date(endDate), 'dd/MM/yyyy')})
          </Typography>
        );
      } else if (filterBy === 'within1Month') {
        return (
          <Typography variant='body1'>
            (Expiring quotations within <b>1 months</b>)
          </Typography>
        );
      } else if (filterBy === 'within2Month') {
        return (
          <Typography variant='body1'>
            (Expiring quotations within <b>2 months</b>)
          </Typography>
        );
      } else if (filterBy === 'today') {
        return (
          <Typography variant='body1'>
            (Expired quotations <b>today</b>)
          </Typography>
        );
      } else if (filterBy === 'lastMonth') {
        return (
          <Typography variant='body1'>
            (Expired quotations <b>last month</b>)
          </Typography>
        );
      } else if (filterBy === 'last3Month') {
        return (
          <Typography variant='body1'>
            (Expired quotations <b>last 3 month</b>)
          </Typography>
        );
      }
    } else if (selectedStatus === 2) {
      return (
        <Typography variant='body1'>
          (Expiring quotations within <b>3 months</b>)
        </Typography>
      );
    }
  };

  const renderLeftHeader = () => {
    return (
      <div style={{ marginTop: theme.spacing(1) }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={200}
          placeHolder='Search ID, Title'
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
        <Grid container alignItems='center'>
          <Grid item xs={11}>
            <Grid container justify='flex-end' alignItems='center'>
              <FilterTable
                masterData={contractTypes}
                selectedData={selectedData}
                setSelectedData={setSelectedData}
                columnFilter={contractTypeFilter}
                setColumnFilter={setContractTypeFilter}
                label='Filter Quotation Type'
              />
              <FilterTable
                masterData={entities}
                selectedData={selectedEntityData}
                setSelectedData={setSelectedEntityData}
                columnFilter={entityFilter}
                setColumnFilter={setEntityFilter}
                label='Filter Entity'
              />
              <FilterTable
                masterData={invoiceFilterParams}
                selectedData={selectedInvoiceData}
                setSelectedData={setSelectedInvoiceData}
                columnFilter={invoiceFilter}
                setColumnFilter={setInvoiceFilter}
                label='Filter Invoice'
              />
              <FilterTable
                masterData={serviceAddresses}
                selectedData={selectedServiceAddressData}
                setSelectedData={setSelectedServiceAddressData}
                columnFilter={serviceAddressFilter}
                setColumnFilter={setServiceAddressFilter}
                label='Filter Service Address'
              />
              <TextField
                select
                margin='dense'
                id='vehicle'
                label='Filter Status'
                value={selectedStatus}
                onChange={event => handleChangeStatus(+event.target.value)}
                variant='outlined'
                autoComplete='off'
                className={classes.selectField}
              >
                <MenuItem key={0} value={0}>
                  All
                </MenuItem>
                {statusFilterParams.map(value => {
                  return (
                    <MenuItem key={value.id} value={value.id}>
                      {value.name}
                    </MenuItem>
                  );
                })}
              </TextField>
              <FilterTable
                masterData={renewFilterParams}
                selectedData={selectedRenewData}
                setSelectedData={setSelectedRenewData}
                columnFilter={renewFilter}
                setColumnFilter={setRenewFilter}
                label='Filter Renewed'
              />
            </Grid>
          </Grid>
          <Grid container item xs={1} justify='center'>
            <PositionedPopper
              openPopper={openCalendarPopper}
              setOpenPopper={setOpenCalendarPopper}
              anchorEl={anchorElCalendarPopper}
              placement={placementCalendarPopper}
              containerWidth={320}
              fadeTransition={350}
              popperComponent='dateRangePicker'
              options={
                selectedStatus === 2
                  ? [
                      { key: 'within1Month', label: 'Within 1 Month' },
                      { key: 'within2Month', label: 'Within 2 Month' },
                      { key: 'termEnd', label: 'Term End Date' }
                    ]
                  : selectedStatus === 3
                  ? [
                      { key: 'today', label: 'today' },
                      { key: 'lastMonth', label: 'Last Month' },
                      { key: 'last3Month', label: 'Last 3 Month' },
                      { key: 'termEnd', label: 'Term End Date' }
                    ]
                  : [
                      { key: 'today', label: 'Today' },
                      { key: 'thisWeek', label: 'This Week' },
                      { key: 'thisMonth', label: 'This Month' },
                      { key: 'lastMonth', label: 'Last Month' },
                      { key: 'termStart', label: 'Custom Term Start Date' },
                      { key: 'termEnd', label: 'Custom Term End Date' }
                    ]
              }
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
          </Grid>
        </Grid>
      </Fragment>
    );
  };

  const renderFilterHeader = () => {
    if (
      contractTypeFilter.length > 0 ||
      entityFilter.length > 0 ||
      invoiceFilter.length > 0 ||
      serviceAddressFilter.length > 0 ||
      renewFilter.length > 0 ||
      selectedStatus > 0
    ) {
      return (
        <Grid container>
          <Grid item xs={1}>
            <Button color='primary' onClick={handleClearFilter}>
              <Typography variant='body1'>Clear Filter</Typography>
            </Button>
          </Grid>
          <Grid item xs={11}>
            {contractTypeFilter.map((value, index) => (
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
            {entityFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteEntityFilter(index)}
              />
            ))}
            {invoiceFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteInvoiceFilter(index)}
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
            {renewFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteRenewFilter(index)}
              />
            ))}
            {selectedStatus !== 0 && (
              <Chip
                label={selectedStatusName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={handleDeleteStatusFilter}
              />
            )}
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Grid container spacing={2} style={{ padding: theme.spacing(2), paddingBottom: 0 }}>
      <Grid item xs={5} container justify='flex-start'>
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
