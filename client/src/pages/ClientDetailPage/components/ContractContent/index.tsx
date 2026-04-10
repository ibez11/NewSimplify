import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useContext } from 'react';
import axios, { CancelTokenSource } from 'axios';

import useDebounce from 'hooks/useDebounce';
import useRouter from 'hooks/useRouter';

import { Paper, Theme, makeStyles } from '@material-ui/core';
import { format, addMonths, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, lastDayOfMonth } from 'date-fns';
import {
  SERVICE_BASE_URL,
  ENTITY_BASE_URL,
  GET_CONFIRM_SERVICE_URL,
  GET_CANCEL_SERVICE_URL,
  GET_DELETE_SERVICES_URL,
  GET_ASSIGN_JOB_BY_SERVICE_ID,
  GET_SETTING_CODE_BASE_URL,
  GET_SETTING_UPDATE_BASE_URL
} from 'constants/url';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import ActionSnackbar from 'components/ActionSnackbar';

import ContractTable from './components/ContractTable';
import InvoiceForm from './components/InvoiceForm';

import { TableColumnSettingContext } from 'contexts/TableColumnSettingContext';
import PasswordConfirmation from 'components/PasswordConfirmation';
import SideBarContent from 'components/SideBarContent';
import ServiceForm from 'pages/ServiceForm';
import CustomizedDialog from 'components/CustomizedDialog';
import AssignForm from './components/AssignForm';
import SmartRankingForm from 'components/SmartRankingForm';
import { ucWords } from 'utils';
import SettingCodes from 'typings/SettingCodes';

interface Props {
  serviceAddressMaster: Select[];
  currentRoleGrants: RoleGrantModel[];
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(1)
    }
  },
  paper: {
    margin: 'auto'
  }
}));

