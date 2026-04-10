import { FC, useState, useEffect } from 'react';
import { Grid, TextField, Theme, Typography, Button, DialogActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { GET_EDIT_INVOICE_URL } from 'constants/url';
import axios from 'axios';
import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { format, isValid } from 'date-fns';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
  invoice: InvoiceDetailModel;
  updateIndividual(value: any): void;
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2),
    maxHeight: 600,
    overflow: 'auto'
  },
  required: {
    color: 'red'
  }
}));

const EditDetailForm: FC<Props> = props => {
  const classes = useStyles();
  const { invoice, updateIndividual, handleSnackbar, handleClose } = props;

  const [isLoading, setIsloading] = useState<boolean>(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceNumberError, setInvoiceNumberError] = useState<string>('');
  const [termEnd, setTermEnd] = useState<string>('');
  const [termEndError, setTermEndError] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [attnTo, setAttnTo] = useState<string>('');
  const [attnToMaster, setAttnToMaster] = useState<Select[]>([]);
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());
  const [invoiceDateError, setInvoiceDateError] = useState<string>('');

  useEffect(() => {
    if (!invoice) {
      return;
    }

    const { invoiceNumber, termEnd, invoiceDate, dueDate, attnTo, Client, invoiceRemarks } = invoice;
    const { ContactPersons } = Client;
    const attnToMaster: Select[] = ContactPersons.map(contact => ({ id: contact.id, name: contact.contactPerson }));

    setInvoiceNumber(invoiceNumber);
    setTermEnd(termEnd);
    setInvoiceDate(invoiceDate);
    setDueDate(dueDate);
    setAttnToMaster(attnToMaster);
    setAttnTo(attnTo || '');
    setRemarks(invoiceRemarks);
  }, [invoice]);

  const handleChangeInvoiceDate = (date: Date | null) => {
    if (date && isValid(date)) {
      setInvoiceDate(date);
      setInvoiceDateError('');
    } else {
      setInvoiceDateError('Please input invoice date');
    }
  };

  const handleTermEndChange = (date: Date | null) => {
    if (date && isValid(date)) {
      setTermEnd(format(date, 'yyyy-MM-dd'));
      setTermEndError('');
    } else {
      setTermEndError('Please input term date');
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

  const handleSubmit = async () => {
    setIsloading(true);

    if (invoiceNumberError || invoiceDateError || termEndError) {
      setIsloading(false);
      return;
    }

    try {
      const { data } = await axios.put(`${GET_EDIT_INVOICE_URL(invoice!.id)}`, {
        invoiceNumber,
        termEnd,
        invoiceDate,
        dueDate,
        attnTo,
        remarks
      });
      updateIndividual(data);
      handleSnackbar('success', 'Successfully update invoice');
      handleClose();
    } catch (err) {
      handleSnackbar('error', 'Failed update invoice');
    }
    setIsloading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Invoice Number <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            margin='dense'
            fullWidth
            id='invoiceNumber'
            variant='outlined'
            value={invoiceNumber}
            error={invoiceNumberError !== ''}
            helperText={invoiceNumberError}
            onChange={event => setInvoiceNumber(event.target.value)}
            onBlur={() => {
              if (!invoiceNumber) {
                setInvoiceNumberError('Please input invoice number');
              } else {
                setInvoiceNumberError('');
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Invoice Date <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              clearable
              required
              fullWidth
              id='invoiceDate'
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
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Term End <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              clearable
              required
              fullWidth
              id='termEnd'
              margin='dense'
              value={termEnd}
              variant='dialog'
              inputVariant='outlined'
              format='dd-MM-yyyy'
              onChange={handleTermEndChange}
              error={termEndError ? true : false}
              helperText={termEndError}
              InputAdornmentProps={{ position: 'start' }}
            />
          </MuiPickersUtilsProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Due Invoice</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField margin='dense' fullWidth id='invoiceDue' variant='outlined' value={dueDate} onChange={event => setDueDate(event.target.value)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Attention to</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
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
              <TextField {...params} required margin='dense' placeholder={attnTo === '' ? 'Select or type name' : ''} variant='outlined' />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Remarks</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            margin='dense'
            fullWidth
            id='invoiceRemarks'
            variant='outlined'
            multiline
            rows={5}
            value={remarks}
            onChange={event => setRemarks(event.target.value)}
          />
        </Grid>
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' disableElevation disabled={isLoading} onClick={handleSubmit}>
          Save
          <LoadingButtonIndicator isLoading={isLoading} />
        </Button>
      </DialogActions>
    </>
  );
};

export default EditDetailForm;
