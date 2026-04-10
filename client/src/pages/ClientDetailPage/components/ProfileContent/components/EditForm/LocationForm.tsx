import React, { useState, FC, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  DialogActions,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Theme,
  Typography
} from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';
import { GET_EDIT_CLIENT_URL, ONEMAP_BASE_URL, CHECK_ATTACH_SERVICE_ADDRESS_URL } from 'constants/url';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { combineAddress } from 'utils';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { grey } from '@material-ui/core/colors';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
  clients: ClientDetailsModel;
  setClients: React.Dispatch<React.SetStateAction<ClientDetailsModel>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  openForm: boolean;
  handleClose(): void;
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

const LocationForm: FC<Props> = props => {
  const classes = useStyles();
  const { clients, setClients, handleSnackbar, handleClose } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSameAddress, setIsSameAddress] = useState<boolean>(false);
  const [clientId, setClientId] = useState<number>(0);
  const [billingAddress, setBillingAddress] = useState<string>('');
  const [billingFloorNo, setBillingFloorNo] = useState<string>('');
  const [billingUnitNo, setBillingUnitNo] = useState<string>('');
  const [billingPostal, setBillingPostal] = useState<string>('');
  const [billingPostalValue, setBillingPostalValue] = useState<Select>({ id: 0, name: '' });
  const [addresses, setAddresses] = useState<ServiceAddressModel[]>([]);
  const [serviceAddressPostal, setServiceAddressPostal] = useState<string[]>(['']);
  const [serviceAddressPostalValue, setServiceAddressPostalValue] = useState<Select[]>([{ id: 0, name: '' }]);
  const [deletedServiceAddresses, setDeletedServiceAddresses] = useState<number[]>([]);
  const [addressOptions, setAddressOptions] = useState<Select[]>([]);

  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [confirmVariant, setConfirmVariant] = useState<string>('warning');
  const [confirmTitle, setConfirmTitle] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<any[]>([{ postalCode: '', address: '' }]);

  useEffect(() => {
    if (!clients) {
      return;
    }
    const { id, billingAddress, billingFloorNo, billingUnitNo, billingPostal, ServiceAddresses } = clients!;

    setClientId(id);
    setBillingAddress(billingAddress);
    setBillingFloorNo(billingFloorNo || '');
    setBillingUnitNo(billingUnitNo || '');
    setBillingPostal(billingPostal);
    setAddresses(
      ServiceAddresses.map(value => {
        return { ...value };
      })
    );

    // setAddresses(tempData);
    const baseBilling = extractBaseAddress(billingAddress, billingPostal);

    setBillingPostalValue({ id: Number(billingPostal), name: baseBilling });
    setIsSameAddress(billingPostal === ServiceAddresses[0].postalCode || false);

    let temp: string[] = [];
    let tempValue: Select[] = [];
    let tempError: any[] = [...errorMessage];
    // eslint-disable-next-line array-callback-return
    ServiceAddresses.map(value => {
      const splitAddress = value.address.split(', ');
      const getAddress = splitAddress.filter(address => !address.includes(value.floorNo! || value.unitNo!) && !address.includes(value.postalCode));
      temp.push(value.postalCode);
      tempValue.push({ id: Number(value.postalCode), name: getAddress.join(', ') });
      tempError.push({ postalCode: '', address: '' });
    });
    setServiceAddressPostal(temp);
    setServiceAddressPostalValue(tempValue);
    setErrorMessage(tempError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  const getAddress = async (postalCode: string) => {
    try {
      setIsLoading(true);
      setAddressOptions([]);

      try {
        const response = await fetch(`${ONEMAP_BASE_URL}/search/${postalCode}`);
        const { success, data } = await response.json();

        if (success && Array.isArray(data) && data.length > 0) {
          setAddressOptions(data);
        } else {
          // no results found
          setAddressOptions([]);
        }
      } catch (error) {
        console.error(error);
        handleSnackbar('error', 'Failed to fetch address');
        setAddressOptions([]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setAddressOptions([]);
    }
  };

  const extractBaseAddress = (fullAddress: string, postal?: string) => {
    if (!fullAddress) return '';
    const parts = fullAddress
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    const filtered = parts.filter(p => {
      if (!p) return false;
      if (postal && p.includes(postal)) return false;
      if (p.startsWith('#')) return false; // floor/unit part
      return true;
    });
    return filtered.join(', ');
  };

  const handleCancel = () => {
    handleClose();
  };

  const performRemoveServiceAddress = (i: number) => {
    const currentServiceAddress = [...addresses];
    const currentServiceAddressPostal = [...serviceAddressPostal];
    const currentServiceAddressPostalValue = [...serviceAddressPostalValue];
    const currentDeletedServiceAddress = [...deletedServiceAddresses];
    const idToDelete = addresses[i].id || 0;
    if (idToDelete) currentDeletedServiceAddress.push(idToDelete);
    currentServiceAddress.splice(i, 1);
    currentServiceAddressPostal.splice(i, 1);
    currentServiceAddressPostalValue.splice(i, 1);
    setAddresses(currentServiceAddress);
    setServiceAddressPostal(currentServiceAddressPostal);
    setServiceAddressPostalValue(currentServiceAddressPostalValue);
    setDeletedServiceAddresses(currentDeletedServiceAddress);
  };

  const handleRemoveSubServiceAddress = (i: number): React.MouseEventHandler => async () => {
    // if address is new (id 0), just confirm deletion
    const serviceAddressId = addresses[i]?.id || 0;
    setPendingDeleteIndex(i);

    if (!serviceAddressId) {
      setConfirmVariant('warning');
      setConfirmTitle('Confirm Deletion');
      setConfirmMessage('Are you sure you want to delete the service address?');
      setOpenConfirmDialog(true);
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.get(CHECK_ATTACH_SERVICE_ADDRESS_URL(serviceAddressId));
      const hasAttach = data && data.hasAttachService;
      if (hasAttach) {
        setConfirmVariant('danger');
        setConfirmTitle('Cannot Delete');
        setConfirmMessage('Service address cannot be deleted because there is a quotation attached to it.');
        setOpenConfirmDialog(true);
      } else {
        setConfirmVariant('warning');
        setConfirmTitle('Confirm Deletion');
        setConfirmMessage('Are you sure you want to delete the service address?');
        setOpenConfirmDialog(true);
      }
    } catch (err) {
      console.error(err);
      handleSnackbar('error', 'Failed to validate service address');
    }
    setIsLoading(false);
  };

  const handleAddSubServiceAddress = () => {
    const currentServiceAddress = [...addresses];
    const currentErrorMessage = [...errorMessage];
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
    currentErrorMessage.push({ postalCode: '', address: '' });

    setAddresses(currentServiceAddress);
    setErrorMessage(currentErrorMessage);
  };

  const hanldeCheckBoxChange = () => {
    setIsSameAddress(!isSameAddress);
    setBillingAddress(!isSameAddress ? addresses[0].address : '');
    setBillingFloorNo(!isSameAddress ? addresses[0].floorNo! : '');
    setBillingUnitNo(!isSameAddress ? addresses[0].unitNo! : '');
    setBillingPostal(!isSameAddress ? addresses[0].postalCode : '');
    setBillingPostalValue(!isSameAddress ? { id: Number(addresses[0].postalCode), name: addresses[0].postalCode } : { id: 0, name: '' });
    setAddressOptions([]);
    setErrorMessage(prev => {
      prev[0].postalCode = '';
      prev[0].address = '';
      return [...prev];
    });
    // const next = !isSameAddress;
    // setIsSameAddress(next);
    // const svc = addresses[0] || { address: '', floorNo: '', unitNo: '', postalCode: '' };
    // const svcBase = serviceAddressPostalValue[0]?.name || extractBaseAddress(svc.address, svc.postalCode);
    // const svcFloor = svc.floorNo || '';
    // const svcUnit = svc.unitNo || '';
    // const svcPostal = svc.postalCode || '';

    // setBillingFloorNo(next ? svcFloor : '');
    // setBillingUnitNo(next ? svcUnit : '');
    // setBillingPostal(next ? svcPostal : '');
    // setBillingPostalValue(next ? { id: Number(svcPostal), name: svcBase } : { id: 0, name: '' });
    // setBillingAddress(next ? combineAddress(svcBase, svcFloor, svcUnit, svcPostal) : '');
    // setAddressOptions([]);
    // setErrorMessage(prev => {
    //   const p = prev.map(e => ({ ...e }));
    //   p[0].postalCode = '';
    //   p[0].address = '';
    //   return p;
    // });
  };

  const handleFreeTextServicePostal = async (value: any, index: number) => {
    if (!value || isNaN(value)) {
      setAddresses(prev => {
        const clone = prev.map(a => ({ ...a }));
        clone[index] = { ...clone[index], postalCode: '' };
        return clone;
      });
      setServiceAddressPostal(prev => {
        const p = [...prev];
        p[index] = '';
        return p;
      });
      if (isSameAddress && index === 0) setBillingPostal('');
      setAddressOptions([]);
      setIsLoading(false); // <- ensure not loading
      return;
    }

    if (String(value).trim().length >= 6) {
      await getAddress(value);
    } else {
      setAddressOptions([]); // empty
      setIsLoading(false); // <- ensure not loading so "No options" shows
    }

    if (isSameAddress && index === 0) setBillingPostal(value);
    setAddresses(prev => {
      const clone = prev.map(a => ({ ...a }));
      clone[index] = { ...clone[index], postalCode: value };
      return clone;
    });
    setServiceAddressPostal(prev => {
      const p = [...prev];
      p[index] = value;
      return p;
    });
  };

  const handleChangeServicePostal = (value: any, index: number) => {
    if (value) {
      const addr = addresses[index];
      const fullAddress = combineAddress(value.value, addr.floorNo || '', addr.unitNo || '', value.tempValue);

      if (isSameAddress && index === 0) {
        setBillingPostal(String(value.tempValue));
        setBillingAddress(fullAddress);
      }

      setAddresses(prev => {
        const clone = prev.map(a => ({ ...a }));
        clone[index] = { ...clone[index], address: fullAddress, postalCode: String(value.tempValue) };
        return clone;
      });

      setServiceAddressPostal(prev => {
        const p = [...prev];
        p[index] = String(value.tempValue);
        return p;
      });

      setServiceAddressPostalValue(prev => {
        const p = [...prev];
        p[index] = { id: value.id, name: value.value };
        return p;
      });

      setErrorMessage(prev => {
        const p = [...prev];
        p[index + 1] = { ...p[index + 1], postalCode: '', address: '' };
        return p;
      });
    }
  };

  const handleChangeServiceFloorNo = (value: string, index: number) => {
    const { unitNo, postalCode, address: existingAddress } = addresses[index];
    const base = serviceAddressPostalValue[index]?.name || extractBaseAddress(existingAddress, postalCode);
    const fullAddress = combineAddress(base, value, unitNo || '', postalCode);

    if (isSameAddress && index === 0) {
      setBillingFloorNo(value);
      setBillingAddress(fullAddress);
    }

    setAddresses(prev => {
      const clone = prev.map(a => ({ ...a }));
      clone[index] = { ...clone[index], address: fullAddress, floorNo: value };
      return clone;
    });
  };

  const handleChangeServiceUnitNo = (value: string, index: number) => {
    const { floorNo, postalCode, address: existingAddress } = addresses[index];
    const base = serviceAddressPostalValue[index]?.name || extractBaseAddress(existingAddress, postalCode);
    const fullAddress = combineAddress(base, floorNo || '', value, postalCode);

    if (isSameAddress && index === 0) {
      setBillingUnitNo(value);
      setBillingAddress(fullAddress);
    }

    setAddresses(prev => {
      const clone = prev.map(a => ({ ...a }));
      clone[index] = { ...clone[index], address: fullAddress, unitNo: value };
      return clone;
    });
  };

  const handleChangeServiceAddress = (value: string, index: number) => {
    setAddresses(prev => {
      const clone = prev.map(a => ({ ...a }));
      clone[index] = { ...clone[index], address: value };
      return clone;
    });
  };

  const handleFreeTextBillingPostal = async (value: any) => {
    if (!value || isNaN(value)) {
      setBillingPostal('');
      setAddressOptions([]);
      setIsLoading(false); // <- ensure not loading
      return;
    }

    setBillingPostal(value);
    if (String(value).trim().length >= 6) {
      await getAddress(value);
    } else {
      setAddressOptions([]); // empty
      setIsLoading(false); // <- ensure not loading so "No options" shows
    }
  };

  const handleChangeBillingPostal = (value: any) => {
    if (value) {
      setBillingPostal(String(value.tempValue));
      setBillingPostalValue({ id: value.id, name: value.value });
      const fullAddress = combineAddress(value.value, billingFloorNo, billingUnitNo, value.tempValue);
      setBillingAddress(fullAddress);
      setErrorMessage(prev => {
        const p = prev.map(e => ({ ...e }));
        p[0].postalCode = '';
        p[0].address = '';
        return p;
      });
    } else {
      setBillingPostal('');
      setBillingPostalValue({ id: 0, name: '' });
      setBillingAddress('');
    }
  };

  const handleChangeBillingFloor = (value: string) => {
    setBillingFloorNo(value);
    const fullAddress = combineAddress(billingPostalValue.name, value, billingUnitNo, billingPostal);
    setBillingAddress(fullAddress);
  };

  const handleChangeBillingUnit = (value: string) => {
    setBillingUnitNo(value);
    const fullAddress = combineAddress(billingPostalValue.name, billingFloorNo, value, billingPostal);
    setBillingAddress(fullAddress);
  };

  const handleOnBlur = (field: string, value: string, index: number) => {
    const currentErrorMessage = [...errorMessage];
    if (!value) {
      if (field === 'postalCode') {
        currentErrorMessage[index].postalCode = 'Please enter postal code';
      } else {
        currentErrorMessage[index].address = 'Please enter address';
      }
      setIsError(true);
    } else {
      if (field === 'postalCode') {
        currentErrorMessage[index].postalCode = '';
      } else {
        currentErrorMessage[index].address = '';
      }
      setIsError(false);
    }
    setErrorMessage(currentErrorMessage);
  };

  const validateForm = () => {
    let isValid = true;
    const currentErrorMessage = [...errorMessage];

    // Validate billing address
    if (!billingPostal || !billingPostal.trim()) {
      currentErrorMessage[0].postalCode = 'Please enter postal code';
      isValid = false;
    } else {
      currentErrorMessage[0].postalCode = '';
    }

    if (!billingAddress || !billingAddress.trim()) {
      currentErrorMessage[0].address = 'Please enter address';
      isValid = false;
    } else {
      currentErrorMessage[0].address = '';
    }

    // Validate service addresses
    addresses.forEach((address, index) => {
      if (!address.postalCode || !address.postalCode.trim()) {
        currentErrorMessage[index + 1].postalCode = 'Please enter postal code';
        isValid = false;
      } else {
        currentErrorMessage[index + 1].postalCode = '';
      }

      if (!address.address || !address.address.trim()) {
        currentErrorMessage[index + 1].address = 'Please enter address';
        isValid = false;
      } else {
        currentErrorMessage[index + 1].address = '';
      }
    });

    setErrorMessage(currentErrorMessage);
    setIsError(!isValid);
    return isValid;
  };

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    setIsLoading(true);
    if (isError) {
      setIsLoading(false);
      return;
    }
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      const { data } = await axios.put(
        `${GET_EDIT_CLIENT_URL(clientId)}`,
        {
          isEditServiceAddress: true,
          billingAddress,
          billingFloorNo,
          billingUnitNo,
          billingPostal,
          ServiceAddresses: addresses,
          deletedServiceAddresses
        },
        { cancelToken: cancelTokenSource.token }
      );
      setClients({
        ...clients,
        billingAddress,
        billingPostal,
        billingUnitNo,
        billingFloorNo,
        ServiceAddresses: data.ServiceAddresses
      });

      handleSnackbar('success', 'Successfully edit address');
      handleCancel();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed edit address');
    }
    setIsLoading(false);
  };

  const renderServiceAddresses = () => {
    return (
      addresses &&
      addresses.length > 0 &&
      addresses.map((value, index) => {
        return (
          <>
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
                      id={`postalCode-${index + 1}`}
                      options={addressOptions}
                      // in BOTH Autocomplete components
                      getOptionLabel={(opt: any) => (typeof opt === 'string' ? opt : opt?.name ?? '')}
                      value={serviceAddressPostalValue[index]}
                      inputValue={serviceAddressPostal[index] || ''}
                      onInputChange={(_, value, reason) => {
                        if (reason === 'input') {
                          handleFreeTextServicePostal(value, index);
                        }
                        if (reason === 'clear') {
                          setServiceAddressPostal(prev => {
                            const p = [...prev];
                            p[index] = '';
                            return p;
                          });
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
                          className={classes.textfield}
                          id='postalCode'
                          label={`Postal Code ${index + 1}`}
                          variant='outlined'
                          error={errorMessage[index + 1].postalCode !== ''}
                          helperText={errorMessage[index + 1].postalCode}
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
                      id='unit'
                      label={`Floor No. ${index + 1}`}
                      value={value.floorNo}
                      onChange={event => handleChangeServiceFloorNo(event.target.value, index)}
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id='unit'
                      label={`Unit No. ${index + 1}`}
                      value={value.unitNo}
                      onChange={event => handleChangeServiceUnitNo(event.target.value, index)}
                      autoComplete='off'
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
                      label={`Address ${index + 1}`}
                      value={value.address}
                      onChange={event => handleChangeServiceAddress(event.target.value, index)}
                      autoComplete='off'
                      error={errorMessage[index + 1].address !== ''}
                      helperText={errorMessage[index + 1].address}
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
                  {index === addresses.length - 1 && (
                    <Grid item container justify='flex-end' xs={index !== 0 ? 6 : 12}>
                      <Button color='primary' startIcon={<AddIcon />} onClick={handleAddSubServiceAddress}>
                        More Address
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
            {index !== addresses.length - 1 && <Divider style={{ marginTop: 16, marginBottom: 16 }} />}
          </>
        );
      })
    );
  };

  const renderBillingAddress = () => {
    return (
      <Card variant='outlined' className={classes.card}>
        <CardHeader title={<Typography variant='subtitle2'>Billing Address</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />{' '}
        <CardContent>
          <Grid container>
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
                    getOptionLabel={(opt: any) => (typeof opt === 'string' ? opt : opt?.name ?? '')}
                    value={billingPostalValue}
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
                    disabled={isSameAddress}
                    renderInput={params => (
                      <TextField
                        {...params}
                        required
                        margin='dense'
                        className={classes.textfield}
                        id='postalCode'
                        label='Postal Code'
                        variant='outlined'
                        error={errorMessage[0].postalCode !== ''}
                        helperText={errorMessage[0].postalCode}
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
                    error={errorMessage[0].address !== ''}
                    helperText={errorMessage[0].address}
                    onChange={event => setBillingAddress(event.target.value)}
                    autoComplete='off'
                    onBlur={event => handleOnBlur('address', event.target.value, 0)}
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
    <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
      <Card variant='outlined' className={classes.card}>
        <CardHeader title={<Typography variant='subtitle2'>Service Address</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
        <CardContent>{renderServiceAddresses()}</CardContent>
      </Card>
      {renderBillingAddress()}
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
      {openConfirmDialog && (
        <StandardConfirmationDialog
          variant={confirmVariant}
          title={confirmTitle}
          message={confirmMessage}
          okLabel={'OK'}
          cancelLabel={confirmVariant === 'warning' ? 'cancel' : ''}
          open={openConfirmDialog}
          handleClose={() => {
            setOpenConfirmDialog(false);
            setPendingDeleteIndex(null);
          }}
          onConfirm={() => {
            if (confirmVariant === 'warning' && pendingDeleteIndex !== null) {
              performRemoveServiceAddress(pendingDeleteIndex);
            }
            setOpenConfirmDialog(false);
            setPendingDeleteIndex(null);
          }}
        />
      )}
    </Grid>
  );
};

export default LocationForm;
