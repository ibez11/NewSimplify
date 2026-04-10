import React, { FC, Fragment, useState, useRef, useEffect } from 'react';
import { Button, Chip, CircularProgress, Fade, Grid, IconButton, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import { PopperPlacementType } from '@material-ui/core/Popper';
import { format } from 'date-fns';

import CalendarIcon from '@material-ui/icons/EventNote';
import DeleteIcon from '@material-ui/icons/Cancel';
import ExportIcon from '@material-ui/icons/GetApp';
import PositionedPopper from 'components/PositionedPopper';
import FilterTable from 'components/FilterTable';
import SearchInput from 'components/SearchInput';
import { CSVLink } from 'react-csv';
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
  serviceAddressMaster: Select[];
  serviceAddressFilter: ColumnFilter[];
  setServiceAddressFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  csv: CSVEquipmentModel[];
  isExportingData: boolean;
  handleCsvClick: () => void;
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
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const ToolBar: FC<Props> = props => {
  const classes = useStyles(props);
  const [openCalendarPopper, setOpenCalendarPopper] = useState(false);
  const [anchorElCalendarPopper, setAnchorElCalendarPopper] = useState<HTMLElement | null>(null);
  const [placementCalendarPopper, setPlacementCalendarPopper] = useState<PopperPlacementType>();
  const { query, setQuery } = props;
  const { filterBy, setFilterBy, serviceAddressMaster, serviceAddressFilter, setServiceAddressFilter } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const { csv, isExportingData, handleCsvClick } = props;

  const [selectedServiceAddressData, setSelectedServiceAddressData] = useState<Select[]>([]);
  const [csvData, setCsvData] = useState<CSVEquipmentModel[]>(csv);
  const [csvDownload, setCsvDownload] = useState<boolean>(false);
  const csvInstance = useRef<any | null>(null);
  const today = format(new Date(), 'dd-MM-yyyy');

  const handleCalendarFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenCalendarPopper(!openCalendarPopper);
    setAnchorElCalendarPopper(event.currentTarget);
    setPlacementCalendarPopper('bottom-end');
  };

  const handleClearFilter = () => {
    setServiceAddressFilter([]);
    setSelectedServiceAddressData([]);
  };

  const handleDeleteServiceAddressFilter = (index: number) => {
    const currentFilter = [...serviceAddressFilter];
    const currentSelectedData = [...selectedServiceAddressData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setServiceAddressFilter(currentFilter);
    setSelectedServiceAddressData(currentSelectedData);
  };

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
          placeHolder='Search brand or serial number'
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
          options={[{ key: '5', label: 'Custom Date' }]}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        <Tooltip title='Calendar filter' placement='top'>
          <IconButton onClick={event => handleCalendarFilterClick(event)} className={classes.calendarIcon}>
            <CalendarIcon className={classes.icon} />
          </IconButton>
        </Tooltip>
        <Tooltip title='Export to CSV' placement='top'>
          {csvData.length > 0 ? (
            <CSVLink
              headers={[
                { label: 'ID', key: 'id' },
                { label: 'Brand', key: 'brand' },
                { label: 'Model', key: 'model' },
                { label: 'Serial Number', key: 'serialNumber' },
                { label: 'Service Address', key: 'serviceAddress' },
                { label: 'Location', key: 'location' },
                { label: 'Last Work Done', key: 'dateWorkDone' },
                { label: 'Last Updated By', key: 'displayName' },
                { label: 'Equipment Type', key: 'type' }
              ]}
              filename={`Equipment_List_${today}.csv`}
              asyncOnClick={true}
              onClick={(event: any) => {
                setCsvDownload(true);
                return false;
              }}
              ref={csvInstance}
              data={csvData}
            >
              <IconButton>
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
      </Fragment>
    );
  };

  const renderFilterHeader = () => {
    if (serviceAddressFilter.length > 0) {
      return (
        <Grid container>
          <Grid item xs={1}>
            <Button color='primary' onClick={handleClearFilter}>
              <Typography variant='body1'>Clear Filter</Typography>
            </Button>
          </Grid>
          <Grid item xs={11}>
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
