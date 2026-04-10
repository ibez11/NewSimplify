import React, { FC, useEffect, useState } from 'react';
import { Grid, TextField, Typography, MenuItem, Card, CardHeader, CardContent, Checkbox, Chip, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { ucWords } from 'utils';
import { grey } from '@material-ui/core/colors';
import { ServiceBody } from 'typings/body/ServiceBody';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import theme from 'theme';
import MUIRichTextEditor from 'mui-rte';
import { convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { addDays, isValid } from 'date-fns';

interface Props {
  serviceMaster: Select[];
  technicianMaster: Select[];
  serviceAddressMaster: Select[];
  contactPersonMaster: Select[];
  entityMaster: EntityModel[];
  gstTaxMaster: Select[];
  skillMaster: SkillsModel[];
  jobLabelMaster: Select[];
  service: ServiceBody;
  setService: React.Dispatch<React.SetStateAction<ServiceBody>>;
  error: any[];
  setError: React.Dispatch<React.SetStateAction<any[]>>;
}

const useStyles = makeStyles(() => ({
  card: {
    margin: 'auto',
    width: '100%'
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
  descriptionGrid: {
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

const GeneralForm: FC<Props> = props => {
  const classes = useStyles();
  const {
    serviceMaster,
    technicianMaster,
    serviceAddressMaster,
    contactPersonMaster,
    entityMaster,
    gstTaxMaster,
    skillMaster,
    jobLabelMaster,
    service,
    setService,
    error,
    setError
  } = props;

  const {
    serviceTitle,
    issueDate,
    expiryDate,
    salesPerson,
    serviceAddressId,
    entityId,
    needGST,
    gstTax,
    description,
    skills,
    JobLabels,
    CustomFields,
    ContactPersons
  } = service;

  const [selectedJobLabel, setSelectedJobLabel] = useState<Select[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillsModel[]>([]);
  const [selectedContactPerson, setSelectedContactPerson] = useState<Select[]>([]);
  const [currentDescription, setCurrentDescription] = useState<string>('');
  let descriptionData = '';

  const duration = [
    { value: 1, name: 'Today' },
    { value: 7, name: 'In 7 Days' },
    { value: 14, name: 'In 14 Days' },
    { value: 30, name: 'In 30 Days' },
    { value: 0, name: 'Custom' }
  ];

  const [quotationDuration, setQuotationDuration] = useState<number>(30);

  useEffect(() => {
    if (!service) {
      return;
    }

    const contentHTMLDescription = convertFromHTML(description);

    // 2. Create the ContentState object
    const stateDescription = ContentState.createFromBlockArray(contentHTMLDescription.contentBlocks, contentHTMLDescription.entityMap);

    // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
    const contentDescription = JSON.stringify(convertToRaw(stateDescription));

    setCurrentDescription(contentDescription);
    setSelectedSkills(skills || []);
    setSelectedJobLabel(JobLabels || []);
    setSelectedContactPerson(ContactPersons || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  const handleFreeTextTitle = (value: any) => {
    setService({ ...service, id: 0, serviceTitle: value });
    setError(prev => {
      prev[0].title = '';
      return [...prev];
    });
  };

  const handleTitleChange = (value: any) => {
    if (value) {
      setService({ ...service, ...value, id: 0, serviceTitle: value.name });
      setError(prev => {
        prev[0].title = '';
        return [...prev];
      });
    }
  };

  const handleTitleValidation = () => {
    setError(prev => {
      prev[0].title = '';
      return [...prev];
    });
    if (!serviceTitle || !serviceTitle.trim()) {
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
      setService({
        ...service,
        issueDate: date,
        expiryDate
      });
    }
  };

  const handleChangeDuration = (value: number) => {
    const { issueDate } = service;

    if (value === 1) {
      setService({
        ...service,
        issueDate: new Date(),
        expiryDate: new Date()
      });
    } else if (value === 0) {
      setService({
        ...service,
        expiryDate: new Date(issueDate)
      });
    } else if (value !== 1 && value !== 0) {
      setService({
        ...service,
        expiryDate: addDays(new Date(issueDate), value)
      });
    }
    setQuotationDuration(value);
  };

  const handleExpiryDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      setService({
        ...service,
        expiryDate: date
      });
    }
  };

  const handleChangeSelectedContactPersons = (contactPerson: Select[]) => {
    setSelectedContactPerson(contactPerson);
    setService({ ...service, ContactPersons: contactPerson });
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

  const handleFreeTextSalesPerson = (value: any) => {
    setService({ ...service, salesPerson: value });
  };

  const handleSalesPersonChange = (value: any) => {
    if (value) {
      setService({ ...service, salesPerson: value.name });
    }
  };

  const handleEntityChange = (value: any) => {
    const entity = entityMaster.find(entity => entity.id === value);
    if (entity) {
      let { contractAmount, discountAmount, gstAmount, totalAmount } = service;
      const gstTax = entity.needGST ? Number(gstTaxMaster[0].value) : 0;

      if (entity.needGST) {
        gstAmount = Number((((contractAmount - discountAmount) * gstTax) / 100).toFixed(2));
        totalAmount = Number((contractAmount - discountAmount + gstAmount).toFixed(2));
      } else {
        gstAmount = 0;
        totalAmount = Number((contractAmount - discountAmount).toFixed(2));
      }
      setService({
        ...service,
        entityId: value,
        entityName: entity.name,
        needGST: entity.needGST,
        gstTax,
        gstAmount,
        totalAmount
      });
    }
  };

  const handleGSTChange = (value: number) => {
    let { contractAmount, discountAmount, gstAmount, totalAmount } = service;
    gstAmount = Number((((contractAmount - discountAmount) * value) / 100).toFixed(2));
    totalAmount = Number((contractAmount - discountAmount + gstAmount).toFixed(2));
    setService({ ...service, gstTax: value, gstAmount, totalAmount });
  };

  const handleChangeSelectedSkills = (skills: Select[]) => {
    const selected: any = [];
    for (const skill of skills) {
      selected.push({ name: skill.name });
    }
    setSelectedSkills(selected);
    setService({ ...service, skills: selected });
  };

  const handleChangeSelectedJobLabels = (jobLabels: Select[]) => {
    const selected: any = [];
    for (const label of jobLabels) {
      selected.push({ id: label.id, name: label.name, color: label.color });
    }
    if (selected.length <= 2) {
      setSelectedJobLabel(selected);
      setService({ ...service, JobLabels: selected });
    }
  };

  const handleChangeDescription = (event: any) => {
    descriptionData = JSON.stringify(convertToHTML(event.getCurrentContent()));
    descriptionData = descriptionData.replace(/"/g, '');
    descriptionData = descriptionData.replace(/<p><\/p>/g, '<div>&shy;</div>');
  };

  const handleBlurDescription = () => {
    if (descriptionData === '<div>&shy;</div>') {
      setService({ ...service, description: '' });
    } else {
      setService({ ...service, description: descriptionData });
    }
  };

  const handleAddCustomField = () => {
    const currentCustomFields = CustomFields;
    currentCustomFields?.push({ id: 0, label: '', value: '' });
    setService({ ...service, CustomFields: currentCustomFields });
  };

  const handleDeleteCustomField = (index: number) => {
    const currentCustomFields = CustomFields;
    currentCustomFields?.splice(index, 1);
    setService({ ...service, CustomFields: currentCustomFields });
  };

  const handleChangeCustomField = (field: string, value: string, index: number) => {
    const currentCustomFields = CustomFields!;
    if (field.includes('label')) {
      currentCustomFields[index].label = value;
    } else {
      currentCustomFields[index].value = value;
    }
    setService({ ...service, CustomFields: currentCustomFields });
  };

  return (
    <Card id='scrolled' variant='outlined' className={classes.card}>
      <CardHeader title={<Typography variant='subtitle2'>General Information</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
      <CardContent>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={4}>
            <Typography variant='h6'>
              Quotation Title <span className={classes.required}>*</span>
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Autocomplete
              id='serviceTitle'
              options={serviceMaster}
              getOptionLabel={option => option.name}
              inputValue={serviceTitle}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') {
                  handleFreeTextTitle(value ? value : '');
                }
                if (reason === 'clear') {
                  setService({ ...service, serviceTitle: '', description: '', termCondition: '' });
                }
              }}
              onChange={(_: any, value: ServiceTemplatesModel | any) => handleTitleChange(value)}
              autoHighlight={true}
              freeSolo
              renderInput={params => (
                <TextField
                  {...params}
                  required
                  autoFocus
                  margin='dense'
                  label='Quotation Title'
                  variant='outlined'
                  error={error[0].title !== ''}
                  helperText={error[0].title}
                  onBlur={handleTitleValidation}
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
            <Grid container spacing={3}>
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
                    value={issueDate}
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
                    value={expiryDate}
                    variant='dialog'
                    inputVariant='outlined'
                    format='dd-MM-yyyy'
                    disabled={quotationDuration !== 0}
                    onChange={handleExpiryDateChange}
                    InputAdornmentProps={{ position: 'start' }}
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
              options={technicianMaster}
              getOptionLabel={option => option.name}
              inputValue={salesPerson}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') {
                  handleFreeTextSalesPerson(value ? value : '');
                }
                if (reason === 'clear') {
                  setService({ ...service, salesPerson: '' });
                }
              }}
              onChange={(_: any, value: ServiceTemplatesModel | any) => handleSalesPersonChange(value)}
              autoHighlight={true}
              freeSolo
              renderInput={params => <TextField {...params} margin='dense' label='Sales Person' variant='outlined' />}
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
              value={serviceAddressId}
              onChange={event => {
                const selectedId = Number(event.target.value);
                const selectedItem = serviceAddressMaster.find(item => item.id === selectedId);
                setService({
                  ...service,
                  serviceAddressId: selectedId,
                  serviceAddress: selectedItem ? selectedItem.name : ''
                });
              }}
              variant='outlined'
              autoComplete='off'
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
              value={entityId}
              onChange={event => handleEntityChange(Number(event.target.value))}
              variant='outlined'
              autoComplete='off'
              error={error[0].entity !== ''}
              helperText={error[0].entity}
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
              value={needGST ? gstTax : 0}
              select
              disabled={needGST ? false : true}
              fullWidth
              margin='dense'
              variant='outlined'
              onChange={event => handleGSTChange(Number(event.target.value))}
              id='GST-tax'
              label='GST Tax'
            >
              {!needGST && (
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
            <Typography variant='h6'>Job Labels</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Autocomplete
              multiple
              id='skills'
              options={jobLabelMaster}
              value={selectedJobLabel}
              disableCloseOnSelect
              getOptionLabel={option => option.name}
              getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
              onChange={(_, value) => handleChangeSelectedJobLabels(value)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    size='small'
                    label={`${option.name}`}
                    color='primary'
                    style={{ color: option.color, backgroundColor: `${option.color}40` }}
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
                  id='job-labels'
                  placeholder={selectedJobLabel.length === 0 ? 'You can choose maximum 2 job labels' : ''}
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
              label='Description'
              controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
              defaultValue={currentDescription}
              onChange={handleChangeDescription}
              onBlur={handleBlurDescription}
              classes={{ container: `${classes.descriptionGrid}` }}
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
              {CustomFields &&
                CustomFields.map((field, index) => (
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
                    {CustomFields.length < 2 && (
                      <Grid item xs={12} md={1}>
                        <Tooltip title='Add More'>
                          <IconButton onClick={handleAddCustomField}>
                            <AddIcon color='primary' />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    )}
                    {CustomFields.length === 2 && (
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
      </CardContent>
    </Card>
  );
};

export default GeneralForm;
