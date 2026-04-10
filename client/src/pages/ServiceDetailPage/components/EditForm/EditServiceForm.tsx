import { FC, useState, useEffect } from 'react';
import { Grid, TextField, Theme, Typography, Button, DialogActions, MenuItem, Chip, Checkbox, Tooltip, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import {
  SERVICE_TEMPLATE_BASE_URL,
  GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL,
  ENTITY_BASE_URL,
  GST_TEMPLATE_BASE_URL,
  SKILL_TEMPLATE_BASE_URL,
  GET_ACTIVE_USERS_URL,
  GET_EDIT_SERVICE_URL,
  GET_CONTACT_PERSONS_CLIENT_BY_ID_URL
} from 'constants/url';
import axios, { CancelTokenSource } from 'axios';
import theme from 'theme';
import { convertHtml, ucWords } from 'utils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import { ServiceBody } from 'typings/body/ServiceBody';
import { dummyCustomField, dummyService } from 'constants/dummy';
import MUIRichTextEditor from 'mui-rte';
import { convertToHTML } from 'draft-convert';
import { addDays, differenceInDays, isValid } from 'date-fns';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

interface Props {
  service: ServiceDetailModel;
  setService: React.Dispatch<React.SetStateAction<ServiceDetailModel>>;
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  fetchData(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2),
    maxHeight: 600,
    overflow: 'auto'
  },
  required: {
    color: 'red'
  },
  checkBoxIcon: {
    fontSize: '16px'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  },
  rteGrid: {
    border: 'solid 1px',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 5,
    paddingBottom: '50px !important',
    paddingLeft: theme.spacing(2),
    overflow: 'auto',
    maxHeight: 300,
    height: 200
  }
}));

const EditServiceForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const { service, handleClose, handleSnackbar, fetchData } = props;

  const [isLoading, setIsloading] = useState<boolean>(false);
  const [editService, setEditService] = useState<ServiceBody>(dummyService);
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [currentTermCondition, setCurrentTermCondition] = useState<string>('');
  let descriptionData = '';
  let termConditionData = '';

  const [selectedSkills, setSelectedSkills] = useState<SkillsModel[]>([]);
  const [selectedContactPerson, setSelectedContactPerson] = useState<Select[]>([]);

  const [serviceMaster, setServiceMaster] = useState<ServiceTemplatesModel[]>([]);
  const [employeeMaster, setEmployeeMaster] = useState<Select[]>([]);
  const [serviceAddressMaster, setServiceAddressMaster] = useState<Select[]>([]);
  const [contactPersonMaster, setContactPersonMaster] = useState<Select[]>([]);
  const [entityMaster, setEntityMaster] = useState<EntityModel[]>([]);
  const [gstTaxMaster, setGstTaxMaster] = useState<Select[]>([]);
  const [skillMaster, setSkillMaster] = useState<SkillsModel[]>([]);

  const duration = [
    { value: 1, name: 'Today' },
    { value: 7, name: 'In 7 Days' },
    { value: 14, name: 'In 14 Days' },
    { value: 30, name: 'In 30 Days' },
    { value: 0, name: 'Custom' }
  ];

  const [quotationDuration, setQuotationDuration] = useState<number>(30);

  const [error, setError] = useState<any[]>([{ title: '', serviceAddress: '', entity: '', contactPerson: '' }]);

  useEffect(() => {
    if (!service) {
      return;
    }
    const {
      serviceTitle,
      serviceStatus,
      description,
      issueDate,
      expiryDate,
      termStart,
      termEnd,
      needGST,
      gstTax,
      contractDiscount,
      serviceAddress,
      serviceAddressId,
      entityName,
      entityId,
      salesPerson,
      termCondition,
      skills,
      CustomFields,
      ContactPersons
    } = service;

    const currentDescription = convertHtml(description);
    const currentTermCondition = convertHtml(termCondition);
    setCurrentDescription(currentDescription);
    setCurrentTermCondition(currentTermCondition);

    let currentSkills: SkillsModel[] = [];

    if (skills && skills.length > 0) {
      skills.map(value => {
        return currentSkills.push({ id: 0, name: value, description: '' });
      });
    }
    setSelectedSkills(currentSkills);

    if (issueDate && expiryDate) {
      const duration = differenceInDays(new Date(expiryDate), new Date(issueDate));
      if (duration !== 1 && duration !== 7 && duration !== 14 && duration !== 30) {
        setQuotationDuration(0);
      } else {
        setQuotationDuration(duration);
      }
    }

    setEditService({
      ...dummyService,
      serviceTitle,
      serviceStatus: serviceStatus.includes('Active') ? 'CONFIRMED' : serviceStatus.toUpperCase(),
      issueDate: issueDate || new Date(),
      expiryDate: expiryDate || addDays(new Date(), 30),
      termStart,
      termEnd,
      needGST,
      gstTax: needGST ? gstTax : 0,
      discountAmount: contractDiscount,
      serviceAddress,
      serviceAddressId,
      entityName,
      entityId,
      salesPerson,
      description,
      termCondition,
      skills: currentSkills,
      CustomFields: CustomFields!.length > 0 ? CustomFields : [dummyCustomField],
      ContactPersons
    });
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
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

      const getActiveEmployee = async () => {
        const { data } = await axios.get(`${GET_ACTIVE_USERS_URL}`, { cancelToken: cancelTokenSource.token });

        let technicianData: Select[] = [];
        data.activeUsers.map((value: any) => {
          return technicianData.push({ id: value.id, name: value.displayName });
        });

        setEmployeeMaster(technicianData);
      };

      const getServiceAddresses = async () => {
        const { data } = await axios.get(`${GET_SERVICE_ADDRESS_BY_CLIENT_ID_URL(service.clientId)}`, { cancelToken: cancelTokenSource.token });

        //Set service address master
        let serviceAddressData: Select[] = [];
        data.serviceAddresses.map((value: any) => {
          return serviceAddressData.push({ id: value.id, name: value.address });
        });

        setServiceAddressMaster(serviceAddressData);
      };

      const getContactPersons = async () => {
        const { data } = await axios.get(`${GET_CONTACT_PERSONS_CLIENT_BY_ID_URL(service.clientId)}`, { cancelToken: cancelTokenSource.token });

        //Set contact person address master
        let contactPersonsData: Select[] = [];
        data.contactPersons.map((value: any, index: number) => {
          return contactPersonsData.push({
            id: value.id,
            name: `${value.contactPerson} ${value.description ? `(${value.description})` : ''} | ${value.countryCode}${value.contactNumber}`,
            value: value.contactEmail
          });
        });

        if (service.ContactPersons && service.ContactPersons.length > 0) {
          const contactPersonWithEmail = contactPersonsData.filter(person => service.ContactPersons!.some(contact => contact.id === person.id));
          setSelectedContactPerson(contactPersonWithEmail);
        } else {
          setSelectedContactPerson([contactPersonsData[0]]);
        }

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

      getServiceTemplates();
      getActiveEmployee();
      getServiceAddresses();
      getContactPersons();
      getEntities();
      getSkills();
    };

    loadProperties();
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFreeTextTitle = (value: any) => {
    setEditService({ ...editService, id: 0, serviceTitle: value });
    setError(prev => {
      prev[0].title = '';
      return [...prev];
    });
  };

  const handleTitleChange = (value: any) => {
    if (value) {
      setCurrentDescription(convertHtml(value.description));
      setCurrentTermCondition(convertHtml(value.termCondition));
      setEditService({ ...editService, ...value, id: 0, serviceTitle: value.name });
      setError(prev => {
        prev[0].title = '';
        return [...prev];
      });
    }
  };

  const handleTitleeValidation = () => {
    setError(prev => {
      prev[0].title = '';
      return [...prev];
    });
    if (!editService.serviceTitle || !editService.serviceTitle.trim()) {
      setError(prev => {
        prev[0].title = 'Please enter title';
        return [...prev];
      });

      return;
    }
  };

  const handleIssueDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      const expiryDate = addDays(date, 30);
      setEditService({
        ...editService,
        issueDate: date,
        expiryDate
      });
    }
  };

  const handleChangeDuration = (value: number) => {
    const { issueDate } = editService;

    if (value === 1) {
      setEditService({
        ...editService,
        issueDate: new Date(),
        expiryDate: new Date()
      });
    } else if (value === 0) {
      setEditService({
        ...editService,
        expiryDate: new Date(issueDate)
      });
    } else if (value !== 1 && value !== 0) {
      setEditService({
        ...editService,
        expiryDate: addDays(new Date(issueDate), value)
      });
    }
    setQuotationDuration(value);
  };

  const handleExpiryDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      setEditService({
        ...editService,
        expiryDate: date
      });
    }
  };

  const handleChangeSelectedContactPersons = (contactPerson: Select[]) => {
    setSelectedContactPerson(contactPerson);
    setEditService({
      ...editService,
      ContactPersons: contactPerson
    });
  };

  const handleFreeTextSalesPerson = (value: any) => {
    setEditService({ ...editService, salesPerson: value });
  };

  const handleSalesPersonChange = (value: any) => {
    if (value) {
      setEditService({ ...editService, salesPerson: value.name });
    }
  };

  const handleContactValidation = () => {
    setError(prev => {
      prev[0].contactPerson = '';
      return [...prev];
    });
    if (!selectedContactPerson || selectedContactPerson.length <= 0) {
      setError(prev => {
        prev[0].contactPerson = 'Please select  at least one contact person';
        return [...prev];
      });

      return;
    }
  };

  const handleEntityChange = (value: any) => {
    const entity = entityMaster.find(entity => entity.id === value);
    if (entity) {
      let { contractAmount, contractDiscount, gstAmount, totalAmount } = service;
      const gstTax = entity.needGST ? Number(gstTaxMaster[0].value) : 0;

      if (entity.needGST) {
        gstAmount = Number((((contractAmount - contractDiscount) * gstTax) / 100).toFixed(2));
        totalAmount = Number((contractAmount - contractDiscount + gstAmount).toFixed(2));
      } else {
        gstAmount = 0;
        totalAmount = Number((contractAmount - contractDiscount).toFixed(2));
      }
      setEditService({
        ...editService,
        entityId: value,
        entityName: entity.name,
        needGST: entity.needGST,
        gstTax,
        gstAmount,
        totalAmount
      });
    }
  };

  const handleChangeSelectedSkills = (skills: Select[]) => {
    const selected: any = [];
    for (const skill of skills) {
      selected.push({ name: skill.name });
    }
    setSelectedSkills(selected);
    setEditService({ ...editService, skills: selected });
  };

  const handleChangeDescription = (event: any) => {
    descriptionData = JSON.stringify(convertToHTML(event.getCurrentContent()));
    descriptionData = descriptionData.replace(/"/g, '');
    descriptionData = descriptionData.replace(/<p><\/p>/g, '<div>&shy;</div>');
  };

  const handleBlurDescription = () => {
    if (descriptionData === '<div>&shy;</div>') {
      setCurrentDescription('');
      setEditService({ ...editService, description: '' });
    } else {
      setCurrentDescription(convertHtml(descriptionData));
      setEditService({ ...editService, description: descriptionData });
    }
  };

  const handleChangeTermCondition = (event: any) => {
    termConditionData = JSON.stringify(convertToHTML(event.getCurrentContent()));
    termConditionData = termConditionData.replace(/"/g, '');
    termConditionData = termConditionData.replace(/<p><\/p>/g, '<div>&shy;</div>');
  };

  const handleBlurTermCondition = () => {
    if (termConditionData === '<div>&shy;</div>') {
      setCurrentTermCondition('');
      setEditService({ ...editService, termCondition: '' });
    } else {
      setCurrentTermCondition(convertHtml(termConditionData));
      setEditService({ ...editService, termCondition: termConditionData });
    }
  };

  const handleAddCustomField = () => {
    const currentCustomFields = editService.CustomFields;
    currentCustomFields?.push({ id: 0, label: '', value: '' });
    setEditService({ ...editService, CustomFields: currentCustomFields });
  };

  const handleDeleteCustomField = (index: number) => {
    const currentCustomFields = editService.CustomFields;
    currentCustomFields?.splice(index, 1);
    setEditService({ ...editService, CustomFields: currentCustomFields });
  };

  const handleChangeCustomField = (field: string, value: string, index: number) => {
    const currentCustomFields = editService.CustomFields!;
    if (field.includes('label')) {
      currentCustomFields[index].label = value;
    } else {
      currentCustomFields[index].value = value;
    }
    setEditService({ ...editService, CustomFields: currentCustomFields });
  };

  const handleSubmit = async () => {
    setIsloading(true);
    try {
      await axios.put(GET_EDIT_SERVICE_URL(service.id), {
        serviceTitle: editService.serviceTitle,
        description: editService.description,
        salesPerson: editService.salesPerson,
        serviceAddressId: editService.serviceAddressId,
        entityId: editService.entityId,
        needGST: editService.needGST,
        contractDiscount: editService.discountAmount,
        gstTax: editService.gstTax,
        termCondition: editService.termCondition,
        skills: editService.skills,
        issueDate: editService.issueDate,
        expiryDate: editService.expiryDate,
        CustomFields: editService.CustomFields,
        ContactPersons: selectedContactPerson
      });

      fetchData();
      handleClose();
      handleSnackbar('success', 'Sucessfully to edit quotation');
    } catch (err) {
      console.log('err');
      handleSnackbar('error', 'Failed to edit quotation');
    }
    setIsloading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Quotation Title <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Autocomplete
            id='serviceTitle'
            options={serviceMaster}
            getOptionLabel={option => option.name}
            inputValue={editService.serviceTitle}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') {
                handleFreeTextTitle(value ? value : '');
              }
              if (reason === 'clear') {
                setEditService({ ...editService, serviceTitle: '', description: '', termCondition: '' });
              }
            }}
            onChange={(_: any, value: ServiceTemplatesModel | any) => handleTitleChange(value)}
            autoHighlight={true}
            freeSolo
            renderInput={params => (
              <TextField
                {...params}
                required
                margin='dense'
                label='Quotation Title'
                variant='outlined'
                error={error[0].title !== ''}
                helperText={error[0].title}
                style={{ paddingRight: 8 }}
                onBlur={handleTitleeValidation}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>
            Quotation Issue & Expiry Date <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                required
                margin='dense'
                id='duration'
                label='Duration'
                value={quotationDuration}
                onChange={event => handleChangeDuration(Number(event.target.value))}
                variant='outlined'
                autoComplete='off'
              >
                {duration.map((value, index) => {
                  return (
                    <MenuItem key={index} value={value.value}>
                      {ucWords(value.name)}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  clearable
                  required
                  fullWidth
                  id='issueDate'
                  label='Issue Date'
                  margin='dense'
                  value={editService.issueDate}
                  variant='dialog'
                  inputVariant='outlined'
                  format='dd-MM-yyyy'
                  onChange={handleIssueDateChange}
                  InputAdornmentProps={{ position: 'start' }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} sm={4}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  clearable
                  required
                  id='expiryDate'
                  label='Expiry Date'
                  margin='dense'
                  value={editService.expiryDate}
                  variant='dialog'
                  inputVariant='outlined'
                  format='dd-MM-yyyy'
                  disabled={quotationDuration !== 0}
                  onChange={handleExpiryDateChange}
                  InputAdornmentProps={{ position: 'start' }}
                  style={{ width: '96%' }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>
            Contact Persons <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Autocomplete
            multiple
            id='skills'
            options={contactPersonMaster}
            value={selectedContactPerson}
            disableCloseOnSelect
            getOptionLabel={option => option.name}
            getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
            onChange={(_, value) => handleChangeSelectedContactPersons(value)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  size='small'
                  style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                  label={`${option.name}`}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderOption={(option, { selected }) => (
              <>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxIcon} />}
                  checkedIcon={<CheckBoxIcon className={classes.checkBoxIcon} />}
                  color='primary'
                  disableRipple
                  className={classes.checkBox}
                  checked={selected}
                />
                {option.name}
              </>
            )}
            renderInput={params => (
              <TextField
                {...params}
                margin='dense'
                fullWidth
                id='skills'
                placeholder={selectedContactPerson.length === 0 ? 'You can choose more than one contact persons' : ''}
                error={error[0].contactPerson !== ''}
                helperText={error[0].contactPerson}
                variant='outlined'
                autoComplete='off'
                onBlur={handleContactValidation}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>Sales Person</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Autocomplete
            id='salesPerson'
            options={employeeMaster}
            getOptionLabel={option => option.name}
            inputValue={editService.salesPerson}
            onInputChange={(_, value, reason) => {
              if (reason === 'input') {
                handleFreeTextSalesPerson(value ? value : '');
              }
              if (reason === 'clear') {
                setEditService({ ...editService, salesPerson: '' });
              }
            }}
            onChange={(_: any, value: ServiceTemplatesModel | any) => handleSalesPersonChange(value)}
            autoHighlight={true}
            freeSolo
            renderInput={params => <TextField {...params} margin='dense' label='Sales Person' variant='outlined' style={{ paddingRight: 8 }} />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>
            Service Address<span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <TextField
            select
            fullWidth
            required
            margin='dense'
            id='service-address'
            label='Service Address'
            value={editService.serviceAddressId}
            onChange={event => setEditService({ ...editService, serviceAddressId: Number(event.target.value) })}
            variant='outlined'
            autoComplete='off'
            style={{ paddingRight: 8 }}
          >
            {serviceAddressMaster.map(value => {
              return (
                <MenuItem key={value.id} value={value.id}>
                  {ucWords(value.name)}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>
            Entity & GST<span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            required
            margin='dense'
            id='entity'
            label='Entity'
            value={editService.entityId}
            onChange={event => handleEntityChange(Number(event.target.value))}
            variant='outlined'
            autoComplete='off'
            style={{ paddingRight: 8 }}
          >
            {entityMaster.map(value => {
              return (
                <MenuItem key={value.id} value={value.id}>
                  {ucWords(value.name)}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            value={editService.needGST ? editService.gstTax : 0}
            select
            disabled={editService.needGST ? false : true}
            fullWidth
            margin='dense'
            variant='outlined'
            onChange={event => setEditService({ ...editService, gstTax: Number(event.target.value) })}
            id='GST-tax'
            label='GST Tax'
          >
            {!editService.needGST && (
              <MenuItem key={0} value={0}>
                -
              </MenuItem>
            )}
            {gstTaxMaster.map(value => {
              return (
                <MenuItem key={value.id} value={value.value}>
                  {ucWords(value.name)}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>Required Skills</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Autocomplete
            multiple
            id='skills'
            options={skillMaster}
            value={selectedSkills}
            disableCloseOnSelect
            getOptionLabel={option => option.name}
            getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
            onChange={(_, value) => handleChangeSelectedSkills(value)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  size='small'
                  style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                  label={`${option.name}`}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderOption={(option, { selected }) => (
              <>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxIcon} />}
                  checkedIcon={<CheckBoxIcon className={classes.checkBoxIcon} />}
                  color='primary'
                  disableRipple
                  className={classes.checkBox}
                  checked={selected}
                />
                {ucWords(option.name)}
              </>
            )}
            renderInput={params => (
              <TextField
                {...params}
                margin='dense'
                fullWidth
                id='skills'
                placeholder={selectedSkills.length === 0 ? 'You can choose more than one required skills' : ''}
                variant='outlined'
                autoComplete='off'
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>Description</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <MUIRichTextEditor
            label='Decription'
            controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
            defaultValue={currentDescription}
            onChange={handleChangeDescription}
            onBlur={handleBlurDescription}
            classes={{ container: `${classes.rteGrid}` }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>Term Condition</Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <MUIRichTextEditor
            label='Term Condition'
            controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
            defaultValue={currentTermCondition}
            onChange={handleChangeTermCondition}
            onBlur={handleBlurTermCondition}
            classes={{ container: `${classes.rteGrid}` }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>Custom Field</Typography>
          <Typography variant='caption' color='textSecondary'>
            This custom field will show at all report (e.g. PO Number, Reference Number, etc)
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} alignItems='center'>
            {editService.CustomFields &&
              editService.CustomFields.length > 0 &&
              editService.CustomFields.map((field, index) => (
                <>
                  <Grid item xs={12} md={5}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id='clientname'
                      label={`Field Label ${index + 1}`}
                      value={field.label}
                      onChange={event => handleChangeCustomField('label', event.target.value, index)}
                      // onBlur={event => handleNameValidation(event.target.value)}
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id='clientname'
                      label={`Value ${index + 1}`}
                      value={field.value}
                      onChange={event => handleChangeCustomField('value', event.target.value, index)}
                      // onBlur={event => handleNameValidation(event.target.value)}
                      autoComplete='off'
                    />
                  </Grid>
                  {editService.CustomFields!.length < 2 && (
                    <Grid item xs={12} md={1}>
                      <Tooltip title='Add More'>
                        <IconButton onClick={handleAddCustomField}>
                          <AddIcon color='primary' />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  )}
                  {editService.CustomFields!.length === 2 && (
                    <Grid item xs={12} md={1}>
                      <Tooltip title='Delete'>
                        <IconButton onClick={() => handleDeleteCustomField(index)}>
                          <DeleteIcon color='error' />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  )}
                </>
              ))}
          </Grid>
        </Grid>
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' disableElevation disabled={isLoading} onClick={handleSubmit}>
          Save
          <LoadingButtonIndicator isLoading={isLoading} />
        </Button>
      </DialogActions>
    </>
  );
};

export default EditServiceForm;
