import { FC, useEffect, useState } from 'react';
import {
  Grid,
  Theme,
  Typography,
  Button,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  DialogActions,
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';

import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import axios, { CancelTokenSource } from 'axios';
import HeaderRow from 'components/HeaderRow';
import BodyRow from '../JobServiceItemContent/components/BodyRow';
import NumberFormat from 'react-number-format';
import ServiceItemModal from './components/ServiceItemModal';
import { dummyServiceItem } from 'constants/dummy';
import {
  ADDITIONAL_SERVICE_URL,
  GET_EDIT_ADDITIONAL_SERVICE_URL,
  GET_EDIT_JOB_SERVICE_ITEM_URL,
  GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL,
  SERVICE_ITEM_TEMPLATE_BASE_URL
} from 'constants/url';
import CustomizedDialog from 'components/CustomizedDialog';
import theme from 'theme';
import NumberFormatCustom from 'components/NumberFormatCustom';

interface Props {
  job: JobDetailModel;
  serviceItems: ServiceItemModel[];
  additionalServiceItems: ServiceItemModel[];
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  fetchData(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  contentGrid: {
    padding: theme.spacing(2),
    maxHeight: 580,
    overflow: 'auto'
  },
  card: {
    borderRadius: 10
  },
  noneBorder: {
    borderStyle: 'none'
  },
  radioButton: {
    padding: theme.spacing(1),
    margin: '8px 0',
    border: '1px solid',
    borderRadius: 10
  },
  discountField: {
    textAlign: 'right',
    width: 50,
    padding: 8
  }
}));

