import { FC, useState, useEffect } from 'react';
import axios from 'axios';
import { Theme, makeStyles, Grid, Dialog, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { GET_PDF_PREVIEW_LAYOUT_URL } from 'constants/url';
import CloseIcon from '@material-ui/icons/Close';

interface Props {
  open: boolean;
  type: string;
  selectedOptions: { [key: string]: string };
  handleClose: () => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
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
  }
}));

const PreviewForm: FC<Props> = props => {
  const classes = useStyles();
  const { open, type, selectedOptions, handleClose, handleSnackbar } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    const getFileUrl = async () => {
      try {
        const convertedOptions = Object.fromEntries(
          Object.entries(selectedOptions).map(([key, value]) =>
            !isNaN(Number(value)) && typeof value === 'string' && value.trim() !== '' ? [key, Number(value)] : [key, value]
          )
        );

        const { data } = await axios({
          url: GET_PDF_PREVIEW_LAYOUT_URL(type),
          method: 'POST',
          responseType: 'blob',
          headers: {
            Accept: 'application/octet-stream'
          },
          data: { ...convertedOptions }
        });

        const objectBlob = new Blob([data], { type: 'application/pdf' });
        const url = URL.createObjectURL(objectBlob);

        setFileUrl(url);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        handleSnackbar('error', 'Failed to get preview');
      }
    };

    getFileUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={open} fullWidth={true} maxWidth='md' scroll='body' aria-labelledby='alert-dialog-title' aria-describedby='alert-dialog-description'>
      <DialogTitle>
        <Typography variant='h5' id='pdf-modal'>
          PDF Preview
        </Typography>
        <IconButton size='small' className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText id='alert-dialog-description'>
          {isLoading ? (
            <Grid container justify='center' alignItems='center'>
              <CircularProgress color='primary' size={80} />
            </Grid>
          ) : (
            fileUrl && <iframe title='file' className={classes.framePdf} style={{ width: '100%', minHeight: '500px' }} src={fileUrl}></iframe>
          )}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewForm;
