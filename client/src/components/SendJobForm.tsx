import React, { FC, useState, useEffect, useCallback } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { Button, IconButton, Theme, TextField, Typography, DialogTitle, DialogContent, DialogActions, Dialog } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import CloseIcon from '@material-ui/icons/Close';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { SETTING_BASE_URL } from 'constants/url';
import { SettingCodes } from 'constants/enum';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  job: any;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  handleClose: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  }
}));

const SendJobForm: FC<Props> = props => {
  const classes = useStyles();

  const { open, job, handleSnackbar, handleClose } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const resetFormValues = useCallback(() => {
    setMessage('');
  }, []);

  // resetFormValues will be modified everytime job changes, due to useCallback
  useEffect(() => {
    if (!job) {
      handleSnackbar('error', 'Failed to load job data');
      return;
    }

    setIsLoading(true);
    const loadMessageTemplate = async () => {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      try {
        const { ContactPersons, clientName, serviceAddress, serviceName, startDateTime, endDateTime, entityName, ServiceItem, ServiceItems } = job;
        const contactPersonsString =
          Array.isArray(ContactPersons) && ContactPersons.length > 0
            ? ContactPersons.map((cp: any) => {
                const name = cp.contactPerson || cp.name || '';
                const cc = cp.countryCode || '+65';
                const num = cp.contactNumber || '';
                return `${name} (${cc} ${num})`.trim();
              })
                .filter(Boolean)
                .join(', ')
            : 'Dummy Contact Person';

        const serviceItems = ServiceItems || ServiceItem;
        const serviceItemsString =
          Array.isArray(serviceItems) && serviceItems.length > 0
            ? serviceItems.map((item: any, index: number) => `\t${index + 1}. ${item.name}`).join('\n')
            : '1. Sample Item x1';

        const { data } = await axios.get(`${SETTING_BASE_URL}/${SettingCodes.COPYMESSAGETEMPLATE}`, { cancelToken: cancelTokenSource.token });
        let messageTemplate = data.value;
        const replacementValues: Record<string, string> = {
          contactPersons: contactPersonsString || 'Dummy Contact Person',
          clientName: clientName || 'Dummy Name',
          serviceAddress: serviceAddress || 'Dummy Service Address',
          quotationTitle: serviceName || 'Dummy Service Name',
          jobDate: startDateTime ? format(new Date(startDateTime), 'dd-MM-yyyy') : '-',
          startTime: startDateTime ? format(new Date(startDateTime), 'hh:mm a') : '-',
          endTime: endDateTime ? format(new Date(endDateTime), 'hh:mm a') : '-',
          entityName: entityName || 'Your Company',
          serviceItems: serviceItemsString || '1. Sample Item x1'
        };
        messageTemplate = messageTemplate.replace(/{([^}]+)}/g, (match: any, placeholder: any) => {
          return replacementValues[placeholder] || match;
        });
        setMessage(messageTemplate);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };

    loadMessageTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job]);

  // This is to ensure that the form value and erors are reset/cleared when job canceled the editing
  const handleOnClose = () => {
    resetFormValues();
    handleClose();
  };

  const handleOnCopyMessage = () => {
    navigator.clipboard.writeText(message).then(
      () => {
        handleSnackbar('success', 'Job message copied to clipboard');
      },
      () => {
        handleSnackbar('error', 'Failed to copy job message');
      }
    );
  };

  return (
    <Dialog open={open} onClose={handleOnClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Typography variant='h5'>Copy Job Message</Typography>
        <IconButton size='small' onClick={handleOnClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          margin='dense'
          fullWidth
          id='job-message'
          variant='outlined'
          label='Message'
          multiline
          rows={12}
          value={message}
          onChange={event => setMessage(event.target.value)}
        />
        <DialogActions style={{ marginTop: 16 }}>
          <Button variant='contained' disableElevation onClick={handleOnClose} disabled={isLoading}>
            Cancel
            <LoadingButtonIndicator isLoading={isLoading} />
          </Button>
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disableElevation
            onClick={handleOnCopyMessage}
            disabled={isLoading}
            startIcon={<CopyIcon />}
          >
            Copy
            <LoadingButtonIndicator isLoading={isLoading} />
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default SendJobForm;
