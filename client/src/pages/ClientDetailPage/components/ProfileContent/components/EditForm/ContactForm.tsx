import React, { useState, useEffect, useCallback, FC, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, Card, CardContent, CardHeader, DialogActions, Divider, Grid, MenuItem, TextField, Theme, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';
import { GET_EDIT_CLIENT_URL } from 'constants/url';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { grey } from '@material-ui/core/colors';
import { PhoneCodeContext } from 'contexts/PhoneCodeContext';
import NumberFormatCustom from 'components/NumberFormatCustom';
import { dummyContactPerson } from 'constants/dummy';
import { isValidEmail } from 'utils';

interface Props {
  clients: ClientDetailsModel;
  setClients: React.Dispatch<React.SetStateAction<ClientDetailsModel>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  textfield: {
    marginBottom: theme.spacing(1)
  },
  rightPadding: {
    paddingRight: theme.spacing(1)
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  redColor: {
    color: theme.palette.error.main
  },
  flagImg: {
    height: 13,
    width: 20,
    marginRight: 10
  }
}));

const ContactForm: FC<Props> = props => {
  const classes = useStyles();
  const { countries } = useContext(PhoneCodeContext);
  const { clients, setClients, handleSnackbar, setOpenForm } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientId, setClientId] = useState<number>(0);
  const [contactPersons, setContactPersons] = useState<ContactPersonModel[]>([dummyContactPerson]);
  const [deletedContactPersons, setDeteledContactPersons] = useState<ContactPersonModel[]>([]);

  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<any[]>([{ contactPerson: '', contactNumber: '', contactEmail: '' }]);

  const resetFormValues = useCallback(() => {
    if (!clients) {
      return;
    }

    const { id, ContactPersons } = clients!;

    const additionalContactPersons = ContactPersons.filter(item => !item.isMain);
    const currentErrorMessage = [...errorMessage];

    if (additionalContactPersons.length > 0) {
      // eslint-disable-next-line array-callback-return
      additionalContactPersons.map(() => {
        currentErrorMessage.push({ contactPerson: '', contactNumber: '', contactEmail: '' });
      });
    }

    setClientId(id);
    setContactPersons(
      ContactPersons.map(value => {
        return { ...value };
      })
    );
    setErrorMessage(currentErrorMessage);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  useEffect(() => {
    resetFormValues();
  }, [resetFormValues]);

  const handleCancel = () => {
    setOpenForm(false);
  };

  const handleOnBlur = (field: string, value: string, index: number) => {
    const currentErrorMessage: any[] = [...errorMessage];
    if (!value) {
      if (field === 'contactPerson') {
        currentErrorMessage[index].contactPerson = 'Please insert contact person';
        setIsError(true);
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactNumber') {
        setIsError(true);
        currentErrorMessage[index].contactNumber = 'Please insert contact number';
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactEmail') {
        setIsError(false);
        currentErrorMessage[index].contactEmail = '';
        setErrorMessage(currentErrorMessage);
        return;
      }
    } else if (field === 'contactNumber' && value.length < 8) {
      setIsError(true);
      currentErrorMessage[index].contactNumber = 'Contact number is less than 8 digit';
      setErrorMessage(currentErrorMessage);
      return;
    } else {
      if (field === 'contactPerson') {
        currentErrorMessage[index].contactPerson = '';
        setIsError(false);
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactNumber') {
        currentErrorMessage[index].contactNumber = '';
        setIsError(false);
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'contactEmail') {
        if (isValidEmail(value)) {
          currentErrorMessage[index].contactEmail = '';
          setIsError(false);
          setErrorMessage(currentErrorMessage);
          return;
        } else {
          setIsError(true);
          currentErrorMessage[index].contactEmail = 'Please insert valid email';
          setErrorMessage(currentErrorMessage);
          return;
        }
      }
    }
  };

  const handleRemoveSubContact = (i: number): React.MouseEventHandler => () => {
    const currentContactPersons = [...contactPersons];
    const currentErrorMessage: any[] = [...errorMessage];
    const currentDeletedContactPersons = [...deletedContactPersons];
    const deletedValue = currentContactPersons.splice(i, 1);
    currentDeletedContactPersons.push(deletedValue[0]);
    currentErrorMessage.splice(i, 1);
    setContactPersons(currentContactPersons);
    setErrorMessage(currentErrorMessage);
    setDeteledContactPersons(currentDeletedContactPersons);
  };

  const handleAddSubContact = () => {
    const currentContactPersons = [...contactPersons];
    const currentErrorMessage: any[] = [...errorMessage];
    currentContactPersons.push({
      id: 0,
      clientId,
      contactPerson: '',
      countryCode: '+65',
      contactNumber: '',
      contactEmail: '',
      country: 'Singapore',
      isMain: false
    });
    currentErrorMessage.push({ contactPerson: '', contactNumber: '', contactEmail: '' });

    setContactPersons(currentContactPersons);
    setErrorMessage(currentErrorMessage);
  };

  const handleChangeContactPerson = (field: string, value: string, index: number) => {
    const currentContactPerson = [...contactPersons];
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

    setContactPersons(currentContactPerson);
  };

  const validateForm = () => {
    let ret = true;
    const currentErrorMessage: any[] = [...errorMessage];

    contactPersons.map((value, index) => {
      if (!ret) {
        // eslint-disable-next-line array-callback-return
        return;
      }

      if (!value.contactPerson || !value.contactPerson.trim()) {
        currentErrorMessage[index].contactPerson = 'Please insert contact person';
        setErrorMessage(currentErrorMessage);
        return (ret = false);
      } else {
        currentErrorMessage[index].contactPerson = '';
        setErrorMessage(currentErrorMessage);
        ret = true;
      }

      if (!value.contactNumber || !value.contactNumber.trim()) {
        currentErrorMessage[index].contactNumber = 'Please insert contact number';
        setErrorMessage(currentErrorMessage);
        return (ret = false);
      } else if (value.contactNumber.length < 8) {
        currentErrorMessage[index].contactNumber = 'Contact number is less than 8 digit';
        setErrorMessage(currentErrorMessage);
        return (ret = false);
      } else {
        currentErrorMessage[index].contactNumber = '';
        setErrorMessage(currentErrorMessage);
        ret = true;
      }

      if (value.contactEmail && !isValidEmail(value.contactEmail)) {
        currentErrorMessage[index].contactEmail = 'Please insert valid email';
        setErrorMessage(currentErrorMessage);
        return (ret = false);
      } else {
        currentErrorMessage[index].contactEmail = '';
        setErrorMessage(currentErrorMessage);
        ret = true;
      }
      return ret;
    });

    return ret;
  };

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    setIsLoading(true);

    if (isError || !validateForm()) {
      setIsLoading(false);
      return;
    }

    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      await axios.put(
        `${GET_EDIT_CLIENT_URL(clientId)}`,
        { isEditContactPerson: true, ContactPersons: contactPersons, DeletedContactPersons: deletedContactPersons },
        { cancelToken: cancelTokenSource.token }
      );
      setClients({ ...clients, ContactPersons: contactPersons });
      handleSnackbar('success', 'Successfully Edit Contact');
      setOpenForm(false);
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed Edit Contact');
    }
    setIsLoading(false);
  };

  const renderAdditionalContact = () => {
    const additionalContactPersons = contactPersons.filter(item => !item.isMain);
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
                      error={errorMessage[index + 1].contactPerson !== ''}
                      helperText={errorMessage[index + 1].contactPerson}
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
                      id='clientcountryCode'
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
                      id='clientcontactnumber'
                      label='Contact Number'
                      error={errorMessage[index + 1].contactNumber !== ''}
                      helperText={errorMessage[index + 1].contactNumber}
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
                      id='clientcontactemail'
                      label='Contact Email'
                      error={errorMessage[index + 1].contactEmail !== ''}
                      helperText={errorMessage[index + 1].contactEmail || 'This email use for send report (Quotation, Invoice, Service)'}
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
                    <Button onClick={handleRemoveSubContact(index + 1)} className={classes.redColor} startIcon={<DeleteIcon />}>
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
    <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
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
                    error={errorMessage[0].contactPerson !== ''}
                    helperText={errorMessage[0].contactPerson}
                    value={contactPersons[0].contactPerson}
                    onChange={event => handleChangeContactPerson('contactPerson', event.target.value, 0)}
                    onBlur={event => handleOnBlur('contactPerson', event.target.value, 0)}
                    autoComplete='off'
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    margin='dense'
                    fullWidth
                    id='clientcountryCode'
                    label='Country Code'
                    value={contactPersons[0].countryCode}
                    onChange={event => handleChangeContactPerson('countryCode', event.target.value, 0)}
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
                    id='clientcontactnumber'
                    label='Contact Number'
                    error={errorMessage[0].contactNumber !== ''}
                    helperText={errorMessage[0].contactNumber}
                    value={contactPersons[0].contactNumber}
                    onChange={event => handleChangeContactPerson('contactNumber', event.target.value.replace(/\s/g, ''), 0)}
                    onBlur={event => handleOnBlur('contactNumber', event.target.value.replace(/\s/g, ''), 0)}
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
                    id='clientcontactemail'
                    label='Contact Email'
                    error={errorMessage[0].contactEmail !== ''}
                    helperText={errorMessage[0].contactEmail || 'This email use for send report (Quotation, Invoice, Service)'}
                    value={contactPersons[0].contactEmail}
                    onChange={event => handleChangeContactPerson('contactEmail', event.target.value, 0)}
                    onBlur={event => handleOnBlur('contactEmail', event.target.value, 0)}
                    autoComplete='off'
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant='outlined'
                    margin='dense'
                    fullWidth
                    id='clientcontactdescription'
                    label='Descriptions'
                    value={contactPersons[0].description}
                    onChange={event => handleChangeContactPerson('description', event.target.value, 0)}
                    autoComplete='off'
                  />
                </Grid>
              </Grid>
              {contactPersons.length < 2 && (
                <Grid container justify='flex-end' style={{ marginTop: 8 }}>
                  <Button color='primary' onClick={handleAddSubContact}>
                    <AddIcon />
                    More Contact
                  </Button>
                </Grid>
              )}
            </Grid>
          </Grid>
          {renderAdditionalContact()}
        </CardContent>
      </Card>
      <Grid item container xs={12} md={12} justify='flex-end'>
        <DialogActions>
          <Button variant='contained' disableElevation disabled={isLoading} onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant='contained' disableElevation color='primary' disabled={isLoading} onClick={handleSubmit}>
            Save
            {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
          </Button>
        </DialogActions>
      </Grid>
    </Grid>
  );
};

export default ContactForm;
