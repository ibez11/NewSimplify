import { FC, useState, useCallback, useEffect } from 'react';
import { Grid, TextField, Theme, Typography, Button, Paper, DialogActions, Tooltip, IconButton, MenuItem, Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ImageIcon from '@material-ui/icons/AddPhotoAlternate';
import DeleteIcon from '@material-ui/icons/Delete';

import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import {
  GET_EDIT_JOB_NOTE_URL,
  GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL,
  GET_PRESIGNED_URL,
  JOB_NOTE_BASE_URL,
  JOB_NOTE_TEMPLATE_BASE_URL
} from 'constants/url';
import axios, { CancelTokenSource } from 'axios';
import { useDropzone } from 'react-dropzone';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { StandardConfirmationDialog } from 'components/AppDialog';
import theme from 'theme';

interface Props {
  jobId: number;
  serviceAddressId: number;
  isEdit: boolean;
  jobNoteIndex?: number;
  jobNote?: JobNoteModel;
  addNewJobNote(job: JobNoteModel): void;
  updateJobNote(jobNoteIndex: number, job: JobNoteModel): void;
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  textClick: {
    wordWrap: 'break-word',
    maxWidth: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2),
    maxHeight: 580,
    overflow: 'auto'
  },
  responsiveScale: {
    width: '100%'
  },
  input: {
    display: 'none'
  },
  image: {
    position: 'relative',
    padding: theme.spacing(4),
    height: 110,
    width: 110,
    [theme.breakpoints.down('xs')]: {
      width: '100% !important', // Overrides inline-style
      height: 100
    },
    '&:hover, &$focusVisible': {
      zIndex: 1,
      '& $imageButton': {
        opacity: 0.7
      },
      '& $imageMarked': {
        opacity: 0
      }
    }
  },
  imageSrc: {
    width: '80%',
    height: 150,
    objectFit: 'scale-down'
  },
  dropZone: {
    padding: theme.spacing(1),
    minHeight: 150,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  imageView: {
    width: '8em',
    height: '8em',
    objectFit: 'contain',
    backgroundColor: theme.palette.primary.light,
    borderRadius: 5,
    border: `1px solid ${theme.palette.grey[300]}`
  },
  spacingNewLine: {
    marginTop: theme.spacing(1),
    width: '8em',
    textAlign: 'center'
  }
}));

