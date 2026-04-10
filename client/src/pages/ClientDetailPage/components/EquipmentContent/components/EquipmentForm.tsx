import { FC, useState, useEffect, useContext } from 'react';
import {
  Grid,
  TextField,
  Theme,
  MenuItem,
  Typography,
  DialogActions,
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Chip,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { ucWords } from 'utils';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { EQUIPMENT_BASE_URL, GET_EDIT_EQUIPMENT_URL, SUBEQUIPMENT_BASE_URL } from 'constants/url';
import axios, { CancelTokenSource } from 'axios';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { grey } from '@material-ui/core/colors';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import ClearIcon from '@material-ui/icons/Clear';
import theme from 'theme';
import { dummyEquipments } from 'constants/dummy';
import { CreateLogEvent } from 'utils/Firebase';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { differenceInCalendarDays, isValid } from 'date-fns';

interface Props {
  clientId: string;
  brandMaster: Select[];
  serviceAddressMaster: Select[];
  isEdit: boolean;
  isMain: boolean;
  isAddSub?: boolean;
  equipment: EquipmentModel;
  selectedSubEquipmentIndex?: number;
  addNewEquipment(equipment: EquipmentModel): void;
  updatedIndividualEquipment: (updatedEquipmentProperties: Partial<EquipmentModel>) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  fetchData(): void;
  handleCancel(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  rightPadding: {
    paddingRight: theme.spacing(1)
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  required: {
    color: 'red'
  },
  card: {
    margin: 'auto',
    width: '100%'
  },
  redColor: {
    color: theme.palette.error.main
  },
  chip: {
    borderRadius: 50,
    marginRight: theme.spacing(1),
    minWidth: 100
  }
}));

const EquipmentForm: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);

  const {
    clientId,
    brandMaster,
    serviceAddressMaster,
    isAddSub,
    isEdit,
    isMain,
    equipment,
    selectedSubEquipmentIndex,
    addNewEquipment,
    updatedIndividualEquipment,
    handleSnackbar,
    fetchData,
    handleCancel
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainEquipmentMaster, setMainEquipmentMaster] = useState<EquipmentModel[]>([]);

  const [serviceAddressId, setServiceAddressId] = useState<number>(serviceAddressMaster[0].id);
  const [subEquipmentId, setSubEquipmentId] = useState<number>(0);
  const [mainId, setMainId] = useState<number>(0);
  const [currentMainId, setCurrentMainId] = useState<number>(0);
  const [equipmentType, setEquipmentType] = useState<string>('MAIN');
  const [description, setDescription] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [brandValue, setBrandValue] = useState<Select>({ id: 0, name: '' });
  const [model, setModel] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [warrantyStartDate, setWarrantyStartDate] = useState<Date | null>(null);
  const [warrantyEndDate, setWarrantyEndDate] = useState<Date | null>(null);
  const [address, setAddress] = useState<string>(serviceAddressMaster[0].name);
  const [subEquipments, setSubEquipments] = useState<EquipmentModel[]>([]);
  const [subEquipmentBrandValue, setSubEquipmentBrandValue] = useState<Select[]>([{ id: 0, name: '' }]);
  const [isChangeSerialNumber, setIsChangeSerialNumber] = useState<boolean>(false);
  const [isEditable, setIsEditable] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<any[]>([{ brand: '', model: '', serialNumber: '', warrantyStartDate: '', warrantyEndDate: '' }]);
  const [serviceAddressError, setServiceAddressError] = useState<string>('');

  useEffect(() => {
    if (equipment.id === 0) {
      return;
    }
    if (isEdit) {
      //get main equipment list
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      const getMainEquipmentList = async () => {
        try {
          const params = new URLSearchParams();
          params.append('ci', clientId);
          const url = `${EQUIPMENT_BASE_URL}?${params.toString()}`;
          const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

          const equipmentData: EquipmentModel[] = data.equipments;
          // eslint-disable-next-line array-callback-return
          const filteredData = equipmentData.filter(value => {
            if (isMain) {
              if (value.id !== equipment!.id) {
                return value;
              }
            } else {
              return value;
            }
          });
          setMainEquipmentMaster(filteredData);
        } catch (err) {
          console.log(err);
        }
      };

      getMainEquipmentList();

      if (isMain) {
        const {
          serviceAddressId,
          description,
          brand,
          model,
          serialNumber,
          location,
          address,
          warrantyStartDate,
          warrantyEndDate,
          SubEquipments
        } = equipment;
        setDescription(description || '');
        setServiceAddressId(serviceAddressId);
        setBrand(brand);
        setModel(model);
        setSerialNumber(serialNumber);
        setLocation(location);
        setAddress(address);
        setEquipmentType('MAIN');
        setWarrantyStartDate(warrantyStartDate ? new Date(warrantyStartDate) : null);
        setWarrantyEndDate(warrantyEndDate ? new Date(warrantyEndDate) : null);
        setIsEditable(SubEquipments && SubEquipments.length > 0 ? false : true);
      } else {
        const { SubEquipments, serviceAddressId } = equipment;
        if (!SubEquipments) {
          return;
        }
        const selectedSubEquipment = SubEquipments[selectedSubEquipmentIndex!];
        if (!selectedSubEquipment) {
          return;
        }
        const { id, description, brand, model, serialNumber, location, mainId, warrantyStartDate, warrantyEndDate } = selectedSubEquipment;
        setSubEquipmentId(id);
        setServiceAddressId(serviceAddressId);
        setDescription(description || '');
        setBrand(brand);
        setModel(model);
        setSerialNumber(serialNumber);
        setLocation(location);
        setEquipmentType('SUB');
        setMainId(mainId || 0);
        setWarrantyStartDate(warrantyStartDate ? new Date(warrantyStartDate) : null);
        setWarrantyEndDate(warrantyEndDate ? new Date(warrantyEndDate) : null);
        setCurrentMainId(mainId || 0);
      }
    } else if (isAddSub) {
      const { serviceAddressId, description, brand, model, serialNumber, location, address, warrantyStartDate, warrantyEndDate } = equipment;
      setServiceAddressId(serviceAddressId);
      setDescription(description || '');
      setBrand(brand);
      setModel(model);
      setSerialNumber(serialNumber);
      setLocation(location);
      setAddress(address);
      setWarrantyStartDate(warrantyStartDate ? new Date(warrantyStartDate) : null);
      setWarrantyEndDate(warrantyEndDate ? new Date(warrantyEndDate) : null);

      const currentSubEquipment: EquipmentModel[] = [];
      const currentErrorMessage = [...errorMessage];
      currentSubEquipment.push({ ...dummyEquipments });
      currentErrorMessage.push({ brand: '', model: '', serialNumber: '' });
      setSubEquipments(currentSubEquipment);
      setErrorMessage(currentErrorMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment, isEdit, isMain, selectedSubEquipmentIndex, isAddSub]);

  const clearForm = () => {
    setServiceAddressId(0);
    setBrand('');
    setSerialNumber('');
    setLocation('');
    setAddress('');
    setDescription('');
    setWarrantyStartDate(null);
    setWarrantyEndDate(null);
  };

  const handleClose = () => {
    handleCancel();
    clearForm();
  };

  const handleFreeText = (value: any) => {
    setBrand(value);
    setBrandValue(value);
  };

  const handleChangeBrand = (value: any) => {
    if (value) {
      setBrand(value.name);
      setBrandValue(value);
    } else {
      setBrand('');
      setBrandValue({ id: 0, name: '' });
    }
  };

  const handleServiceAddressChange = (value: any) => {
    if (value !== 0) {
      const address = serviceAddressMaster.find(address => address.id === value);
      setServiceAddressId(value);
      setAddress(address ? address.name : '');
      setServiceAddressError('');
    } else {
      setServiceAddressError('Please select service address');
    }
  };

  const handleChangeSerialNumber = (value: string) => {
    setSerialNumber(value);
    setIsChangeSerialNumber(true);
  };

  const handleOnBlurServiceAddress = (value: any) => {
    if (value !== 0) {
      const address = serviceAddressMaster.find(address => address.id === value);
      setServiceAddressId(value);
      setAddress(address ? address.name : '');
      setServiceAddressError('');
    } else {
      setServiceAddressError('Please select service address');
    }
  };

  const handleOnBlur = (field: string, value: string, index: number) => {
    const currentErrorMessage: any[] = [...errorMessage];
    if (!value) {
      if (field === 'brand') {
        currentErrorMessage[index].brand = 'Please insert equipment brand';
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'model') {
        currentErrorMessage[index].model = 'Please insert equipment model';
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'serialNumber') {
        currentErrorMessage[index].serialNumber = 'Please insert equipment serial number';
        setErrorMessage(currentErrorMessage);
        return;
      }
    } else {
      if (field === 'brand') {
        currentErrorMessage[index].brand = '';
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'model') {
        currentErrorMessage[index].model = '';
        setErrorMessage(currentErrorMessage);
        return;
      } else if (field === 'serialNumber') {
        currentErrorMessage[index].serialNumber = '';
        setErrorMessage(currentErrorMessage);
        return;
      }
    }

    return;
  };

  const handleAddSubEquipment = () => {
    const currentSubEquipment = [...subEquipments];
    const currentErrorMessage = [...errorMessage];
    currentSubEquipment.push({ ...dummyEquipments });
    currentErrorMessage.push({ brand: '', model: '', serialNumber: '', warrantyStartDate: '', warrantyEndDate: '' });
    setSubEquipments(currentSubEquipment);
    setErrorMessage(currentErrorMessage);
  };

  const handleRemoveSubEquipment = (i: number) => {
    const currentSubEquipment = [...subEquipments];
    const currentErrorMessage = [...errorMessage];
    currentSubEquipment.splice(i, 1);
    currentErrorMessage.splice(i, 1);
    setSubEquipments(currentSubEquipment);
    setErrorMessage(currentErrorMessage);
  };

  const handleFreeTextSubEquipmentBrand = (value: any, index: number) => {
    setSubEquipmentBrandValue(prev => {
      prev[index] = value;
      return [...prev];
    });
    setSubEquipments(prev => {
      prev[index].brand = value;
      return [...prev];
    });
  };

  const handleChangeSubEquipment = (field: string, value: any, index: number) => {
    const updateSubEquipments = (updater: (item: any) => void) => {
      setSubEquipments(prev => {
        const updated = [...prev];
        updater(updated[index]);
        return updated;
      });
    };

    if (field.includes('brand')) {
      const newBrand = value || { id: 0, name: '' };
      setSubEquipmentBrandValue(prev => {
        const updated = [...prev];
        updated[index] = newBrand;
        return updated;
      });

      updateSubEquipments(item => {
        item.brand = value || '';
      });
      return;
    }

    if (field.includes('model')) {
      updateSubEquipments(item => {
        item.model = value;
      });
      return;
    }

    if (field.includes('serialNumber')) {
      updateSubEquipments(item => {
        item.serialNumber = value;
      });
      return;
    }

    if (field.includes('location')) {
      updateSubEquipments(item => {
        item.location = value;
      });
      return;
    }

    if (field.includes('description')) {
      updateSubEquipments(item => {
        item.description = value;
      });
      return;
    }

    if (field.includes('warrantyStartDate')) {
      updateSubEquipments(item => {
        const updatedErrors = [...errorMessage];

        if (!value) {
          item.warrantyStartDate = null;
          updatedErrors[index + 1].warrantyStartDate = '';
        } else if (isValid(value)) {
          const startDate = new Date(value);
          const endDate = item.warrantyEndDate ? new Date(item.warrantyEndDate) : null;

          // If current endDate is earlier by calendar day, snap it to startDate and clear error
          if (endDate && differenceInCalendarDays(endDate, startDate) < 0) {
            item.warrantyEndDate = value;
            updatedErrors[index + 1].warrantyEndDate = '';
          }

          item.warrantyStartDate = value;
          updatedErrors[index + 1].warrantyStartDate = '';
        } else {
          updatedErrors[index + 1].warrantyStartDate = 'Invalid Format Date';
        }

        setErrorMessage(updatedErrors);
      });
      return;
    }

    if (field.includes('warrantyEndDate')) {
      updateSubEquipments(item => {
        const updatedErrors = [...errorMessage];

        if (!value) {
          item.warrantyEndDate = null;
          updatedErrors[index + 1].warrantyEndDate = '';
        } else if (isValid(value)) {
          const startDate = item.warrantyStartDate ? new Date(item.warrantyStartDate) : null;
          const endDate = new Date(value);

          if (startDate && differenceInCalendarDays(endDate, startDate) < 0) {
            updatedErrors[index + 1].warrantyEndDate = 'Cannot be earlier than start date';
          } else {
            item.warrantyEndDate = value;
            updatedErrors[index + 1].warrantyEndDate = '';
          }
        } else {
          updatedErrors[index + 1].warrantyEndDate = 'Invalid Format Date';
        }

        setErrorMessage(updatedErrors);
      });
      return;
    }
  };

  const validateForm = () => {
    let ret = true;
    const currentErrorMessage: any[] = [...errorMessage];

    // Validate service address
    if (!serviceAddressId || serviceAddressId === 0) {
      setServiceAddressError('Please select service address');
      ret = false;
    } else {
      setServiceAddressError(''); // clear error if valid
    }

    // Validate main equipment fields
    if (!brand) {
      currentErrorMessage[0].brand = 'Please insert equipment brand';
      ret = false;
    } else {
      currentErrorMessage[0].brand = '';
    }

    if (!model) {
      currentErrorMessage[0].model = 'Please insert equipment model';
      ret = false;
    } else {
      currentErrorMessage[0].model = '';
    }

    if (!serialNumber) {
      currentErrorMessage[0].serialNumber = 'Please insert equipment serial number';
      ret = false;
    } else {
      currentErrorMessage[0].serialNumber = '';
    }

    if (warrantyEndDate && !isValid(warrantyEndDate)) {
      currentErrorMessage[0].warrantyStartDate = 'Invalid Format Date';
      ret = false;
    }

    if (warrantyEndDate && !isValid(warrantyEndDate)) {
      currentErrorMessage[0].warrantyEndDate = 'Invalid Format Date';
      ret = false;
    }

    // Validate subEquipments
    if (subEquipments.length > 0) {
      subEquipments.forEach((value, index) => {
        if (!value.brand) {
          currentErrorMessage[index + 1].brand = 'Please insert equipment brand';
          ret = false;
        } else {
          currentErrorMessage[index + 1].brand = '';
        }

        if (!value.model) {
          currentErrorMessage[index + 1].model = 'Please insert equipment model';
          ret = false;
        } else {
          currentErrorMessage[index + 1].model = '';
        }

        if (!value.serialNumber) {
          currentErrorMessage[index + 1].serialNumber = 'Please insert equipment serial number';
          ret = false;
        } else {
          currentErrorMessage[index + 1].serialNumber = '';
        }

        if (value.warrantyStartDate && !isValid(value.warrantyStartDate)) {
          currentErrorMessage[index + 1].warrantyStartDate = 'Invalid Format Date';
          ret = false;
        }

        if (value.warrantyEndDate) {
          if (!isValid(value.warrantyEndDate)) {
            currentErrorMessage[index + 1].warrantyEndDate = 'Invalid Format Date';
            ret = false;
          } else if (value.warrantyStartDate && differenceInCalendarDays(value.warrantyEndDate, value.warrantyStartDate) < 0) {
            currentErrorMessage[index + 1].warrantyEndDate = 'Cannot be earlier than start date';
            ret = false;
          }
        }
      });
    }

    setErrorMessage(currentErrorMessage);
    return ret;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    const { displayName } = currentUser!;
    try {
      setIsLoading(true);
      if (isEdit) {
        if (isMain) {
          const { id } = equipment!;
          await axios.put(
            GET_EDIT_EQUIPMENT_URL(id),
            {
              brand,
              model,
              serialNumber,
              location,
              dateWorkDone: null,
              serviceAddressId,
              isChangeSerialNumber,
              isMain: equipmentType.includes('MAIN'),
              mainId,
              description,
              warrantyStartDate,
              warrantyEndDate
            },
            { cancelToken: cancelTokenSource.token }
          );
          fetchData();
          handleSnackbar('success', 'Successfuly update equipment');
        } else {
          await axios.put(
            GET_EDIT_EQUIPMENT_URL(subEquipmentId),
            {
              brand,
              model,
              serialNumber,
              location,
              dateWorkDone: null,
              serviceAddressId,
              isChangeSerialNumber,
              isMain: equipmentType.includes('MAIN'),
              mainId,
              description,
              warrantyStartDate,
              warrantyEndDate
            },
            { cancelToken: cancelTokenSource.token }
          );
          handleSnackbar('success', 'Successfuly update equipment');
          fetchData();
        }
        handleClose();
      } else {
        if (isAddSub) {
          const updatedEquipment = equipment!;
          const { id } = updatedEquipment;
          const response = await axios.post(
            SUBEQUIPMENT_BASE_URL,
            { SubEquipments: subEquipments, mainId: id },
            { cancelToken: cancelTokenSource.token }
          );

          const newSubEquipments = response.data.SubEquipments;
          const currentSubEquipments = newSubEquipments ? newSubEquipments : [];

          updatedEquipment.address = address;
          updatedEquipment.displayName = displayName;
          updatedEquipment.SubEquipments = currentSubEquipments;

          updatedIndividualEquipment(updatedEquipment);
          handleSnackbar('success', 'Successfuly add sub equipment');
        } else {
          const response = await axios.post(
            EQUIPMENT_BASE_URL,
            {
              brand,
              model,
              serialNumber,
              location,
              dateWorkDone: null,
              serviceAddressId,
              description,
              warrantyStartDate,
              warrantyEndDate,
              SubEquipments: subEquipments
            },
            { cancelToken: cancelTokenSource.token }
          );

          const newEquipment = response.data;
          newEquipment.address = address;
          newEquipment.displayName = displayName;
          addNewEquipment(newEquipment);
          handleSnackbar('success', 'Successfuly add equipment');
        }
        CreateLogEvent('create_equipment', currentUser!);
        handleClose();
      }
      setIsLoading(false);
    } catch (err) {
      console.log('err', err);
      const error = err as any;
      const { errorCode } = error.data;

      if (errorCode === 37) {
        handleSnackbar('error', 'Serial Number is duplicated');
      } else {
        handleSnackbar('error', isEdit ? 'Failed to edit equipment' : 'Failed to add equipment');
      }
      setIsLoading(false);
    }
  };

  const renderServiceAddresses = () => {
    // eslint-disable-next-line array-callback-return
    return serviceAddressMaster.map(serviceAddress => {
      if (serviceAddress.id !== 0)
        return (
          <MenuItem key={serviceAddress.id} value={serviceAddress.id}>
            {ucWords(serviceAddress.name)}
          </MenuItem>
        );
    });
  };

  const renderSubEquipment = () => {
    return (
      <Grid item xs={12} md={12}>
        <Card variant='outlined' className={classes.card}>
          <CardHeader title={<Typography variant='subtitle2'>Sub Equipments</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
          <CardContent>
            {subEquipments && subEquipments.length > 0 ? (
              subEquipments.map((value, index) => (
                <>
                  {index !== 0 && <Divider style={{ marginTop: 16, marginBottom: 16 }} />}
                  <Grid container>
                    <Grid item xs={12} md={3}>
                      <Typography variant='h6'>Sub Equipment {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            required
                            margin='dense'
                            id={`description-sub${index}`}
                            label='Name/Description'
                            value={subEquipments[index].description}
                            onChange={event => handleChangeSubEquipment('description', event.target.value, index)}
                            onBlur={event => handleOnBlur('description', event.target.value, index + 1)}
                            variant='outlined'
                            autoComplete='off'
                            multiline
                            rows={3}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Autocomplete
                            id='brand'
                            options={brandMaster}
                            getOptionLabel={option => option.name}
                            inputValue={value.brand ? value.brand : ''}
                            onInputChange={(_event, value) => handleFreeTextSubEquipmentBrand(value ? value : '', index)}
                            onChange={(_event: any, value: BrandTemplateModel | any) => handleChangeSubEquipment('brand', value, index)}
                            autoHighlight
                            freeSolo
                            renderInput={params => (
                              <TextField
                                {...params}
                                required
                                margin='dense'
                                id={`brand-sub${index}`}
                                label='Brand Name'
                                variant='outlined'
                                value={subEquipmentBrandValue[index]}
                                error={errorMessage[index + 1].brand !== ''}
                                helperText={errorMessage[index + 1].brand}
                                onBlur={event => handleOnBlur('brand', event.target.value, index + 1)}
                                inputProps={{
                                  ...params.inputProps,
                                  onKeyDown: e => {
                                    if (e.key === 'Enter') {
                                      e.stopPropagation();
                                    }
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            required
                            margin='dense'
                            id={`model-sub${index}`}
                            label='Model'
                            value={subEquipments[index].model}
                            onChange={event => handleChangeSubEquipment('model', event.target.value.toUpperCase(), index)}
                            error={errorMessage[index + 1].model !== ''}
                            helperText={errorMessage[index + 1].model}
                            onBlur={event => handleOnBlur('model', event.target.value, index + 1)}
                            variant='outlined'
                            autoComplete='off'
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            required
                            margin='dense'
                            id={`serialnumber-sub${index}`}
                            label='Serial Number'
                            value={subEquipments[index].serialNumber}
                            onChange={event => handleChangeSubEquipment('serialNumber', event.target.value, index)}
                            error={errorMessage[index + 1].serialNumber !== ''}
                            helperText={errorMessage[index + 1].serialNumber}
                            onBlur={event => handleOnBlur('serialNumber', event.target.value, index + 1)}
                            variant='outlined'
                            autoComplete='off'
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            margin='dense'
                            id={`location-sub${index}`}
                            label='Location'
                            value={subEquipments[index].location}
                            onChange={event => handleChangeSubEquipment('location', event.target.value, index)}
                            variant='outlined'
                            autoComplete='off'
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              fullWidth
                              clearable
                              id={`warrantyStartDate-sub${index}`}
                              label='Warranty Start Date'
                              margin='dense'
                              value={subEquipments[index].warrantyStartDate || null}
                              variant='dialog'
                              inputVariant='outlined'
                              format='dd-MM-yyyy'
                              placeholder='dd-MM-yyyy'
                              onChange={date => handleChangeSubEquipment('warrantyStartDate', date, index)}
                              // onBlur={event => handleOnBlur('warrantyStartDate', event.target.value, index + 1)}
                              error={errorMessage[index + 1].warrantyStartDate !== ''}
                              helperText={errorMessage[index + 1].warrantyStartDate}
                              InputAdornmentProps={{ position: 'start' }}
                              InputProps={{
                                endAdornment: subEquipments[index].warrantyStartDate && (
                                  <IconButton size='small' onClick={() => handleChangeSubEquipment('warrantyStartDate', null, index)}>
                                    <ClearIcon fontSize='small' />
                                  </IconButton>
                                )
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                        <Grid item xs={6}>
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                              fullWidth
                              clearable
                              id={`warrantyEndDate-sub${index}`}
                              label='Warranty End Date'
                              margin='dense'
                              value={subEquipments[index].warrantyEndDate || null}
                              variant='dialog'
                              inputVariant='outlined'
                              format='dd-MM-yyyy'
                              placeholder='dd-MM-yyyy'
                              minDate={subEquipments[index].warrantyStartDate || undefined}
                              onChange={date => handleChangeSubEquipment('warrantyEndDate', date, index)}
                              // onBlur={event => handleOnBlur('warrantyEndDate', event.target.value, index + 1)}
                              error={errorMessage[index + 1].warrantyEndDate !== ''}
                              helperText={errorMessage[index + 1].warrantyEndDate}
                              InputAdornmentProps={{ position: 'start' }}
                              InputProps={{
                                endAdornment: subEquipments[index].warrantyEndDate && (
                                  <IconButton size='small' onClick={() => handleChangeSubEquipment('warrantyEndDate', null, index)}>
                                    <ClearIcon fontSize='small' />
                                  </IconButton>
                                )
                              }}
                            />
                          </MuiPickersUtilsProvider>
                        </Grid>
                      </Grid>
                      <Grid container style={{ marginTop: 8 }}>
                        <Grid item xs={6}>
                          <Button onClick={() => handleRemoveSubEquipment(index)} className={classes.redColor}>
                            <DeleteIcon />
                            Remove Sub Equipment
                          </Button>
                        </Grid>
                        {index === subEquipments.length - 1 && (
                          <Grid item container justify='flex-end' xs={6}>
                            <Button color='primary' onClick={handleAddSubEquipment}>
                              <AddIcon />
                              More Sub Equipment
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              ))
            ) : (
              <Grid container spacing={2} justify='flex-end'>
                <Grid item>
                  <Button color='primary' onClick={handleAddSubEquipment}>
                    <AddIcon />
                    Add Sub Equipment
                  </Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderMainEquipment = () => {
    // eslint-disable-next-line array-callback-return
    return mainEquipmentMaster.map(value => {
      return (
        <MenuItem key={value.id} value={value.id}>
          {ucWords(`${value.brand} ${value.model}-${value.serialNumber} ${value.location ? `(${value.location})` : ''}`)}
        </MenuItem>
      );
    });
  };

  return (
    <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
      {isEdit ? (
        <Grid item xs={12}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={3}>
              <Typography variant='h6'>
                Equipment Type <span className={classes.required}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <Tooltip title={!isEditable ? 'Cannot change because there is sub equipment under this main equipment' : ''}>
                <span style={{ cursor: !isEditable ? 'not-allowed' : 'default' }}>
                  <FormControl component='fieldset'>
                    <RadioGroup
                      aria-label='equipmentType'
                      name='equipmentType'
                      value={equipmentType}
                      onChange={event => {
                        setEquipmentType(event.target.value);
                        if (event.target.value === 'MAIN') {
                          setMainId(0);
                        } else {
                          if (isMain) {
                            setMainId(mainEquipmentMaster[0].id);
                          } else {
                            setMainId(currentMainId);
                          }
                        }
                      }}
                      row
                    >
                      <FormControlLabel
                        value='MAIN'
                        control={<Radio color='primary' />}
                        label='Main Equipment'
                        labelPlacement='end'
                        disabled={!isEditable}
                      />
                      <FormControlLabel
                        value='SUB'
                        control={<Radio color='primary' />}
                        label='Sub Equipment'
                        labelPlacement='end'
                        disabled={!isEditable}
                      />
                    </RadioGroup>
                  </FormControl>
                </span>
              </Tooltip>
            </Grid>
            {equipmentType.includes('SUB') && (
              <>
                <Grid item xs={12} md={3}>
                  <Typography variant='h6'>
                    Main Equipment <span className={classes.required}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={9}>
                  <TextField
                    select
                    fullWidth
                    required
                    margin='dense'
                    id='mainEquipment'
                    label='Main Equipment'
                    value={mainId}
                    onChange={event => setMainId(Number(event.target.value))}
                    variant='outlined'
                    autoComplete='off'
                    InputLabelProps={{
                      shrink: mainId === 0 ? false : true
                    }}
                  >
                    {renderMainEquipment()}
                  </TextField>
                </Grid>
              </>
            )}
            <Grid item xs={12} md={3}>
              <Typography variant='h6'>Name/Description</Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                margin='dense'
                id='description'
                label='Name/Description'
                value={description}
                onChange={event => setDescription(event.target.value)}
                variant='outlined'
                autoComplete='off'
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant='h6'>
                Brand Name <span className={classes.required}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <Autocomplete
                id='brand'
                options={brandMaster}
                getOptionLabel={option => option.name}
                inputValue={brand ? brand : ''}
                onInputChange={(_event, value) => handleFreeText(value ? value : '')}
                onChange={(_event: any, value: BrandTemplateModel | any) => handleChangeBrand(value)}
                autoHighlight
                freeSolo
                renderInput={params => (
                  <TextField
                    {...params}
                    required
                    margin='dense'
                    id='brand'
                    label='Brand Name'
                    variant='outlined'
                    value={brandValue}
                    error={errorMessage[0].brand !== ''}
                    helperText={errorMessage[0].brand}
                    onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                    inputProps={{
                      ...params.inputProps,
                      onKeyDown: e => {
                        if (e.key === 'Enter') {
                          e.stopPropagation();
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant='h6'>
                Model & Serial Number <span className={classes.required}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                margin='dense'
                id='model'
                label='Model'
                value={model}
                onChange={event => setModel(event.target.value.toUpperCase())}
                error={errorMessage[0].model !== ''}
                helperText={errorMessage[0].model}
                onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                variant='outlined'
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                required
                margin='dense'
                id='serialNumber'
                label='Serial Number'
                value={serialNumber}
                onChange={event => handleChangeSerialNumber(event.target.value)}
                error={errorMessage[0].serialNumber !== ''}
                helperText={errorMessage[0].serialNumber}
                onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                variant='outlined'
                autoComplete='off'
              />
            </Grid>
            {equipmentType.includes('MAIN') && (
              <>
                <Grid item xs={12} md={3}>
                  <Typography variant='h6'>
                    Service Address <span className={classes.required}>*</span>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={9}>
                  <TextField
                    select
                    fullWidth
                    required
                    margin='dense'
                    id='serviceAddress'
                    label='Service Address'
                    error={serviceAddressError !== ''}
                    helperText={serviceAddressError}
                    value={serviceAddressId}
                    onChange={event => handleServiceAddressChange(Number(event.target.value))}
                    onBlur={event => handleOnBlurServiceAddress(event.target.value)}
                    variant='outlined'
                    autoComplete='off'
                    InputLabelProps={{
                      shrink: serviceAddressId === 0 ? false : true
                    }}
                  >
                    {renderServiceAddresses()}
                  </TextField>
                </Grid>
              </>
            )}
            <Grid item xs={12} md={3}>
              <Typography variant='h6'>Location</Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <TextField
                fullWidth
                margin='dense'
                id='location'
                label='Location'
                value={location}
                onChange={event => setLocation(event.target.value)}
                variant='outlined'
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant='h6'>Warranty Date</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  fullWidth
                  clearable
                  id='warrantyStartDate'
                  label='Warranty Start Date'
                  margin='dense'
                  value={warrantyStartDate || null}
                  variant='dialog'
                  inputVariant='outlined'
                  format='dd-MM-yyyy'
                  placeholder='dd-MM-yyyy'
                  onChange={date => {
                    const updatedErrors = [...errorMessage];
                    if (!date) {
                      setWarrantyStartDate(null);
                      updatedErrors[0].warrantyStartDate = '';
                      return;
                    }

                    if (isValid(date)) {
                      const endDate = warrantyEndDate ? new Date(warrantyEndDate) : null;

                      // If end date is before the new start date, update end date to match
                      if (endDate && differenceInCalendarDays(endDate, date) < 0) {
                        setWarrantyEndDate(date);
                      }

                      setWarrantyStartDate(date);
                      updatedErrors[0].warrantyStartDate = '';
                    } else {
                      updatedErrors[0].warrantyStartDate = 'Invalid Format Date';
                    }
                    setErrorMessage(updatedErrors);
                  }}
                  onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                  error={errorMessage[0].warrantyStartDate !== ''}
                  helperText={errorMessage[0].warrantyStartDate}
                  InputAdornmentProps={{ position: 'start' }}
                  InputProps={{
                    endAdornment: warrantyStartDate && (
                      <IconButton size='small' onClick={() => setWarrantyStartDate(null)}>
                        <ClearIcon fontSize='small' />
                      </IconButton>
                    )
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
            <Grid item xs={12} md={5}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  fullWidth
                  clearable
                  id='warrantyEndDate'
                  label='Warranty End Date'
                  margin='dense'
                  value={warrantyEndDate || null}
                  variant='dialog'
                  inputVariant='outlined'
                  format='dd-MM-yyyy'
                  placeholder='dd-MM-yyyy'
                  minDate={warrantyStartDate || undefined}
                  onChange={date => {
                    const updatedErrors = [...errorMessage];
                    if (!date) {
                      setWarrantyStartDate(null);
                      updatedErrors[0].warrantyStartDate = '';
                      return;
                    }

                    if (isValid(date)) {
                      const endDate = warrantyEndDate ? new Date(warrantyEndDate) : null;

                      // If end date is before the new start date, update end date to match
                      if (endDate && differenceInCalendarDays(endDate, date) < 0) {
                        setWarrantyEndDate(date);
                      }

                      setWarrantyStartDate(date);
                      updatedErrors[0].warrantyStartDate = '';
                    } else {
                      updatedErrors[0].warrantyStartDate = 'Invalid Format Date';
                    }
                    setErrorMessage(updatedErrors);
                  }}
                  onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                  error={errorMessage[0].warrantyEndDate !== ''}
                  helperText={errorMessage[0].warrantyEndDate}
                  InputAdornmentProps={{ position: 'start' }}
                  InputProps={{
                    endAdornment: warrantyEndDate && (
                      <IconButton size='small' onClick={() => setWarrantyEndDate(null)}>
                        <ClearIcon fontSize='small' />
                      </IconButton>
                    )
                  }}
                />
              </MuiPickersUtilsProvider>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <>
          {isAddSub ? (
            <Grid item xs={12}>
              <Card variant='outlined' className={classes.card}>
                <CardHeader
                  title={
                    <Grid container spacing={1} alignItems='center'>
                      <Grid item xs={8}>
                        <Typography variant='h5'>{brand}</Typography>
                      </Grid>
                      <Grid item container justify='flex-end' xs={4}>
                        <Chip
                          key={'main'}
                          label={'Main Equipment'}
                          className={classes.chip}
                          style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant='body1'>{address}</Typography>
                      </Grid>
                      <Grid item xs={12} style={{ marginTop: theme.spacing(0.5) }}>
                        <Grid container spacing={2} alignItems='center'>
                          <Grid item>
                            <Typography variant='body1' color='textSecondary'>
                              Model: {model}
                            </Typography>
                          </Grid>
                          <Divider orientation='vertical' flexItem />
                          <Grid item>
                            <Typography variant='body1' color='textSecondary'>
                              Serial No.: {serialNumber}
                            </Typography>
                          </Grid>
                          <Divider orientation='vertical' flexItem />
                          <Grid item>
                            <Typography variant='body1' color='textSecondary'>
                              Location.: {location || '-'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  }
                />
              </Card>
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Card variant='outlined' className={classes.card}>
                <CardHeader
                  title={<Typography variant='subtitle2'> Main Equipments</Typography>}
                  style={{ backgroundColor: grey[200], height: 35 }}
                />
                <CardContent>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={12} md={3}>
                      <Typography variant='h6'>Name/Description</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <TextField
                        fullWidth
                        margin='dense'
                        id='description'
                        label='Name/Description'
                        value={description}
                        onChange={event => setDescription(event.target.value)}
                        variant='outlined'
                        autoComplete='off'
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='h6'>
                        Brand Name <span className={classes.required}>*</span>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Autocomplete
                        id='brand'
                        options={brandMaster}
                        getOptionLabel={option => option.name}
                        inputValue={brand ? brand : ''}
                        onInputChange={(_event, value) => handleFreeText(value ? value : '')}
                        onChange={(_event: any, value: BrandTemplateModel | any) => handleChangeBrand(value)}
                        autoHighlight
                        freeSolo
                        renderInput={params => (
                          <TextField
                            {...params}
                            required
                            margin='dense'
                            id='brand'
                            label='Brand Name'
                            variant='outlined'
                            value={brandValue}
                            error={errorMessage[0].brand !== ''}
                            helperText={errorMessage[0].brand}
                            onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                            inputProps={{
                              ...params.inputProps,
                              onKeyDown: e => {
                                if (e.key === 'Enter') {
                                  e.stopPropagation();
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='h6'>
                        Model & Serial Number <span className={classes.required}>*</span>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        required
                        margin='dense'
                        id='model'
                        label='Model'
                        value={model}
                        onChange={event => setModel(event.target.value.toUpperCase())}
                        error={errorMessage[0].model !== ''}
                        helperText={errorMessage[0].model}
                        onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                        variant='outlined'
                        autoComplete='off'
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        required
                        margin='dense'
                        id='serialNumber'
                        label='Serial Number'
                        value={serialNumber}
                        onChange={event => handleChangeSerialNumber(event.target.value)}
                        error={errorMessage[0].serialNumber !== ''}
                        helperText={errorMessage[0].serialNumber}
                        onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                        variant='outlined'
                        autoComplete='off'
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='h6'>
                        Service Address <span className={classes.required}>*</span>
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <TextField
                        select
                        fullWidth
                        required
                        margin='dense'
                        id='serviceAddress'
                        label='Service Address'
                        error={serviceAddressError !== ''}
                        helperText={serviceAddressError}
                        value={serviceAddressId}
                        onChange={event => handleServiceAddressChange(Number(event.target.value))}
                        onBlur={event => handleOnBlurServiceAddress(event.target.value)}
                        variant='outlined'
                        autoComplete='off'
                        InputLabelProps={{
                          shrink: serviceAddressId === 0 ? false : true
                        }}
                      >
                        {renderServiceAddresses()}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='h6'>Location</Typography>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <TextField
                        fullWidth
                        margin='dense'
                        id='location'
                        label='Location'
                        value={location}
                        onChange={event => setLocation(event.target.value)}
                        variant='outlined'
                        autoComplete='off'
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant='h6'>Warranty Date</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          clearable
                          id='warrantyStartDate'
                          label='Warranty Start Date'
                          margin='dense'
                          value={warrantyStartDate || null}
                          variant='dialog'
                          inputVariant='outlined'
                          format='dd-MM-yyyy'
                          placeholder='dd-MM-yyyy'
                          onChange={date => {
                            const updatedErrors = [...errorMessage];
                            if (!date) {
                              setWarrantyStartDate(null);
                              updatedErrors[0].warrantyStartDate = '';
                              return;
                            }

                            if (isValid(date)) {
                              const endDate = warrantyEndDate ? new Date(warrantyEndDate) : null;

                              // If end date is before the new start date, update end date to match
                              if (endDate && differenceInCalendarDays(endDate, date) < 0) {
                                setWarrantyEndDate(date);
                              }

                              setWarrantyStartDate(date);
                              updatedErrors[0].warrantyStartDate = '';
                            } else {
                              updatedErrors[0].warrantyStartDate = 'Invalid Format Date';
                            }
                            setErrorMessage(updatedErrors);
                          }}
                          onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                          error={errorMessage[0].warrantyStartDate !== ''}
                          helperText={errorMessage[0].warrantyStartDate}
                          InputAdornmentProps={{ position: 'start' }}
                          InputProps={{
                            endAdornment: warrantyStartDate && (
                              <IconButton size='small' onClick={() => setWarrantyStartDate(null)}>
                                <ClearIcon fontSize='small' />
                              </IconButton>
                            )
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                          fullWidth
                          clearable
                          id='warrantyEndDate'
                          label='Warranty End Date'
                          margin='dense'
                          value={warrantyEndDate || null}
                          variant='dialog'
                          inputVariant='outlined'
                          format='dd-MM-yyyy'
                          placeholder='dd-MM-yyyy'
                          minDate={warrantyStartDate || undefined}
                          onChange={date => {
                            const updatedErrors = [...errorMessage];

                            if (!date) {
                              setWarrantyEndDate(null);
                              updatedErrors[0].warrantyEndDate = '';
                              return;
                            }

                            if (isValid(date)) {
                              const startDate = warrantyStartDate ? new Date(warrantyStartDate) : null;

                              if (startDate && date && differenceInCalendarDays(date, startDate) < 0) {
                                updatedErrors[0].warrantyEndDate = 'Cannot be earlier than start date';
                              } else {
                                setWarrantyEndDate(date);
                                updatedErrors[0].warrantyEndDate = '';
                              }
                            } else {
                              updatedErrors[0].warrantyEndDate = 'Invalid Format Date';
                            }

                            setErrorMessage(updatedErrors);
                          }}
                          onBlur={event => handleOnBlur(event.target.id, event.target.value, 0)}
                          error={errorMessage[0].warrantyEndDate !== ''}
                          helperText={errorMessage[0].warrantyEndDate}
                          InputAdornmentProps={{ position: 'start' }}
                          InputProps={{
                            endAdornment: warrantyEndDate && (
                              <IconButton size='small' onClick={() => setWarrantyEndDate(null)}>
                                <ClearIcon fontSize='small' />
                              </IconButton>
                            )
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
          {renderSubEquipment()}
        </>
      )}

      <Grid item container xs={12} md={12} justify='flex-end'>
        <DialogActions>
          <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
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

export default EquipmentForm;
