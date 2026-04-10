import React, { FC, Fragment, useState, useEffect, useRef } from 'react';

import { format } from 'date-fns';
import { Button, CircularProgress, Chip, Fade, Grid, IconButton, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';

import CalendarIcon from '@material-ui/icons/EventNote';
import DeleteIcon from '@material-ui/icons/Cancel';
import ExportIcon from '@material-ui/icons/GetApp';
import ViewColumn from '@material-ui/icons/ViewColumn';
import PositionedPopper from 'components/PositionedPopper';
import FilterTable from 'components/FilterTable';
import SearchInput from 'components/SearchInput';
import SelectColumn from 'components/SelectColumn';
import { CSVLink } from 'react-csv';
import theme from 'theme';

interface Props {
  isExportingData: boolean;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  filterBy: string;
  setFilterBy: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  entities: Select[];
  contractTypes: Select[];
  contractTypeFilter: ColumnFilter[];
  setContractTypeFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  entityFilter: ColumnFilter[];
  setEntityFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  renewFilter: ColumnFilter[];
  setRenewFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  invoiceFilter: ColumnFilter[];
  setInvoiceFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  csv: CSVContractModel[];
  selectedTabId: number;
  handleCsvClick: () => void;
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

  const [openCalendarPopper, setOpenCalendarPopper] = useState(false);
  const [anchorElCalendarPopper, setAnchorElCalendarPopper] = useState<HTMLElement | null>(null);
  const [placementCalendarPopper, setPlacementCalendarPopper] = useState<PopperPlacementType>();

  const { entities, contractTypes, isExportingData, columns, setColumns, tableSettingId } = props;
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
    renewFilter,
    setRenewFilter
  } = props;
  const { selectedTabId, handleCsvClick, csv } = props;

  const [csvData, setCsvData] = useState<CSVContractModel[]>(csv);
  const [csvDownload, setCsvDownload] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<Select[]>([]);
  const [selectedEntityData, setSelectedEntityData] = useState<Select[]>([]);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<Select[]>([]);
  const [selectedRenewData, setSelectedRenewData] = useState<Select[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [openColumnPopper, setOpenColumnPopper] = useState(false);
  const [anchorElColumn, setAnchorElColumn] = useState<HTMLElement | null>(null);

  const invoiceFilterParams: Select[] = [
    { id: 1, name: 'Has Invoice', value: 'true' },
    { id: 2, name: 'No Invoice', value: 'false' }
  ];
  const renewFilterParams: Select[] = [
    { id: 1, name: 'Renewed', value: 'true' },
    { id: 2, name: 'Not Renewed', value: 'false' }
  ];

  const csvInstance = useRef<any | null>(null);
  const today = format(new Date(), 'dd-MM-yyyy');

  useEffect(() => {
    if (selectedTabId === 0) {
      setSelectedTab('All');
    } else if (selectedTabId === 1) {
      setSelectedTab('Active');
    } else if (selectedTabId === 2) {
      setSelectedTab('Expiring');
    } else if (selectedTabId === 3) {
      setSelectedTab('Expired');
    } else if (selectedTabId === 4) {
      setSelectedTab('Completed');
    } else if (selectedTabId === 5) {
      setSelectedTab('Cancelled');
    } else if (selectedTabId === 6) {
      setSelectedTab('Pending');
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

  const handleCsvIconClick = async () => {
    handleCsvClick();
    setCsvDownload(true);
  };

  const handleClearFilter = () => {
    setContractTypeFilter([]);
    setSelectedData([]);
    setEntityFilter([]);
    setSelectedEntityData([]);
    setInvoiceFilter([]);
    setSelectedInvoiceData([]);
    setRenewFilter([]);
    setSelectedRenewData([]);
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

  const handleDeleteRenewFilter = (index: number) => {
    const currentFilter = [...renewFilter];
    const currentSelectedData = [...selectedRenewData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setRenewFilter(currentFilter);
    setSelectedRenewData(currentSelectedData);
  };

  const handleCalendarFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCalendarPopper(!openCalendarPopper);
    setAnchorElCalendarPopper(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

  const handleShowHideColumnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenColumnPopper(!openColumnPopper);
    setAnchorElColumn(event.currentTarget);
  };

  const renderHeaderLabel = () => {
    if (filterBy) {
      if (filterBy === 'termStart' && startDate && endDate) {
        return (
          <Typography variant='h6'>
            Quotations from {format(new Date(startDate), 'dd/MM/yyyy')} - {format(new Date(endDate), 'dd/MM/yyyy')}
          </Typography>
        );
      } else if (filterBy === 'termEnd' && startDate && endDate) {
        return (
          <Typography variant='h6'>
            Quotations from {format(new Date(startDate), 'dd/MM/yyyy')} - {format(new Date(endDate), 'dd/MM/yyyy')}
          </Typography>
        );
      } else if (filterBy === 'within1Month') {
        return (
          <Typography variant='h6'>
            Expiring quotations within <b>1 months</b>
          </Typography>
        );
      } else if (filterBy === 'within2Month') {
        return (
          <Typography variant='h6'>
            Expiring quotations within <b>2 months</b>
          </Typography>
        );
      } else if (filterBy === 'today') {
        return (
          <Typography variant='h6'>
            Expired quotations <b>today</b>
          </Typography>
        );
      } else if (filterBy === 'lastMonth') {
        return (
          <Typography variant='h6'>
            Expired quotations <b>last month</b>
          </Typography>
        );
      } else if (filterBy === 'last3Month') {
        return (
          <Typography variant='h6'>
            (Expired quotations <b>last 3 month</b>)
          </Typography>
        );
      }
    } else if (selectedTabId === 2) {
      return (
        <Typography variant='h6'>
          Expiring quotations within <b>3 months</b>
        </Typography>
      );
    } else if (selectedTabId === 3) {
      return (
        <Typography variant='h6'>
          Expired quotations last <b>6 months</b>
        </Typography>
      );
    }
  };

  const renderLeftHeader = () => {
    return (
      <div>
        <SearchInput
          withBorder
          withTransition={false}
          width={200}
          placeHolder='Search ID, Client, Title'
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
        {(selectedTabId === 2 || selectedTabId === 3) && (
          <FilterTable
            masterData={renewFilterParams}
            selectedData={selectedRenewData}
            setSelectedData={setSelectedRenewData}
            columnFilter={renewFilter}
            setColumnFilter={setRenewFilter}
            label='Filter Renewed'
          />
        )}
        <PositionedPopper
          openPopper={openCalendarPopper}
          setOpenPopper={setOpenCalendarPopper}
          anchorEl={anchorElCalendarPopper}
          placement={placementCalendarPopper}
          containerWidth={320}
          fadeTransition={350}
          popperComponent='dateRangePicker'
          options={
            selectedTabId === 2
              ? [
                  { key: 'within1Month', label: 'Within 1 Month' },
                  { key: 'within2Month', label: 'Within 2 Month' },
                  { key: 'termEnd', label: 'Term End Date' }
                ]
              : selectedTabId === 3
              ? [
                  { key: 'today', label: 'Today' },
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
        {selectedTabId !== 0 && (
          <Tooltip title='Export to CSV' placement='top'>
            {csvData.length > 0 ? (
              <CSVLink
                headers={[
                  { label: 'Quotation ID', key: 'id' },
                  { label: 'Client', key: 'clientName' },
                  { label: 'Entity', key: 'entity' },
                  { label: 'Quotation Title', key: 'contractTitle' },
                  { label: 'Quotation Type', key: 'contractType' },
                  { label: 'Quotation Status', key: 'contractStatus' },
                  { label: 'Start Date', key: 'startDate' },
                  { label: 'End Date', key: 'endDate' },
                  { label: 'Created Date', key: 'createdDate' },
                  { label: 'Invoice No', key: 'invoiceNumber' },
                  { label: 'Payment Status', key: 'paymentStatus' },
                  { label: 'Quotation Amount', key: 'contractAmount' },
                  { label: 'Collected Amount', key: 'collectedAmount' },
                  { label: 'Outstanding Amount', key: 'outstandingAmount' },
                  { label: 'Custom Field Label 1', key: 'customFieldLabel1' },
                  { label: 'Custom Field Value 1', key: 'customFieldValue1' },
                  { label: 'Custom Field Label 2', key: 'customFieldLabel2'},
                  { label: 'Custom Field Value 2', key: 'customFieldValue2'}
                ]}
                filename={`Quotation_List_${selectedTab}_${today}.csv`}
                asyncOnClick={true}
                onClick={(event: any) => {
                  setCsvDownload(true);
                  return false;
                }}
                ref={csvInstance}
                data={csvData}
              >
                <IconButton disabled={isExportingData}>
                  <ExportIcon className={classes.icon} />
                </IconButton>
              </CSVLink>
            ) : (
              <IconButton disabled={isExportingData} onClick={handleCsvIconClick}>
                <ExportIcon className={classes.icon} />
                {isExportingData && (
                  <Fade
                    in={isExportingData}
                    style={{
                      transitionDelay: '0ms'
                    }}
                    unmountOnExit
                  >
                    <CircularProgress size={24} className={classes.buttonProgress} />
                  </Fade>
                )}
              </IconButton>
            )}
          </Tooltip>
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
    if (contractTypeFilter.length > 0 || entityFilter.length > 0 || invoiceFilter.length > 0 || renewFilter.length > 0) {
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
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Grid container spacing={2} style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
      <Grid item xs={4} container justify='flex-start' alignItems='center' className={classes.marginTop}>
        {renderLeftHeader()}
      </Grid>
      <Grid item xs={8} container direction='row' justify='flex-end' alignItems='center' className={classes.marginTop}>
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