const EquipmentNoteForm: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const { jobId, serviceAddressId, isEdit, jobNoteIndex, jobNote, addNewJobNote, updateJobNote, handleClose, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobNoteMaster, setJobNoteMasater] = useState<Select[]>([]);
  const [equipmentMaster, setEquipmentMaster] = useState<any[]>([]);
  const [equipmentId, setEquipmentId] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [noteName, setNoteName] = useState<string>('');
  const [notesError, setNotesError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [equipmentError, setEquipmentError] = useState<string>('');
  const [jobNoteMedia, setJobNoteMedia] = useState<JobNoteMediaModel[]>([]);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      const getJobNoteTemplates = async () => {
        const { data } = await axios.get(JOB_NOTE_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });
        let jobNoteData: Select[] = [];
        data.JobNoteTemplates.map((value: any) => {
          return jobNoteData.push({ id: value.id, name: value.notes });
        });
        setJobNoteMasater(jobNoteData);
      };

      const getEquipmentTemplates = async () => {
        const { data } = await axios.get(GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL(serviceAddressId), { cancelToken: cancelTokenSource.token });

        const equipmentData: any[] = [];
        data.equipments.map((value: any) => {
          return equipmentData.push({
            id: value.id,
            name: `${value.brand} ${value.model} - ${value.serialNumber} (${value.location ? value.location : '-'})`,
            brand: value.brand,
            model: value.model,
            serialNumber: value.serialNumber,
            location: value.location,
            isMain: value.isMain,
            index: value.index
          });
        });

        setEquipmentMaster(equipmentData);
      };
      getJobNoteTemplates();
      getEquipmentTemplates();

      if (jobNote) {
        const { notes, JobNoteMedia, Equipments } = jobNote;
        const { id } = Equipments![0];

        if (JobNoteMedia && JobNoteMedia.length > 0) {
          setJobNoteMedia(JSON.parse(JSON.stringify(JobNoteMedia)));
        }

        setEquipmentId(id);
        setNotes(notes);
        setNoteName(notes);
      }
    } catch (err) {
      console.log(err);
    }
    return () => {
      cancelTokenSource.cancel();
    };
  }, [serviceAddressId, jobNote]);

  const handleEquipmentChange = (value: number) => {
    if (value) {
      setEquipmentId(value);
      setEquipmentError('');
    } else {
      setEquipmentId(0);
      setEquipmentError('Please select equipment');
    }
  };

  const handleFreeText = (value: any) => {
    setNoteName(value);
    setNotes(value);
    setNotesError('');
  };

  const handleNotesChange = (value: any) => {
    if (value) {
      const { name } = value;
      setNotes(name);
      setNotesError('');
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    let selectedImage: any;
    let selectedImageView: any;

    if (acceptedFiles[0] === undefined) {
      selectedImage = '';
      selectedImageView = '';
      setFileError('Please insert correct file');
    } else {
      selectedImage = acceptedFiles[0];
      selectedImageView = URL.createObjectURL(acceptedFiles[0]);
      setFileError('');

      let newImageKey = '';
      let fileExtension = '';

      const imageType = selectedImage ? selectedImage.type : '';
      fileExtension = imageType ? imageType.split('/').pop()! : '';
      newImageKey = `${Date.now()}.${fileExtension}`;

      setJobNoteMedia(prev => [
        ...prev,
        {
          id: 0,
          jobNoteId: 0,
          fileName: newImageKey,
          fileType: selectedImage.type.includes('image') ? 'image' : 'video',
          imageUrl: selectedImageView,
          imageData: selectedImage,
          fileExtension
        }
      ]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/png,image/jpeg,video/*',
    multiple: false,
    onDrop
  });

  const { ref, ...rootProps } = getRootProps();

  const handleDeleteButton = (index: number) => {
    setSelectedIndex(index);
    setOpenConfirmation(true);
  };

  const handleDeleteJobNoteMedia = (index: number) => {
    const currentJobNoteMedia = [...jobNoteMedia];
    currentJobNoteMedia.splice(index, 1);
    setJobNoteMedia(currentJobNoteMedia);
    setOpenConfirmation(false);
  };

  const handleOnBlurNotes = (note: string) => {
    if (!note) {
      setNotesError('Please enter notes');
      return;
    }

    setNotesError('');
    return;
  };

  const handleAddJobNote = async () => {
    cancelTokenSource = axios.CancelToken.source();

    if (equipmentId === 0) {
      setEquipmentError('Please select equipment');
      return;
    }

    if (!notes) {
      setNotesError('Please enter job note.');
      return;
    }

    if (fileError) {
      return;
    }

    try {
      setIsLoading(true);

      const formData = {
        notes,
        jobId,
        jobNoteType: 'EQUIPMENT',
        equipmentId,
        JobNoteMedia: jobNoteMedia
      };

      const config = { cancelToken: cancelTokenSource.token };

      if (jobNoteMedia.length > 0) {
        jobNoteMedia.map(async media => {
          if (media.id === 0) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', `${media.fileType}/${media.fileExtension}`);
            const config = {
              method: 'PUT',
              headers: myHeaders,
              body: media.imageData
            };

            const { data } = await axios.get(`${GET_PRESIGNED_URL(media.fileName)}`);
            await fetch(data, config);
          }
        });
      }

      if (isEdit) {
        const { id } = jobNote!;
        const { data } = await axios.put(`${GET_EDIT_JOB_NOTE_URL(id)}`, formData, config);

        updateJobNote(jobNoteIndex!, data);
      } else {
        const { data } = await axios.post(`${JOB_NOTE_BASE_URL}`, formData, config);

        addNewJobNote(data);
      }

      handleClose();
      handleSnackbar('success', `Successfully ${isEdit ? 'edited' : 'added'} equipment note`);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      handleClose();
      handleSnackbar('error', 'Failed to add equipment note');
      setIsLoading(false);
    }
  };

  const renderMedia = (jobNoteMedia: JobNoteMediaModel[]) => {
    return (
      <Grid container>
        {jobNoteMedia.map((media, index) => {
          const { imageUrl, fileType } = media;

          if (fileType.includes('image')) {
            return (
              <Grid item xs={2}>
                <img src={imageUrl} alt='logo' className={classes.imageView} />
                <div className={classes.spacingNewLine}>
                  <Tooltip title='Remove Image' placement='top'>
                    <IconButton size='small' onClick={() => handleDeleteButton(index)}>
                      <DeleteIcon color='error' />
                    </IconButton>
                  </Tooltip>
                </div>
              </Grid>
            );
          } else {
            return (
              <Grid item xs={2}>
                <video height='100%' width='100%' src={`${imageUrl}#t=0.5`} controls className={classes.imageView} />
                <div className={classes.spacingNewLine}>
                  <Tooltip title='Remove Image' placement='top'>
                    <IconButton size='small' onClick={() => handleDeleteButton(index)}>
                      <DeleteIcon color='error' />
                    </IconButton>
                  </Tooltip>
                </div>
              </Grid>
            );
          }
        })}
      </Grid>
    );
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={12} className={classes.responsiveScale}>
          <TextField
            select
            fullWidth
            required
            label='Equipment'
            margin='dense'
            variant='outlined'
            autoComplete='off'
            error={equipmentError !== ''}
            helperText={equipmentError}
            value={equipmentId}
            onChange={event => handleEquipmentChange(Number(event.target.value))}
            InputLabelProps={{
              shrink: equipmentId === 0 ? false : true
            }}
          >
            {equipmentMaster.map(value => {
              return (
                <MenuItem key={value.id} value={value.id}>
                  <Grid container spacing={2} alignItems='center'>
                    <Grid item xs={7}>
                      <Typography variant='subtitle1'>
                        {value.brand}, {value.model}
                      </Typography>
                      <Typography variant='body1' color='textSecondary'>
                        {value.serialNumber}
                        {value.location ? `, ${value.location}` : ''}
                      </Typography>
                    </Grid>
                    <Grid item container justify='flex-end' xs={5}>
                      <Chip
                        label={value.isMain ? `Main Equipment ${value.index! + 1}` : `Sub Equipment ${value.index! + 1}`}
                        size='small'
                        style={{
                          color: value.isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                          backgroundColor: value.isMain ? theme.palette.primary.light : theme.palette.secondary.light
                        }}
                      />
                    </Grid>
                  </Grid>
                </MenuItem>
              );
            })}
          </TextField>
          {/* <Autocomplete
            id='combo-box-demo'
            options={equipmentMaster}
            getOptionLabel={option => option.name}
            inputValue={equipmentTitle ? equipmentTitle : ''}
            onChange={(_event: any, value: any) => handleEquipmentChange(value)}
            freeSolo={true}
            autoHighlight={true}
            renderInput={params => (
              <TextField
                {...params}
                required
                label='Equipment'
                margin='dense'
                variant='outlined'
                error={equipmentError !== ''}
                helperText={equipmentError}
              />
            )}
          /> */}
        </Grid>
        {/* <Grid item xs={12} className={classes.responsiveScale}>
          <Grid container spacing={1}>
            <Grid item sm={6}>
              <TextField fullWidth variant='outlined' margin='dense' id='note' label='Brand' value={brand} disabled />
            </Grid>
            <Grid item sm={6}>
              <TextField fullWidth variant='outlined' margin='dense' id='note' label='Model' value={model} disabled />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.responsiveScale}>
          <Grid container spacing={1}>
            <Grid item sm={6}>
              <TextField fullWidth variant='outlined' margin='dense' id='note' label='Serial Number' value={serialNumber} disabled />
            </Grid>
            <Grid item sm={6}>
              <TextField fullWidth variant='outlined' margin='dense' id='note' label='Location' value={location} disabled />
            </Grid>
          </Grid>
        </Grid> */}
        <Grid item xs={12} className={classes.responsiveScale}>
          <Paper {...rootProps} variant='outlined' className={classes.dropZone}>
            <Grid container justify='center' alignItems='center' spacing={1}>
              <Grid container item xs={12} sm={12} alignItems='center' justify='center'>
                <input {...getInputProps()} className={classes.input} id='contained-button-file' />
                {fileError ? (
                  <Grid container>
                    <Grid item xs style={{ textAlign: 'center' }}>
                      <Grid container justify='center' alignItems='center'>
                        <Grid item xs={12}>
                          <ImageIcon fontSize='large' color='error' />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography component='span' variant='body1' color='error' style={{ textAlign: 'center' }}>
                            {fileError}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container>
                    <Grid item xs style={{ textAlign: 'center' }}>
                      <Grid container justify='center' alignItems='center'>
                        <Grid item xs={12}>
                          <ImageIcon fontSize='large' />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            component='span'
                            variant='body1'
                            color={jobNoteMedia.length === 4 ? 'textSecondary' : 'inherit'}
                            style={{ textAlign: 'center' }}
                          >
                            {jobNoteMedia.length === 4 ? 'Maximum 4 media in 1 note' : ' Click Or Drag File Here'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} className={classes.responsiveScale}>
          {jobNoteMedia.length > 0 ? renderMedia(jobNoteMedia) : <></>}
        </Grid>
        <Grid item xs={12} className={classes.responsiveScale}>
          <Autocomplete
            id='combo-box-demo'
            options={jobNoteMaster}
            getOptionLabel={option => option.name}
            inputValue={noteName ? noteName : ''}
            onInputChange={(_event, value) => handleFreeText(value ? value : '')}
            onChange={(_event: any, value: JobNoteTemplateModel | any) => handleNotesChange(value)}
            autoHighlight={true}
            freeSolo
            disabled={isLoading}
            renderInput={params => (
              <TextField
                {...params}
                fullWidth
                variant='outlined'
                margin='dense'
                id='note'
                label='Job Note'
                multiline
                rows={5}
                value={notes}
                error={notesError !== ''}
                helperText={notesError}
                onBlur={event => handleOnBlurNotes(event.target.value)}
                inputProps={{
                  ...params.inputProps,
                  onKeyDown: e => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                    }
                  }
                }}
              />
            )}
          />
        </Grid>
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} style={{ marginTop: 8 }} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' disableElevation disabled={isLoading} style={{ marginTop: 8 }} onClick={handleAddJobNote}>
          Save
          <LoadingButtonIndicator isLoading={isLoading} />
        </Button>
      </DialogActions>
      {openConfirmation && (
        <StandardConfirmationDialog
          variant={'warning'}
          message={'Are you sure you want to delete this media?'}
          open={openConfirmation}
          handleClose={() => setOpenConfirmation(false)}
          onConfirm={() => handleDeleteJobNoteMedia(selectedIndex)}
          isLoading={isLoading}
        />
      )}
    </>
  );
};

export default EquipmentNoteForm;
