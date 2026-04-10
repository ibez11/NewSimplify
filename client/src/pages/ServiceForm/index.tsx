import { FC, useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, DialogActions, Theme, Grid, Typography, List, ListItem, Card, ListItemText, ListItemSecondaryAction } from '@material-ui/core';

import CheckIcon from '@material-ui/icons/CheckCircle';
import axios, { CancelTokenSource } from 'axios';
import {
  CHECKLIST_TEMPLATE_BASE_URL,
  ENTITY_BASE_URL,
  GET_ACTIVE_USERS_URL,
  GET_CONTACT_PERSONS_CLIENT_BY_ID_URL,
  GET_RENEW_SERVICE_URL,
  GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL,
  GST_TEMPLATE_BASE_URL,
  JOB_LABEL_TEMPLATE_BASE_URL,
  RENEW_SERVICE_URL,
  SERVICE_BASE_URL,
  SERVICE_ITEM_TEMPLATE_BASE_URL,
  SERVICE_TEMPLATE_BASE_URL,
  SKILL_TEMPLATE_BASE_URL
} from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { dummyService } from 'constants/dummy';
import { ServiceBody } from 'typings/body/ServiceBody';
import GeneralForm from './components/GeneralForm';
import ChecklistForm from './components/ChecklistForm';
import TermConditionForm from './components/TermConditionForm';
import SummaryForm from './components/SummaryForm';
import ScheduleForm from './components/ScheduleForm';
import { scheduleLabelGenerate } from 'utils';
import { addDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';

interface Props {
  oldContractId?: number;
  isRenew?: boolean;
  clientId: number;
  setServiceId: React.Dispatch<React.SetStateAction<number>>;
  setServiceType?: React.Dispatch<React.SetStateAction<string>>;
  setOpenSuccessModal: React.Dispatch<React.SetStateAction<boolean>>;
  fetchData(): void;
  handleSnackbar(variant: 'success' | 'error', message: string, isCountdown?: boolean): void;
  handleCancel(): void;
  setNewServiceCreated?: React.Dispatch<React.SetStateAction<any>>;
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
    maxHeight: '100vh' // Adjust as needed
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
    padding: theme.spacing(1), // Optional: add some padding
    zIndex: 1000 // Ensure it floats above other content
  }
}));

