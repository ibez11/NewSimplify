import { FC, useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, DialogActions, Theme, Grid, Typography, List, ListItem, Card, ListItemText, ListItemSecondaryAction } from '@material-ui/core';

import CheckIcon from '@material-ui/icons/CheckCircle';
import axios, { CancelTokenSource } from 'axios';
import {
  CHECKLIST_TEMPLATE_BASE_URL,
  ENTITY_BASE_URL,
  GET_ACTIVE_USERS_URL,
  GST_TEMPLATE_BASE_URL,
  JOB_LABEL_TEMPLATE_BASE_URL,
  SERVICE_BASE_URL,
  SERVICE_ITEM_TEMPLATE_BASE_URL,
  SERVICE_TEMPLATE_BASE_URL,
  SKILL_TEMPLATE_BASE_URL
} from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { dummyClientBody, dummyService } from 'constants/dummy';
import { ServiceBody } from 'typings/body/ServiceBody';
import ClientForm from './components/ClientForm';
// import GeneralForm from './components/GeneralForm';
// import ChecklistForm from './components/ChecklistForm';
// import TermConditionForm from './components/TermConditionForm';
// import SummaryForm from './components/SummaryForm';
// import ScheduleForm from './components/ScheduleForm';
import { getNewDate, isValidEmail } from 'utils';
import { addHours, differenceInHours, differenceInMinutes } from 'date-fns';
import GeneralForm from './components/GeneralForm';
import ScheduleForm from './components/ScheduleForm';
import ChecklistForm from './components/ChecklistForm';
import TermConditionForm from './components/TermConditionForm';
import SummaryForm from './components/SummaryForm';
import { CreateLogEvent } from 'utils/Firebase';
import { CurrentUserContext } from 'contexts/CurrentUserContext';

interface Props {
  vehicleMaster: Select[];
  clickedData: any;
  handleSnackbar(variant: 'success' | 'error', message: string, isCountdown?: boolean): void;
  handleClose(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  contentGrid: {
    padding: theme.spacing(2),
    paddingBottom: '8vh',
    background: '#F5F8FA'
  },
  rightContent: {
    flex: 1, // Allow this to grow and take available space
    overflow: 'auto',
    maxHeight: '100vh' // Adjust as needed,
  },
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  menuList: {
    minHeight: 40
  },
  menuListActive: {
    minHeight: 40,
    background: '#DFFBFB'
  },
  checkIcon: {
    color: theme.palette.success.main
  },
  dialogActions: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.background.paper, // Optional: to match the dialog background
    padding: theme.spacing(1),
    zIndex: 1000 // Ensure it floats above other content
  }
}));

const CreateServiceForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { currentUser } = useContext(CurrentUserContext);

  const { vehicleMaster, clickedData, handleClose, handleSnackbar } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [steps, setSteps] = useState<any[]>([
    { label: 'Client Information', completed: false },
    { label: 'General Information', completed: false },
    { label: 'Scheduling & Service Items', completed: false },
    { label: 'Job Checklist', completed: false },
    { label: 'Term & Conditions', completed: false },
    { label: 'Summary', completed: false }
  ]);

  const [activeStep, setActiveStep] = useState<number>(0);
  const [service, setService] = useState<ServiceBody>({
    ...dummyService,
    serviceStatus: 'CONFIRMED',
    ContactPersons: [],
    ClientBody: dummyClientBody,
    CustomFields: [{ id: 0, label: '', value: '' }]
  });
  const [tempClientValue, setTempClientValue] = useState<ClientOption>({ id: 0, name: '', firstServiceAddress: '', ContactPersons: [] });
  const [tempPostalValue, setTempPostalValue] = useState<Select>({ id: 0, name: '' });
  const [selectedEmployees, setSelectedEmployees] = useState<Select[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<Select[]>([]);

  const [jobGenerate, setJobGenerate] = useState<JobGenerateModel[]>([]);

  const [error, setError] = useState<any>({
    clientName: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: '',
    postalCode: '',
    address: '',
    title: '',
    entity: '',
    selectedEmployee: ''
  });

  const [employeeMaster, setEmployeeMaster] = useState<Select[]>([]);
  const [serviceMaster, setServiceMaster] = useState<ServiceTemplatesModel[]>([]);
  const [serviceAddressMaster, setServiceAddressMaster] = useState<Select[]>([]);
  const [contactPersonMaster, setContactPersonMaster] = useState<Select[]>([]);
  const [entityMaster, setEntityMaster] = useState<EntityModel[]>([]);
  const [gstTaxMaster, setGstTaxMaster] = useState<Select[]>([]);
  const [skillMaster, setSkillMaster] = useState<SkillsModel[]>([]);
  const [serviceItemMaster, setServiceItemMaster] = useState<ServiceItemModel[]>([]);
  const [jobLabelMaster, setJobLabelMaster] = useState<Select[]>([]);
  const [checklistMaster, setChecklistMaster] = useState<ChecklistTemplateModel[]>([]);

  const loadProperties = async () => {
    setIsLoading(true);
    let updateService = service;

    if (clickedData.employeeId !== 0) {
      const getEmployees: any = [];
      getEmployees.push({ id: clickedData.employeeId, name: clickedData.employeeName });
      setSelectedEmployees(getEmployees);
    } else if (clickedData.vehicleId !== 0) {
      const getVehicles: any = [];
      getVehicles.push({ id: clickedData.vehicleId, name: clickedData.vehicleNumber });
      setSelectedVehicles(getVehicles);
    } else {
      setSelectedEmployees([]);
      setSelectedVehicles([]);
    }

    if (clickedData.employeeId !== 0 || clickedData.vehicleId !== 0) {
      const hour = differenceInHours(new Date(clickedData.endDateTime), new Date(clickedData.startDateTime));
      const differenceMinute = differenceInMinutes(new Date(clickedData.endDateTime), new Date(clickedData.startDateTime));
      const minute = differenceMinute - hour * 60;

      const newStartDateTime = new Date(clickedData.startDateTime);
      const newEndDateTime = new Date(clickedData.endDateTime);
      updateService.Schedules[0].startDateTime = newStartDateTime;
      updateService.Schedules[0].hour = hour;
      updateService.Schedules[0].minute = minute;
      updateService.Schedules[0].endDateTime = newEndDateTime;
    } else {
      const defaultStartTime = getNewDate(clickedData.startDateTime);
      const currentMinute = getNewDate(clickedData.startDateTime).getMinutes();
      const modMinute = currentMinute % 15;
      const newStartMinute = modMinute === 0 ? currentMinute : currentMinute + (15 - modMinute);
      defaultStartTime.setMinutes(newStartMinute);
      const defaultEndTime = addHours(defaultStartTime, 1);
      updateService.Schedules[0].startDateTime = defaultStartTime;
      updateService.Schedules[0].endDateTime = defaultEndTime;
    }

    const getEmployees = async () => {
      const { data } = await axios.get(`${GET_ACTIVE_USERS_URL}`, { cancelToken: cancelTokenSource.token });

      let employeeData: Select[] = [];
      data.activeUsers.map((value: any) => {
        return employeeData.push({ id: value.id, name: value.displayName });
      });

      setEmployeeMaster(employeeData);
    };

    const getServiceTemplates = async () => {
      const { data } = await axios.get(`${SERVICE_TEMPLATE_BASE_URL}`, { cancelToken: cancelTokenSource.token });

      //Set service template master
      let serviceTemplateData: ServiceTemplatesModel[] = [];
      data.serviceTemplates.map((value: any) => {
        return serviceTemplateData.push({
          id: value.id,
          name: value.name,
          description: value.description,
          termCondition: value.termCondition
        });
      });
      setServiceMaster(serviceTemplateData);
    };

    const getEntities = async () => {
      const { data } = await axios.get(`${ENTITY_BASE_URL}`, { cancelToken: cancelTokenSource.token });
      const gst = await axios.get(`${GST_TEMPLATE_BASE_URL}`, { cancelToken: cancelTokenSource.token });

      let gstData: Select[] = [];
      gst.data.gstTemplates.map((value: any) => {
        return gstData.push({ id: value.id, name: `${value.tax}%`, value: value.tax });
      });

      const entityData: EntityModel[] = data.entities;
      updateService.entityId = entityData[0].id;
      updateService.entityName = entityData[0].name;
      updateService.needGST = entityData[0].needGST;
      updateService.gstTax = entityData[0].needGST ? Number(gstData[0].value!) : 0;
      setEntityMaster(entityData);
      setGstTaxMaster(gstData);
    };

    const getSkills = async () => {
      try {
        const { data } = await axios.get(SKILL_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });
        setSkillMaster(data.SkillTemplates);
      } catch (err) {
        console.log(err);
      }
    };

    const getJobLabels = async () => {
      const { data } = await axios.get(JOB_LABEL_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });
      setJobLabelMaster(data.JobLabelTemplates);
    };

    const getServiceItemTemplates = async () => {
      const { data } = await axios.get(`${SERVICE_ITEM_TEMPLATE_BASE_URL}`, { cancelToken: cancelTokenSource.token });

      //Set service item master
      let serviceItemData: ServiceItemModel[] = [];
      data.serviceItemTemplates.map((value: any) => {
        return serviceItemData.push({
          id: value.id,
          name: value.name,
          description: value.description,
          quantity: value.qty,
          unitPrice: value.unitPrice,
          idQboWithGST: value.idQboWithGST,
          IdQboWithoutGST: value.IdQboWithoutGST,
          totalPrice: 0
        });
      });
      setServiceItemMaster(serviceItemData);
    };

    const getChecklistTemplates = async () => {
      try {
        const { data } = await axios.get(CHECKLIST_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });
        setChecklistMaster(data.checklistTemplates);
      } catch (err) {
        console.log(err);
      }
      updateService.Checklists = [];
    };

    getEmployees();
    getServiceTemplates();
    // getServiceAddresses();
    // getContactPersons();
    getEntities();
    getSkills();
    getJobLabels();
    getServiceItemTemplates();
    getChecklistTemplates();
    setService(updateService);
    setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadProperties();
    };
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <ClientForm
            service={service}
            setService={setService}
            tempClientValue={tempClientValue}
            setTempClientValue={setTempClientValue}
            tempPostalValue={tempPostalValue}
            setTempPostalValue={setTempPostalValue}
            error={error}
            setError={setError}
            setContactPersonMaster={setContactPersonMaster}
            setServiceAddressMaster={setServiceAddressMaster}
          />
        );
      case 1:
        return (
          <GeneralForm
            serviceMaster={serviceMaster}
            technicianMaster={employeeMaster}
            serviceAddressMaster={serviceAddressMaster}
            contactPersonMaster={contactPersonMaster}
            entityMaster={entityMaster}
            gstTaxMaster={gstTaxMaster}
            skillMaster={skillMaster}
            jobLabelMaster={jobLabelMaster}
            service={service}
            setService={setService}
            error={error}
            setError={setError}
            setContactPersonMaster={setContactPersonMaster}
            setServiceAddressMaster={setServiceAddressMaster}
          />
        );
      case 2:
        return (
          <ScheduleForm
            employeeMaster={employeeMaster}
            vehicleMaster={vehicleMaster}
            serviceItemMaster={serviceItemMaster}
            service={service}
            setService={setService}
            selectedEmployees={selectedEmployees}
            setSelectedEmployees={setSelectedEmployees}
            selectedVehicles={selectedVehicles}
            setSelectedVehicles={setSelectedVehicles}
            jobGenerate={jobGenerate}
            setJobGenerate={setJobGenerate}
            error={error}
            setError={setError}
            handleSnackbar={handleSnackbar}
          />
        );
      case 3:
        return <ChecklistForm checklistMaster={checklistMaster} service={service} setService={setService} />;
      case 4:
        return <TermConditionForm service={service} setService={setService} />;
      default:
        return <SummaryForm service={service} jobGenerate={jobGenerate} selectedEmployees={selectedEmployees} selectedVehicles={selectedVehicles} />;
    }
  };

  const validateForm = async (step: number) => {
    let ret = true;

    const { ClientBody } = service;
    const { name, billingPostal, billingAddress, ContactPersons } = ClientBody!;
    const { contactPerson, contactNumber, contactEmail } = ContactPersons[0];

    if (activeStep === 0) {
      if (!name || !name.trim()) {
        setError({ ...error, clientName: 'Please enter client name' });
        ret = false;
      } else if (!contactPerson || !contactPerson.trim()) {
        setError({ ...error, contactPerson: 'Please enter contact person name' });
        ret = false;
      } else if (!contactNumber || !contactNumber.trim()) {
        setError({ ...error, contactNumber: 'Please enter contact number' });
        ret = false;
      } else if (contactNumber.length < 8) {
        setError({ ...error, contactNumber: 'Contact number is less than 8 digit' });
        ret = false;
      } else if (contactEmail && !isValidEmail(contactEmail)) {
        setError({ ...error, contactEmail: 'Please enter valid email' });
        ret = false;
      } else if (!billingPostal || !billingPostal.trim()) {
        setError({ ...error, postalCode: 'Please enter postal code' });
        ret = false;
      } else if (!billingAddress || !billingAddress.trim()) {
        setError({ ...error, address: 'Please enter address' });
        ret = false;
      }
    } else if (activeStep === 1) {
      const { serviceTitle, ContactPersons } = service;

      if (!serviceTitle || !serviceTitle.trim()) {
        setError({ ...error, title: 'Please enter title' });
        ret = false;
      } else if (!ContactPersons || ContactPersons.length <= 0) {
        setError({ ...error, contactPerson: 'Please select  at least one contact person' });
        ret = false;
      }
    } else {
      if (jobGenerate.length <= 0) {
        handleSnackbar('error', 'Please generate job schedule');
        setActiveStep(2);
        ret = false;
      }
    }

    if (ret) {
      setActiveStep(step);
      setSteps(prev => {
        prev[activeStep].completed = true;
        return [...prev];
      });
    } else {
      setSteps(prev => {
        prev[activeStep].completed = false;
        return [...prev];
      });
    }

    return ret;
  };

  const handleMenu = (step: number) => {
    validateForm(step);
  };

  const handleNext = () => {
    validateForm(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit: React.FormEventHandler = async () => {
    setIsLoading(true);

    if (jobGenerate.length <= 0) {
      handleSnackbar('error', 'Please generate job schedule');
      setActiveStep(2);
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${SERVICE_BASE_URL}`, { ...service, selectedEmployees, selectedVehicles }, { cancelToken: cancelTokenSource.token });
      CreateLogEvent('create_adhoc_schedule', currentUser!);
      handleSnackbar('success', 'Success to create ad-hoc service');
      handleClose();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed to create quotation');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={2}>
          <Card variant='outlined' className={classes.paper}>
            <List component='nav'>
              {steps.map((value, index) => (
                <ListItem
                  key={`list-menu-${index}`}
                  button
                  className={activeStep === index ? classes.menuListActive : classes.menuList}
                  onClick={() => handleMenu(index)}
                >
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant='subtitle1' color={activeStep === index ? 'primary' : 'textPrimary'}>
                        {value.label}
                      </Typography>
                    }
                  />
                  {value.completed && (
                    <ListItemSecondaryAction>
                      <CheckIcon fontSize='small' className={classes.checkIcon} />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={10} className={classes.rightContent}>
          {getStepContent(activeStep)}
        </Grid>
      </Grid>
      <Grid container spacing={2} justify='flex-end' className={classes.dialogActions}>
        <DialogActions>
          <Button variant='contained' disableElevation disabled={isLoading} onClick={activeStep === 0 ? handleClose : handleBack} size='small'>
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant='contained'
            color='primary'
            disableElevation
            disabled={isLoading}
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            size='small'
          >
            {activeStep === steps.length - 1 ? 'Save' : 'Continue'}
            <LoadingButtonIndicator isLoading={isLoading} />
          </Button>
        </DialogActions>
      </Grid>
    </>
  );
};

export default CreateServiceForm;
