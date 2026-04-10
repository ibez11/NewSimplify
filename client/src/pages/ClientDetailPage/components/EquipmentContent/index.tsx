import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import axios, { CancelTokenSource } from 'axios';
import useDebounce from 'hooks/useDebounce';
import useRouter from 'hooks/useRouter';

import { Paper, Theme, makeStyles } from '@material-ui/core';
import { format } from 'date-fns';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import EquipmentTable from './components/EquipmentTable';

import ActionSnackbar from 'components/ActionSnackbar';
import SideBarContent from 'components/SideBarContent';
import EquipmentForm from './components/EquipmentForm';
import { BRAND_TEMPLATE_BASE_URL, EQUIPMENT_BASE_URL, GET_CSV_EQUIPMENT_URL } from 'constants/url';
import { dummyEquipments } from 'constants/dummy';

interface Props {
  serviceAddressMaster: Select[];
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto'
  }
}));

const EquipmentContent = forwardRef<{}, Props>((props, ref) => {
  const classes = useStyles();
  const { serviceAddressMaster } = props;
  const { match } = useRouter();
  const clientId = match.params.id;

  const [equipments, setEquipments] = useState<EquipmentModel[]>([]);
  const [count, setCount] = useState<number>(0);
  const [brandMaster, setBrandMaster] = useState<Select[]>([]);

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingEquipment, setSearchingEquipment] = useState<boolean>(false);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [filterBy, setFilterBy] = useState<string>('');
  const [serviceAddressFilter, setServiceAddressFilter] = useState<ColumnFilter[]>([]);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedSubEquipmentIndex, setSelectedSubEquipmentIndex] = useState<number>(0);
  const [isAddSub, setIsAddSub] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isMain, setIsMain] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);

  const [csv, setCsv] = useState<CSVEquipmentModel[]>([]);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);

  const handleCancel = () => {
    setOpenForm(false);
    setSelectedIndex(0);
    setIsEdit(false);
    setSelectedSubEquipmentIndex(0);
    setIsMain(true);
    setIsAddSub(false);
  };

  const getQueryParams = (noLimit?: boolean) => {
    const params = new URLSearchParams();

    if (queryString) {
      params.append('q', queryString);
    }

    if (orderBy) {
      params.append('ob', orderBy);
      params.append('ot', order);
    }

    if (filterBy) {
      if (startDate || endDate) {
        params.append('fb', filterBy.toString());
        params.append('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd').toString() : '');
        params.append('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd').toString() : '');
      }
    }

    if (serviceAddressFilter.length > 0) {
      serviceAddressFilter.map(value => {
        return params.append('sai', value.columnValue.toString());
      });
    }

    params.append('ci', clientId);

    if (!noLimit) {
      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());
    }

    return params.toString();
  };

  // Search Equipment whenever rowsPerPage, currentPage, queryString
  const fetchData = useCallback(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const searchEquipment = async () => {
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

    searchEquipment();
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsPerPage, currentPage, queryString, filterBy, serviceAddressFilter, clientId, startDate, endDate, order, orderBy]);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useImperativeHandle(ref, () => ({
    handleOpenCreateEquipment: () => {
      return setOpenForm(true);
    }
  }));

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  const handleSearch = useCallback((searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  }, []);

  const debouncedSearchTerm = useDebounce(query, 500);
  // Load client data to populate on search list
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
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
      const url = `${GET_CSV_EQUIPMENT_URL}?${getQueryParams(true)}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

      let equipments: EquipmentModel[] = data.equipments ? data.equipments : [];
      let csvData: CSVEquipmentModel[] = [];
      if (equipments && equipments.length > 0) {
        equipments.map((value: any) => {
          return csvData.push({
            id: value.id,
            brand: value.brand,
            model: value.model,
            serialNumber: value.serialNumber,
            serviceAddress: value.address,
            location: value.location,
            dateWorkDone: value.dateWorkDone ? format(new Date(value.dateWorkDone), 'dd-MM-yyyy') : '-',
            displayName: value.displayName,
            type: value.type
          });
        });
      }

      setCsv(csvData);
      setIsExportingData(false);
    } catch (error) {
      console.log(error);
      setIsExportingData(false);
    }
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <EquipmentTable
        isLoadingData={isSearchingEquipment}
        count={count}
        equipments={equipments}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        query={query}
        setQuery={setQuery}
        order={order}
        setOrder={setOrder}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        serviceAddressMaster={serviceAddressMaster}
        serviceAddressFilter={serviceAddressFilter}
        setServiceAddressFilter={setServiceAddressFilter}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        handleSnackbar={handleSnackbar}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        selectedSubEquipmentIndex={selectedSubEquipmentIndex}
        setSelectedSubEquipmentIndex={setSelectedSubEquipmentIndex}
        setOpenForm={setOpenForm}
        setIsAddSub={setIsAddSub}
        setIsEdit={setIsEdit}
        isMain={isMain}
        setIsMain={setIsMain}
        updateIndividualEquipment={updateIndividualEquipment}
        csv={csv}
        isExportingData={isExportingData}
        handleCsvClick={handleCsvClick}
      />
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
      <SideBarContent
        title={isEdit ? 'Edit Equipment' : isAddSub ? 'Add Sub Equipment' : 'Add Equipment'}
        open={openForm}
        onClickDrawer={handleCancel}
        width='60%'
      >
        <EquipmentForm
          clientId={clientId}
          brandMaster={brandMaster}
          serviceAddressMaster={serviceAddressMaster}
          isAddSub={isAddSub}
          isEdit={isEdit}
          isMain={isMain}
          equipment={isEdit || isAddSub ? equipments[selectedIndex] : dummyEquipments}
          selectedSubEquipmentIndex={selectedSubEquipmentIndex}
          addNewEquipment={addNewEquipment}
          updatedIndividualEquipment={updateIndividualEquipment(selectedIndex)}
          handleSnackbar={handleSnackbar}
          fetchData={fetchData}
          handleCancel={handleCancel}
        />
      </SideBarContent>
    </Paper>
  );
});

export default EquipmentContent;
