import React, { FC, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { Button, IconButton, Theme, Grid, TextField, Typography, DialogTitle, DialogContent, DialogActions, Dialog } from '@material-ui/core';
import { GET_EDIT_INVOICE_URL } from 'constants/url';
import { makeStyles } from '@material-ui/styles';

import CloseIcon from '@material-ui/icons/Close';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';

interface Props {
  open: boolean;
  invoice?: InvoicesModel;
  updateIndividual: (updatedContractProperties: Partial<InvoicesModel>) => void;
  setIsEditRemarks: React.Dispatch<React.SetStateAction<boolean>>;
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

const InvoiceRemakrsForm: FC<Props> = props => {
  const classes = useStyles();

  const { open, invoice, updateIndividual, setIsEditRemarks, handleSnackbar } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [remarks, setRemarks] = useState<string>('');

  const resetFormValues = useCallback(() => {
    if (!invoice) {
      return;
    }

    const { remarks } = invoice;

    if (remarks) {
      setRemarks(remarks);
    }
  }, [invoice]);

  // resetFormValues will be modified everytime invoice changes, due to useCallback
  useEffect(() => {
    resetFormValues();
  }, [resetFormValues]);

  // This is to ensure that the form value and erors are reset/cleared when invoice canceled the editing
  const handleOnClose = () => {
    resetFormValues();
    setIsEditRemarks(false);
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    setLoading(true);

    try {
      await axios.put(`${GET_EDIT_INVOICE_URL(invoice!.id)}`, {
        invoiceNumber: invoice ? invoice.invoiceNumber : '',
        remarks: remarks || null
      });
      updateIndividual({ ...invoice, remarks: remarks });
      handleSnackbar('success', 'Successfully update remarks');
      handleOnClose();
    } catch (err) {
      handleSnackbar('error', 'Failed update remarks');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h5'>Invoice Remarks</Typography>
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
                id='invoiceRemarks'
                variant='outlined'
                label='Invoice Remarks'
                multiline
                rows={5}
                value={remarks}
                onChange={event => setRemarks(event.target.value)}
              />
            </Grid>
          </Grid>
          <DialogActions style={{ marginTop: 16 }}>
            <Button variant='contained' disableElevation onClick={handleOnClose} disabled={isLoading}>
              Cancel
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
            <Button type='submit' variant='contained' color='primary' disableElevation disabled={isLoading}>
              Save
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceRemakrsForm;
