import React, { FC, Fragment, useState } from 'react';
import { Grid, TextField, Typography, Theme, FormControlLabel, Card, CardHeader, CardContent, Checkbox, Button, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';
import { ClientBody } from 'typings/body/ClientBody';
import { ONEMAP_BASE_URL } from 'constants/url';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { combineAddress } from 'utils';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

interface Props {
  client: ClientBody;
  setClient: React.Dispatch<React.SetStateAction<ClientBody>>;
  tempPostalValue: Select[];
  setTempPostalValue: React.Dispatch<React.SetStateAction<Select[]>>;
  locationErrorMessage: any[];
  setLocationErrorMessage: React.Dispatch<React.SetStateAction<any[]>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  redColor: {
    color: theme.palette.error.main
  },
  textField: {
    marginBottom: theme.spacing(1),
    marginTop: 0
  }
}));

const LocationForm: FC<Props> = props => {
  const classes = useStyles();
  const { client, setClient, tempPostalValue, setTempPostalValue, locationErrorMessage, setLocationErrorMessage } = props;

  const { billingAddress, billingFloorNo, billingUnitNo, billingPostal, ServiceAddresses } = client;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSameAddress, setIsSameAddress] = useState<boolean>(billingPostal === ServiceAddresses[0].postalCode ? true : false);

  const [addressOptions, setAddressOptions] = useState<Select[]>([]);

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

      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemoveSubServiceAddress = (i: number): React.MouseEventHandler => () => {
    const currentServiceAddress = ServiceAddresses;
    currentServiceAddress.splice(i, 1);
    setClient({ ...client, ServiceAddresses: currentServiceAddress });
    setTempPostalValue(prev => {
      prev.splice(i, 1);
      return [...prev];
    });
    setLocationErrorMessage(prev => {
      prev.splice(i + 1, 1);
      return [...prev];
    });
  };

  const handleAddSubServiceAddress = () => {
    const currentServiceAddress = ServiceAddresses;
    currentServiceAddress.push({
      id: 0,
      contactPerson: currentServiceAddress[0].contactPerson,
      countryCode: currentServiceAddress[0].countryCode,
      contactNumber: currentServiceAddress[0].contactNumber,
      secondaryContactPerson: currentServiceAddress[0].secondaryContactPerson,
      secondaryContactNumber: currentServiceAddress[0].secondaryContactNumber,
      country: currentServiceAddress[0].country,
      address: '',
      floorNo: '',
      unitNo: '',
      postalCode: '',
      clientId: currentServiceAddress[0].clientId
    });
    setClient({ ...client, ServiceAddresses: currentServiceAddress });
    setTempPostalValue(array => [...array, { id: 0, name: '' }]);
    setLocationErrorMessage(array => [...locationErrorMessage, { postalCode: '', address: '' }]);
  };

  const handleClearServicePostal = async (index: number) => {
    const currentServiceAddress = ServiceAddresses;
    currentServiceAddress[index].postalCode = '';
    currentServiceAddress[index].address = '';
    setClient({ ...client, ServiceAddresses: currentServiceAddress });
  };

  const handleFreeTextServicePostal = async (value: any, index: number) => {
    const currentServiceAddress = ServiceAddresses;
    if (value) {
      if (!isNaN(value)) {
        currentServiceAddress[index].postalCode = value;

        if (value.length > 5) {
          await getAddress(value);
        }

        if (isSameAddress && index === 0) {
          setClient({ ...client, ServiceAddresses: currentServiceAddress, billingPostal: value });
        } else {
          setClient({ ...client, ServiceAddresses: currentServiceAddress });
        }
      }
    } else {
      currentServiceAddress[index].postalCode = '';
      if (isSameAddress && index === 0) {
        setClient({ ...client, ServiceAddresses: currentServiceAddress, billingPostal: '' });
      } else {
        setClient({ ...client, ServiceAddresses: currentServiceAddress });
      }
    }
  };

  const handleChangeServicePostal = (value: any, index: number) => {
    const currentServiceAddress = ServiceAddresses;
    if (value) {
      const fullAddress = combineAddress(
        value.value,
        currentServiceAddress[index].floorNo || '',
        currentServiceAddress[index].unitNo || '',
        value.tempValue
      );
      currentServiceAddress[index].address = fullAddress;
      currentServiceAddress[index].postalCode = String(value.tempValue);

      if (isSameAddress && index === 0) {
        setClient({ ...client, ServiceAddresses: currentServiceAddress, billingPostal: String(value.tempValue), billingAddress: fullAddress });
        setLocationErrorMessage(prev => {
          prev[0].postalCode = '';
          prev[0].address = '';
          prev[index + 1].postalCode = '';
          prev[index + 1].address = '';
          return [...prev];
        });
      } else {
        setClient({ ...client, ServiceAddresses: currentServiceAddress });
        setLocationErrorMessage(prev => {
          prev[index + 1].postalCode = '';
          prev[index + 1].address = '';
          return [...prev];
        });
      }

      setTempPostalValue(prev => {
        prev[index + 1].id = value.id;
        prev[index + 1].name = value.value;
        return [...prev];
      });
    }
  };
  const handleChangeServiceFloorNo = (value: string, index: number) => {
    const currentServiceAddress = ServiceAddresses;
    const { unitNo, postalCode } = currentServiceAddress[index];
    const fullAddress = combineAddress(tempPostalValue[index + 1].name, value, unitNo || '', postalCode);
    currentServiceAddress[index].floorNo = value;
    currentServiceAddress[index].address = fullAddress;
    if (isSameAddress && index === 0) {
      setClient({ ...client, ServiceAddresses: currentServiceAddress, billingFloorNo: value, billingAddress: fullAddress });
    } else {
      setClient({ ...client, ServiceAddresses: currentServiceAddress });
    }
  };

  const handleChangeServiceUnitNo = (value: string, index: number) => {
    const currentServiceAddress = ServiceAddresses;
    const { floorNo, postalCode } = currentServiceAddress[index];
    const fullAddress = combineAddress(tempPostalValue[index + 1].name, floorNo, value || '', postalCode);
    currentServiceAddress[index].unitNo = value;
    currentServiceAddress[index].address = fullAddress;
    if (isSameAddress && index === 0) {
      setClient({ ...client, ServiceAddresses: currentServiceAddress, billingUnitNo: value, billingAddress: fullAddress });
    } else {
      setClient({ ...client, ServiceAddresses: currentServiceAddress });
    }
  };

  const handleChangeServiceAddress = (value: string, index: number) => {
    const currentServiceAddress = ServiceAddresses;
    currentServiceAddress[index].address = value;
    if (isSameAddress && index === 0) {
      setClient({ ...client, ServiceAddresses: currentServiceAddress, billingAddress: value });
    } else {
      setClient({ ...client, ServiceAddresses: currentServiceAddress });
    }
  };

  const handleOnBlur = (field: string, value: string, index: number) => {
    const currentErrorMessage = [...locationErrorMessage];

    if (!value) {
      if (field === 'postalCode') {
        currentErrorMessage[index].postalCode = 'Please enter postal code';
      } else {
        currentErrorMessage[index].address = 'Please enter address';
      }
    } else {
      if (field === 'postalCode') {
        currentErrorMessage[index].postalCode = '';
      } else {
        currentErrorMessage[index].address = '';
      }
    }
    setLocationErrorMessage(currentErrorMessage);
  };

  const renderServiceAddress = () => {
    return (
      ServiceAddresses &&
      ServiceAddresses.length > 0 &&
      ServiceAddresses.map((value, index) => {
        return (
          <Fragment key={`service-address-${index}`}>
            <Grid container>
              <Grid item xs={12} md={4}>
                <Typography variant='h6'>
                  Service Address {index + 1}
                  {index === 0 && <span className={classes.redColor}>*</span>}
                </Typography>
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      id='postalCode-0'
                      options={addressOptions}
                      getOptionLabel={options => options.name}
                      value={tempPostalValue[index + 1]}
                      inputValue={value.postalCode || ''}
                      onInputChange={(_, value, reason) => {
                        if (reason === 'input') {
                          handleFreeTextServicePostal(value, index);
                        }
                        if (reason === 'clear') {
                          handleClearServicePostal(index);
                        }
                      }}
                      onChange={(_, value) => {
                        handleChangeServicePostal(value, index);
                      }}
                      autoHighlight
                      // freeSolo
                      loading={isLoading}
                      loadingText='Searching…'
                      noOptionsText='No options'
                      renderInput={params => (
                        <TextField
                          {...params}
                          required
                          margin='dense'
                          className={classes.textField}
                          id='postalCode'
                          label='Postal Code'
                          variant='outlined'
                          error={locationErrorMessage[index + 1].postalCode !== ''}
                          helperText={locationErrorMessage[index + 1].postalCode}
                          onBlur={event => handleOnBlur('postalCode', event.target.value, index + 1)}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id='floor'
                      label='Floor No'
                      value={value.floorNo}
                      onChange={event => handleChangeServiceFloorNo(event.target.value, index)}
                      autoComplete='off'
                      className={classes.textField}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id='unit'
                      label='Unit No'
                      value={value.unitNo}
                      onChange={event => handleChangeServiceUnitNo(event.target.value, index)}
                      autoComplete='off'
                      className={classes.textField}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      required
                      fullWidth
                      multiline={true}
                      rows={3}
                      id='address'
                      label='Address'
                      value={value.address}
                      error={locationErrorMessage[index + 1].address !== ''}
                      helperText={locationErrorMessage[index + 1].address}
                      autoComplete='off'
                      className={classes.textField}
                      onChange={event => handleChangeServiceAddress(event.target.value, index)}
                      onBlur={event => handleOnBlur('address', event.target.value, index + 1)}
                    />
                  </Grid>
                </Grid>
                <Grid container style={{ marginTop: 8 }}>
                  {index !== 0 && (
                    <Grid item xs={6}>
                      <Button onClick={handleRemoveSubServiceAddress(index)} className={classes.redColor} startIcon={<DeleteIcon />}>
                        Remove Address
                      </Button>
                    </Grid>
                  )}
                  {index === ServiceAddresses.length - 1 && (
                    <Grid item container justify='flex-end' xs={index !== 0 ? 6 : 12}>
                      <Button color='primary' startIcon={<AddIcon />} onClick={handleAddSubServiceAddress}>
                        More Address
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
            {index !== ServiceAddresses.length - 1 && <Divider style={{ marginTop: 16, marginBottom: 16 }} />}
          </Fragment>
        );
      })
    );
  };

  const hanldeCheckBoxChange = () => {
    setIsSameAddress(!isSameAddress);
    const { postalCode, floorNo, unitNo, address } = ServiceAddresses[0];
    setClient({
      ...client,
      billingPostal: !isSameAddress ? postalCode : '',
      billingFloorNo: !isSameAddress ? floorNo : '',
      billingUnitNo: !isSameAddress ? unitNo : '',
      billingAddress: !isSameAddress ? address : ''
    });
    setLocationErrorMessage(prev => {
      prev[0].postalCode = '';
      prev[0].address = '';
      return [...prev];
    });
  };

  const handleFreeTextBillingPostal = async (value: any) => {
    if (value) {
      if (!isNaN(value)) {
        setClient({ ...client, billingPostal: value });
        if (value.length > 5) {
          await getAddress(value);
        }
      }
    } else {
      setClient({ ...client, billingPostal: '' });
      setAddressOptions([]);
    }
  };

  const handleChangeBillingPostal = (value: any) => {
    if (value) {
      const fullAddress = combineAddress(value.value, billingFloorNo, billingUnitNo, value.tempValue);
      setTempPostalValue(prev => {
        prev[0].id = value.id;
        prev[0].name = value.value;
        return [...prev];
      });
      setClient({ ...client, billingPostal: String(value.tempValue), billingAddress: fullAddress });
      setLocationErrorMessage(prev => {
        prev[0].postalCode = '';
        prev[0].address = '';
        return [...prev];
      });
    } else {
      setTempPostalValue(prev => {
        prev[0].id = 0;
        prev[0].name = '';
        return [...prev];
      });
      setClient({ ...client, billingPostal: '', billingAddress: '' });
    }
  };

  const handleChangeBillingFloor = (value: string) => {
    const fullAddress = combineAddress(tempPostalValue[0].name, value, billingUnitNo, billingPostal);
    setClient({ ...client, billingFloorNo: value, billingAddress: fullAddress });
  };

  const handleChangeBillingUnit = (value: string) => {
    const fullAddress = combineAddress(tempPostalValue[0].name, billingFloorNo, value, billingPostal);
    setClient({ ...client, billingUnitNo: value, billingAddress: fullAddress });
  };

  const renderBillingAddress = () => {
    return (
      <>
        <Grid item xs={12} md={4}>
          <Typography variant='h6'>
            Billing Address<span className={classes.redColor}>*</span>
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={isSameAddress} color='primary' onChange={hanldeCheckBoxChange} />}
            label={
              <Typography variant='caption' color='textSecondary'>
                Mark same as with Service Address 1
              </Typography>
            }
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                id='postalCode-0'
                options={addressOptions}
                getOptionLabel={options => options.name}
                value={tempPostalValue[0]}
                inputValue={billingPostal}
                onInputChange={(_, value, reason) => {
                  if (reason === 'input') {
                    handleFreeTextBillingPostal(value);
                  }
                }}
                onChange={(_, value) => {
                  handleChangeBillingPostal(value);
                }}
                autoHighlight
                // freeSolo
                loading={isLoading}
                loadingText='Searching…'
                noOptionsText='No options'
                disabled={isSameAddress}
                renderInput={params => (
                  <TextField
                    {...params}
                    required
                    margin='dense'
                    className={classes.textField}
                    id='postalCode'
                    label='Postal Code'
                    variant='outlined'
                    error={locationErrorMessage[0].postalCode !== ''}
                    helperText={locationErrorMessage[0].postalCode}
                    onBlur={event => handleOnBlur('postalCode', event.target.value, 0)}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                variant='outlined'
                margin='dense'
                fullWidth
                disabled={isSameAddress}
                id='floor'
                label='Floor No'
                value={billingFloorNo}
                onChange={event => handleChangeBillingFloor(event.target.value)}
                autoComplete='off'
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                variant='outlined'
                margin='dense'
                fullWidth
                disabled={isSameAddress}
                id='unit'
                label='Unit No'
                value={billingUnitNo}
                onChange={event => handleChangeBillingUnit(event.target.value)}
                autoComplete='off'
                className={classes.textField}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant='outlined'
                margin='dense'
                required
                fullWidth
                multiline={true}
                rows={3}
                disabled={isSameAddress}
                id='address'
                label='Address'
                value={billingAddress}
                error={locationErrorMessage[0].address !== ''}
                helperText={locationErrorMessage[0].address}
                onChange={event => setClient({ ...client, billingAddress: event.target.value })}
                autoComplete='off'
                className={classes.textField}
                onBlur={event => handleOnBlur('address', event.target.value, 0)}
              />
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <>
      <Card variant='outlined' className={classes.card}>
        <CardHeader title={<Typography variant='subtitle2'>Service Address</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
        <CardContent>{renderServiceAddress()}</CardContent>
      </Card>
      <Card variant='outlined' className={classes.card}>
        <CardHeader title={<Typography variant='subtitle2'>Billing Address</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
        <CardContent>
          <Grid container>{renderBillingAddress()}</Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default LocationForm;
