import React, { FC, useState, useEffect, useCallback, useContext } from 'react';
import clsx from 'clsx';
import { Button, Container, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';

import PersonAddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import useDebounce from 'hooks/useDebounce';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import axios, { CancelTokenSource } from 'axios';
import ActionSnackbar from 'components/ActionSnackbar';
import Breadcrumb from 'components/Breadcrumb';
import {
  BRAND_TEMPLATE_BASE_URL,
  CLIENT_BASE_URL,
  EQUIPMENT_BASE_URL,
  GET_CSV_EQUIPMENT_URL,
  GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL
} from 'constants/url';
import { TableColumnSettingContext } from 'contexts/TableColumnSettingContext';
import { CurrentPageContext } from 'contexts/CurrentPageContext';
import SideBarContent from 'components/SideBarContent';
import { dummyEquipmentColumn, dummyEquipments } from 'constants/dummy';
import EquipmentTable from './components/EquipmentTable';
import { format } from 'date-fns';
import EquipmentDetail from './components/EquipmentTable/components/EquipmentDetail';
import EquipmentForm from './components/EquipmentForm';
import ExportCsvProgress from 'components/ExportCsvProgress';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(4)
    }
  },
  paper: {
    margin: 'auto'
  },
  addGrid: {
    textAlign: 'end'
  },
  addButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  },
  headerColumn: {
    paddingTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  icon: {
    fontSize: 25
  },
  filterIcon: {
    fontSize: 20
  }
}));

