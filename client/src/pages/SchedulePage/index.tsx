import React, { FC, useContext, useState, useEffect, useRef } from 'react';
import { Button, Container, Grid, makeStyles, Theme, Paper, Typography } from '@material-ui/core';

import VehicleSchedule from './components/VehicleSchedule';
import EmployeeSchedule from './components/EmployeeSchedule';
import PrintScheduleModal from './components/PrintScheduleModal';
import clsx from 'clsx';
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';

import axios, { CancelTokenSource } from 'axios';
import { CurrentPageContext } from 'contexts/CurrentPageContext';
import { PublicHolidayContext } from 'contexts/PublicHolidayContext';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import PrintIcon from '@material-ui/icons/Print';
import DateOffIcon from '@material-ui/icons/EventBusy';
import AddIcon from '@material-ui/icons/Add';

import CustomizedTabs from 'components/CustomizedTabs';
import Breadcrumb from 'components/Breadcrumb';
import ActionSnackbar from 'components/ActionSnackbar';
import { dummyInformationContent, dummyJobEvent, dummyResources } from 'constants/dummy';
import {
  DISTRICT_BASE_URL,
  GET_ACTIVE_TECHNICIANS_URL,
  GET_ACTIVE_VEHICLE_URL,
  GET_DELETE_TIMEOFF_BY_ID_URL,
  GET_SETTING_UPDATE_BASE_URL,
  GET_SUMMARY_JOB_URL,
  JOB_BASE_URL,
  SETTING_BASE_URL,
  TIMEOFF_BASE_URL
} from 'constants/url';
import ToolBar from './components/ToolBar';
import SideBarContent from 'components/SideBarContent';
import EditJobForm from './components/EditJobForm';
import { getNumberWithOrdinal } from 'utils';
import InvoiceForm from './components/InvoiceForm';
import TimeOffForm from './components/TimeOffForm';
import CustomizedDialog from 'components/CustomizedDialog';
import CreateServiceForm from './components/CreateServiceForm';
import InformationContent from 'components/InformationContent';
import SendJobForm from 'components/SendJobForm';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(2)
    }
  },
  printButton: {
    marginRight: theme.spacing(1)
  },
  paper: {
    padding: theme.spacing(2)
  }
}));