const ServiceForm: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const {
    oldContractId,
    isRenew,
    clientId,
    setServiceId,
    setServiceType,
    setOpenSuccessModal,
    fetchData,
    handleSnackbar,
    handleCancel,
    setNewServiceCreated
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [steps, setSteps] = useState<any[]>([
    { label: 'General Information', completed: false },
    { label: 'Scheduling & Service Items', completed: false },
    { label: 'Job Checklist', completed: false },
    { label: 'Term & Conditions', completed: false },
    { label: 'Summary', completed: false }
  ]);
  const [activeStep, setActiveStep] = useState<number>(0);

  const [service, setService] = useState<ServiceBody>({
    ...dummyService,
    clientId,
    ContactPersons: [],
    CustomFields: [{ id: 0, label: '', value: '' }]
  });
  const [jobGenerate, setJobGenerate] = useState<JobGenerateModel[]>([]);

  const [error, setError] = useState<any[]>([{ title: '', serviceAddress: '', entity: '', contactPerson: '' }]);

  const [serviceMaster, setServiceMaster] = useState<ServiceTemplatesModel[]>([]);
  const [technicianMaster, setTechnicianMaster] = useState<Select[]>([]);
  const [serviceAddressMaster, setServiceAddressMaster] = useState<Select[]>([]);
  const [contactPersonMaster, setContactPersonMaster] = useState<Select[]>([]);
  const [entityMaster, setEntityMaster] = useState<EntityModel[]>([]);
  const [gstTaxMaster, setGstTaxMaster] = useState<Select[]>([]);
  const [skillMaster, setSkillMaster] = useState<SkillsModel[]>([]);
  const [serviceItemMaster, setServiceItemMaster] = useState<ServiceItemModel[]>([]);
  const [jobLabelMaster, setJobLabelMaster] = useState<Select[]>([]);
  const [checklistMaster, setChecklistMaster] = useState<ChecklistTemplateModel[]>([]);

  const loadProperties = async () => {
    let updateService = service;

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

    const getActiveTechnicians = async () => {
      const { data } = await axios.get(`${GET_ACTIVE_USERS_URL}`, { cancelToken: cancelTokenSource.token });

      let technicianData: Select[] = [];
      data.activeUsers.map((value: any) => {
        return technicianData.push({ id: value.id, name: value.displayName });
      });

      setTechnicianMaster(technicianData);
    };

    const getServiceAddresses = async () => {
      const { data } = await axios.get(`${GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL(clientId)}`, { cancelToken: cancelTokenSource.token });

      //Set service address master
      let serviceAddressData: Select[] = [];
      data.serviceAddresses.map((value: any) => {
        return serviceAddressData.push({ id: value.id, name: value.address });
      });

      updateService.serviceAddressId = serviceAddressData[0].id;
      updateService.serviceAddress = serviceAddressData[0].name;
      setServiceAddressMaster(serviceAddressData);
    };

    const getContactPersons = async () => {
      const { data } = await axios.get(`${GET_CONTACT_PERSONS_CLIENT_BY_ID_URL(clientId)}`, { cancelToken: cancelTokenSource.token });

      //Set contact person address master
      let contactPersonsData: Select[] = [];
      data.contactPersons.map((value: any) => {
        return contactPersonsData.push({
          id: value.id,
          name: `${value.contactPerson} ${value.description ? `(${value.description})` : ''} | ${value.countryCode}${value.contactNumber}`,
          value: value.contactEmail
        });
      });

      updateService.ContactPersons!.push({ ...contactPersonsData[0] });
      setContactPersonMaster(contactPersonsData);
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

    getServiceTemplates();
    getActiveTechnicians();
    getServiceAddresses();
    getContactPersons();
    getEntities();
    getSkills();
    getJobLabels();
    getServiceItemTemplates();
    getChecklistTemplates();
    setService(updateService);
  };

  const loadRenewService = async () => {
    const { data } = await axios.get(GET_RENEW_SERVICE_URL(Number(oldContractId)), { cancelToken: cancelTokenSource.token });
    const service = data.service;
    const jobs = data.jobs;
    let Checklists: ChecklistTemplateModel[] = [];
    let JobLabels: JobLabelModel[] = [];
    let skills: SkillsModel[] = [];

    service.Schedules.map((value: any, index: number) => {
      const hour = differenceInHours(new Date(value.endDateTime), new Date(value.startDateTime));
      const differenceMinute = differenceInMinutes(new Date(value.endDateTime), new Date(value.startDateTime));
      const minute = differenceMinute - hour * 60;
      const scheduleLabel = scheduleLabelGenerate(value);

      value.scheduleIndex = index;
      value.scheduleLabel = scheduleLabel;
      value.hour = hour;
      value.minute = minute;

      return value;
    });

    service.Jobs.forEach((job: any) => {
      Checklists = job.ChecklistJob;
      JobLabels = job.JobLabels;
    });

    service.ServiceSkills.forEach((skill: any) => {
      skills.push({ id: 0, name: skill.skill, description: '' });
    });

    let contactPersonsData: Select[] = [];
    if (service.Client.ContactPersons && service.Client.ContactPersons.length > 0) {
      service.Client.ContactPersons.map((value: any) => {
        return contactPersonsData.push({
          id: value.id,
          name: `${value.contactPerson} ${value.description ? `(${value.description})` : ''} | ${value.countryCode}${value.contactNumber}`,
          value: value.contactEmail
        });
      });
    }

    setService({
      ...service,
      issueDate: new Date(),
      expiryDate: addDays(new Date(), 30),
      salesPerson: service.salesPerson ? service.salesPerson : '',
      serviceAddress: service.ServiceAddress.address,
      entityName: service.Entity.name,
      contractAmount: service.originalAmount,
      skills,
      Checklists,
      JobLabels,
      CustomFields: [{ id: 0, label: '', value: '' }],
      ContactPersons: contactPersonsData
    });
    setJobGenerate(jobs);
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadProperties();
      if (!isRenew && !oldContractId) {
        return;
      } else {
        await loadRenewService();
      }
    };
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <GeneralForm
            serviceMaster={serviceMaster}
            technicianMaster={technicianMaster}
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
          />
        );
      case 1:
        return (
          <ScheduleForm
            serviceItemMaster={serviceItemMaster}
            service={service}
            setService={setService}
            jobGenerate={jobGenerate}
            setJobGenerate={setJobGenerate}
            error={error}
            setError={setError}
            handleSnackbar={handleSnackbar}
          />
        );
      case 2:
        return <ChecklistForm checklistMaster={checklistMaster} service={service} setService={setService} />;
      case 3:
        return <TermConditionForm service={service} setService={setService} />;
      default:
        return <SummaryForm service={service} jobGenerate={jobGenerate} />;
    }
  };

  const validateForm = async (step: number) => {
    let ret = true;

    const { serviceTitle, ContactPersons, entityId } = service;

    if (activeStep === 0) {
      if (!serviceTitle || !serviceTitle.trim()) {
        setError(prev => {
          prev[0].title = 'Please enter title';
          return [...prev];
        });
        ret = false;
      } else if (!ContactPersons || ContactPersons.length <= 0) {
        setError(prev => {
          prev[0].contactPerson = 'Please select at least one contact person';
          return [...prev];
        });
        ret = false;
      } else if (entityId === 0) {
        setError(prev => {
          prev[0].entities = 'Please select the entity';
          return [...prev];
        });
        ret = false;
      }
    } else {
      if (jobGenerate.length <= 0) {
        handleSnackbar('error', 'Please generate job schedule');
        setActiveStep(1);
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
      setActiveStep(1);
      setIsLoading(false);
      return;
    }

    try {
      if (isRenew) {
        const { data } = await axios.post(`${RENEW_SERVICE_URL(oldContractId!)}`, { ...service }, { cancelToken: cancelTokenSource.token });
        setServiceId(data.id);
        setOpenSuccessModal(true);
        setServiceType!(data.serviceType);
        CreateLogEvent('renew_quotation', currentUser!);
      } else {
        const { data } = await axios.post(`${SERVICE_BASE_URL}`, { ...service }, { cancelToken: cancelTokenSource.token });
        setServiceId(data.id);
        setServiceType!(data.serviceType);
        setNewServiceCreated && setNewServiceCreated(data);
        CreateLogEvent('create_quotation', currentUser!);
      }
      setOpenSuccessModal(true);
      handleCancel();
      fetchData();
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
          <Button variant='contained' disableElevation disabled={isLoading} onClick={activeStep === 0 ? handleCancel : handleBack}>
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            variant='contained'
            color='primary'
            disableElevation
            disabled={isLoading}
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          >
            {activeStep === steps.length - 1 ? 'Save' : 'Continue'}
            <LoadingButtonIndicator isLoading={isLoading} />
          </Button>
        </DialogActions>
      </Grid>
    </>
  );
};

export default ServiceForm;
