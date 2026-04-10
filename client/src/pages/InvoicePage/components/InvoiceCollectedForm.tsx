import React, { FC, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

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
  MenuItem
} from '@material-ui/core';
import { GET_EDIT_INVOICE_URL } from 'constants/url';
import { makeStyles } from '@material-ui/styles';

import NumberFormatCustom from 'components/NumberFormatCustom';
import CloseIcon from '@material-ui/icons/Close';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { PaymentMethod } from 'constants/enum';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';

interface Props {
  open: boolean;
  invoice?: InvoicesModel;
  updateIndividual: (updatedProperties: Partial<InvoicesModel>) => void;
  setIsEditCollected: React.Dispatch<React.SetStateAction<boolean>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  }
}));

const InvoiceCollectedForm: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);
  const { open, invoice, updateIndividual, setIsEditCollected, handleSnackbar } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [currenctCollected, setCurrenctCollected] = useState<number>(0);
  const [collected, setCollected] = useState<number>(0);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.CASH);
  const paymentMethodArray = Object.entries(PaymentMethod).map(([key, value]) => ({ key, value }));
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [chequeNumber, setChequeNumber] = useState<string>('');

  const resetFormValues = useCallback(() => {
    if (!invoice) {
      return;
    }

    const { invoiceAmount, collectedAmount } = invoice;
    setCurrenctCollected(collectedAmount || 0);
    setInvoiceAmount(invoiceAmount || 0);
  }, [invoice]);

  // resetFormValues will be modified everytime invoice changes, due to useCallback
  useEffect(() => {
    resetFormValues();
  }, [resetFormValues]);

  // This is to ensure that the form value and erors are reset/cleared when invoice canceled the editing
  const handleOnClose = () => {
    resetFormValues();
    setIsEditCollected(false);
  };

  const handleChangeCollectedAmount = (value: number) => {
    if (value < 0) {
      setCollected(0);
    } else {
      setCollected(value);
    }
  };

  const handleBlur = () => {
    const unpaidAmount = invoiceAmount - currenctCollected;
    if (collected + currenctCollected > invoiceAmount) {
      setCollected(unpaidAmount);
    }
  };

  const handleChangePaymentMethod = (value: string) => {
    if (value === 'Unpaid') {
      setOpenConfirmation(true);
    } else {
      setPaymentMethod(value);
      setChequeNumber('');
    }
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    setLoading(true);

    try {
      const collectedAmount = collected + currenctCollected > invoiceAmount ? invoiceAmount : collected;
      const invoiceStatus = paymentMethod === 'Unpaid' ? 'UNPAID' : collected + currenctCollected >= invoiceAmount ? 'FULLY PAID' : 'PARTIALLY PAID';

      await axios.put(`${GET_EDIT_INVOICE_URL(invoice!.id)}`, {
        invoiceNumber: invoice ? invoice.invoiceNumber : '',
        collectedAmount,
        invoiceStatus,
        paymentMethod: paymentMethod.toUpperCase(),
        chequeNumber,
        isUpdateCollectedAmount: true
      });
      updateIndividual({ ...invoice, collectedAmount: collectedAmount, invoiceStatus: invoiceStatus });
      CreateLogEvent('update_invoice_collected', currentUser!);
      handleSnackbar('success', 'Successfully update invoice collected');
      handleOnClose();
    } catch (err) {
      const error = err as any;
      const { errorCode } = error.data;

      if (errorCode === 42) {
        handleSnackbar('error', 'Invoice  Collected amount is more than Total Job Collected Amount');
      } else {
        handleSnackbar('error', 'Failed to update invoice collected');
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} fullWidth maxWidth='xs'>
      <DialogTitle>
        <Typography variant='h5'>Update Collected Amount</Typography>
        <IconButton size='small' onClick={handleOnClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <form noValidate onSubmit={handleOnSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin='dense'
                fullWidth
                id='invoiceAmount'
                label='Invoice Amount'
                value={invoiceAmount}
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
              <TextField
                margin='dense'
                fullWidth
                id='currentCollectedAmount'
                label='Current Collected Amount'
                value={currenctCollected}
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
              <TextField
                margin='dense'
                fullWidth
                id='collectedAmount'
                label='Amount Collected'
                disabled={paymentMethod === 'Unpaid'}
                value={collected}
                onChange={event => handleChangeCollectedAmount(+event.target.value)}
                onBlur={handleBlur}
                variant='outlined'
                autoComplete='off'
                autoFocus
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
              <TextField
                select
                fullWidth
                margin='dense'
                id='paymentMethod'
                label='Payment Method'
                value={paymentMethod}
                onChange={event => handleChangePaymentMethod(event.target.value)}
                variant='outlined'
                autoComplete='off'
                style={{ minWidth: 120 }}
              >
                {paymentMethodArray.map((option: any) => (
                  <MenuItem key={option.key} value={option.value}>
                    {option.value}
                  </MenuItem>
                ))}
              </TextField>
              {paymentMethod === PaymentMethod.CHEQUE && (
                <TextField
                  fullWidth
                  margin='dense'
                  id='chequeNumber'
                  label='Cheque Number'
                  value={chequeNumber}
                  onChange={event => setChequeNumber(event.target.value)}
                  variant='outlined'
                  autoComplete='off'
                  style={{ minWidth: 120 }}
                />
              )}
            </Grid>
          </Grid>
          <DialogActions style={{ marginTop: 16 }}>
            <Button variant='contained' disableElevation onClick={handleOnClose} disabled={isLoading}>
              Cancel
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
            <Button type='submit' variant='contained' color='primary' disableElevation disabled={isLoading}>
              Update
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
      {openConfirmation && (
        <StandardConfirmationDialog
          variant={'warning'}
          title='Unpaid Confirmation'
          message='Are you sure want to change invoice status to unpaid?'
          secondMessage='Current collected amount will change to $0'
          okLabel='OK'
          cancelLabel='cancel'
          open={openConfirmation}
          handleClose={() => setOpenConfirmation(false)}
          onConfirm={() => {
            setPaymentMethod('Unpaid');
            setCurrenctCollected(0);
            setOpenConfirmation(false);
          }}
        />
      )}
    </Dialog>
  );
};

export default InvoiceCollectedForm;
