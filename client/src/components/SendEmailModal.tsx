import { FC, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Grid,
  makeStyles,
  Theme,
  Typography,
  DialogTitle,
  IconButton,
  Chip,
  Checkbox,
  TextField,
  Tooltip
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import LoadingButtonIndicator from './LoadingButtonIndicator';
import Autocomplete from '@material-ui/lab/Autocomplete';
import theme from 'theme';
import { GET_EMAIL_CLIENT_BY_SERVICE_ID_URL, GET_SEND_INVOICE_URL, GET_SEND_JOB_URL, GET_SEND_SERVICE_URL } from 'constants/url';
import axios from 'axios';
import ShowPdfTypes from 'typings/ShowPdfTypes';

interface Props {
  open: boolean;
  id: number;
  documentType: string;
  serviceId: number;
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  },
  buttonAciton: {
    margin: 8
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  }
}));

const SendEmailModal: FC<Props> = props => {
  const classes = useStyles();
  const { open, id, documentType, serviceId, handleClose, handleSnackbar } = props;

  const [loadingEmail, setLoadingEmail] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<any[]>([]);
  const [contactPersonMaster, setContactPersonMaster] = useState<any[]>([]);
  const [errorEmail, setErrorEmail] = useState<string>('');

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    const getClientEmail = async () => {
      setLoadingEmail(true);
      const { data } = await axios.get(`${GET_EMAIL_CLIENT_BY_SERVICE_ID_URL(serviceId)}`);

      const contactPersons: any[] = [];
      const selectedContact: any[] = [];

      if (data.ContactPersons.length > 0) {
        // eslint-disable-next-line array-callback-return
        data.ContactPersons.map((value: any) => {
          if (value.contactEmail) {
            if (value.isDefault) {
              selectedContact.push(value);
            }
            return contactPersons.push(value);
          }
        });
      }

      setSelectedContact(selectedContact);
      setContactPersonMaster(contactPersons);
      setLoadingEmail(false);
    };

    getClientEmail();
  }, [serviceId]);

  const handleSelectedContact = (contact: any[]) => {
    setSelectedContact(contact);
    setErrorEmail('');
  };

  const handleSendEmail = async () => {
    if (selectedContact.length === 0) {
      setErrorEmail('Please input email address');
      return;
    }

    setLoadingEmail(true);
    const sendEmailUrl =
      documentType === ShowPdfTypes.JOB
        ? GET_SEND_JOB_URL(id)
        : documentType === ShowPdfTypes.SERVICE
        ? GET_SEND_SERVICE_URL(id)
        : GET_SEND_INVOICE_URL(id);

    try {
      const contactEmail: string[] = [];
      selectedContact.map(value => {
        return contactEmail.push(value.contactEmail);
      });

      await axios.post(sendEmailUrl, { contactEmail });
      setLoadingEmail(false);
      handleClose();
      handleSnackbar('success', 'Success send email');
    } catch (error) {
      console.error(error);
      setLoadingEmail(false);
      handleSnackbar('error', 'Failed send email');
    }
  };

  return (
    <Dialog open={open} scroll='body' fullWidth maxWidth='xs'>
      <DialogTitle>
        <Typography variant='h5' id='invoice-modal'>
          Choose Email Recipient
        </Typography>
        <IconButton size='small' className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Autocomplete
          multiple
          id='email'
          disableCloseOnSelect
          options={contactPersonMaster}
          getOptionLabel={option => `${option.contactPerson}${option.description && `-${option.description}`}`}
          value={selectedContact}
          getOptionSelected={(option, value) => option.contactEmail === value.contactEmail}
          onChange={(_, value) => handleSelectedContact(value)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Tooltip title={option.contactEmail}>
                <Chip
                  label={`${option.contactPerson}${option.description ? ` (${option.description})` : ''}`}
                  {...getTagProps({ index })}
                  style={{ color: theme.palette.primary.main, backgroundColor: theme.palette.primary.light }}
                />
              </Tooltip>
            ))
          }
          renderOption={(option, { selected }) => (
            <>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                color='primary'
                disableRipple
                className={classes.checkBox}
                checked={selected}
              />
              {option.contactPerson}
              {option.description && ` (${option.description})`}
            </>
          )}
          renderInput={params => (
            <TextField
              {...params}
              fullWidth
              id='email'
              label='Email'
              variant='outlined'
              autoComplete='off'
              margin='dense'
              error={errorEmail !== '' ? true : false}
              helperText={errorEmail}
            />
          )}
        />
        <DialogActions>
          <Grid container justify='flex-end' alignItems='center'>
            <Button variant='contained' onClick={handleClose} disabled={loadingEmail} disableElevation className={classes.buttonAciton}>
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={handleSendEmail}
              disabled={loadingEmail}
              disableElevation
              className={classes.buttonAciton}
            >
              Send
              <LoadingButtonIndicator isLoading={loadingEmail} />
            </Button>
          </Grid>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default SendEmailModal;