const EquipmentPage: FC = () => {
  useCurrentPageTitleUpdater('Equipment List');
  const classes = useStyles();
  const { currentPageTitle } = useContext(CurrentPageContext);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('id');
  const { tableColumn } = useContext(TableColumnSettingContext);
  const [column, setColumn] = useState<any[]>(dummyEquipmentColumn);
  const [tableSettingId, setTableSettingId] = useState<number>(1);

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [isSearchingEquipment, setSearchingEquipment] = useState<boolean>(false);
  const [equipments, setEquipments] = useState<EquipmentModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [brandMaster, setBrandMaster] = useState<Select[]>([]);
  const [brandFilter, setBrandFilter] = useState<ColumnFilter[]>([]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedSubEquipmentIndex, setSelectedSubEquipmentIndex] = useState<number>(0);
  const [isAddSub, setIsAddSub] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isMain, setIsMain] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [isForm, setIsForm] = useState<boolean>(false);

  const [csv, setCsv] = useState<CSVEquipmentModel[]>([]);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const [isSearchingClient, setSearchingClient] = useState<boolean>(false);
  const [clientId, setClientId] = useState<number>(0);

  const [serviceAddressFilter, setServiceAddressFilter] = useState<ColumnFilter[]>([]);

  // Search Equipment whenever rowsPerPage, currentPage, queryString
  const getQueryParams = (noLimit?: boolean) => {
    const params = new URLSearchParams();

    if (queryString) {
      params.append('q', queryString);
    }

    if (orderBy) {
      params.append('ob', orderBy);
      params.append('ot', order);
    }

    if (brandFilter.length > 0) {
      brandFilter.map(value => {
        return params.append('brands', value.columnName.toString());
      });
    }

    if (clientId > 0) {
      params.append('ci', clientId.toString());
    }

    if (serviceAddressFilter.length > 0) {
      serviceAddressFilter.map(value => {
        return params.append('sai', value.columnValue.toString());
      });
    }

    if (!noLimit) {
      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());
    }

    return params.toString();
  };

  const getClientName = async (name: string): Promise<ClientOption[]> => {
    try {
      setSearchingClient(true);
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      const params = new URLSearchParams({ q: name, s: '0', l: '15' });

      const { data } = await axios.get(`${CLIENT_BASE_URL}?${params}`, {
        cancelToken: cancelTokenSource.token
      });
      setSearchingClient(false);
      return data.clients ?? []; // ✅ Always return ClientOption[]
    } catch (err) {
      console.error('getClientName error', err);
      setSearchingClient(false);
      return []; // ✅ Return empty array on error
    }
  };

  const getServiceAddresses = async (clientId: number): Promise<Select[]> => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    const { data } = await axios.get(`${GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL(clientId)}`, { cancelToken: cancelTokenSource.token });

    //Set service address master
    let serviceAddressData: Select[] = [];
    data.serviceAddresses.map((value: any) => {
      return serviceAddressData.push({ id: value.id, name: value.address });
    });
    return serviceAddressData;
  };

  const fetchData = useCallback(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    setSearchingEquipment(true);

    const searchEquipments = async () => {
      setSearchingEquipment(true);
      try {
        const url = `${EQUIPMENT_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        setEquipments(data.equipments);
        setCount(data.count);
      } catch (err) {
        console.log(err);
      }
      setSearchingEquipment(false);
    };

    searchEquipments();
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString, currentPage, rowsPerPage, brandFilter, serviceAddressFilter, clientId, order, orderBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tableColumn.length > 0) {
      const { column, id } = tableColumn.find(value => value.tableName === 'EQUIPMENT');

      setColumn(column);
      setTableSettingId(id);
    }
  }, [tableColumn]);

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getBrandTemplate = async () => {
      const { data } = await axios.get(`${BRAND_TEMPLATE_BASE_URL}`, { cancelToken: cancelTokenSource.token });

      let brandData: Select[] = [];
      if (data) {
        data.BrandTemplates.map((value: any) => {
          return brandData.push({ id: value.id, name: value.name });
        });
      }
      setBrandMaster(brandData);
    };
    getBrandTemplate();
  }, []);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  const handleSearch = (searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  };

  const debouncedSearchTerm = useDebounce(query, 500);
  // Load client data to populate on search list
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const handleSnackbar = (variant: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(message);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setIsForm(false);
    setSelectedIndex(0);
    setIsEdit(false);
    setSelectedSubEquipmentIndex(0);
    setIsMain(true);
    setIsAddSub(false);
  };

  const addNewEquipment = (equipment: EquipmentModel) => {
    equipment.isNew = true;
    equipments.unshift(equipment);
    setEquipments([...equipments]);
    setCount(c => c + 1);
  };

  const updateIndividualEquipment = (equipmentIndex: number) => {
    return (updatedEquipmentProperties: Partial<EquipmentModel>) => {
      setEquipments(
        equipments!.map((equipment, index) => {
          if (index !== equipmentIndex) {
            return equipment;
          }

          return Object.assign({}, equipment, updatedEquipmentProperties);
        })
      );
    };
  };

  const handleCsvClick = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    if (count >= 1000) {
      handleSnackbar('error', 'Cannot export more than 1000 records, please apply more filters to reduce the number of records.');
      return;
    }

    try {
      setIsExportingData(true);
      setCsv([]);
      setExportProgress(0);

      let csvData: CSVEquipmentModel[] = [];
      let counter = 0;
      while (counter < count) {
        const url = `${GET_CSV_EQUIPMENT_URL}?${getQueryParams(true)}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        const equipments: EquipmentModel[] = data.equipments ? data.equipments : [];
        if (equipments && equipments.length > 0) {
          equipments.map((value: any) => {
            return csvData.push({
              id: value.id,
              clientName: value.clientName,
              serviceAddress: value.address,
              location: value.location || '-',
              brand: value.brand || '-',
              model: value.model || '-',
              serialNumber: value.serialNumber || '-',
              description: value.description || '-',
              dateWorkDone: value.dateWorkDone ? format(new Date(value.dateWorkDone), 'dd-MM-yyyy') : '-',
              warrantyStartDate: value.warrantyStartDate ? value.warrantyStartDate : '-',
              warrantyEndDate: value.warrantyEndDate ? value.warrantyStartDate : '-',
              type: value.type
            });
          });
        }
        counter += 50;
        const progress = Math.min((counter / count) * 100, 100);
        setExportProgress(progress);
      }

      setCsv(csvData);
      setExportProgress(100);
      setIsExportingData(false);
      handleSnackbar('success', 'Successfully exported CSV');
    } catch (error) {
      console.log(error);
      setIsExportingData(false);
      handleSnackbar('error', 'Failed to export');
      setCsv([]);
    }
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item sm={6}>
          <Typography variant='h4' gutterBottom>
            {currentPageTitle}
          </Typography>
          <Breadcrumb pages={['equipments']} />
        </Grid>
        <Grid item sm={6} container alignItems='center' justify='flex-end' className={classes.addGrid}>
          <Button
            color='primary'
            size='medium'
            variant='contained'
            disableElevation
            className={classes.addButton}
            startIcon={<PersonAddIcon />}
            onClick={() => {
              setIsForm(true);
              setOpen(true);
            }}
          >
            New Equipment
          </Button>
        </Grid>
      </Grid>
      <Paper variant='outlined' className={classes.paper}>
        <EquipmentTable
          isLoadingData={isSearchingEquipment}
          equipments={equipments}
          count={count}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          order={order}
          orderBy={orderBy}
          query={query}
          brandMaster={brandMaster}
          brandFilter={brandFilter}
          serviceAddressFilter={serviceAddressFilter}
          selectedIndex={selectedIndex}
          selectedSubEquipmentIndex={selectedSubEquipmentIndex}
          isMain={isMain}
          column={column}
          tableSettingId={tableSettingId}
          csv={csv}
          isSearchingClient={isSearchingClient}
          handleSnackbar={handleSnackbar}
          handleChangePage={(event, page) => setCurrentPage(page)}
          handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
          setQuery={setQuery}
          setBrandFilter={setBrandFilter}
          setServiceAddressFilter={setServiceAddressFilter}
          setSelectedIndex={setSelectedIndex}
          isExportingData={isExportingData}
          setSelectedSubEquipmentIndex={setSelectedSubEquipmentIndex}
          setIsEdit={setIsEdit}
          setOpen={setOpen}
          setIsForm={setIsForm}
          setIsAddSub={setIsAddSub}
          setIsMain={setIsMain}
          updateIndividualEquipment={updateIndividualEquipment}
          setColumn={setColumn}
          handleCsvClick={handleCsvClick}
          getClientName={getClientName}
          setClientId={setClientId}
          getServiceAddresses={getServiceAddresses}
        />
      </Paper>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
      <SideBarContent
        title={isForm ? (isEdit ? 'Edit Equipment' : isAddSub ? 'Add Sub Equipment' : 'Add Equipment') : 'Work History'}
        open={open}
        onClickDrawer={handleCancel}
        width='60%'
      >
        {isForm ? (
          <EquipmentForm
            isSearchingClient={isSearchingClient}
            brandMaster={brandMaster}
            isAddSub={isAddSub}
            isEdit={isEdit}
            isMain={isMain}
            equipment={isEdit || isAddSub ? equipments[selectedIndex] : dummyEquipments}
            selectedSubEquipmentIndex={selectedSubEquipmentIndex}
            getClientName={getClientName}
            getServiceAddresses={getServiceAddresses}
            addNewEquipment={addNewEquipment}
            updatedIndividualEquipment={updateIndividualEquipment(selectedIndex)}
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
            handleCancel={handleCancel}
          />
        ) : (
          <EquipmentDetail
            equipment={
              isMain
                ? equipments.length > 0
                  ? equipments[selectedIndex]
                  : dummyEquipments
                : {
                    ...(equipments[selectedIndex].SubEquipments?.[selectedSubEquipmentIndex!] ?? dummyEquipments),
                    address: equipments[selectedIndex].address // ✅ inherit address from main
                  }
            }
            isMain={isMain}
          />
        )}
      </SideBarContent>
      {isExportingData && <ExportCsvProgress open={isExportingData} progress={exportProgress} />}
    </Container>
  );
};

export default EquipmentPage;