const ContractContent = forwardRef<{}, Props>((props, ref) => {
  const classes = useStyles();
  const { serviceAddressMaster, currentRoleGrants } = props;
  const { match, history } = useRouter();
  const clientId = match.params.id;
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { tableColumn } = useContext(TableColumnSettingContext);

  const [openForm, setOpenForm] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [contracts, setContracts] = useState<ServiceModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('id');
  const [filterBy, setFilterBy] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  const [entities, setEntities] = useState<Select[]>([]);
  const [contractTypes, setContractTypes] = useState<Select[]>([]);
  const [contractTypeFilter, setContractTypeFilter] = useState<ColumnFilter[]>([]);
  const [entityFilter, setEntityFilter] = useState<ColumnFilter[]>([]);
  const [invoiceFilter, setInvoiceFilter] = useState<ColumnFilter[]>([]);
  const [serviceAddressFilter, setServiceAddressFilter] = useState<ColumnFilter[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [renewFilter, setRenewFilter] = useState<ColumnFilter[]>([]);

  const [openEditInvoice, setOpenEditInvoice] = useState<boolean>(false);

  const [isCancel, setIsCancel] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [selectedEmployees, setSelectedEmployees] = useState<Select[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Select[]>([]);
  const [isAssignFirstJob, setIsAssignFirstJob] = useState<boolean>(true);
  const [assignError, setAssignError] = useState<any[]>([{ message: '' }, { message: '' }]);

  const [smartSkill, setSmartSkill] = useState<boolean>(true);
  const [smartProximity, setSmartProximity] = useState<boolean>(true);
  const [smartSettingId, setSmartSettingId] = useState<number | null>(null);
  const [isSmartRanking, setIsSmartRanking] = useState<boolean>(false);

  const [isRenew, setIsRenew] = useState<boolean>(false);
  const [oldContractId, setOldContractId] = useState<number>(0);
  const [serviceId, setServicetId] = useState<number>(0);
  const [serviceType, setServiceType] = useState<string>('');
  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);
  const [openSuccessConfirmModal, setOpenSuccessConfirmModal] = useState<boolean>(false);
  const [openAssignModal, setOpenAssignModal] = useState<boolean>(false);

  const [column, setColumn] = useState<any[]>([]);
  const [tableSettingId, setTableSettingId] = useState<number>(0);

  const [newServiceCreated, setNewServiceCreated] = useState<any>(null);

  // Search Contract whenever rowsPerPage, currentPage, queryString, contract, and filterby changes
  const fetchData = useCallback(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }

      if (selectedStatus > 0) {
        params.append('c', selectedStatus.toString());
        if (selectedStatus === 1) {
          params.append('fb', 'active');
        } else if (selectedStatus === 2) {
          params.append('fb', 'expiring');
          params.append('na', 'true');
        }
        if (selectedStatus === 3) {
          params.append('fb', 'expired');
          params.append('na', 'true');
        }
      }

      if (filterBy) {
        if (filterBy === 'termStart' || filterBy === 'termEnd') {
          params.append('fb', filterBy.toString());
          if (selectedStatus === 3) {
            params.set('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd') : '');
            params.set('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd') : '');
          } else {
            params.append('sd', startDate !== null ? format(new Date(startDate), 'yyyy-MM-dd') : '');
            params.append('ed', endDate !== null ? format(new Date(endDate), 'yyyy-MM-dd') : '');
          }
        } else if (filterBy === 'within1Month') {
          const newEndDate = addMonths(startDate || new Date(), 1);
          params.set('fb', 'custom');
          params.set('sd', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        } else if (filterBy === 'within2Month') {
          const newEndDate = addMonths(startDate || new Date(), 2);
          params.set('fb', 'custom');
          params.set('sd', startDate ? format(new Date(startDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        } else if (filterBy === 'today') {
          params.set('fb', 'termStart');
          params.set('sd', format(new Date(), 'yyyy-MM-dd'));
          params.set('ed', format(new Date(), 'yyyy-MM-dd'));
        } else if (filterBy === 'thisWeek') {
          params.set('fb', 'termStart');
          params.set('sd', format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
          params.set('ed', format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        } else if (filterBy === 'thisMonth') {
          params.set('fb', 'termStart');
          params.set('sd', format(startOfMonth(new Date()), 'yyyy-MM-dd'));
          params.set('ed', format(lastDayOfMonth(new Date()), 'yyyy-MM-dd'));
        } else if (filterBy === 'lastMonth') {
          const newStartDate = subMonths(startDate || new Date(), 1);
          const newEndDate = subDays(endDate || new Date(), 1);
          params.set('fb', 'custom');
          params.set('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        } else if (filterBy === 'last3Month') {
          const newStartDate = subMonths(startDate || new Date(), 3);
          const newEndDate = subDays(endDate || new Date(), 1);
          params.set('fb', 'custom');
          params.set('sd', newStartDate ? format(new Date(newStartDate), 'yyyy-MM-dd') : '');
          params.set('ed', newEndDate ? format(new Date(newEndDate), 'yyyy-MM-dd') : '');
        }
      }

      if (orderBy) {
        params.append('ob', orderBy === 'term' ? 'date' : orderBy);
        params.append('ot', order);
      }

      if (contractTypeFilter.length > 0) {
        contractTypeFilter.map(value => {
          return params.append('ct', value.columnValue === 0 ? 'ADHOC' : value.columnValue === 1 ? 'CONTRACT' : 'ADDITIONAL');
        });
      }

      if (entityFilter.length > 0) {
        entityFilter.map(value => {
          return params.append('ei', value.columnValue.toString());
        });
      }

      if (serviceAddressFilter.length > 0) {
        serviceAddressFilter.map(value => {
          return params.append('sai', value.columnValue.toString());
        });
      }

      if (invoiceFilter.length !== 0) {
        if (invoiceFilter.length === 1) {
          invoiceFilter.map(value => {
            return params.append('fi', value.columnValue.toString());
          });
        }
      }

      if (renewFilter.length !== 0) {
        if (renewFilter.length === 1) {
          renewFilter.map(value => {
            return params.append('rnw', value.columnValue === 1 ? 'true' : 'false');
          });
        }
      }

      params.append('ci', clientId);
      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchContract = async () => {
      setIsLoading(true);

      try {
        const url = `${SERVICE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        if (data.contracts) {
          setCount(data.count);
          setContracts(data.contracts);
          setContractTypes(
            selectedStatus === 2 || selectedStatus === 3
              ? [
                  { id: 0, name: ucWords('AD-HOC SERVICE') },
                  { id: 1, name: ucWords('SERVICE CONTRACT') }
                ]
              : [
                  { id: 0, name: ucWords('AD-HOC SERVICE') },
                  { id: 1, name: ucWords('SERVICE CONTRACT') },
                  { id: 2, name: ucWords('SEPARATE QUOTATION') }
                ]
          );
        } else {
          history.push({ pathname: `/notfound/` });
        }
      } catch (err) {
        console.log(err);
      }

      setIsLoading(false);
    };

    searchContract();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    rowsPerPage,
    currentPage,
    queryString,
    filterBy,
    startDate,
    endDate,
    contractTypeFilter,
    entityFilter,
    invoiceFilter,
    serviceAddressFilter,
    renewFilter,
    selectedStatus,
    clientId,
    order,
    orderBy
  ]);

  const getEntitiesData = async () => {
    try {
      const { data } = await axios.get(`${ENTITY_BASE_URL}`, { cancelToken: cancelTokenSource.token });
      setEntities(data.entities);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSmartRankingSetting = async () => {
    try {
      const cancelTokenSource = axios.CancelToken.source();
      const { data } = await axios.get(`${GET_SETTING_CODE_BASE_URL(SettingCodes.SMARTRANKING)}`, {
        cancelToken: cancelTokenSource.token
      });

      const value = String(data.value || data).toUpperCase();
      // determine flags
      if (value === 'BOTH') {
        setSmartSkill(true);
        setSmartProximity(true);
      } else if (value === 'SKILL') {
        setSmartSkill(true);
        setSmartProximity(false);
      } else if (value === 'PROXIMITY') {
        setSmartSkill(false);
        setSmartProximity(true);
      } else {
        // default: both false
        setSmartSkill(false);
        setSmartProximity(false);
      }

      // Set the setting ID for later updates
      if (data.id) setSmartSettingId(data.id);
      setIsSmartRanking(data.isActive);
    } catch (err) {
      console.error('failed to load smart ranking setting', err);
      setIsSmartRanking(false);
    }
  };

  useEffect(() => {
    getEntitiesData();
    loadSmartRankingSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (tableColumn.length > 0) {
      const { column, id } = tableColumn.find(value => value.tableName === 'CLIENT_CONTRACT');
      setColumn(column);
      setTableSettingId(id);
    }
  }, [tableColumn]);

  const handleConfirmAction = async (serviceId: number, isFromCreate: boolean) => {
    setIsLoading(true);
    try {
      await axios.put(`${GET_CONFIRM_SERVICE_URL(serviceId)}`, { cancelToken: cancelTokenSource.token });
      setOpenSuccessModal(false);
      if (isFromCreate) {
        setOpenSuccessConfirmModal(true);
      } else {
        handleSnackbar('success', 'Successfully approve quotation');
      }
      fetchData();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed approve quotation');
    }
    setIsLoading(false);
  };

  const handleViewDetailAction = () => {
    window.open(`/quotations/${serviceId}`, '_blank');
    setOpenSuccessModal(false);
  };

  const handleCloseSmartRankingForm = () => {
    setOpenAssignModal(false);
  };

  const handleSmartRankingFormSave = async (data: { technicianIds: number[]; selectedTechnicians: Select[]; selectedVehicles: Select[] }) => {
    const { selectedTechnicians, selectedVehicles } = data;
    setSelectedEmployees(selectedTechnicians);
    setSelectedVehicles(selectedVehicles);
    await handleAssignAction(selectedTechnicians, selectedVehicles);
  };

  const saveSmartRankingSetting = async (skillOn: boolean, proximityOn: boolean) => {
    if (!smartSettingId) return;
    try {
      let value = '';
      if (skillOn && proximityOn) value = 'BOTH';
      else if (skillOn) value = 'SKILL';
      else if (proximityOn) value = 'PROXIMITY';
      else value = 'NONE';

      const cancelTokenSource = axios.CancelToken.source();
      await axios.put(`${GET_SETTING_UPDATE_BASE_URL(smartSettingId)}`, { value }, { cancelToken: cancelTokenSource.token });
    } catch (err) {
      console.error('failed to save smart ranking setting', err);
    }
  };

  const handleSmartSkillChange = (checked: boolean) => {
    setSmartSkill(checked);
    saveSmartRankingSetting(checked, smartProximity);
  };

  const handleSmartProximityChange = (checked: boolean) => {
    setSmartProximity(checked);
    saveSmartRankingSetting(smartSkill, checked);
  };

  const handleAssignAction = async (technicianIds?: Select[], vehicleIds?: Select[]) => {
    try {
      const employees = technicianIds || selectedEmployees;
      const vehicles = vehicleIds || selectedVehicles;

      if (employees.length === 0) {
        setAssignError(prev => {
          prev[0].message = 'Please select an Employee';
          return [...prev];
        });
        return;
        // } else if (selectedVehicles.length === 0) {
        //   setAssignError(prev => {
        //     prev[1].message = 'Please select an Vehicle';
        //     return [...prev];
        //   });
        //   return;
      }
      setIsLoading(true);
      await axios.post(
        `${GET_ASSIGN_JOB_BY_SERVICE_ID}`,
        {
          serviceId,
          selectedVehicles: vehicles,
          selectedEmployees: employees,
          isAssignFirstJob
        },
        { cancelToken: cancelTokenSource.token }
      );
      handleSnackbar('success', 'Successfully assign technician');
      setOpenAssignModal(false);
      setSelectedEmployees([]);
      setSelectedVehicles([]);
      setIsAssignFirstJob(true);
    } catch (err) {
      handleSnackbar('error', 'Failed to assign technician');
    }

    setIsLoading(false);
  };

  const handleCancelAction = (index: number) => {
    setSelectedIndex(index);
    setIsCancel(true);
  };

  const handleDeleteAction = (index: number) => {
    setSelectedIndex(index);
    setIsDelete(true);
  };

  const handleRenewAction = (serviceId: number) => {
    setIsRenew(true);
    setOpenForm(true);
    setOldContractId(serviceId);
  };

  useImperativeHandle(ref, () => ({
    handleOpenCreateContract: () => {
      return setOpenForm(true);
    }
  }));

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  // Load contract data if search not empty and populate on search list
  const handleSearch = useCallback((searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  }, []);

  const debouncedSearchTerm = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const updateIndividual = (serviceIndex: number) => {
    return (updatedContractProperties: Partial<ServiceModel>) => {
      setContracts(
        contracts!.map((contract, index) => {
          if (index !== serviceIndex) {
            return contract;
          }

          return Object.assign({}, contract, updatedContractProperties);
        })
      );
    };
  };

  const handleOpenEditInvoice = (invoiceIndex: number): React.MouseEventHandler => () => {
    setSelectedIndex(invoiceIndex);
    setOpenEditInvoice(true);
  };

  const handleCancelEditInvoice = () => {
    setOpenEditInvoice(false);
  };

  const handleCancel = () => {
    setIsCancel(false);
    setIsDelete(false);
  };

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  const mappedJob = newServiceCreated
    ? (() => {
        const job = newServiceCreated.Jobs?.[0];
        const schedule = newServiceCreated.Schedules?.[0];
        const serviceAddress = newServiceCreated.ServiceAddress;

        return {
          id: job?.id, // job primary id
          jobId: job?.id, // if jobId is same as id
          clientName: newServiceCreated.Client?.name || '',
          startDateTime: job?.startDateTime || schedule?.startDateTime,
          endDateTime: job?.endDateTime || schedule?.endDateTime,
          serviceAddress: serviceAddress?.address || '',
          postalCode: serviceAddress?.postalCode || '',
          ServiceSkills: newServiceCreated.ServiceSkills || []
        };
      })()
    : null;

  return (
    <Paper variant='outlined' className={classes.paper}>
      <ContractTable
        isLoadingData={isLoading}
        contracts={contracts}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        query={query}
        setQuery={setQuery}
        order={order}
        orderBy={orderBy}
        setOrder={setOrder}
        setOrderBy={setOrderBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        entities={entities}
        serviceAddresses={serviceAddressMaster}
        serviceAddressFilter={serviceAddressFilter}
        setServiceAddressFilter={setServiceAddressFilter}
        contractTypes={contractTypes}
        contractTypeFilter={contractTypeFilter}
        setContractTypeFilter={setContractTypeFilter}
        entityFilter={entityFilter}
        setEntityFilter={setEntityFilter}
        invoiceFilter={invoiceFilter}
        setInvoiceFilter={setInvoiceFilter}
        renewFilter={renewFilter}
        setRenewFilter={setRenewFilter}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        handleSnackbar={handleSnackbar}
        handleOpenEditInvoice={handleOpenEditInvoice}
        handleConfirmAction={handleConfirmAction}
        handleCancelAction={handleCancelAction}
        handleDeleteAction={handleDeleteAction}
        handleRenewAction={handleRenewAction}
        column={column}
        setColumn={setColumn}
        tableSettingId={tableSettingId}
        currentRoleGrants={currentRoleGrants}
      />
      {openEditInvoice && (
        <InvoiceForm
          open={openEditInvoice}
          contract={contracts[selectedIndex]}
          handleCancel={handleCancelEditInvoice}
          updateIndividualInvoice={updateIndividual(selectedIndex)}
          handleSnackbar={handleSnackbar}
        />
      )}
      {isCancel && (
        <PasswordConfirmation
          open={isCancel}
          handleClose={handleCancel}
          url={GET_CANCEL_SERVICE_URL(contracts[selectedIndex].id)}
          isEdit
          title='Cancel Quotation'
          message='cancel quotation'
          handleSnackbar={handleSnackbar}
          fetchData={fetchData}
        />
      )}
      {isDelete && (
        <PasswordConfirmation
          open={isDelete}
          handleClose={handleCancel}
          url={GET_DELETE_SERVICES_URL(contracts[selectedIndex].id)}
          title='Delete Quotation'
          message='delete quotation'
          handleSnackbar={handleSnackbar}
          fetchData={fetchData}
        />
      )}
      {openSuccessModal && (
        <CustomizedDialog
          isLoading={isLoading}
          open={openSuccessModal}
          isConfirmation
          variant='success'
          title='Successfully!'
          message={`Your quotation has been created with ID: ${serviceId}`}
          primaryButtonLabel='Approve Quotation'
          secondaryButtonLabel='Done & View Details'
          primaryActionButton={() => handleConfirmAction(serviceId, true)}
          secondaryActionButton={handleViewDetailAction}
          handleClose={() => setOpenSuccessConfirmModal(false)}
        />
      )}
      {openSuccessConfirmModal && (
        <CustomizedDialog
          isLoading={isLoading}
          open={openSuccessConfirmModal}
          isConfirmation
          variant='success'
          title='Successfully approve quotation'
          message={`You can assign technician & vehicle for first or all job(s) in this quotation by clicking button Assign`}
          primaryButtonLabel='Assign'
          secondaryButtonLabel='Close'
          primaryActionButton={() => {
            setOpenAssignModal(true);
            setOpenSuccessConfirmModal(false);
          }}
          secondaryActionButton={() => setOpenSuccessConfirmModal(false)}
          handleClose={() => setOpenSuccessConfirmModal(false)}
        />
      )}
      {openAssignModal && (serviceType === 'CONTRACT' || !isSmartRanking) ? (
        <CustomizedDialog
          isLoading={isLoading}
          open={openAssignModal}
          isConfirmation={false}
          header='Assign Technician & Vehicle'
          message=''
          primaryButtonLabel='Save'
          secondaryButtonLabel='Cancel'
          primaryActionButton={() => handleAssignAction(selectedEmployees, selectedVehicles)}
          secondaryActionButton={() => setOpenAssignModal(false)}
          handleClose={() => setOpenAssignModal(false)}
        >
          <AssignForm
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
            assignError={assignError}
            setAssignError={setAssignError}
            serviceType={serviceType || 'ADHOC'}
            isAssignFirstJob={isAssignFirstJob}
            setIsAssignFirstJob={setIsAssignFirstJob}
          />
        </CustomizedDialog>
      ) : (
        openAssignModal &&
        isSmartRanking && (
          <SmartRankingForm
            open={openAssignModal}
            onClose={handleCloseSmartRankingForm}
            job={mappedJob}
            onSave={handleSmartRankingFormSave}
            initialSelectedTechnicians={selectedEmployees}
            initialSelectedVehicles={selectedVehicles}
            smartSkill={smartSkill}
            smartProximity={smartProximity}
            smartSettingId={smartSettingId}
            onSmartSkillChange={handleSmartSkillChange}
            onSmartProximityChange={handleSmartProximityChange}
            handleSnackbar={handleSnackbar}
          />
        )
      )}
      <SideBarContent
        title={isRenew ? 'Renew Quotation' : 'Create New Quotation'}
        open={openForm}
        onClickDrawer={() => {
          setIsRenew(false);
          setOpenForm(false);
        }}
        width='100%'
      >
        <ServiceForm
          isRenew={isRenew}
          oldContractId={isRenew ? oldContractId : 0}
          clientId={Number(clientId)}
          setServiceId={setServicetId}
          setServiceType={setServiceType}
          setOpenSuccessModal={setOpenSuccessModal}
          fetchData={fetchData}
          handleCancel={() => {
            setIsRenew(false);
            setOpenForm(false);
          }}
          handleSnackbar={handleSnackbar}
          setNewServiceCreated={setNewServiceCreated}
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
});

export default ContractContent;
