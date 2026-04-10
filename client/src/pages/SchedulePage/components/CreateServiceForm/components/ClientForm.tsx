import React, { FC, useContext, useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  MenuItem,
  Card,
  CardHeader,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';
import { ServiceBody } from 'typings/body/ServiceBody';
import Autocomplete from '@material-ui/lab/Autocomplete';
import theme from 'theme';
import axios, { CancelTokenSource } from 'axios';
import { CLIENT_BASE_URL, ONEMAP_BASE_URL } from 'constants/url';
import { dummyClientBody, dummyContactPerson, dummyServiceAddressBody } from 'constants/dummy';
import { PhoneCodeContext } from 'contexts/PhoneCodeContext';
import NumberFormatCustom from 'components/NumberFormatCustom';
import { combineAddress, isValidEmail } from 'utils';

interface Props {
  service: ServiceBody;
  setService: React.Dispatch<React.SetStateAction<ServiceBody>>;
  tempClientValue: ClientOption;
  setTempClientValue: React.Dispatch<React.SetStateAction<ClientOption>>;
  tempPostalValue: Select;
  setTempPostalValue: React.Dispatch<React.SetStateAction<Select>>;
  error: any;
  setError: React.Dispatch<React.SetStateAction<any>>;
  setContactPersonMaster: React.Dispatch<React.SetStateAction<Select[]>>;
  setServiceAddressMaster: React.Dispatch<React.SetStateAction<Select[]>>;
}

const useStyles = makeStyles(() => ({
  card: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  required: {
    color: 'red'
  },
  textField: {
    marginBottom: theme.spacing(1),
    marginTop: 0
  },
  flagImg: {
    height: 13,
    width: 20,
    marginRight: 10
  }
}));

const ClientForm: FC<Props> = props => {
  const classes = useStyles();
  const { countries } = useContext(PhoneCodeContext);

  const {
    service,
    setService,
    tempClientValue,
    setTempClientValue,
    tempPostalValue,
    setTempPostalValue,
    error,
    setError,
    setContactPersonMaster,
    setServiceAddressMaster
  } = props;

  const { ClientBody } = service;
  const { name, clientType, ContactPersons, remarks, billingPostal, billingUnitNo, billingFloorNo, billingAddress, ServiceAddresses } = ClientBody!;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [clientId, setClientId] = useState<number>(0);
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [addressOptions, setAddressOptions] = useState<Select[]>([]);

  useEffect(() => {
    if (!service) {
      return;
    }

    setClientId(service.clientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  const getClientName = async (name: string) => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      setIsLoading(true);

      const getQueryParams = () => {
        const params = new URLSearchParams();
        if (name) {
          params.append('q', name);
        }

        params.append('s', '0');
        params.append('l', '15');

        return params.toString();
      };

      const searchClient = async () => {
        try {
          const url = `${CLIENT_BASE_URL}?${getQueryParams()}`;
          const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

          setClientOptions(data.clients);
          setIsLoading(false);
        } catch (err) {
          console.log('err', err);
        }
      };
      searchClient();
    } catch (err) {
      console.log(err);
    }
  };

  const getAddress = async (postalCode: string) => {
    try {
      setIsLoading(true);
      setAddressOptions([]);
      const response = await fetch(`${ONEMAP_BASE_URL}/search/${postalCode}`);
      const { data } = await response.json();
      setAddressOptions(data);
      // const getQueryParams = () => {
      //   const params = new URLSearchParams();
      //   params.append('returnGeom', 'N');
      //   params.append('getAddrDetails', 'Y');
      //   params.append('searchVal', postalCode);
      //   return params.toString();
      // };

      // const url = `${ONEMAP_BASE_URL}?${getQueryParams()}`;
      // const response = await fetch(url);
      // const { results } = await response.json();
      // let fetchAddress: Select[] = [];

      // if (results && results.length > 0) {
      //   // eslint-disable-next-line array-callback-return
      //   results.map((value: any) => {
      //     if (!isNaN(value['POSTAL'])) {
      //       return fetchAddress.push({
      //         id: Number(value['POSTAL']),
      //         name: value['BUILDING'].includes('NIL')
      //           ? `${value['BLK_NO']} ${value['ROAD_NAME']}, ${value['POSTAL']}`
      //           : `${value['BUILDING']}, ${value['BLK_NO']} ${value['ROAD_NAME']}, ${value['POSTAL']}`,
      //         value: value['BUILDING'].includes('NIL')
      //           ? `${value['BLK_NO']} ${value['ROAD_NAME']}`
      //           : `${value['BUILDING']}, ${value['BLK_NO']} ${value['ROAD_NAME']}`,
      //         tempValue: value['POSTAL']
      //       });
      //     }
      //   });
      // }

      // setAddressOptions(fetchAddress);

      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleFreeTextClientName = async (value: any) => {
    if (value) {
      if (value.length > 2) {
        await getClientName(value);
      }

      setService({
        ...service,
        clientId: 0,
        ClientBody: {
          ...ClientBody!,
          name: value,
          ContactPersons: [dummyContactPerson],
          ServiceAddresses: [dummyServiceAddressBody],
          billingAddress: '',
          billingFloorNo: '',
          billingUnitNo: '',
          billingPostal: '',
          remarks: ''
        }
      });
      setError({ ...error, clientName: '' });
    } else {
      setService({
        ...service,
        clientId: 0,
        ClientBody: dummyClientBody
      });
    }
  };

  const handleChangeClientName = (value: any) => {
    if (value) {
      const contactPersonsData: Select[] = [];
      const serviceAddressData: Select[] = [];
      const currentServiceAddress = JSON.parse(JSON.stringify(ServiceAddresses));

      if (value.ContactPersons.length > 0) {
        value.ContactPersons.map((value: any) => {
          return contactPersonsData.push({
            id: value.id,
            name: `${value.contactPerson} ${value.description ? `(${value.description})` : ''} | ${value.countryCode}${value.contactNumber}`,
            value: value.contactEmail
          });
        });
      }

      if (value.ServiceAddresses.length > 0) {
        value.ServiceAddresses.map((value: any) => {
          return serviceAddressData.push({ id: value.id, name: value.address });
        });
      }

      currentServiceAddress[0].postalCode = value.ServiceAddresses[0].postalCode;
      currentServiceAddress[0].floorNo = value.ServiceAddresses[0].floorNo;
      currentServiceAddress[0].unitNo = value.ServiceAddresses[0].unitNo;
      currentServiceAddress[0].address = value.ServiceAddresses[0].firstServiceAddress;

      setContactPersonMaster(contactPersonsData);
      setServiceAddressMaster(serviceAddressData);
      setClientId(value.id);
      setTempClientValue({ id: value.id, name: value.name, firstServiceAddress: value.firstServiceAddress, ContactPersons: value.ContactPersons });
      setTempPostalValue({ id: value.ServiceAddresses[0].id, name: value.ServiceAddresses[0].postalCode });
      setService({
        ...service,
        clientId: value.id,
        ClientBody: {
          ...value,
          billingPostal: value.ServiceAddresses[0].postalCode,
          billingFloorNo: value.ServiceAddresses[0].floorNo,
          billingUnitNo: value.ServiceAddresses[0].unitNo,
          billingAddress: value.firstServiceAddress,
          ServiceAddresses: currentServiceAddress
        },
        ContactPersons: [{ ...contactPersonsData[0] }],
        serviceAddressId: serviceAddressData[0].id,
        serviceAddress: serviceAddressData[0].name
      });
      setError({
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
    }
  };

  const handleChangeContactPerson = (field: string, value: string) => {
    const currentContactPerson = ContactPersons.map(person => ({ ...person }));
    if (value) {
      if (field.includes('contactPerson')) {
        currentContactPerson[0].contactPerson = value;
        setError({ ...error, contactPerson: '' });
      } else if (field.includes('countryCode')) {
        currentContactPerson[0].countryCode = value;
        const { name } = countries.find(c => c.callingCode === value);
        currentContactPerson[0].country = name;
      } else if (field.includes('contactNumber')) {
        currentContactPerson[0].contactNumber = value;
        setError({ ...error, contactNumber: '' });
      } else if (field.includes('contactEmail')) {
        currentContactPerson[0].contactEmail = value;
      }
      setService({
        ...service,
        ClientBody: {
          ...ClientBody!,
          ContactPersons: currentContactPerson
        }
      });
    } else {
      if (field.includes('contactPerson')) {
        currentContactPerson[0].contactPerson = '';
        setError({ ...error, contactPerson: '' });
      } else if (field.includes('contactNumber')) {
        currentContactPerson[0].contactNumber = '';
        setError({ ...error, contactNumber: '' });
      } else if (field.includes('contactEmail')) {
        currentContactPerson[0].contactEmail = '';
      }
      setService({
        ...service,
        ClientBody: {
          ...ClientBody!,
          ContactPersons: currentContactPerson
        }
      });
      setContactPersonMaster([]);
    }
  };

  const handleOnBlur = (field: string, value: string) => {
    if (!value || !value.trim()) {
      if (field.includes('clientName')) {
        setError({ ...error, clientName: 'Please enter client name' });
      } else if (field.includes('contactPerson')) {
        setError({ ...error, contactPerson: 'Please enter contact person name' });
      } else if (field.includes('contactNumber')) {
        setError({ ...error, contactNumber: 'Please enter contact number' });
      } else if (field.includes('postalCode')) {
        setError({ ...error, postalCode: 'Please enter postal code' });
      } else if (field.includes('address')) {
        setError({ ...error, address: 'Please enter address' });
      }
    } else {
      if (field.includes('clientName')) {
        setError({ ...error, clientName: '' });
      } else if (field.includes('contactPerson')) {
        setError({ ...error, contactPerson: '' });
      } else if (field.includes('contactNumber')) {
        setError({ ...error, contactNumber: '' });
      } else if (field.includes('contactEmail')) {
        if (!isValidEmail(value)) {
          setError({ ...error, contactEmail: 'Please enter valid email' });
        } else {
          setError({ ...error, contactEmail: '' });
        }
      } else if (field.includes('postalCode')) {
        setError({ ...error, postalCode: '' });
      } else if (field.includes('address')) {
        setError({ ...error, address: '' });
      }
    }
  };

  const renderClientInformation = () => {
    return (
      <Card id='scrolled' variant='outlined' className={classes.card}>
        <CardHeader title={<Typography variant='subtitle2'>Client Information</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              Client Name <span className={classes.required}>*</span>
            </Grid>
            <Grid item xs={12} md={9}>
              <Autocomplete
                id={`clientName-service`}
                options={clientOptions}
                getOptionLabel={options => options.name}
                value={tempClientValue}
                inputValue={name}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') {
                    handleFreeTextClientName(value);
                  }
                  if (reason === 'clear') {
                    setClientOptions([]);
                    setClientId(0);
                    setContactPersonMaster([]);
                    setServiceAddressMaster([]);

                    setService({
                      ...service,
                      clientId: 0,
                      ClientBody: dummyClientBody
                    });
                  }
                }}
                onChange={(_, value) => {
                  handleChangeClientName(value);
                }}
                autoHighlight
                freeSolo
                loading={isLoading}
                renderOption={(option, { inputValue }) => (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      {option.name.split(new RegExp(`(${inputValue})`, 'gi')).map((part: any, index: number) =>
                        part.toLowerCase() === inputValue.toLowerCase() ? (
                          <span key={index} style={{ color: '#53A0BE' }}>
                            {part}
                          </span>
                        ) : (
                          <span key={index}>{part}</span>
                        )
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant='caption'>
                        {option.firstServiceAddress.split(new RegExp(`(${inputValue})`, 'gi')).map((part: any, index: number) =>
                          part.toLowerCase() === inputValue.toLowerCase() ? (
                            <span key={index} style={{ color: '#53A0BE' }}>
                              {part}
                            </span>
                          ) : (
                            <span key={index}>{part}</span>
                          )
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                )}
                renderInput={params => (
                  <TextField
                    {...params}
                    required
                    margin='dense'
                    className={classes.textField}
                    id='clientName-textField'
                    variant='outlined'
                    placeholder='You can search for a client by name or service address, or you can input a new client name'
                    error={error.clientName !== ''}
                    helperText={error.clientName}
                    onBlur={event => handleOnBlur('clientName', event.target.value)}
                  />
                )}
                filterOptions={(options, params) => {
                  const filteredOptions = options.filter(option => {
                    const nameMatch = option.name.toLowerCase().includes(params.inputValue.toLowerCase());
                    const addressMatch = option.firstServiceAddress.toLowerCase().includes(params.inputValue.toLowerCase());
                    return nameMatch || addressMatch;
                  });
                  return filteredOptions;
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              Client Type
            </Grid>
            <Grid item xs={12} md={9}>
              <FormControl component='fieldset'>
                <RadioGroup
                  aria-label='clientType'
                  name='clientType'
                  value={clientType}
                  onChange={event => setService({ ...service, ClientBody: { ...ClientBody!, clientType: event.target.value } })}
                  row
                >
                  <FormControlLabel
                    value='RESIDENTIAL'
                    disabled={clientId !== 0}
                    control={<Radio color='primary' />}
                    label='Residential'
                    labelPlacement='end'
                  />
                  <FormControlLabel
                    value='COMMERCIAL'
                    disabled={clientId !== 0}
                    control={<Radio color='primary' />}
                    label='Commercial'
                    labelPlacement='end'
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              Contact Person Name <span className={classes.required}>*</span>
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                variant='outlined'
                margin='dense'
                required
                fullWidth
                id={`contactPersonName`}
                label='Name'
                className={classes.textField}
                error={error.contactPerson !== ''}
                helperText={error.contactPerson}
                value={ContactPersons[0].contactPerson}
                disabled={clientId !== 0}
                onChange={event => handleChangeContactPerson('contactPerson', event.target.value)}
                onBlur={event => handleOnBlur('contactPerson', event.target.value)}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12} md={3}>
              Contact Number <span className={classes.required}>*</span>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                margin='dense'
                fullWidth
                id={`countryCode`}
                label='Country Code'
                className={classes.textField}
                value={ContactPersons[0].countryCode}
                disabled={clientId !== 0}
                onChange={event => handleChangeContactPerson('countryCode', event.target.value)}
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
            <Grid item xs={12} md={7}>
              <TextField
                variant='outlined'
                margin='dense'
                required
                fullWidth
                id={`contactNumber`}
                label='Contact Number'
                className={classes.textField}
                error={error.contactNumber !== ''}
                helperText={error.contactNumber}
                value={ContactPersons[0].contactNumber}
                disabled={clientId !== 0}
                onChange={event => handleChangeContactPerson('contactNumber', event.target.value)}
                onBlur={event => handleOnBlur('contactNumber', event.target.value)}
                autoComplete='off'
                InputProps={{
                  inputComponent: NumberFormatCustom as any
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              Contact Email
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                variant='outlined'
                margin='dense'
                fullWidth
                id={`contactEmail`}
                label='Contact Email'
                className={classes.textField}
                error={error.contactEmail !== ''}
                helperText={error.contactEmail}
                value={ContactPersons[0].contactEmail}
                disabled={clientId !== 0}
                onChange={event => handleChangeContactPerson('contactEmail', event.target.value)}
                onBlur={event => handleOnBlur('contactEmail', event.target.value)}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12} md={3}>
              Client Remarks
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                variant='outlined'
                margin='dense'
                multiline
                rows='2'
                fullWidth
                id='remarks'
                className={classes.textField}
                value={remarks}
                disabled={clientId !== 0}
                onChange={event => setService({ ...service, ClientBody: { ...ClientBody!, remarks: event.target.value } })}
                autoComplete='off'
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const handleFreeTextPostal = async (value: any) => {
    const currentServiceAddress = JSON.parse(JSON.stringify(ServiceAddresses));
    if (value) {
      if (!isNaN(value)) {
        currentServiceAddress[0].postalCode = value;
        setService({
          ...service,
          ClientBody: { ...ClientBody!, billingPostal: value, ServiceAddresses: currentServiceAddress }
        });
        if (value.length > 5) {
          await getAddress(value);
        }
      }
    } else {
      currentServiceAddress[0].postalCode = '';
      setService({
        ...service,
        ClientBody: { ...ClientBody!, billingPostal: '', ServiceAddresses: currentServiceAddress }
      });
      setAddressOptions([]);
    }
    setServiceAddressMaster([]);
  };

  const handleChangePostal = (value: any) => {
    const currentServiceAddress = JSON.parse(JSON.stringify(ServiceAddresses));
    if (value) {
      const fullAddress = combineAddress(value.value, billingFloorNo, billingUnitNo, value.tempValue);
      currentServiceAddress[0].postalCode = String(value.tempValue);
      currentServiceAddress[0].address = fullAddress;
      setTempPostalValue({ id: value.id, name: value.value });
      setService({
        ...service,
        ClientBody: {
          ...ClientBody!,
          billingPostal: String(value.tempValue),
          billingAddress: fullAddress,
          ServiceAddresses: currentServiceAddress
        }
      });
      // setLocationErrorMessage(prev => {
      //   prev[0].postalCode = '';
      //   prev[0].address = '';
      //   return [...prev];
      // });
    } else {
      currentServiceAddress[0].postalCode = '';
      currentServiceAddress[0].address = '';
      setTempPostalValue({ id: 0, name: '' });
      setService({
        ...service,
        ClientBody: {
          ...ClientBody!,
          billingPostal: '',
          billingAddress: '',
          ServiceAddresses: currentServiceAddress
        }
      });
    }
  };

  const handleChangeFloor = (value: string) => {
    const fullAddress = combineAddress(tempPostalValue.name, value, billingUnitNo, billingPostal);
    const currentServiceAddress = JSON.parse(JSON.stringify(ServiceAddresses));
    currentServiceAddress[0].floorNo = value;
    currentServiceAddress[0].address = fullAddress;
    setService({
      ...service,
      ClientBody: {
        ...ClientBody!,
        billingFloorNo: value,
        billingAddress: fullAddress,
        ServiceAddresses: currentServiceAddress
      }
    });
  };

  const handleChangeUnit = (value: string) => {
    const fullAddress = combineAddress(tempPostalValue.name, billingFloorNo, value, billingPostal);
    const currentServiceAddress = JSON.parse(JSON.stringify(ServiceAddresses));
    currentServiceAddress[0].unitNo = value;
    currentServiceAddress[0].address = fullAddress;
    setService({
      ...service,
      ClientBody: {
        ...ClientBody!,
        billingUnitNo: value,
        billingAddress: fullAddress,
        ServiceAddresses: currentServiceAddress
      }
    });
  };

  const handleChangeAddress = (value: string) => {
    const currentServiceAddress = JSON.parse(JSON.stringify(ServiceAddresses));
    currentServiceAddress[0].address = value;
    setService({
      ...service,
      ClientBody: {
        ...ClientBody!,
        billingAddress: value,
        ServiceAddresses: currentServiceAddress
      }
    });
  };

  const renderAddressInformation = () => {
    return (
      <Card id='scrolled' variant='outlined' className={classes.card}>
        <CardHeader
          title={<Typography variant='subtitle2'>Service Address & Billing Address</Typography>}
          style={{ backgroundColor: grey[200], height: 35 }}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Typography variant='body1'>
                Service Address <span className={classes.required}>*</span>
              </Typography>
              <Typography variant='caption' color='textSecondary'>
                Billing address will be automatically as service address, you can edit later from client detail
              </Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    id='postalCode-0'
                    options={addressOptions}
                    getOptionLabel={options => options.name}
                    value={tempPostalValue}
                    inputValue={billingPostal}
                    onInputChange={(_, value, reason) => {
                      if (reason === 'input') {
                        handleFreeTextPostal(value);
                      }
                    }}
                    onChange={(_, value) => {
                      handleChangePostal(value);
                    }}
                    autoHighlight
                    // freeSolo
                    loading={isLoading}
                    loadingText='Searching…'
                    noOptionsText='No options'
                    disabled={clientId !== 0}
                    renderInput={params => (
                      <TextField
                        {...params}
                        required
                        margin='dense'
                        className={classes.textField}
                        id='postalCode'
                        label='Postal Code'
                        variant='outlined'
                        error={error.postalCode !== ''}
                        helperText={error.postalCode}
                        value={ContactPersons[0].contactNumber}
                        onBlur={event => handleOnBlur('postalCode', event.target.value)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    variant='outlined'
                    margin='dense'
                    className={classes.textField}
                    fullWidth
                    disabled={clientId !== 0}
                    id='floor'
                    label='Floor No'
                    value={billingFloorNo}
                    onChange={event => handleChangeFloor(event.target.value)}
                    autoComplete='off'
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    variant='outlined'
                    margin='dense'
                    className={classes.textField}
                    fullWidth
                    disabled={clientId !== 0}
                    id='unit'
                    label='Unit No'
                    value={billingUnitNo}
                    onChange={event => handleChangeUnit(event.target.value)}
                    autoComplete='off'
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant='outlined'
                    margin='dense'
                    className={classes.textField}
                    required
                    fullWidth
                    multiline={true}
                    rows={3}
                    disabled={clientId !== 0}
                    id='address'
                    label='Address'
                    value={billingAddress}
                    error={error.address !== ''}
                    helperText={error.address}
                    onChange={event => handleChangeAddress(event.target.value)}
                    autoComplete='off'
                    onBlur={event => handleOnBlur('address', event.target.value)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {renderClientInformation()}
      {renderAddressInformation()}
    </>
  );
};

export default ClientForm;
