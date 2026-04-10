import React, { FC, useState, useEffect, useCallback, useContext } from 'react';
import axios, { CancelTokenSource } from 'axios';

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
  MenuItem,
  Divider
} from '@material-ui/core';
import { GET_EDIT_JOB_URL } from 'constants/url';
import { makeStyles } from '@material-ui/styles';

import NumberFormatCustom from 'components/NumberFormatCustom';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import CloseIcon from '@material-ui/icons/Close';
import { PaymentMethod } from 'constants/enum';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';

interface Props {
  open: boolean;
  job: JobDetailModel;
  fetchData(): void;
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
  const { open, job, fetchData, setIsEditCollected, handleSnackbar } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [contractOutstandingAmount, setContractOutstandingAmount] = useState<number>(0);
  const [additionalCollectedAmount, setAdditionalCollectedAmount] = useState<number>(0);
  const [additionalAmount, setAdditionalAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.CASH);
  const paymentMethodArray = Object.entries(PaymentMethod).map(([key, value]) => ({ key, value }));
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [confirmationType, setConfirmationType] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState<string>('');

  const resetFormValues = useCallback(() => {
    if (!job) {
      return;
    }

    const { contractOutstandingAmount, additionalTotalAmount, jobCollectedAmount, additionalCollectedAmount } = job;
    setContractOutstandingAmount(contractOutstandingAmount || 0);
    setAdditionalAmount(additionalTotalAmount || 0);
    setCollectedAmount(jobCollectedAmount || 0);
    setAdditionalCollectedAmount(additionalCollectedAmount);
  }, [job]);

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
      setCollectedAmount(0);
    } else {
      setCollectedAmount(value);
    }
  };

  const handleChangeAdditionalCollectedAmount = (value: number) => {
    if (value < 0) {
      setAdditionalCollectedAmount(0);
    } else {
      setAdditionalCollectedAmount(value);
    }
  };

  const handleBlurAdditional = () => {
    if (additionalCollectedAmount > additionalAmount) {
      setAdditionalCollectedAmount(additionalAmount);
    }
  };

  const handleChangePaymentMethod = (value: string) => {
    if (value === 'Unpaid') {
      setConfirmationType('cancel');
      setOpenConfirmation(true);
    } else {
      setPaymentMethod(value);
      setChequeNumber(value === 'Cheque' ? job.chequeNumber : '');
    }
  };

  const handleValidation: React.FormEventHandler = async event => {
    event.preventDefault();
    if (job.jobCollectedAmount > 0 || job.additionalCollectedAmount > 0) {
      setOpenConfirmation(true);
      setConfirmationType('replace');
      return false;
    } else {
      handleOnSubmit();
    }
    return true;
  };

  const handleOnSubmit = async (isReplacement?: boolean) => {
    setLoading(true);

    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      const { jobId, jobStatus } = job;
      let newCollectedAmount = collectedAmount;
      let newAdditionalCollectedAmount = additionalCollectedAmount;
      let newPaymentMethod = paymentMethod;

      if (confirmationType.includes('cancel')) {
        newCollectedAmount = 0;
        newAdditionalCollectedAmount = 0;
        newPaymentMethod = 'UNPAID';
      }

      if (confirmationType.includes('replace')) {
        if (contractOutstandingAmount === job.contractAmount - job.jobCollectedAmount) {
          newCollectedAmount = newCollectedAmount >= job.contractAmount ? job.contractAmount : newCollectedAmount;
        } else {
          newCollectedAmount = newCollectedAmount >= job.contractAmount ? job.contractAmount - contractOutstandingAmount : newCollectedAmount;
        }
      } else {
        newCollectedAmount = newCollectedAmount >= contractOutstandingAmount ? contractOutstandingAmount : newCollectedAmount;
      }

      await axios.put(
        GET_EDIT_JOB_URL(Number(jobId)),
        {
          jobStatus,
          collectedAmount: newCollectedAmount,
          additionalCollectedAmount: newAdditionalCollectedAmount,
          paymentMethod: newPaymentMethod.toUpperCase(),
          chequeNumber,
          isReplacement
        },
        { cancelToken: cancelTokenSource.token }
      );

      fetchData();
      CreateLogEvent('update_job_collected', currentUser!);
      handleSnackbar('success', 'Successfully update job collected');
      handleOnClose();
    } catch (err) {
      const error = err as any;
      const { errorCode } = error.data;

      if (errorCode === 42) {
        handleSnackbar('error', 'Job Collected amount is more than Total Job Collected Amount');
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
        <form noValidate onSubmit={handleValidation}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='subtitle1'>Current Quotation</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin='dense'
                fullWidth
                id='outstandingAmount'
                label='Outstanding Amount'
                value={contractOutstandingAmount}
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
            <Grid item xs={6}>
              <TextField
                margin='dense'
                fullWidth
                id='quotationAmount'
                label='Total Quotation Amount'
                value={job.contractAmount}
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
                label='Job Amount Collected'
                disabled={paymentMethod === 'Unpaid' || paymentMethod === 'Not Chargeable'}
                value={collectedAmount}
                onChange={event => handleChangeCollectedAmount(+event.target.value)}
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
            {job.additionalServiceId && (
              <>
                <Grid item xs={12}>
                  <Divider style={{ margin: '8px 0' }} />
                  <Typography variant='subtitle1'>Separate Quotation</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin='dense'
                    fullWidth
                    id='additionalAmount'
                    label='Separate Amount'
                    value={additionalAmount}
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
                    id='additinalCollectedAmount'
                    label='Separate Quotation Amount Collected'
                    disabled={paymentMethod === 'Unpaid'}
                    value={additionalCollectedAmount}
                    onChange={event => handleChangeAdditionalCollectedAmount(+event.target.value)}
                    onBlur={handleBlurAdditional}
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
              </>
            )}
            <Grid item xs={12}>
              <Divider style={{ margin: '8px 0' }} />
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
          title={confirmationType.includes('cancel') ? 'Unpaid Confirmation' : 'Update Confirmation'}
          message={
            confirmationType.includes('cancel') ? 'Are you sure want to change payment to unpaid?' : 'Are you sure want to change collected amount?'
          }
          secondMessage={confirmationType.includes('cancel') ? 'Collected amount will change to $0' : 'It will replace current collected amount'}
          okLabel='OK'
          cancelLabel='cancel'
          open={openConfirmation}
          handleClose={() => setOpenConfirmation(false)}
          onConfirm={() => {
            if (confirmationType.includes('cancel')) {
              setOpenConfirmation(false);
              handleOnSubmit();
            } else {
              handleOnSubmit(true);
            }
          }}
        />
      )}
    </Dialog>
  );
};

export default InvoiceCollectedForm;
