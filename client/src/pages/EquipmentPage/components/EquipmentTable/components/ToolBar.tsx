import React, { FC, Fragment, useState, useEffect, useRef, useContext } from 'react';
import { Button, Chip, CircularProgress, Fade, Grid, IconButton, makeStyles, TextField, Theme, Tooltip, Typography } from '@material-ui/core';

import { format } from 'date-fns';
import DeleteIcon from '@material-ui/icons/Cancel';
import ExportIcon from '@material-ui/icons/GetApp';
import ViewColumn from '@material-ui/icons/ViewColumn';
import FilterTable from 'components/FilterTable';
import SearchInput from 'components/SearchInput';
import { CSVLink } from 'react-csv';
import theme from 'theme';
import SelectColumn from 'components/SelectColumn';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants } from 'selectors';
import { hasAccessPermission } from 'utils';
import { Autocomplete } from '@material-ui/lab';

interface Props {
  isProcessing: boolean;
  query: string;
  brandMaster: Select[];
  brandFilter: ColumnFilter[];
  serviceAddressFilter: ColumnFilter[];
  columns: SelectedColumn[];
  tableSettingId: number;
  csv: CSVEquipmentModel[];
  isExportingData: boolean;
  isSearchingClient: boolean;

  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setBrandFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  setServiceAddressFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  setColumns: React.Dispatch<React.SetStateAction<SelectedColumn[]>>;
  handleCsvClick: () => void;
  getClientName: (name: string) => Promise<ClientOption[]>;
  setClientId: React.Dispatch<React.SetStateAction<number>>;
  getServiceAddresses: (clientId: number) => Promise<Select[]>;
}

