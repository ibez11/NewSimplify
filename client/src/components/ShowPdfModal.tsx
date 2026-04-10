import { FC, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Theme,
  makeStyles,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography
} from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { GET_EXPORT_JOBS_URL, GET_EXPORT_SERVICES_URL, GET_EXPORT_INVOICE_URL } from 'constants/url';
import CloseIcon from '@material-ui/icons/Close';
import ShowPdfTypes from 'typings/ShowPdfTypes';
import SendIcon from '@material-ui/icons/Send';
import DownloadIcon from '@material-ui/icons/PlayForWork';
import SendEmailModal from './SendEmailModal';

interface Props {
  id: number;
  serviceId: number;
  documentType: string;
  documentNumber: string;
  open: boolean;
  handleClose: () => void;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  framePdf: {
    minHeight: '150px'
  },
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  marginRight: {
    marginRight: theme.spacing(1)
  }
}));

const ShowPdfModal: FC<Props> = props => {
  const classes = useStyles();
  const { id, documentType, documentNumber, serviceId, open, handleClose, handleSnackbar } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [openEmailRecipient, setOpenEmailRecipient] = useState<boolean>(false);

  const fileName =
    documentType === ShowPdfTypes.JOB
      ? `Service-${documentNumber}-report`
      : documentType === ShowPdfTypes.SERVICE
      ? `Quotation-${documentNumber}-report`
      : `Invoice-${documentNumber}`;

  const header =
    documentType === ShowPdfTypes.JOB
      ? `Service Report`
      : documentType === ShowPdfTypes.SERVICE
      ? `Quotation ${documentNumber}`
      : `Invoice ${documentNumber}`;

  const fetchFile = useCallback(async () => {
    if (!id || !open) {
      return;
    }

    const exprotUrl =
      documentType === ShowPdfTypes.JOB
        ? GET_EXPORT_JOBS_URL(id)
        : documentType === ShowPdfTypes.SERVICE
        ? GET_EXPORT_SERVICES_URL(id)
        : GET_EXPORT_INVOICE_URL(id);

    setLoading(true);
    try {
      const { data } = await axios({
        url: exprotUrl,
        method: 'GET',
        responseType: 'blob',
        headers: {
          Accept: 'application/octet-stream'
        }
      });

      const objectBlob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(objectBlob);

      setFileUrl(url);
    } catch (error) {
      console.error(error);
      handleSnackbar('error', 'Failed get data');
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', `${fileName}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  return (
    <>
      <Dialog
        open={open}
        fullWidth={true}
        maxWidth='md'
        scroll='body'
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle>
          <Typography variant='h5' id='pdf-modal'>
            {header}
          </Typography>
          <IconButton size='small' className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText id='alert-dialog-description'>
            {loading ? (
              <Grid container justify='center' alignItems='center'>
                <CircularProgress color='primary' size={80} />
              </Grid>
            ) : (
              fileUrl && <iframe title='file' className={classes.framePdf} style={{ width: '100%', minHeight: '500px' }} src={fileUrl}></iframe>
            )}
          </DialogContentText>
          <DialogActions>
            <Grid container justify='flex-end' alignItems='center'>
              {!loading && (
                <Button onClick={handleDownload} disableElevation variant='contained' startIcon={<DownloadIcon />}>
                  Download as PDF
                </Button>
              )}
              <div className={classes.wrapper}>
                {!loading && (
                  <Button onClick={() => setOpenEmailRecipient(true)} disableElevation variant='contained' startIcon={<SendIcon />}>
                    Send to Client Email
                  </Button>
                )}
              </div>
            </Grid>
          </DialogActions>
        </DialogContent>
      </Dialog>
      {openEmailRecipient && (
        <SendEmailModal
          open={openEmailRecipient}
          id={id}
          documentType={documentType}
          serviceId={serviceId}
          handleClose={() => setOpenEmailRecipient(false)}
          handleSnackbar={handleSnackbar}
        />
      )}
    </>
  );
};

export default ShowPdfModal;