const ServiceItemForm: FC<Props> = props => {
  const classes = useStyles();
  const { job, serviceItems, additionalServiceItems, handleClose, handleSnackbar, fetchData } = props;
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const { serviceAddressId, needGST, gstTax, jobDiscountAmount, additionalServiceId, additionalGstTax } = job;
  const [serviceItemMaster, setServiceItemMaster] = useState<ServiceItemModel[]>([]);
  const [equipmentMaster, setEquipmentMaster] = useState<EquipmentModel[]>([]);

  const isHaveAdditional = additionalServiceId && additionalServiceId > 0 ? true : false;
  const [currentServiceItems, setCurrentServiceItems] = useState<ServiceItemModel[]>([]);
  const [currentAdditonalServiceItems, setCurrentAdditonalServiceItems] = useState<ServiceItemModel[]>([]);
  const [jobAmount, setJobAmount] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [additionalJobAmount, setAdditionalJobAmount] = useState<number>(0);
  const [additionalGst, setAdditionalGst] = useState<number>(0);
  const [additionalDiscountAmount, setAdditionalDiscountAmount] = useState<number>(0);
  const [additionalGstAmount, setAdditionalGstAmout] = useState<number>(0);
  const [additionalTotalAmount, setAdditionalTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openItemModal, setOpenItemModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [type, setType] = useState<string>('original');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [openSelectType, setOpenSelectType] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('original');

  useEffect(() => {
    if (job) {
      const {
        jobAmount,
        gstAmount,
        totalAmount,
        additionalJobAmount,
        additionalGstAmount,
        additionalDiscountAmount,
        additionalTotalAmount,
        defaultGst
      } = job;
      setJobAmount(jobAmount);
      setGstAmount(gstAmount);
      setTotalAmount(totalAmount);
      setAdditionalJobAmount(additionalJobAmount);
      setAdditionalGst(isHaveAdditional ? additionalGstTax : defaultGst);
      setAdditionalGstAmout(additionalGstAmount);
      setAdditionalDiscountAmount(additionalDiscountAmount);
      setAdditionalTotalAmount(additionalTotalAmount);
      setCurrentServiceItems(
        serviceItems.map(value => {
          return { ...value };
        })
      );

      if (additionalServiceItems) {
        setCurrentAdditonalServiceItems(
          additionalServiceItems.map(value => {
            return { ...value };
          })
        );
      }
    }

    const getServiceItemTemplate = async () => {
      //Set service item master
      const { data } = await axios.get(`${SERVICE_ITEM_TEMPLATE_BASE_URL}`, { cancelToken: cancelTokenSource.token });

      let serviceItemData: ServiceItemModel[] = [];
      data.serviceItemTemplates.map((value: any) => {
        return serviceItemData.push({
          ...value,
          totalPrice: 0,
          isDeleted: false
        });
      });
      setServiceItemMaster(serviceItemData);
    };

    const getEquipmentsTemplate = async () => {
      const { data } = await axios.get(`${GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL(serviceAddressId)}`, {
        cancelToken: cancelTokenSource.token
      });

      let equipmentData: EquipmentModel[] = [];
      if (data.equipments.length > 0) {
        equipmentData = data.equipments;
      }
      equipmentData = equipmentData.sort((a, b) => a.brand.localeCompare(b.brand));

      setEquipmentMaster(equipmentData);
    };

    getServiceItemTemplate();
    getEquipmentsTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditAction = (index: number, type: string) => {
    setIsEdit(true);
    setOpenItemModal(true);
    setSelectedIndex(index);
    setType(type);
  };

  const handleDeleteAction = (index: number, type: string) => {
    if (type === 'original') {
      const serviceItems = [...currentServiceItems];
      serviceItems.splice(index, 1);
      setCurrentServiceItems(serviceItems);
    } else {
      const additionalItems = [...currentAdditonalServiceItems];
      additionalItems.splice(index, 1);
      setCurrentAdditonalServiceItems(additionalItems);
    }
  };

  const renderServiceItems = () => {
    return currentServiceItems.map((value, index) => (
      <BodyRow
        key={index}
        index={index}
        item={value}
        actionButton
        handleEditAction={() => handleEditAction(index, 'original')}
        handleDeleteAction={() => handleDeleteAction(index, 'original')}
      />
    ));
  };

  const renderAdditonalServiceItems = () => {
    return currentAdditonalServiceItems.map((value, index) => (
      <BodyRow
        key={index}
        index={index}
        item={value}
        actionButton
        handleEditAction={() => handleEditAction(index, 'additional')}
        handleDeleteAction={() => handleDeleteAction(index, 'additional')}
      />
    ));
  };

  const renderFooter = (title: string, value: any) => {
    return (
      <>
        <Grid item container justify='flex-end' xs={11}>
          <Typography variant='body1'>{title}</Typography>
        </Grid>
        <Grid item container justify='flex-end' xs={1}>
          <Typography variant='body1'>
            <NumberFormat value={value || 0} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
          </Typography>
        </Grid>
      </>
    );
  };

  const handleSubmitModal = (item: ServiceItemModel) => {
    if (item.name) {
      if (type === 'original') {
        const currentItems = currentServiceItems;
        let gstAmount = 0;
        let totalAmount = 0;

        if (isEdit) {
          const findSameIndex = currentItems.findIndex(
            value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim()
          );

          if (findSameIndex === selectedIndex) {
            currentItems[selectedIndex] = item;
          } else {
            const findSame = currentItems.some(
              value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim()
            );
            if (!findSame) {
              currentItems[selectedIndex] = item;
            } else {
              handleSnackbar('error', 'This item is already added');
              return;
            }
          }
        } else {
          const findSame = currentItems.some(
            value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim()
          );

          if (!findSame) {
            const serviceId = currentItems[0].serviceId;
            const scheduleId = currentItems[0].scheduleId;
            currentItems.push({ ...item, isNew: true, serviceId, scheduleId });
          } else {
            handleSnackbar('error', 'This item is already added');
            return;
          }
        }
        const jobAmount = currentItems.reduce((accumulator, value) => {
          return accumulator + value.totalPrice;
        }, 0);

        totalAmount = Number((jobAmount - jobDiscountAmount).toFixed(2));

        if (needGST) {
          gstAmount = Number(((totalAmount * gstTax) / 100).toFixed(2));
          totalAmount = Number((totalAmount + gstAmount).toFixed(2));
        }

        setJobAmount(jobAmount);
        setGstAmount(gstAmount);
        setTotalAmount(totalAmount);
        setCurrentServiceItems(currentItems);
      } else {
        const currentItems = currentAdditonalServiceItems;
        let additionalGstAmount = 0;
        let additionalTotalAmount = 0;

        if (isEdit) {
          const findSameIndex = currentItems.findIndex(
            value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim()
          );
          if (findSameIndex === selectedIndex) {
            currentItems[selectedIndex] = item;
          } else {
            const findSame = currentItems.some(
              value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim()
            );
            if (!findSame) {
              currentItems[selectedIndex] = item;
            } else {
              handleSnackbar('error', 'This item is already added');
              return;
            }
          }
        } else {
          const findSame = currentItems.some(
            value => value.name.trim() === item.name.trim() && value.description.trim() === item.description.trim()
          );
          if (!findSame) {
            currentItems.push({ ...item, isNew: true });
          } else {
            handleSnackbar('error', 'This item is already added');
            return;
          }
        }
        const additionalJobAmount = currentItems.reduce((accumulator, value) => {
          return accumulator + value.totalPrice;
        }, 0);

        additionalTotalAmount = Number((additionalJobAmount - additionalDiscountAmount).toFixed(2));

        if (needGST) {
          additionalGstAmount = Number(((additionalTotalAmount * additionalGst) / 100).toFixed(2));
          additionalTotalAmount = Number((additionalTotalAmount + additionalGstAmount).toFixed(2));
        }

        setAdditionalJobAmount(additionalJobAmount);
        setAdditionalGstAmout(additionalGstAmount);
        setAdditionalTotalAmount(additionalTotalAmount);
        setCurrentAdditonalServiceItems(currentItems);
      }
      setOpenItemModal(false);
    } else {
      handleSnackbar('error', 'Please input item');
      return;
    }
  };

  const handleChangeAdditionalDiscount = (value: number) => {
    let totalDiscountAmount = additionalDiscountAmount;
    let totalGstAmount = additionalGstAmount;
    let grandTotal = additionalTotalAmount;

    totalDiscountAmount = value > additionalJobAmount ? additionalJobAmount : value;
    grandTotal = Number((additionalJobAmount - totalDiscountAmount).toFixed(2));

    if (needGST) {
      totalGstAmount = Number(((grandTotal * additionalGst) / 100).toFixed(2));
      grandTotal = grandTotal + totalGstAmount;
    }
    setAdditionalDiscountAmount(Number(totalDiscountAmount.toFixed(2)));
    setAdditionalGstAmout(totalGstAmount);
    setAdditionalTotalAmount(grandTotal);
  };

  const handleSubmit = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    setIsLoading(true);

    try {
      await axios.put(`${GET_EDIT_JOB_SERVICE_ITEM_URL(job.jobId)}`, { ServiceItems: currentServiceItems }, { cancelToken: cancelTokenSource.token });

      if (currentAdditonalServiceItems.length > 0) {
        if (isHaveAdditional) {
          await axios.put(
            `${GET_EDIT_ADDITIONAL_SERVICE_URL(additionalServiceId)}`,
            {
              discountAmount: additionalDiscountAmount,
              originalAmount: additionalJobAmount,
              gstAmount: additionalGstAmount,
              totalAmount: additionalTotalAmount,
              ServiceItems: currentAdditonalServiceItems
            },
            { cancelToken: cancelTokenSource.token }
          );
        } else {
          await axios.post(
            `${ADDITIONAL_SERVICE_URL}`,
            {
              ServiceItems: currentAdditonalServiceItems,
              discountAmount: additionalDiscountAmount,
              jobId: job.jobId
            },
            { cancelToken: cancelTokenSource.token }
          );
        }
      }

      fetchData();
      setIsLoading(false);
      handleSnackbar('success', 'Successfully edit service item');
      handleClose();
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      handleSnackbar('error', 'Failed edit service item');
    }
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
        <Grid item xs={12} sm={10}>
          <Typography variant='h4'>All Service Items</Typography>
        </Grid>
        <Grid item container justify='flex-end' xs={12} sm={2}>
          <Button
            color='primary'
            onClick={() => {
              setOpenSelectType(true);
              setIsEdit(false);
            }}
          >
            <AddIcon />
            Add Service Items
          </Button>
        </Grid>
        <Grid item xs={12} style={{ marginTop: 16 }}>
          <Typography variant='h5'>Current Quotation</Typography>
          <Typography variant='body1' color='textSecondary'>
            You can create new service items that only affected on this job under the contract
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Card variant='outlined' className={classes.card}>
            <CardContent style={{ padding: 0 }}>
              <Table component='table'>
                <TableHead>
                  <HeaderRow
                    headers={[
                      { label: '', verticalAlign: 'top' },
                      { label: 'Item & Description', verticalAlign: 'top' },
                      { label: 'Qty', verticalAlign: 'top' },
                      { label: 'Price', verticalAlign: 'top' },
                      { label: 'Amount', verticalAlign: 'top', textAlign: 'center' },
                      { label: 'Action', verticalAlign: 'top', textAlign: 'center' }
                    ]}
                  />
                </TableHead>
                <TableBody>
                  {renderServiceItems()}
                  <TableRow>
                    <TableCell colSpan={5} className={classes.noneBorder}>
                      <Grid container spacing={1}>
                        {renderFooter('Job Amount', jobAmount)}
                        {renderFooter('Discount', jobDiscountAmount)}
                        {renderFooter(`GST ${gstTax}%`, gstAmount)}
                        {renderFooter('Total Amount', totalAmount)}
                      </Grid>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        {currentAdditonalServiceItems && currentAdditonalServiceItems.length > 0 && (
          <>
            <Grid item xs={12} style={{ marginTop: 16 }}>
              <Typography variant='h5'>Separate Quotation</Typography>
              <Typography variant='body1' color='textSecondary'>
                When you add new additional items here, it will create a new ad-hoc quotation and new invoice
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Card variant='outlined' className={classes.card}>
                <CardContent style={{ padding: 0 }}>
                  <Table component='table'>
                    <TableHead>
                      <HeaderRow
                        headers={[
                          { label: '', verticalAlign: 'top' },
                          { label: 'Item & Description', verticalAlign: 'top' },
                          { label: 'Qty', verticalAlign: 'top' },
                          { label: 'Price', verticalAlign: 'top' },
                          { label: 'Amount', verticalAlign: 'top', textAlign: 'center' },
                          { label: 'Action', verticalAlign: 'top', textAlign: 'center' }
                        ]}
                      />
                    </TableHead>
                    <TableBody>
                      <>
                        {renderAdditonalServiceItems()}
                        <TableRow>
                          <TableCell colSpan={5} className={classes.noneBorder}>
                            <Grid container spacing={1}>
                              {renderFooter('Additonal Amount', additionalJobAmount)}
                              <Grid item container justify='flex-end' alignItems='center' xs={11}>
                                <Typography variant='body1'>Discount</Typography>
                              </Grid>
                              <Grid item container justify='flex-end' xs={1}>
                                <TextField
                                  variant='outlined'
                                  margin='dense'
                                  id='discountAmount'
                                  value={additionalDiscountAmount}
                                  onChange={event => handleChangeAdditionalDiscount(Number(event.target.value))}
                                  InputProps={{
                                    classes: {
                                      input: classes.discountField
                                    },
                                    inputComponent: NumberFormatCustom as any,
                                    inputProps: {
                                      prefix: '$',
                                      thousandSeparator: true,
                                      decimalScale: 2,
                                      fixedDecimalScale: true,
                                      allowNegative: false
                                    }
                                  }}
                                />
                              </Grid>
                              {renderFooter(`GST ${additionalGst}%`, additionalGstAmount)}
                              {renderFooter('Total Additional Amount', additionalTotalAmount)}
                            </Grid>
                          </TableCell>
                        </TableRow>
                      </>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        {openSelectType && (
          <CustomizedDialog
            isLoading={isLoading}
            open={openSelectType}
            isConfirmation={true}
            variant='warning'
            title='Add New Service Items'
            message=''
            secondMessage='Please specify the addition of service items you did just now'
            primaryButtonLabel='Confirm'
            secondaryButtonLabel='Cancel'
            primaryActionButton={() => {
              setType(selectedType);
              setOpenItemModal(true);
              setOpenSelectType(false);
            }}
            secondaryActionButton={() => setOpenSelectType(false)}
            handleClose={() => setOpenSelectType(false)}
          >
            <FormControl component='fieldset' style={{ margin: '16px 0' }}>
              <RadioGroup aria-label='contractType' name='contractType' value={selectedType} onChange={event => setSelectedType(event.target.value)}>
                <FormControlLabel
                  value={'original'}
                  control={<Radio color='primary' />}
                  label={
                    <>
                      <Typography variant='subtitle1'>Current Quotation</Typography>
                      <FormHelperText>You can add new service items that only affected on this job under the quotation</FormHelperText>
                    </>
                  }
                  className={classes.radioButton}
                  style={{ borderColor: selectedType === 'original' ? theme.palette.primary.main : theme.palette.grey[500] }}
                />
                <FormControlLabel
                  value={'additional'}
                  control={<Radio color='primary' />}
                  label={
                    <>
                      <Typography variant='subtitle1'>Separate Quotation</Typography>
                      <FormHelperText>You can add new service items that affecting to create a new separate quotation and new invoice</FormHelperText>
                    </>
                  }
                  className={classes.radioButton}
                  style={{ borderColor: selectedType === 'additional' ? theme.palette.primary.main : theme.palette.grey[500] }}
                />
              </RadioGroup>
            </FormControl>
          </CustomizedDialog>
        )}
        {openItemModal && (
          <ServiceItemModal
            open={openItemModal}
            serviceItemMaster={serviceItemMaster}
            equipmentMaster={equipmentMaster}
            serviceItem={
              isEdit ? (type === 'original' ? currentServiceItems[selectedIndex] : currentAdditonalServiceItems[selectedIndex]) : dummyServiceItem
            }
            isEdit={isEdit}
            handleSubmitModal={handleSubmitModal}
            handleClose={() => setOpenItemModal(false)}
          />
        )}
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} style={{ marginTop: 8 }} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' disableElevation disabled={isLoading} style={{ marginTop: 8 }} onClick={handleSubmit}>
          Save
          <LoadingButtonIndicator isLoading={isLoading} />
        </Button>
      </DialogActions>
    </>
  );
};

export default ServiceItemForm;