const useStyles = makeStyles((theme: Theme) => ({
  exportIcon: {
    fontSize: 20
  },
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

  const { query, setQuery, columns, setColumns, tableSettingId, getClientName, setClientId, isSearchingClient, getServiceAddresses } = props;
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);

  const { csv, isExportingData, handleCsvClick } = props;
  const isExportActive = hasAccessPermission('EQUIPMENTS', 'EXPORT', currentRoleGrants);
  const [csvData, setCsvData] = useState<CSVEquipmentModel[]>(csv);
  const [csvDownload, setCsvDownload] = useState<boolean>(false);
  const csvInstance = useRef<any | null>(null);
  const today = format(new Date(), 'dd-MM-yyyy');

  const [openColumnPopper, setOpenColumnPopper] = useState(false);
  const [anchorElColumn, setAnchorElColumn] = useState<HTMLElement | null>(null);

  const { brandMaster, brandFilter, setBrandFilter, serviceAddressFilter, setServiceAddressFilter } = props;
  const [selectedBrandData, setSelectedBrandData] = useState<Select[]>([]);
  const [selectedServiceAddressData, setSelectedServiceAddressData] = useState<Select[]>([]);

  const [tempClientValue, setTempClientValue] = useState<ClientOption>({ id: 0, name: '', firstServiceAddress: '', ContactPersons: [] });
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [clientName, setClientName] = useState<string>('');

  const [serviceAddressMaster, setServiceAddressMaster] = useState<Select[]>([]);

  useEffect(() => {
    if (!csvDownload || !csv || csv.length < 1) {
      return;
    }

    console.log(csv);
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

  const handleShowHideColumnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenColumnPopper(!openColumnPopper);
    setAnchorElColumn(event.currentTarget);
  };

  const handleClearFilter = () => {
    setBrandFilter([]);
    setSelectedBrandData([]);
    setServiceAddressFilter([]);
    setSelectedServiceAddressData([]);
  };

  const handleDeleteBrandFilter = (index: number) => {
    const currentFilter = [...brandFilter];
    const currentSelectedData = [...selectedBrandData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setBrandFilter(currentFilter);
    setSelectedBrandData(currentSelectedData);
  };

  const handleDeleteServiceAddressFilter = (index: number) => {
    const currentFilter = [...serviceAddressFilter];
    const currentSelectedData = [...selectedServiceAddressData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setServiceAddressFilter(currentFilter);
    setSelectedServiceAddressData(currentSelectedData);
  };

  const handleFreeTextClientName = async (value: string) => {
    if (value && value.length > 2) {
      const options = await getClientName(value);
      setClientOptions(options); // now options is ClientOption[]
    }
  };

  const handleChangeClientName = async (value: any) => {
    if (value) {
      setTempClientValue(value);
      setClientId(value.id);
      setClientName(value.name);

      const serviceAddresses = await getServiceAddresses(value.id);
      setServiceAddressMaster(serviceAddresses);
    }
  };

  const renderLeftHeader = () => {
    return (
      <div>
        <SearchInput
          withBorder
          withTransition={false}
          width={200}
          placeHolder='Search ID, Name, Location, etc.'
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
        <Autocomplete
          loading={isSearchingClient}
          options={clientOptions}
          getOptionLabel={option => option.name}
          value={tempClientValue}
          inputValue={clientName}
          onInputChange={(_, value, reason) => {
            if (reason === 'input') {
              setClientName(value);
              handleFreeTextClientName(value);
            }
            if (reason === 'clear') {
              setClientName('');
              setTempClientValue({ id: 0, name: '', firstServiceAddress: '', ContactPersons: [] });
              setClientId(0);
              setClientOptions([]);
              setServiceAddressMaster([]);
              setServiceAddressFilter([]);
              setSelectedServiceAddressData([]);
            }
          }}
          autoHighlight
          freeSolo
          onChange={(_, value) => handleChangeClientName(value)}
          renderInput={params => (
            <TextField {...params} label='Client Filter' variant='outlined' fullWidth margin='dense' style={{ width: 180, paddingRight: 8 }} />
          )}
        />
        <FilterTable
          masterData={serviceAddressMaster}
          selectedData={selectedServiceAddressData}
          setSelectedData={setSelectedServiceAddressData}
          columnFilter={serviceAddressFilter}
          setColumnFilter={setServiceAddressFilter}
          label='Service Address Filter'
        />
        <FilterTable
          masterData={brandMaster}
          selectedData={selectedBrandData}
          setSelectedData={setSelectedBrandData}
          columnFilter={brandFilter}
          setColumnFilter={setBrandFilter}
          label='Brand Filter'
        />
        {isExportActive && (
          <Tooltip title='Export to CSV' placement='top'>
            {csvData.length > 0 ? (
              <CSVLink
                headers={[
                  { label: 'ID', key: 'id' },
                  { label: 'Client Name', key: 'clientName' },
                  { label: 'Service Address', key: 'serviceAddress' },
                  { label: 'Location', key: 'location' },
                  { label: 'Brand', key: 'brand' },
                  { label: 'Model', key: 'model' },
                  { label: 'Serial Number', key: 'serialNumber' },
                  { label: 'Name/Description', key: 'description' },
                  { label: 'Last Work Done', key: 'dateWorkDone' },
                  { label: 'Warranty Start Date', key: 'warrantyStartDate' },
                  { label: 'Warranty End Date', key: 'warrantyEndDate' },
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
    if (brandFilter.length > 0 || serviceAddressFilter.length > 0) {
      return (
        <Grid container>
          <Grid item xs={1}>
            <Button color='primary' onClick={handleClearFilter}>
              <Typography variant='body1'>Clear Filter</Typography>
            </Button>
          </Grid>
          <Grid item xs={11}>
            {brandFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDeleteBrandFilter(index)}
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
    <Grid container spacing={2} style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
      <Grid item xs={3} container justify='flex-start' alignItems='center' className={classes.marginTop}>
        {renderLeftHeader()}
      </Grid>
      <Grid item xs={9} container direction='row' justify='flex-end' alignItems='center' className={classes.marginTop}>
        {renderRightHeader()}
      </Grid>
      {/* <Grid item xs={12}>
        {renderHeaderLabel()}
      </Grid> */}
      <Grid item xs={12} container justify='flex-start' alignItems='center'>
        {renderFilterHeader()}
      </Grid>
    </Grid>
  );
};

export default ToolBar;