const SchedulePage: FC = () => {
  useCurrentPageTitleUpdater('Schedule Page');

  const classes = useStyles();
  const { currentPageTitle } = useContext(CurrentPageContext);
  const { holidays } = useContext(PublicHolidayContext);
  const childRef: any = useRef();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [active, setActive] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [events, setEvents] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([dummyResources]);
  const [infomationContents, setInformationContents] = useState<InformationContentModel[]>(dummyInformationContent);
  const [employeeMaster, setEmployeeMaster] = useState<Select[]>([]);
  const [vehicleMaster, setVehicleMaster] = useState<Select[]>([]);
  const [districts, setDistricts] = useState<Select[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<ColumnFilter[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<ColumnFilter[]>([]);
  const [districtFilter, setDistrictFilter] = useState<ColumnFilter[]>([]);
  const [isUnassignedJobs, setIsUnassignedJobs] = useState<boolean>(true);

  const [startOperatingHour, setStartOperatingHour] = useState<string>('08:00:00');
  const [endOperatingHour, setEndOperatingHour] = useState<string>('21:00:00');
  const [isRemarksShow, setIsRemarksShow] = useState<boolean>(true);
  const [isNotesShow, setIsNotesShow] = useState<boolean>(true);
  const [initialView, setIntialView] = useState<string>('resourceTimeline');

  const [publicHoliday, setPublicHoliday] = useState<string>('');

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [form, setForm] = useState<'job' | 'service'>('job');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [openInvoiceForm, setOpenInvoiceForm] = useState<boolean>(false);
  const [openSendJobMessage, setOpenSendJobMessage] = useState<boolean>(false);

  const [openTimeOff, setOpenTimeOff] = useState<boolean>(false);
  const [isEditTimeOff, setIsEditTimeOff] = useState<boolean>(false);
  const [isDeleteTimeOff, setIsDeleteTimeOff] = useState<boolean>(false);

  const [clickedData, setClickedData] = useState<any>({
    employeeId: 0,
    employeeName: '',
    vehicleId: 0,
    vehicleNumber: '',
    startDateTime: new Date(),
    endDateTime: new Date()
  });

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  const fetchJobInfo = async () => {
    setIsLoadingData(true);
    try {
      const { data } = await axios.get(`${GET_SUMMARY_JOB_URL}`, { cancelToken: cancelTokenSource.token });

      const jobStats = [
        { label: 'Unassigned', count: data.unassignedCount },
        { label: 'Confirmed', count: data.confirmedCount },
        { label: 'Assigned', count: data.assignedCount },
        { label: 'In Progress', count: data.inprogressCount },
        { label: 'Completed', count: data.completedCount },
        { label: 'Cancelled', count: data.cancelledCount }
      ];

      const infoContents = jobStats.map(({ label, count }) => ({
        header: label,
        value: count,
        isPrice: false
      }));
      setInformationContents(infoContents);
    } catch (err) {
      console.log(err);
    }
    setIsLoadingData(false);
  };

  const fetchData = async () => {
    const getQueryParams = () => {
      const params = new URLSearchParams();

      params.append('fb', '8');

      if (initialView.includes('dayGridMonth') || initialView.includes('listMonth')) {
        params.append('sd', format(startOfMonth(selectedDate), 'yyyy-MM-dd'));
        params.append('ed', format(endOfMonth(selectedDate), 'yyyy-MM-dd'));
      } else if (initialView.includes('dayGridWeek')) {
        params.append('sd', format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
        params.append('ed', format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
      } else if (selectedDate) {
        params.append('sd', format(selectedDate, 'yyyy-MM-dd'));
        params.append('ed', format(selectedDate, 'yyyy-MM-dd'));
      }

      if (employeeFilter.length > 0) {
        employeeFilter.map(value => {
          return params.append('ei', value.columnValue.toString());
        });
      }

      if (vehicleFilter.length > 0) {
        vehicleFilter.map(value => {
          return params.append('vi', value.columnValue.toString());
        });
      }

      if (districtFilter.length > 0) {
        districtFilter.map(value => {
          return params.append('pd', value.columnValue.toString());
        });

        if (isUnassignedJobs) {
          params.append('iu', isUnassignedJobs.toString());
        }
      }

      if (selectedTab === 1) {
        params.append('selectedTab', 'vehicles');
      } else {
        params.append('selectedTab', 'technicians');
      }

      return params.toString();
    };

    try {
      setIsLoadingData(true);
      let calendarEvents: CalendarEventModel[] = [];
      let countJob = 0;

      const timeOffData = await axios.get(`${TIMEOFF_BASE_URL}?${getQueryParams()}`, { cancelToken: cancelTokenSource.token });
      countJob = timeOffData.data.timeOff.length || 0;

      await Promise.all(
        // eslint-disable-next-line array-callback-return
        timeOffData.data.timeOff.map((value: any, index: number) => {
          calendarEvents.push({
            index: index,
            title: value.status,
            start: new Date(value.startDateTime),
            end: new Date(value.endDateTime),
            resourceIds: value.Employees.map((employee: any) => employee.id),
            employees: value.Employees.map((employee: any) => employee.displayName).join(', '),
            remarks: value.remarks,
            color: '#ffffff',
            textColor: '#000000',
            jobId: value.id,
            jobSequence: '',
            clientName: '',
            contactPerson: '',
            contactNumber: '',
            serviceAddress: '',
            postalCode: '',
            contract: '',
            jobStatus: '',
            vehicleSelected: [],
            employeesSelected: value.Employees,
            isTimeOff: true,
            resourceEditable: false
          });
        })
      );

      const url = `${JOB_BASE_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

      await Promise.all(
        // eslint-disable-next-line array-callback-return
        data.jobs.map((value: any, index: number) => {
          const selectedEmployee: any = [];
          if (value.employeeId) {
            value.employeeId.map((val: any, key: number) => {
              return selectedEmployee.push({ id: val, name: value.employees[key] });
            });
          }

          const selectedVehicle: any = [];
          if (value.vehicleId) {
            value.vehicleId.map((val: any, key: number) => {
              return selectedVehicle.push({ id: val, name: value.vehicles[key] });
            });
          }

          const serviceItems: any = [];
          if (value.ServiceItem) {
            value.ServiceItem.map((val: any) => {
              return serviceItems.push(val.name);
            });
          }

          const eventTitle = `#${value.jobId} ${value.clientName}`;

          calendarEvents.push({
            index: index + countJob,
            title: eventTitle,
            start: new Date(value.startDateTime),
            end: new Date(value.endDateTime),
            startDateTime: value.startDateTime,
            endDateTime: value.endDateTime,
            resourceIds: selectedTab === 0 ? (value.employeeId ? value.employeeId : ['0']) : value.vehicleId ? value.vehicleId : ['0'],
            color: '#ffffff',
            textColor: '#000000',
            jobId: value.jobId,
            jobSequence: `${getNumberWithOrdinal(value.jobSequence)} of ${value.totalJob}`,
            clientName: value.clientName,
            contactPerson: value.contactPerson,
            contactNumber: `${value.countryCode}${value.contactNumber}`,
            serviceAddress: value.serviceAddress,
            postalCode: value.postalCode,
            contract: `${value.serviceName} (${value.serviceType === 'CONTRACT' ? 'RECURRING' : value.serviceType})`,
            remarks: value.remarks,
            employees: value.employees ? value.employees.join(', ') : '-',
            vehicles: value.vehicles ? value.vehicles.join(', ') : '-',
            jobStatus: value.jobStatus,
            vehicleSelected: selectedVehicle,
            employeesSelected: selectedEmployee,
            jobLabels: value.jobLabels,
            serviceItems: serviceItems ? serviceItems.join(', ') : '-',
            collectedAmount: value.collectedAmount || 0,
            jobAmount: value.jobAmount || 0,
            paymentMethod: value.paymentMethod || '',
            invoiceId: value.invoiceId || 0,
            invoiceNumber: value.invoiceNumber || '',
            invoiceStatus: value.invoiceStatus || '',
            serviceId: value.serviceId || 0,
            clientId: value.clientId || 0,
            isTimeOff: false,
            resourceEditable: value.jobStatus === 'COMPLETED' ? false : true,
            entityName: value.entityName || '',
            serviceName: value.serviceName || '',
            ContactPersons: value.ContactPersons,
            Skills: value.ServiceSkills || [],
            ServiceItem: value.ServiceItem
            // editable: false
          });
        })
      );

      setEvents(calendarEvents.sort((a, b) => a.index - b.index));
      setIsLoadingData(false);
    } catch (err) {
      console.error(err);
      setIsLoadingData(false);
    }
  };

  const getTechnicianData = async () => {
    try {
      setIsLoadingData(true);
      const { data } = await axios.get(`${GET_ACTIVE_TECHNICIANS_URL}`, { cancelToken: cancelTokenSource.token });

      //Set Calendar Resouces
      let calendarResource: CalendarResourcesNew[] = [dummyResources];
      data.activeUsers.map((value: any, index: number) => {
        return calendarResource.push({ id: value.id, title: value.displayName, index: index + 1 });
      });

      let employeeData: Select[] = [];
      data.activeUsers.map((value: any) => {
        let displayName: string = value.displayName;

        return employeeData.push({ id: value.id, name: displayName });
      });

      if (employeeFilter.length > 0) {
        calendarResource = calendarResource.filter(item => item.id === 0 || employeeFilter.some(filterItem => filterItem.columnValue === item.id));
      }

      setEmployeeMaster(employeeData);
      if (selectedTab === 0) {
        setResources(calendarResource);
      }
      setIsLoadingData(false);
    } catch (err) {
      console.error(err);
      setIsLoadingData(false);
    }
  };

  const getVehicleData = async () => {
    try {
      setIsLoadingData(true);
      const { data } = await axios.get(`${GET_ACTIVE_VEHICLE_URL}`, { cancelToken: cancelTokenSource.token });

      //Set Calendar Resouces
      let calendarResource: CalendarResourcesNew[] = [dummyResources];
      let vehicles: VehicleModel[] = data.vehicles;
      vehicles = vehicles.sort((a, b) => a.carplateNumber.localeCompare(b.carplateNumber));
      vehicles.map((value: any, index: number) => {
        return calendarResource.push({ id: value.id, title: value.carplateNumber, index: index + 1 });
      });

      let vehicleData: Select[] = [];
      data.vehicles.map((value: any) => {
        return vehicleData.push({ id: value.id, name: value.carplateNumber });
      });

      if (vehicleFilter.length > 0) {
        calendarResource = calendarResource.filter(item => item.id === 0 || vehicleFilter.some(filterItem => filterItem.columnValue === item.id));
      }

      setVehicleMaster(vehicleData);
      if (selectedTab === 1) {
        setResources(calendarResource);
      }
      setIsLoadingData(false);
    } catch (err) {
      console.error(err);
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getSettings = async () => {
      try {
        setIsLoadingData(true);
        const { data } = await axios.get(SETTING_BASE_URL, { cancelToken: cancelTokenSource.token });

        const operatingHours: SettingModel = data.detailSetting.Setting.find((setting: any) => setting.label === 'OperationHours');
        const arrayOperatingHours = operatingHours.value!.split(',');
        const getShowRemarksStatus: SettingModel = data.detailSetting.Setting.find((setting: any) => setting.label === 'RemarksSchedule');
        const getShowNotesStatus: SettingModel = data.detailSetting.Setting.find((setting: any) => setting.label === 'NoteSchedule');
        const getScheduleView: SettingModel = data.detailSetting.Setting.find((setting: any) => setting.label === 'ScheduleView');

        setStartOperatingHour(arrayOperatingHours[0]);
        setEndOperatingHour(arrayOperatingHours[1]);
        setIsRemarksShow(getShowRemarksStatus.isActive);
        setIsNotesShow(getShowNotesStatus.isActive);
        setIntialView(getScheduleView.value || 'resourceTimeline');
        setIsLoadingData(false);
      } catch (err) {
        console.error(err);
        setIsLoadingData(false);
      }
    };

    const getDistrictData = async () => {
      try {
        setIsLoadingData(true);
        const districtsData: Select[] = [];
        const { data } = await axios.get(`${DISTRICT_BASE_URL}`, { cancelToken: cancelTokenSource.token });
        if (data.districts) {
          data.districts.map((value: any) => {
            return districtsData.push({
              id: value.id,
              name: `D${value.postalDistrict} - ${value.generalLocation.join(' / ')}`,
              value: value.postalDistrict
            });
          });
        }
        setDistricts(districtsData);
        setIsLoadingData(false);
      } catch (err) {
        console.error(err);
        setIsLoadingData(false);
      }
    };

    getSettings();
    getDistrictData();
    fetchJobInfo();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedTab, initialView, employeeFilter, vehicleFilter, districtFilter, isUnassignedJobs]);

  useEffect(() => {
    getTechnicianData();
    getVehicleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, employeeFilter, vehicleFilter]);

  const checkPublicHoliday = (date: Date) => {
    const getPublicHoliday = holidays.find((holidayDate: any) => holidayDate.date === format(date, 'yyyy-MM-dd'));
    setPublicHoliday(getPublicHoliday ? getPublicHoliday.name : '');
  };

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    action(actionParam);
    handleResetFilter();
  };

  const handleChangeScheduleView = async (value: string) => {
    try {
      await axios.put(`${GET_SETTING_UPDATE_BASE_URL(27)}`, { value }, { cancelToken: cancelTokenSource.token });

      setIntialView(value);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteTimeOff = async () => {
    try {
      const { jobId } = events[selectedIndex];
      await axios.delete(GET_DELETE_TIMEOFF_BY_ID_URL(jobId), { cancelToken: cancelTokenSource.token });
      setIsDeleteTimeOff(false);
      handleSnackbar('success', 'Successfully delete time off');
      fetchData();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed delete time off');
    }
  };

  const handleOpenAdhoc = () => {
    setOpenForm(true);
    setForm('service');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setClickedData({ employeeId: 0, employeeName: '', vehicleId: 0, vehicleNumber: '', startDateTime: new Date(), endDateTime: new Date() });
    fetchData();
    fetchJobInfo();
  };

  const handleResetFilter = () => {
    childRef && childRef.current!.handleResetFilter();
  };

  const SelectedContent: FC<{ page: number }> = props => {
    switch (props.page) {
      case 0:
        return (
          <EmployeeSchedule
            isLoadingData={isLoadingData}
            initialView={initialView}
            selectedDate={selectedDate}
            events={events}
            setEvents={setEvents}
            resources={resources}
            startOperatingHour={startOperatingHour}
            endOperatingHour={endOperatingHour}
            active={active}
            checkPublicHoliday={checkPublicHoliday}
            setSelectedIndex={setSelectedIndex}
            setOpenForm={setOpenForm}
            setOpenSendJobMessage={setOpenSendJobMessage}
            setForm={setForm}
            setOpenTimeOff={setOpenTimeOff}
            setIsEditTimeOff={setIsEditTimeOff}
            setIsDeleteTimeOff={setIsDeleteTimeOff}
            setOpenInvoiceForm={setOpenInvoiceForm}
            setClickedData={setClickedData}
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
          />
        );
      case 1:
        return (
          <VehicleSchedule
            isLoadingData={isLoadingData}
            initialView={initialView}
            selectedDate={selectedDate}
            events={events}
            setEvents={setEvents}
            resources={resources}
            startOperatingHour={startOperatingHour}
            endOperatingHour={endOperatingHour}
            active={active}
            checkPublicHoliday={checkPublicHoliday}
            setSelectedIndex={setSelectedIndex}
            setOpenForm={setOpenForm}
            setOpenSendJobMessage={setOpenSendJobMessage}
            setForm={setForm}
            setOpenInvoiceForm={setOpenInvoiceForm}
            setClickedData={setClickedData}
            handleSnackbar={handleSnackbar}
            fetchData={fetchData}
          />
        );
      default:
        return <div />;
    }
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container>
        <Grid item sm={12}>
          <Typography variant='h4' gutterBottom>
            {currentPageTitle}
          </Typography>
          <Breadcrumb pages={['schedules']} />
        </Grid>
      </Grid>
      <Grid container>
        <Typography variant='body1' gutterBottom>
          Total Job Today
        </Typography>
        <InformationContent isLoading={isLoadingData} infomationContents={infomationContents} />
      </Grid>
      <Grid container>
        <Grid item sm={6}>
          <CustomizedTabs
            tabs={[
              { id: 0, name: 'Technicians' },
              { id: 1, name: 'Vehicles' }
            ]}
            selectedTabId={selectedTab}
            onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
          />
        </Grid>
        <Grid item sm={6} container alignItems='center' justify='flex-end'>
          <Button
            variant='outlined'
            disableElevation
            color='primary'
            className={classes.printButton}
            startIcon={<PrintIcon />}
            onClick={() => setOpenModal(true)}
          >
            Print Schedule
          </Button>
          {selectedTab === 0 && (
            <Button
              variant='outlined'
              disableElevation
              color='primary'
              className={classes.printButton}
              startIcon={<DateOffIcon />}
              onClick={() => setOpenTimeOff(true)}
            >
              Create Time Off
            </Button>
          )}
          <Button variant='contained' disableElevation color='primary' startIcon={<AddIcon />} onClick={handleOpenAdhoc}>
            Add Ad-hoc
          </Button>
        </Grid>
      </Grid>
      <Paper variant='outlined' className={classes.paper}>
        <ToolBar
          ref={childRef}
          selectedTab={selectedTab}
          initialView={initialView}
          handleChangeScheduleView={handleChangeScheduleView}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          active={active}
          setActive={setActive}
          publicHoliday={publicHoliday}
          employeeMaster={employeeMaster}
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          vehicleMaster={vehicleMaster}
          vehicleFilter={vehicleFilter}
          setVehicleFilter={setVehicleFilter}
          districtMaster={districts}
          districtFilter={districtFilter}
          setDistrictFilter={setDistrictFilter}
          isUnassignedJobs={isUnassignedJobs}
          setIsUnassignedJobs={setIsUnassignedJobs}
        />
        <SelectedContent page={selectedTab} />
      </Paper>
      <SideBarContent
        title={form.includes('job') ? 'Edit Job Schedule' : 'Create Ad-hoc Service'}
        open={openForm}
        onClickDrawer={handleCloseForm}
        width={form.includes('job') ? '60%' : '100%'}
      >
        {form.includes('job') ? (
          <EditJobForm
            jobEvent={events[selectedIndex] ? events[selectedIndex] : dummyJobEvent}
            employeeMaster={employeeMaster}
            vehicleMaster={vehicleMaster}
            publicHolidays={holidays}
            handleClose={handleCloseForm}
            handleSnackbar={handleSnackbar}
            fetchData={() => {
              fetchData();
              fetchJobInfo();
            }}
          />
        ) : (
          <CreateServiceForm vehicleMaster={vehicleMaster} clickedData={clickedData} handleClose={handleCloseForm} handleSnackbar={handleSnackbar} />
        )}
      </SideBarContent>
      {openModal && (
        <PrintScheduleModal
          openModal={openModal}
          selectedDate={selectedDate}
          selectedEmployeeFilter={employeeFilter.map(value => {
            return { id: value.columnValue, name: value.columnName };
          })}
          selectedVehilceFilter={vehicleFilter.map(value => {
            return { id: value.columnValue, name: value.columnName };
          })}
          employeeMaster={employeeMaster}
          vehicleMaster={vehicleMaster}
          setOpenModal={setOpenModal}
          isRemarksShow={isRemarksShow}
          setIsRemarksShow={setIsRemarksShow}
          isNotesShow={isNotesShow}
          setIsNotesShow={setIsNotesShow}
        />
      )}
      {openInvoiceForm && (
        <InvoiceForm
          open={openInvoiceForm}
          invoiceNumber={events[selectedIndex] ? events[selectedIndex].invoiceNumber : ''}
          invoiceId={events[selectedIndex] ? events[selectedIndex].invoiceId : 0}
          serviceId={events[selectedIndex] ? events[selectedIndex].serviceId : 0}
          clientId={events[selectedIndex] ? events[selectedIndex].clientId : 0}
          loadData={fetchData}
          handleCancel={() => {
            setOpenInvoiceForm(false);
            setSelectedIndex(0);
          }}
          handleSnackbar={handleSnackbar}
        />
      )}
      {openTimeOff && (
        <TimeOffForm
          open={openTimeOff}
          setOpen={setOpenTimeOff}
          employeeMaster={employeeMaster}
          isEditTimeOff={isEditTimeOff}
          setIsEditTimeOff={setIsEditTimeOff}
          loadData={fetchData}
          timeOffEvent={isEditTimeOff && events[selectedIndex]}
          handleSnackbar={handleSnackbar}
        />
      )}
      {isDeleteTimeOff && (
        <CustomizedDialog
          isLoading={isLoadingData}
          open={isDeleteTimeOff}
          isConfirmation
          variant='warning'
          title='Delete Time Off'
          message={`Are you sure want to delete this time off?`}
          primaryButtonLabel='Ok'
          secondaryButtonLabel='Cancel'
          primaryActionButton={handleDeleteTimeOff}
          secondaryActionButton={() => setIsDeleteTimeOff(false)}
          handleClose={() => setIsDeleteTimeOff(false)}
        />
      )}
      {openSnackbar && (
        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={() => setOpenSnackbar(false)}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        />
      )}
      {openSendJobMessage && (
        <SendJobForm
          open={openSendJobMessage}
          job={events[selectedIndex]}
          handleSnackbar={handleSnackbar}
          handleClose={() => setOpenSendJobMessage(false)}
        />
      )}
    </Container>
  );
};
export default SchedulePage;
