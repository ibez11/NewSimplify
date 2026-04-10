import { FC, useState, useCallback, useEffect, useContext } from 'react';
import { Grid, TextField, Theme, Typography, Button, Paper, DialogActions, Tooltip, IconButton, Chip, Checkbox, CircularProgress, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import ImageIcon from '@material-ui/icons/AddPhotoAlternate';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import {
  GET_EDIT_JOB_NOTE_URL,
  GET_EQUIPEMENT_BY_SERVICE_ADDRESS_ID_URL,
  GET_PRESIGNED_URL,
  JOB_NOTE_BASE_URL,
  JOB_NOTE_TEMPLATE_BASE_URL,
  GENERATE_TEXT_URL,
  AI_SPELL_CHECK_URL
} from 'constants/url';
import axios, { CancelTokenSource } from 'axios';
import { useDropzone } from 'react-dropzone';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { StandardConfirmationDialog } from 'components/AppDialog';
import theme from 'theme';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';
import { ReactComponent as RewriteIcon } from 'images/ButtonIcon/rewrite-ai.svg';
import { ReactComponent as SpellingCheckIcon } from 'images/ButtonIcon/spelling-check.svg';
import { ReactComponent as OptimizedAIIcon } from 'images/ButtonIcon/optimized-ai.svg';
import Popper from '@material-ui/core/Popper';


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
  },
  checkBoxIcon: {
    fontSize: '16px'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  }, 
  rewriteButton: {
    backgroundColor: '#FEF2DE',
    color: '#EF965A',
    marginRight: theme.spacing(1)
  },
  spellCheckButton: {
    backgroundColor: '#DFFBFB',
    color: '#53A0BE'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const NoteForm: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;
  const { currentUser } = useContext(CurrentUserContext);

  const { jobId, serviceAddressId, isEdit, jobNoteIndex, jobNote, addNewJobNote, updateJobNote, handleClose, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingRewriteWithAi, setIsLoadingRewriteWithAi] = useState<boolean>(false);
  const [isLoadingSpellCheckWithAi, setIsLoadingSpellCheckWithAi] = useState<boolean>(false);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [labelOptimized, setLabelOptimized] = useState<string>('');
  const [jobNoteMaster, setJobNoteMaster] = useState<Select[]>([]);
  const [jobNoteTemplates, setJobNoteTemplates] = useState<Select[]>([]);
  const [equipmentMaster, setEquipmentMaster] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<EquipmentModel[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [noteName, setNoteName] = useState<string>('');
  const [notesError, setNotesError] = useState<string>('');
  const [fileError, setFileError] = useState<string>('');
  const [equipmentError, setEquipmentError] = useState<string>('');
  const [jobNoteMedia, setJobNoteMedia] = useState<JobNoteMediaModel[]>([]);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterOptions, setfilterOptions] = useState(false);
  const showAiButton = noteName.length >= 2;

  const CustomPopper = (props: any) => {
    return <Popper {...props} placement="bottom-start" modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]} />;
  };

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      const getJobNoteTemplates = async () => {
        const { data } = await axios.get(JOB_NOTE_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });
        let jobNoteData: Select[] = [];
        data.JobNoteTemplates.map((value: any) => {
          return jobNoteData.push({ id: value.id, name: value.notes });
        });
        setJobNoteTemplates(jobNoteData);
        setJobNoteMaster(jobNoteData);
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

        if (JobNoteMedia && JobNoteMedia.length > 0) {
          setJobNoteMedia(JSON.parse(JSON.stringify(JobNoteMedia)));
        }

        if (Equipments && Equipments.length > 0) {
          setEquipments(Equipments);
        }

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

  const handleRewriteWithAI = async (prompt: string) => {
    setIsLoadingRewriteWithAi(true);
    setfilterOptions(true);
    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      if (prompt !== "") {
      const { data } = await axios.post(
          GENERATE_TEXT_URL,
          { prompt },
          { cancelToken: cancelTokenSource.token }
        );

        const suggestions: Select[] = data.result.map((value: string, index: number) => ({
          id: index,
          name: value,
        }));

        setJobNoteMaster(suggestions);
        setDropdownOpen(true);
        setIsOptimized(true);
        setLabelOptimized('AI-assisted rewrite applied.');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('Request was cancel:', error.message);
      } else {
        console.error('Error:', error);
      }
    } finally{
      setIsLoadingRewriteWithAi(false);
    } 
  };
  const handleSpellCheckWithAI = async (prompt: string) => {
    if (prompt) {
      setIsLoadingSpellCheckWithAi(true);
      try {
        const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
        const { data } = await axios.post(
          AI_SPELL_CHECK_URL,
          { prompt: notes },
          { cancelToken: cancelTokenSource.token }
        )
        setNoteName(data.result);
        setNotes(data.result);
        setIsOptimized(true);
        setLabelOptimized('Spell-checked and replaced by AI.');
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoadingSpellCheckWithAi(false);
      }
    }
  };

  const handleEquipmentChange = (value: any) => {
    if (value) {
      setEquipments(value);
      setEquipmentError('');
    }
  };

  const handleFreeText = (value: any) => {
    setNoteName(value);
    setNotes(value);
    setNotesError('');
    if (value === '') {
      setJobNoteMaster(jobNoteTemplates);
      setIsOptimized(false);
      setfilterOptions(false);
      return;
    }
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
    accept: 'image/png,image/jpeg,video/mp4',
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
        equipmentIds: equipments.map(item => item.id),
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
      CreateLogEvent('job_notes', currentUser!);
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
                          <Typography component='span' variant='body1' style={{ textAlign: 'center' }}>
                            Click Or Drag File Here
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
        {showAiButton && (
        <Grid item xs={12} className={classes.responsiveScale}>
          <Button
            id='rewrite-button'
            variant='contained'
            disabled={isLoadingRewriteWithAi}
            className={classes.rewriteButton}
            disableElevation
            style={{ opacity: isLoadingRewriteWithAi ? 0.6 : 1 }}
            onClick={() => handleRewriteWithAI(notes)}
            startIcon={<RewriteIcon />}
          >
            Rewrite with A.I
            {isLoadingRewriteWithAi && (
              <Fade
                in={isLoadingRewriteWithAi}
                style={{
                  transitionDelay: '0ms'
                }}
                unmountOnExit
              >
                <CircularProgress size={24} className={classes.buttonProgress} style={{ color: '#EF965A' }} />
              </Fade>
            )}
          </Button><Button
            id='spell-check-button'
            variant='contained'
            disabled={isLoadingSpellCheckWithAi}
            className={classes.spellCheckButton}
            disableElevation
            style={{ opacity: isLoadingSpellCheckWithAi ? 0.6 : 1 }}
            onClick={() => handleSpellCheckWithAI(notes)}
            startIcon={<SpellingCheckIcon />}
          >
              Spell Check with A.I
              {isLoadingSpellCheckWithAi && (
                <Fade
                  in={isLoadingSpellCheckWithAi}
                  style={{
                    transitionDelay: '0ms'
                  }}
                  unmountOnExit
                >
                  <CircularProgress size={24} className={classes.buttonProgress} style={{ color: 'primary' }} />
                </Fade>
              )}  
          </Button>
        </Grid>
        )}
        <Grid item xs={12} className={classes.responsiveScale}>
          <Autocomplete
            id='combo-box-demo'
            open={dropdownOpen}
            onOpen={() => setDropdownOpen(true)}
            onClose={() => setDropdownOpen(false)}
            options={jobNoteMaster}
            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
            filterOptions={options => filterOptions ? options : options.filter((option) => option.name.toLowerCase().includes(notes.toLowerCase()))}
            inputValue={noteName || ''}
            onInputChange={(_, value) => handleFreeText(value || '')}
            onChange={(_, value) => handleNotesChange(value)}
            autoHighlight
            freeSolo
            disabled={isLoading}
            autoSelect={false}
            selectOnFocus={false}
            PopperComponent={CustomPopper}
            renderInput={(params) => (
              <div style={{ position: 'relative' }}>
                <TextField
                  {...params}
                  fullWidth
                  variant='outlined'
                  margin='dense'
                  id='note'
                  label='Job Note'
                  multiline
                  rows={7}
                  value={notes}
                  error={notesError !== ''}
                  helperText={notesError}
                  onBlur={event => handleOnBlurNotes(event.target.value)}
                  InputProps={{
                    ...params.InputProps
                  }}
                />
                
              </div>
            )}
          />
          {isOptimized && (
          <div style={{ fontSize: '11px', color: labelOptimized.includes('rewrite') ? '#EF965A' : '#53A0BE', marginLeft: '4px', marginTop: '4px' }}>
            <IconButton
              size='small'
              disableRipple
              disableFocusRipple
              disableTouchRipple
            >
              <OptimizedAIIcon fill={labelOptimized.includes('rewrite') ? '#EF965A' : '#53A0BE'} />
            </IconButton>
            {labelOptimized}
          </div>)}
        </Grid>
        <Grid item xs={12} className={classes.responsiveScale}>
          <Autocomplete
            multiple
            id='equipments'
            disableCloseOnSelect
            options={equipmentMaster}
            getOptionLabel={option => `${option.brand} ${option.model} - ${option.serialNumber} (${option.location ? option.location : '-'})`}
            value={equipments}
            getOptionSelected={(option, value) => (value.id === option.id ? true : false)}
            onChange={(_: any, value: EquipmentModel | any) => handleEquipmentChange(value)}
            autoHighlight={true}
            fullWidth
            renderOption={(option, { selected }) => (
              <Grid container spacing={1}>
                <Grid item xs={1} style={{ paddingLeft: !option.isMain ? theme.spacing(3) : theme.spacing(1.5) }}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxIcon} />}
                    checkedIcon={<CheckBoxIcon className={classes.checkBoxIcon} />}
                    color='primary'
                    disableRipple
                    className={classes.checkBox}
                    checked={selected}
                  />
                </Grid>
                <Grid item xs={11} container spacing={2} alignItems='center'>
                  <Grid item xs={7}>
                    <Typography variant='subtitle1'>
                      {option.brand}, {option.model}
                    </Typography>
                    <Typography variant='body1' color='textSecondary'>
                      {option.serialNumber}
                      {option.location ? `, ${option.location}` : ''}
                    </Typography>
                  </Grid>
                  <Grid item container justify='flex-end' xs={5}>
                    <Chip
                      label={option.isMain ? `Main Equipment ${option.index! + 1}` : `Sub Equipment ${option.index! + 1}`}
                      size='small'
                      style={{
                        color: option.isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                        backgroundColor: option.isMain ? theme.palette.primary.light : theme.palette.secondary.light
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={`${option.brand} ${option.model} - ${option.serialNumber} ${option.location ? `(${option.location})` : ''}`}
                  {...getTagProps({ index })}
                  style={{
                    color: option.isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                    backgroundColor: option.isMain ? theme.palette.primary.light : theme.palette.secondary.light
                  }}
                />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                margin='dense'
                variant='outlined'
                label={equipments.length > 0 ? 'Equipment' : 'Select Equipment'}
                value={equipments}
                error={equipmentError !== ''}
                helperText={equipmentError}
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

export default NoteForm;
