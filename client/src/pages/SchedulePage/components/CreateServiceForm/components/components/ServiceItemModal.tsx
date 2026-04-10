import { FC, useState, useEffect } from 'react';

import {
  Button,
  IconButton,
  Theme,
  Grid,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Chip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import NumberFormatCustom from 'components/NumberFormatCustom';
import CloseIcon from '@material-ui/icons/Close';
import Autocomplete from '@material-ui/lab/Autocomplete';
import theme from 'theme';
import { dummyServiceItem } from 'constants/dummy';

interface Props {
  open: boolean;
  serviceItemMaster: ServiceItemModel[];
  equipmentMaster: EquipmentModel[];
  serviceItem: ServiceItemModel;
  isEdit: boolean;
  handleSubmitModal: (item: ServiceItemModel) => void;
  handleClose(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  },
  checkBoxIcon: {
    fontSize: '16px'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  }
}));

const ServiceItemModal: FC<Props> = props => {
  const classes = useStyles();
  const { open, serviceItem, serviceItemMaster, equipmentMaster, isEdit, handleSubmitModal, handleClose } = props;

  const [item, setItem] = useState<ServiceItemModel>(dummyServiceItem);
  const [equipmentError, setEquipmentError] = useState<string>('');

  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    if (!serviceItem) {
      return;
    }

    setItem(serviceItem);
  }, [serviceItem]);

  const handleFreeTextItemName = (value: any) => {
    setItem({ ...item, name: value });
    setNameError('');
  };

  const handleItemChange = (value: any) => {
    if (value) {
      setItem({ ...item, ...value, id: isEdit ? item.id : 0, quantity: item.quantity });
      setNameError('');
    }
  };

  const handleBlurItem = () => {
    if (!item.name || !item.name.trim()) {
      setNameError('Please enter item name');
      return;
    }
    setNameError('');
  };

  const handleEquipmentChange = (value: any) => {
    if (value) {
      setItem({ ...item, Equipments: value });
    }
    setEquipmentError('');
  };

  const handleSubmit = () => {
    handleSubmitModal({
      ...item,
      quantity: Number(item.quantity.toFixed(2)),
      unitPrice: Number(item.unitPrice.toFixed(2)),
      totalPrice: Number(item.totalPrice.toFixed(2))
    });
  };

  const handleInputResize = (event: any) => {
    // Automatically adjust the height of the textarea based on its content
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
    <Dialog open={open} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h5'>{`${isEdit ? 'Edit' : 'Add'} Service Item`}</Typography>
        <IconButton size='small' onClick={handleClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Autocomplete
              id='item-name'
              options={serviceItemMaster}
              getOptionLabel={option => option.name}
              inputValue={item.name}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') {
                  handleFreeTextItemName(value ? value : '');
                }
                if (reason === 'clear') {
                  setItem({ ...item, name: '', description: '', unitPrice: 0, quantity: 1 });
                }
              }}
              onChange={(_: any, value: ServiceItemModel | any) => handleItemChange(value)}
              onBlur={handleBlurItem}
              autoHighlight={true}
              freeSolo
              renderInput={params => (
                <TextField
                  {...params}
                  required
                  margin='dense'
                  label='Item Name'
                  variant='outlined'
                  value={item.name}
                  error={nameError !== ''}
                  helperText={nameError}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id='description'
              label='Description'
              margin='normal'
              value={item.description}
              multiline
              rows={5}
              onChange={event => setItem({ ...item, description: event.target.value })}
              variant='outlined'
              autoComplete='off'
              style={{ resize: 'none' }}
              onInput={handleInputResize}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin='dense'
              fullWidth
              id='item-price'
              label='Unit Price'
              value={item.unitPrice}
              variant='outlined'
              onChange={event => {
                setItem({
                  ...item,
                  unitPrice: Number(event.target.value),
                  totalPrice: Number(event.target.value) * item.quantity - (item.discountAmt || 0)
                });
              }}
              InputProps={{
                inputComponent: NumberFormatCustom as any,
                inputProps: {
                  prefix: '$',
                  thousandSeparator: true,
                  decimalScale: 2,
                  fixedDecimalScale: true
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              margin='dense'
              fullWidth
              id='item-quantity'
              label='Qty'
              value={item.quantity || ''}
              variant='outlined'
              onChange={event => {
                setItem({
                  ...item,
                  quantity: Number(event.target.value),
                  totalPrice: Number(event.target.value) * item.unitPrice - (item.discountAmt || 0)
                });
              }}
              onBlur={event => {
                if (Number(event.target.value) <= 0) {
                  setItem({
                    ...item,
                    quantity: 1,
                    totalPrice: 1 * item.unitPrice - (item.discountAmt || 0)
                  });
                } else {
                  setItem({
                    ...item,
                    quantity: Number(event.target.value),
                    totalPrice: Number(event.target.value) * item.unitPrice - (item.discountAmt || 0)
                  });
                }
              }}
              InputProps={{
                inputComponent: NumberFormatCustom as any,
                inputProps: {
                  thousandSeparator: true,
                  fixedDecimalScale: true
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin='dense'
              fullWidth
              id='item-total-price'
              label='Total Price'
              value={item.totalPrice}
              variant='outlined'
              disabled
              InputProps={{
                inputComponent: NumberFormatCustom as any,
                inputProps: {
                  prefix: '$',
                  thousandSeparator: true,
                  decimalScale: 2,
                  fixedDecimalScale: true
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              id='equipments'
              disableCloseOnSelect
              options={equipmentMaster}
              getOptionLabel={option => `${option.brand} ${option.model} - ${option.serialNumber} (${option.location ? option.location : '-'})`}
              value={item.Equipments}
              getOptionSelected={(option, value) => (value.id === option.id ? true : false)}
              onChange={(_: any, value: EquipmentModel | any) => handleEquipmentChange(value)}
              autoHighlight={true}
              fullWidth
              renderOption={(option, { selected }) => (
                <Grid container spacing={1}>
                  <Grid item xs={1} style={{ paddingLeft: !option.isMain ? theme.spacing(3) : theme.spacing(1.5) }}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxIcon} />}
                      checkedIcon={<CheckBoxIcon className={classes.checkBoxIcon} />}
                      color='primary'
                      disableRipple
                      className={classes.checkBox}
                      checked={selected}
                    />
                  </Grid>
                  <Grid item xs={11} container spacing={2} alignItems='center'>
                    <Grid item xs={7}>
                      <Typography variant='subtitle1'>
                        {option.brand}, {option.model}
                      </Typography>
                      <Typography variant='body1' color='textSecondary'>
                        {option.serialNumber}
                        {option.location ? `, ${option.location}` : ''}
                      </Typography>
                    </Grid>
                    <Grid item container justify='flex-end' xs={5}>
                      <Chip
                        label={option.isMain ? `Main Equipment ${option.index! + 1}` : `Sub Equipment ${option.index! + 1}`}
                        size='small'
                        style={{
                          color: option.isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                          backgroundColor: option.isMain ? theme.palette.primary.light : theme.palette.secondary.light
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.brand} ${option.model} - ${option.serialNumber} ${option.location ? `(${option.location})` : ''}`}
                    {...getTagProps({ index })}
                    style={{
                      color: option.isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                      backgroundColor: option.isMain ? theme.palette.primary.light : theme.palette.secondary.light
                    }}
                  />
                ))
              }
              renderInput={params => (
                <TextField
                  {...params}
                  margin='dense'
                  variant='outlined'
                  label='Equipment'
                  value={item.Equipments}
                  error={equipmentError !== ''}
                  helperText={equipmentError}
                />
              )}
            />
          </Grid>
        </Grid>
        <DialogActions style={{ marginTop: 16 }}>
          <Button variant='contained' disableElevation onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='contained' color='primary' disableElevation onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceItemModal;
