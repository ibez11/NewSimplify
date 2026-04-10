import React, { FC, useContext } from 'react';
import { Grid, TextField, Typography, Theme, MenuItem, Card, CardHeader, CardContent, Button, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';
import { ClientBody } from 'typings/body/ClientBody';
import { PhoneCodeContext } from 'contexts/PhoneCodeContext';
import NumberFormatCustom from 'components/NumberFormatCustom';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { isValidEmail } from 'utils';

interface Props {
  client: ClientBody;
  setClient: React.Dispatch<React.SetStateAction<ClientBody>>;
  contactErrorMessage: any[];
  setContactErorMessage: React.Dispatch<React.SetStateAction<any[]>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: 'auto',
    width: '100%'
  },
  redColor: {
    color: 'red'
  },
  flagImg: {
    height: 13,
    width: 20,
    marginRight: 10
  },
  textField: {
    marginBottom: theme.spacing(1),
    marginTop: 0
  }
}));

const ContactForm: FC<Props> = props => {
  const classes = useStyles();
  const { countries } = useContext(PhoneCodeContext);
  const { client, setClient, contactErrorMessage, setContactErorMessage } = props;

  const { ContactPersons } = client;

  const handleRemoveSubContact = (i: number): React.MouseEventHandler => () => {
    const currentSubContact = [...ContactPersons];
    // const currentErrorSubContact = [...errorMessageSubContact];
    currentSubContact.splice(i, 1);
    // currentErrorSubContact.splice(i, 1);
    setClient({ ...client, ContactPersons: currentSubContact });
    setContactErorMessage(prev => {
      prev.splice(i + 1, 1);
      return [...prev];
    });
  };

  const handleAddSubContact = () => {
    const currentSubContact = [...ContactPersons];
    currentSubContact.push({
      id: 0,
      clientId: 0,
      contactPerson: '',
      countryCode: '+65',
      contactNumber: '',
      contactEmail: '',
      country: 'Singapore',
      description: '',
      isMain: false
    });

    setClient({ ...client, ContactPersons: currentSubContact });
    setContactErorMessage(() => [...contactErrorMessage, { contactPerson: '', contactNumber: '', contactEmail: '' }]);
  };

  const handleChangeContactPerson = (field: string, value: string, index: number) => {
    const currentContactPerson = [...ContactPersons];
    if (field.includes('contactPerson')) {
      currentContactPerson[index].contactPerson = value;
    } else if (field.includes('countryCode')) {
      currentContactPerson[index].countryCode = value;
      const { name } = countries.find(c => c.callingCode === value);
      currentContactPerson[index].country = name;
    } else if (field.includes('contactNumber')) {
      currentContactPerson[index].contactNumber = value;
    } else if (field.includes('contactEmail')) {
      currentContactPerson[index].contactEmail = value;
    } else {
      currentContactPerson[index].description = value;
    }

    setClient({ ...client, ContactPersons: currentContactPerson });
  };

  const handleOnBlur = (field: string, value: string, index: number) => {
    const currentErrorMessage: any[] = [...contactErrorMessage];
    if (!value) {
      if (field === 'contactPerson') {
        currentErrorMessage[index].contactPerson = 'Please insert contact person';
        setContactErorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactNumber') {
        currentErrorMessage[index].contactNumber = 'Please insert contact number';
        setContactErorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactEmail') {
        currentErrorMessage[index].contactEmail = '';
        setContactErorMessage(currentErrorMessage);
        return;
      }
    } else if (field === 'contactNumber' && value.length < 8) {
      currentErrorMessage[index].contactNumber = 'Contact number is less than 8 digit';
      setContactErorMessage(currentErrorMessage);
      return;
    } else {
      if (field === 'contactPerson') {
        currentErrorMessage[index].contactPerson = '';
        setContactErorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactNumber') {
        currentErrorMessage[index].contactNumber = '';
        setContactErorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactEmail') {
        if (isValidEmail(value)) {
          currentErrorMessage[index].contactEmail = '';
          setContactErorMessage(currentErrorMessage);
          return;
        } else {
          currentErrorMessage[index].contactEmail = 'Please insert valid email';
          setContactErorMessage(currentErrorMessage);
          return;
        }
      }
    }
  };

  const renderAdditionalContact = () => {
    const additionalContactPersons = ContactPersons.filter(item => !item.isMain);
    return (
      additionalContactPersons &&
      additionalContactPersons.length > 0 &&
      additionalContactPersons.map((value, index) => {
        return (
          <>
            <Divider style={{ marginTop: 16, marginBottom: 16 }} />
            <Grid container>
              <Grid item xs={12} md={3}>
                <Typography variant='h6'>Contact Person {index + 2}</Typography>
              </Grid>
              <Grid item xs={12} md={9}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      required
                      fullWidth
                      id={`contactPersonName${index + 1}`}
                      label='Name'
                      error={contactErrorMessage[index + 1].contactPerson !== ''}
                      helperText={contactErrorMessage[index + 1].contactPerson}
                      value={value.contactPerson}
                      onChange={event => handleChangeContactPerson('contactPerson', event.target.value, index + 1)}
                      onBlur={event => handleOnBlur('contactPerson', event.target.value, index + 1)}
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      select
                      margin='dense'
                      fullWidth
                      id={`clientcountryCode${index + 1}`}
                      label='Country Code'
                      value={value.countryCode}
                      onChange={event => handleChangeContactPerson('countryCode', event.target.value, index + 1)}
                      variant='outlined'
                      autoComplete='off'
                    >
                      {countries.map(item => {
                        return (
                          <MenuItem key={item.callingCode} value={item.callingCode}>
                            <img src={item.flag} className={classes.flagImg} alt={item.code} /> ({item.callingCode}) - {item.code}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      required
                      fullWidth
                      id={`clientcontactnumber${index + 1}`}
                      label='Contact Number'
                      error={contactErrorMessage[index + 1].contactNumber !== ''}
                      helperText={contactErrorMessage[index + 1].contactNumber}
                      value={value.contactNumber}
                      onChange={event => handleChangeContactPerson('contactNumber', event.target.value, index + 1)}
                      onBlur={event => handleOnBlur('contactNumber', event.target.value, index + 1)}
                      autoComplete='off'
                      InputProps={{
                        inputComponent: NumberFormatCustom as any
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id={`clientcontactemail${index + 1}`}
                      label='Contact Email'
                      error={contactErrorMessage[index + 1].contactEmail !== ''}
                      helperText={contactErrorMessage[index + 1].contactEmail || 'This email use for send report (Quotation, Invoice, Service)'}
                      value={value.contactEmail}
                      onChange={event => handleChangeContactPerson('contactEmail', event.target.value, index + 1)}
                      onBlur={event => handleOnBlur('contactEmail', event.target.value, index + 1)}
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id='clientdescription'
                      label='Descriptions'
                      value={value.description}
                      onChange={event => handleChangeContactPerson('description', event.target.value, index + 1)}
                      autoComplete='off'
                    />
                  </Grid>
                </Grid>
                <Grid container style={{ marginTop: 8 }}>
                  <Grid item xs={6}>
                    <Button startIcon={<DeleteIcon />} onClick={handleRemoveSubContact(index + 1)} className={classes.redColor}>
                      Remove Contact
                    </Button>
                  </Grid>
                  {index === additionalContactPersons.length - 1 && (
                    <Grid item container justify='flex-end' xs={6}>
                      <Button color='primary' startIcon={<AddIcon />} onClick={handleAddSubContact}>
                        More Contact
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </>
        );
      })
    );
  };

  return (
    <Card variant='outlined' className={classes.card}>
      <CardHeader title={<Typography variant='subtitle2'>Contact Information</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
      <CardContent>
        <Grid container>
          <Grid item xs={12} md={3}>
            <Typography variant='h6'>
              Contact Person 1 <span className={classes.redColor}>*</span>
            </Typography>
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <TextField
                  variant='outlined'
                  margin='dense'
                  required
                  fullWidth
                  id='clientcontactperson'
                  label='Name'
                  error={contactErrorMessage[0].contactPerson !== ''}
                  helperText={contactErrorMessage[0].contactPerson}
                  value={ContactPersons[0].contactPerson}
                  onChange={event => handleChangeContactPerson('contactPerson', event.target.value, 0)}
                  onBlur={event => handleOnBlur('contactPerson', event.target.value, 0)}
                  autoComplete='off'
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  margin='dense'
                  fullWidth
                  id='clientcountryCode'
                  label='Country Code'
                  value={ContactPersons[0].countryCode}
                  onChange={event => handleChangeContactPerson('countryCode', event.target.value, 0)}
                  variant='outlined'
                  autoComplete='off'
                  className={classes.textField}
                >
                  {countries.map(item => {
                    return (
                      <MenuItem key={item.callingCode} value={item.callingCode}>
                        <img src={item.flag} className={classes.flagImg} alt={item.code} /> ({item.callingCode}) - {item.code}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  variant='outlined'
                  margin='dense'
                  required
                  fullWidth
                  id='clientcontactnumber'
                  label='Contact Number'
                  error={contactErrorMessage[0].contactNumber !== ''}
                  helperText={contactErrorMessage[0].contactNumber}
                  value={ContactPersons[0].contactNumber}
                  onChange={event => handleChangeContactPerson('contactNumber', event.target.value.replace(/\s/g, ''), 0)}
                  onBlur={event => handleOnBlur('contactNumber', event.target.value, 0)}
                  autoComplete='off'
                  className={classes.textField}
                  InputProps={{
                    inputComponent: NumberFormatCustom as any
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant='outlined'
                  margin='dense'
                  fullWidth
                  id='clientcontactemail'
                  label='Contact Email'
                  error={contactErrorMessage[0].contactEmail !== ''}
                  helperText={contactErrorMessage[0].contactEmail || 'This email use for send report (Quotation, Invoice, Service)'}
                  value={ContactPersons[0].contactEmail}
                  onChange={event => handleChangeContactPerson('contactEmail', event.target.value, 0)}
                  onBlur={event => handleOnBlur('contactEmail', event.target.value, 0)}
                  autoComplete='off'
                  className={classes.textField}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant='outlined'
                  margin='dense'
                  fullWidth
                  id='clientcontactdescription'
                  label='Descriptions'
                  value={ContactPersons[0].description}
                  onChange={event => handleChangeContactPerson('description', event.target.value, 0)}
                  autoComplete='off'
                  className={classes.textField}
                />
              </Grid>
            </Grid>
            {ContactPersons.length < 2 && (
              <Grid container justify='flex-end' style={{ marginTop: 8 }}>
                <Button color='primary' startIcon={<AddIcon />} onClick={handleAddSubContact}>
                  More Contact
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
        {renderAdditionalContact()}
      </CardContent>
    </Card>
  );
};

export default ContactForm;
