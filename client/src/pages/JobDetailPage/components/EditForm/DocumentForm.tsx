import { FC, useState, useCallback } from 'react';
import {
  Grid,
  TextField,
  Theme,
  Typography,
  Button,
  Table,
  TableHead,
  Paper,
  TableCell,
  TableRow,
  TableBody,
  Tooltip,
  IconButton,
  RootRef,
  DialogActions
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import DeleteIcon from '@material-ui/icons/Delete';
import DocumentIcon from '@material-ui/icons/Description';

import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { JOB_DOCUMENT_BASE_URL, GET_JOB_DOCUMENT_URL, GET_DELETE_JOB_DOCUMENT_BY_ID_URL } from 'constants/url';
import axios, { CancelTokenSource } from 'axios';
import HeaderRow from 'components/HeaderRow';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { useDropzone } from 'react-dropzone';
import theme from 'theme';

interface Props {
  jobId: number;
  jobDocuments: JobDocumentModel[];
  setJobDocuments: React.Dispatch<React.SetStateAction<JobDocumentModel[]>>;
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
  textClick: {
    wordWrap: 'break-word',
    maxWidth: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2)
  }
}));

const DocumentForm: FC<Props> = props => {
  const classes = useStyles();

  let cancelTokenSource: CancelTokenSource;

  const { jobId, jobDocuments, setJobDocuments, handleClose, handleSnackbar } = props;

  const [file, setFile] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [notesError, setNotesError] = useState<string>('');
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedJobDocumentId, setSelectedJobDocumentId] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const resetForm = () => {
    setFile('');
    setFileName('');
    setNotes('');
  };

  const handleCancel = () => {
    handleClose();
    resetForm();
  };

  const onDrop = useCallback(
    acceptedFiles => {
      let file;
      let fileName;
      if (acceptedFiles[0] === undefined) {
        file = '';
        fileName = '';
      } else {
        file = acceptedFiles[0];
        fileName = acceptedFiles[0].name;
        setFileError('');
      }
      setFile(file);
      setFileName(fileName);
    },
    [setFileName, setFile]
  );

  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: 'image/*, .docx, .pdf',
    multiple: false,
    onDrop
  });

  const { ref, ...rootProps } = getRootProps();

  const fileRejectionHandle = fileRejections.map(({ file, errors }) => {
    return errors.map(e => (
      <Typography key={e.code} variant='body1' color='error' className={classes.textClick}>
        {`${file.name} ${e.message}`}
      </Typography>
    ));
  });

  const handleOnBlurNotes = (note: string) => {
    if (!note) {
      setNotesError('Please enter notes.');
      return;
    }

    setNotesError('');
    return;
  };

  const addNewJobDocument = (jobDocument: JobDocumentModel) => {
    const currentJobDocument = jobDocuments ? [...jobDocuments] : [];
    currentJobDocument.push(jobDocument);
    setJobDocuments(currentJobDocument);
  };

  const handleAddJobDocument = async () => {
    cancelTokenSource = axios.CancelToken.source();

    if (!file) {
      setFileError('Please insert your file');
      return;
    }

    if (!notes) {
      setNotesError('Please enter notes.');
      return;
    }

    try {
      setIsloading(true);
      let newFileKey = '';
      let fileExtension = '';
      let checkExtension;

      if (fileName) {
        const fileNewName = fileName ? fileName : '';
        checkExtension = fileNewName.split('.');
        fileExtension = fileNewName ? fileNewName.split('.').pop()! : '';
        newFileKey = `${Date.now()}.${fileExtension}`;
      }

      if (checkExtension) {
        if (checkExtension.length === 2) {
          const formData = {
            notes,
            jobId,
            document: newFileKey
          };

          const config = { cancelToken: cancelTokenSource.token };
          const { data } = await axios.post(`${JOB_DOCUMENT_BASE_URL}`, formData, config);

          if (data.documentUrl) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', `multipart/form-data`);

            const config = {
              method: 'PUT',
              headers: myHeaders,
              body: file
            };

            await fetch(data.documentUrl, config);
            const response = await axios.get(`${GET_JOB_DOCUMENT_URL(newFileKey)}`);
            data.documentUrl = response.data.documentUrl;
          }

          addNewJobDocument(data);
          setFile('');
          setFileName('');
          setNotes('');
          handleSnackbar('success', 'Successfully added job document');
          setIsloading(false);
        } else {
          handleSnackbar('error', 'Please check your file name/extension');
          setIsloading(false);
        }
      } else {
        const formData = {
          notes,
          jobId,
          document: newFileKey
        };
        const config = { cancelToken: cancelTokenSource.token };
        const { data } = await axios.post(`${JOB_DOCUMENT_BASE_URL}`, formData, config);

        addNewJobDocument(data);
        setFile('');
        setFileName('');
        setNotes('');
        handleSnackbar('success', 'Successfully added job document');
        setIsloading(false);
      }
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed adding job document');
      setIsloading(false);
    }
  };

  const handleConfirmation = (jobDocumentId: number, index: number) => {
    setSelectedIndex(index);
    setSelectedJobDocumentId(jobDocumentId);
    setOpenDialog(true);
  };

  const deleteIndividualJobDocument = (index: number) => {
    const currentJobDocument = jobDocuments ? [...jobDocuments] : [];
    currentJobDocument.splice(index, 1);
    setJobDocuments(currentJobDocument);
  };

  const handleDeleteJobDocument = async () => {
    try {
      setIsloading(true);
      await axios.delete(`${GET_DELETE_JOB_DOCUMENT_BY_ID_URL(selectedJobDocumentId)}`);
      deleteIndividualJobDocument(selectedIndex);
      handleSnackbar('success', 'Successfully deleted job document');
      setOpenDialog(false);
      setIsloading(false);
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed to delete job document');
      setIsloading(false);
    }
  };

  const renderRecentDocument = () => {
    if (jobDocuments && jobDocuments.length > 0) {
      return jobDocuments.map((value, index) => (
        <TableRow>
          <TableCell width={'80%'} style={{ whiteSpace: 'pre-line' }}>
            {value.notes}
          </TableCell>
          <TableCell width={'20%'}>
            <Grid container alignItems='center'>
              <Grid item>
                <Tooltip title='Download'>
                  <IconButton color='primary' href={value.documentUrl} disabled={value.documentUrl ? false : true}>
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item>
                <Tooltip title='Delete'>
                  <IconButton disabled={isLoading} onClick={() => handleConfirmation(value.id, index)}>
                    <DeleteIcon fontSize='small' color='error' />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>
      ));
    } else {
      return (
        <TableRow>
          <TableCell colSpan={2} style={{ textAlign: 'center' }}>
            There is no document.
          </TableCell>
        </TableRow>
      );
    }
  };

  const renderFormDocument = () => {
    return (
      <Grid container spacing={1} style={{ marginTop: theme.spacing(1) }}>
        <Grid item xs={3}>
          <RootRef rootRef={ref}>
            <div style={{ width: '100%', marginBottom: theme.spacing(3) }}>
              <Paper {...rootProps} variant='outlined' style={{ padding: 20, minHeight: 130 }}>
                <Grid container justify='center' spacing={1}>
                  <Grid item xs={6} sm={8} alignItems='center'>
                    <input {...getInputProps()} />
                    {fileError ? (
                      <Grid container justify='center'>
                        <Grid item xs={12} container justify='center'>
                          <DocumentIcon fontSize='large' color='error' />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant='body1' color='error' align='center' className={classes.textClick}>
                            {fileError}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : fileName ? (
                      <Grid container justify='center' alignItems='center'>
                        <DocumentIcon fontSize='large' />
                        <Typography variant='body1' color='textSecondary' align='center' className={classes.textClick}>
                          {fileName}
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid container justify='center'>
                        <Grid item xs={12} container justify='center'>
                          <DocumentIcon fontSize='large' />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant='body1' color='textSecondary' align='center' className={classes.textClick}>
                            Click Or Drag File Here
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                    {fileRejectionHandle}
                  </Grid>
                </Grid>
              </Paper>
            </div>
          </RootRef>
        </Grid>
        <Grid item xs={9}>
          <TextField
            fullWidth
            variant='outlined'
            id='note'
            label='Note'
            multiline
            rows={6}
            disabled={isLoading}
            value={notes}
            error={notesError !== ''}
            helperText={notesError}
            onChange={event => setNotes(event.target.value)}
            onBlur={event => handleOnBlurNotes(event.target.value)}
          />
          <DialogActions>
            <Button variant='contained' disableElevation disabled={isLoading} onClick={handleCancel} style={{ marginTop: 8 }}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' disableElevation disabled={isLoading} onClick={handleAddJobDocument} style={{ marginTop: 8 }}>
              Save
              <LoadingButtonIndicator isLoading={isLoading} />
            </Button>
          </DialogActions>
        </Grid>
      </Grid>
    );
  };

  return (
    <Grid container spacing={2} className={classes.contentGrid}>
      <Paper variant='outlined' className={classes.paper}>
        <Table>
          <TableHead>
            <HeaderRow
              headers={[
                { id: 'Notes', label: 'Notes' },
                { id: 'action', label: 'Action' }
              ]}
              height={30}
            />
          </TableHead>
          <TableBody>{renderRecentDocument()}</TableBody>
        </Table>
      </Paper>
      {renderFormDocument()}
      <StandardConfirmationDialog
        variant={'warning'}
        message={'Are you sure you want to delete this job document?'}
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        onConfirm={handleDeleteJobDocument}
      />
    </Grid>
  );
};

export default DocumentForm;
