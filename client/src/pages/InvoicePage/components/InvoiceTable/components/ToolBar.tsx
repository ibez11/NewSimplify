import React, { FC, Fragment, useState, useEffect, useRef } from 'react';

import { format } from 'date-fns';
import { Button, CircularProgress, Chip, Fade, Grid, IconButton, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';
import { CSVLink } from 'react-csv';

import PositionedPopper from 'components/PositionedPopper';
import FilterTable from 'components/FilterTable';
import SearchInput from 'components/SearchInput';
import SelectColumn from 'components/SelectColumn';
import ExportIcon from '@material-ui/icons/GetApp';
import CalendarIcon from '@material-ui/icons/EventNote';
import ViewColumn from '@material-ui/icons/ViewColumn';
import DeleteIcon from '@material-ui/icons/Cancel';
import theme from 'theme';
import { hasAccessPermission } from 'utils';

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
  invoiceStatus: Select[];
  columnFilter: ColumnFilter[];
  setColumnFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  csv: CSVInvoiceModel[];
  handleCsvClick: () => void;
  columns: SelectedColumn[];
  setColumns: React.Dispatch<React.SetStateAction<SelectedColumn[]>>;
  tableSettingId: number;
  currentRoleGrants: RoleGrantModel[];
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

  const { query, setQuery, isExportingData, columns, setColumns, tableSettingId, currentRoleGrants } = props;
  const { filterBy, setFilterBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const { invoiceStatus, columnFilter, setColumnFilter } = props;
  const { handleCsvClick, csv } = props;
  const isExportActive = hasAccessPermission('INVOICES', 'EXPORT', currentRoleGrants);

  const [openCalendarPopper, setOpenCalendarPopper] = useState(false);
  const [anchorElCalendar, setAnchorElCalendar] = useState<HTMLElement | null>(null);
  const [placementCalendarPopper, setPlacementCalendarPopper] = useState<PopperPlacementType>();
  const [openColumnPopper, setOpenColumnPopper] = useState(false);
  const [anchorElColumn, setAnchorElColumn] = useState<HTMLElement | null>(null);

  const [csvData, setCsvData] = useState<CSVInvoiceModel[]>(csv);
  const [csvDownload, setCsvDownload] = useState<boolean>(false);
  const csvInstance = useRef<any | null>(null);
  const [selectedData, setSelectedData] = useState<Select[]>([]);

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
    setColumnFilter([]);
    setSelectedData([]);
  };

  const handleDelete = (index: number) => {
    const currentFilter = [...columnFilter];
    const currentSelectedData = [...selectedData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setColumnFilter(currentFilter);
    setSelectedData(currentSelectedData);
  };

  // const renderHeaderLabel = () => {
  //   if (filterBy && startDate && endDate) {
  //     return (
  //       <Typography variant='h6'>
  //         ({format(new Date(startDate), 'dd/MM/yyyy')} - {format(new Date(endDate), 'dd/MM/yyyy')})
  //       </Typography>
  //     );
  //   }
  // };

  const renderLeftHeader = () => {
    return (
      <SearchInput
        withBorder
        withTransition={false}
        width={200}
        placeHolder='Search Invoice Number, Client'
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
          masterData={invoiceStatus}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          label='Filter Status'
        />
        <PositionedPopper
          openPopper={openCalendarPopper}
          setOpenPopper={setOpenCalendarPopper}
          anchorEl={anchorElCalendar}
          placement={placementCalendarPopper}
          containerWidth={320}
          fadeTransition={350}
          popperComponent='dateRangePicker'
          options={[
            { key: '1', label: 'Today' },
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
        {openColumnPopper && (
          <SelectColumn
            open={openColumnPopper}
            setOpen={setOpenColumnPopper}
            anchorEl={anchorElColumn}
            columns={columns}
            setColumns={setColumns}
            tableSettingId={tableSettingId}
          />
        )}

        <Tooltip title='Calendar filter' placement='top'>
          <IconButton onClick={event => handleCalendarFilterClick(event)}>
            <CalendarIcon className={classes.calendarIcon} />
          </IconButton>
        </Tooltip>
        {isExportActive && (
          <Tooltip title='Export to CSV' placement='top'>
            {csvData.length > 0 ? (
              <CSVLink
                headers={[
                  { label: 'Invoice Number', key: 'invoiceNumber' },
                  { label: 'Client', key: 'clientName' },
                  { label: 'Quotation Title', key: 'invoiceTitle' },
                  { label: 'Invoice Date', key: 'invoiceDate' },
                  { label: 'Total Amount', key: 'totalAmount' },
                  { label: 'Collected Amount', key: 'collectedAmount' },
                  { label: 'Invoice Status', key: 'invoiceStatus' },
                  { label: 'Entity', key: 'entityName' },
                  { label: 'Custom Field Label 1', key: 'customFieldLabel1' },
                  { label: 'Custom Field Value 1', key: 'customFieldValue1' },
                  { label: 'Custom Field Label 2', key: 'customFieldLabel2' },
                  { label: 'Custom Field Value 2', key: 'customFieldValue2' }
                ]}
                filename={'Invoices ' + format(new Date(), 'dd-MM-yyyy') + '.csv'}
                asyncOnClick={true}
                onClick={(event: any) => {
                  setCsvDownload(true);
                  return false;
                }}
                ref={csvInstance}
                data={csv}
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
        <Tooltip title='Show/Hide Column' placement='top'>
          <IconButton onClick={event => handleShowHideColumnClick(event)}>
            <ViewColumn className={classes.icon} />
          </IconButton>
        </Tooltip>
      </Fragment>
    );
  };

  const renderFilterHeader = () => {
    if (columnFilter.length > 0) {
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
          </Grid>
        </Grid>
      );
    }
  };

  const handleCalendarFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCalendarPopper(!openCalendarPopper);
    setAnchorElCalendar(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

  const handleShowHideColumnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenColumnPopper(!openColumnPopper);
    setAnchorElColumn(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

  return (
    <Grid container spacing={2} style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
      <Grid item xs={4} container justify='flex-start' alignItems='center' className={classes.marginTop}>
        {renderLeftHeader()}
      </Grid>
      <Grid item xs={8} container direction='row' justify='flex-end' alignItems='center' className={classes.marginTop}>
        {renderRightHeader()}
      </Grid>
      <Grid item xs={12} container justify='flex-start' alignItems='center'>
        {renderFilterHeader()}
      </Grid>
    </Grid>
  );
};

export default ToolBar;
