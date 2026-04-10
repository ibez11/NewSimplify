import React, { FC, useState, useEffect, useCallback, Fragment } from 'react';
import axios, { CancelTokenSource } from 'axios';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Theme, Grid, TextField, Typography } from '@material-ui/core';

import { INVOICES_BASE_URL, GET_EDIT_INVOICE_URL, GET_CONTACT_PERSONS_CLIENT_BY_ID_URL, GET_INVOICE_BY_ID_URL } from 'constants/url';
import { makeStyles } from '@material-ui/styles';
import { format, isValid } from 'date-fns';
import CloseIcon from '@material-ui/icons/Close';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { Autocomplete } from '@material-ui/lab';

interface Props {
  open: boolean;
  contract?: ServiceModel;
  handleCancel(): void;
  updateIndividualInvoice: (updatedContractProperties: Partial<ServiceModel>) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  controlDiv: {
    marginTop: theme.spacing(1)
  },
  paddingLeft: {
    paddingLeft: theme.spacing(1)
  }
}));

const InvoiceForm: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const { open, contract, handleCancel, updateIndividualInvoice, handleSnackbar } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [invoiceNoError, setInvoiceNoError] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [invoiceDateError, setInvoiceDateError] = useState<string>('');
  const [invoices, setInvoices] = useState<InvoicesModel[]>([]);
  const [attnTo, setAttnTo] = useState<string>('');
  const [attnToMaster, setAttnToMaster] = useState<Select[]>([]);
  const [isUpdateInvoiceNumber, setIsUpdateInvoiceNumber] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const resetFormValues = useCallback(() => {
    if (!contract) {
      return;
    }

    const { invoiceNo } = contract;

    if (invoiceNo[0]) {
      setInvoiceNo(invoiceNo[0]);
      setIsEdit(true);
    } else {
      setInvoiceNo('');
    }
    setInvoiceNoError('');
    setIsUpdateInvoiceNumber(false);
  }, [contract]);

  const getQueryParams = () => {
    const params = new URLSearchParams();

    params.append('l', '5');

    return params.toString();
  };

  // Search Invoice whenever rowsPerPage, currentPage, queryString, contract, and filterby changes
  const fetchData = useCallback(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const searchContract = async () => {
      setLoading(true);

      try {
        const url = `${INVOICES_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        if (contract!.invoiceId[0]) {
          const invoice = await axios.get(`${GET_INVOICE_BY_ID_URL(contract!.invoiceId[0])}`, { cancelToken: cancelTokenSource.token });
          if (invoice) {
            setAttnTo(invoice.data.attnTo || '');
            setInvoiceDate(invoice.data.invoiceDate);
          }
        }
        setInvoices(data.invoices);
      } catch (err) {}

      setLoading(false);
    };

    const getContactPersons = async () => {
      setLoading(true);

      try {
        const { data } = await axios.get(`${GET_CONTACT_PERSONS_CLIENT_BY_ID_URL(contract!.clientId)}`, { cancelToken: cancelTokenSource.token });

        const attnToMaster: Select[] = data.contactPersons.map((contact: any) => ({ id: contact.id, name: contact.contactPerson }));
        setAttnToMaster(attnToMaster);
      } catch (err) {
        console.log('error', err);
      }

      setLoading(false);
    };

    searchContract();
    getContactPersons();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resetFormValues will be modified everytime user changes, due to useCallback
  useEffect(() => {
    fetchData();
    resetFormValues();
  }, [resetFormValues, fetchData]);

  // This is to ensure that the form value and erors are reset/cleared when user canceled the editing
  const handleOnClose = () => {
    resetFormValues();
    handleCancel();
  };

  const handleBlur = () => {
    if (invoiceNo) {
      setInvoiceNoError('');
    } else {
      setInvoiceNoError('Please input invoice number');
    }
  };

  const handleChangeInvoiceDate = (date: Date | null) => {
    if (date && isValid(date)) {
      setInvoiceDate(date);
      setInvoiceDateError('');
    } else {
      setInvoiceDateError('Please input invoice Date');
    }
  };

  const handleFreeTextAttnTo = (value: any) => {
    setAttnTo(value);
  };

  const handleAttnToChange = (value: any) => {
    if (value) {
      setAttnTo(value.name);
    }
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    setLoading(true);

    if (!invoiceNo[0]) {
      setLoading(false);
      setInvoiceNoError('Please input invoice number');
      return;
    }

    if (invoiceDateError) {
      setLoading(false);
      return;
    }

    try {
      cancelTokenSource = axios.CancelToken.source();

      let response;
      if (isEdit) {
        response = await axios.put(
          `${GET_EDIT_INVOICE_URL(contract!.invoiceId!)}`,
          {
            invoiceNumber: invoiceNo,
            invoiceDate,
            isUpdateCollectedAmount: false,
            isUpdateInvoiceNumber,
            attnTo
          },
          { cancelToken: cancelTokenSource.token }
        );
        handleSnackbar('success', 'Successfully edit invoice number');
      } else {
        response = await axios.post(
          `${INVOICES_BASE_URL}`,
          {
            invoiceNumber: invoiceNo,
            invoiceDate,
            serviceId: contract!.id,
            attnTo
          },
          { cancelToken: cancelTokenSource.token }
        );
        handleSnackbar('success', 'Successfully generate invoice number');
      }

      let currentContractData = contract;
      currentContractData!.invoiceNo = [invoiceNo];
      currentContractData!.invoiceId = [response.data.id];

      updateIndividualInvoice(currentContractData!);
      setInvoiceNoError('');
      handleCancel();
    } catch (err) {
      const error = err as any;
      const { message } = error.data;
      handleSnackbar('error', message ? message : 'Failed to edit invoice number');
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} scroll='body' fullWidth={true} maxWidth='xs'>
      <DialogTitle>
        <Typography variant='h5' id='invoice-modal'>
          {isEdit ? 'Edit Invoice Number' : 'Generate Invoice'}
        </Typography>
        <IconButton size='small' className={classes.closeButton} onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid>
          <form noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin='dense'
                  fullWidth
                  id='invoiceNo'
                  label='Invoice Number'
                  value={invoiceNo}
                  helperText={invoiceNoError}
                  error={invoiceNoError !== ''}
                  onChange={event => {
                    setInvoiceNo(event.target.value);
                    setIsUpdateInvoiceNumber(true);
                  }}
                  onBlur={handleBlur}
                  variant='outlined'
                  autoComplete='off'
                  InputProps={{
                    inputProps: { maxLength: 10 }
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    clearable
                    required
                    fullWidth
                    id='invoiceDate'
                    label='Invoice Date'
                    margin='dense'
                    value={invoiceDate}
                    variant='dialog'
                    inputVariant='outlined'
                    format='dd-MM-yyyy'
                    onChange={handleChangeInvoiceDate}
                    error={invoiceDateError ? true : false}
                    helperText={invoiceDateError}
                    KeyboardButtonProps={{
                      'aria-label': 'change date'
                    }}
                    InputAdornmentProps={{ position: 'start' }}
                  />
                </MuiPickersUtilsProvider>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  id='attnTo'
                  options={attnToMaster}
                  getOptionLabel={option => option.name}
                  inputValue={attnTo}
                  onInputChange={(_, value, reason) => {
                    if (reason === 'input') {
                      handleFreeTextAttnTo(value ? value : '');
                    }
                    if (reason === 'clear') {
                      setAttnTo('');
                    }
                  }}
                  onChange={(_: any, value: Select | any) => handleAttnToChange(value)}
                  autoHighlight={true}
                  freeSolo
                  forcePopupIcon
                  renderInput={params => (
                    <TextField
                      {...params}
                      margin='dense'
                      label='Attention to'
                      placeholder={attnTo === '' ? 'Select or type name' : ''}
                      variant='outlined'
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle1'>Last Invoice Created:</Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2} className={classes.paddingLeft}>
                  <Grid item xs={4}>
                    <Typography color='textSecondary'>Invoice Number</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color='textSecondary'>Date & Time</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color='textSecondary'>Created By</Typography>
                  </Grid>
                  {invoices.length > 0
                    ? invoices.map(invoice => (
                        <Fragment>
                          <Grid item xs={4}>
                            {invoice.invoiceNumber}
                          </Grid>
                          <Grid item xs={4}>
                            {format(new Date(invoice.generatedDate), 'dd-MM-yyyy hh:mm a')}
                          </Grid>
                          <Grid item xs={4}>
                            {invoice.createdBy || '-'}
                          </Grid>
                        </Fragment>
                      ))
                    : ''}
                </Grid>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.controlDiv}>
        <Button variant='contained' disableElevation disabled={isLoading} onClick={handleOnClose}>
          Cancel
        </Button>
        <Button variant='contained' disableElevation color='primary' disabled={isLoading} onClick={handleOnSubmit}>
          Save
          {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoiceForm;
