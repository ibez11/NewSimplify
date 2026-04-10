import { FC, Fragment, useState } from 'react';
import {
  createStyles,
  IconButton,
  makeStyles,
  Theme,
  Typography,
  Tooltip,
  withStyles,
  TableRow,
  TableCell,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';

import DownloadIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import ViewIcon from '@material-ui/icons/Visibility';
import EditIcon from '@material-ui/icons/Edit';

import dummyImage from 'images/noimage.png';
import MediaPreview from 'components/MediaPreview';

import { GET_DELETE_JOB_NOTE_BY_ID_URL, GET_EDIT_JOB_NOTE_VISIBILITY_URL } from 'constants/url';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { JobNoteType } from 'constants/enum';
import axios, { CancelTokenSource } from 'axios';
import { Skeleton } from '@material-ui/lab';
import theme from 'theme';

interface Props {
  isLoading: boolean;
  jobNotes: JobNoteModel[];
  updateJobNoteVisibility: (jobNoteIndex: number, jobNoteStatus: boolean) => void;
  deleteIndividualJobNote: (jobNoteIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  handleEditJobNote: (noteType: JobNoteType, index: number) => void;
}

const useStyles = makeStyles(() => ({
  dummyImageDisplay: {
    width: 100,
    height: 100,
    objectFit: 'scale-down'
  },
  imageDisplay: {
    width: 100,
    height: 100,
    objectFit: 'scale-down',
    borderRadius: 10
  },
  imageContainer: {
    position: 'relative',
    textAlign: 'center',
    width: 100
  },
  middle: {
    opacity: 1,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    msTransform: 'translate(-50%, -50%)',
    textAlign: 'center',
    background: '#00000060',
    borderRadius: 50
  },
  noneBorder: {
    borderStyle: 'none'
  },
  chip: {
    borderRadius: 50,
    minWidth: 100
  }
}));

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface IProps extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1),
      marginTop: 0,
      marginBottom: 0
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#53A0BE',
          opacity: 1,
          border: 'none'
        }
      },
      '&$focusVisible $thumb': {
        color: '#53A0BE',
        border: '6px solid #fff'
      }
    },
    thumb: {
      width: 24,
      height: 24
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border'])
    },
    checked: {},
    focusVisible: {}
  })
)(({ classes, ...props }: IProps) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  );
});

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, jobNotes, updateJobNoteVisibility, deleteIndividualJobNote, handleSnackbar, handleEditJobNote } = props;

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedNote, setSelectedNote] = useState<number>(0);
  const [selectedMedia, setSelectedMedia] = useState<JobNoteMediaModel[]>([]);

  const handleOpenDialog = (jobId: number, index: number) => {
    setOpenConfirmation(true);
    setSelectedNote(jobId);
    setSelectedIndex(index);
  };

  const handleOpenViewModal = (index: number) => {
    const media = jobNotes[index].JobNoteMedia!;

    setOpenViewModal(true);
    setSelectedMedia(media);
  };

  const handleDownloadButton = async (jobNoteMedia: JobNoteMediaModel[]) => {
    try {
      setIsProcessing(true);
      const link = document.createElement('a');
      // eslint-disable-next-line array-callback-return
      jobNoteMedia.map(value => {
        if (value.imageUrl) {
          link.href = value.imageUrl;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
        }
      });

      setIsProcessing(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteJobNote = async (jobNoteId: number, index: number) => {
    try {
      setIsProcessing(true);
      await axios.delete(`${GET_DELETE_JOB_NOTE_BY_ID_URL(jobNoteId)}`);
      deleteIndividualJobNote(index);
      handleSnackbar('success', 'Successfully deleted job note');
      setOpenConfirmation(false);
      setIsProcessing(false);
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed to delete job note');
      setIsProcessing(false);
    }
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>, jobNoteIndex: number, jobNoteId: number, jobNoteStatus: boolean) => {
    setIsProcessing(true);
    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      await axios.put(`${GET_EDIT_JOB_NOTE_VISIBILITY_URL(jobNoteId)}`, { isHide: jobNoteStatus }, { cancelToken: cancelTokenSource.token });
      updateJobNoteVisibility(jobNoteIndex, jobNoteStatus);
      handleSnackbar('success', 'Successfully update job note');
      setIsProcessing(false);
    } catch (err) {
      handleSnackbar('error', 'Failed to update job note');
      setIsProcessing(false);
    }
  };

  const renderMedia = (media: JobNoteMediaModel[], index: number) => {
    if (media.length === 0) {
      return (
        <div className={classes.imageContainer}>
          <img src={dummyImage} alt='logo' className={classes.dummyImageDisplay} />{' '}
        </div>
      );
    }

    return (
      <>
        {media[0].imageUrl !== '' ? (
          <Fragment>
            {media[0].fileType === 'image' ? (
              <>
                <div className={classes.imageContainer}>
                  <img src={media[0].imageUrl} alt='logo' className={classes.imageDisplay} />
                  <div className={classes.middle}>
                    <Tooltip title='View Image'>
                      <IconButton onClick={() => handleOpenViewModal(index)}>
                        {media.length > 1 ? (
                          <Typography variant='h5' style={{ color: '#FFFFFF' }}>
                            +{media.length - 1}
                          </Typography>
                        ) : (
                          <ViewIcon fontSize='small' style={{ color: '#FFFFFF' }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              </>
            ) : (
              <div className={classes.imageContainer}>
                <video width='110' src={`${media[0].imageUrl}#t=0.5`} />
                <div className={classes.middle}>
                  <Tooltip title='View Video'>
                    <IconButton onClick={() => handleOpenViewModal(index)}>
                      <ViewIcon fontSize='small' style={{ color: '#FFFFFF' }} />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            )}
          </Fragment>
        ) : (
          <div className={classes.imageContainer}>
            <img src={dummyImage} alt='logo' className={classes.dummyImageDisplay} />
          </div>
        )}
      </>
    );
  };

  const renderJobNotes = () => {
    if (jobNotes && jobNotes.length > 0) {
      return jobNotes.map((value, index) => (
        <TableRow key={value.id}>
          <TableCell width={'14%'}>
            {isLoading ? <Skeleton width={'50%'} height={80} variant='rect' /> : renderMedia(value.JobNoteMedia!, index)}
          </TableCell>
          <TableCell width={'15%'}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                {value.notes}
              </Typography>
            )}
          </TableCell>
          <TableCell width={'20%'}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : value.Equipments && value.Equipments.length > 0 ? (
              <Grid item xs={12} key={`grid-equipment-${index}`}>
                <List dense key={`equipment-list-${index}`}>
                  {value.Equipments.map(equipment => (
                    <ListItem key={`equipment-item-${equipment.id}`}>
                      <ListItemText
                        key={`equipment-${equipment.serialNumber}`}
                        style={{ whiteSpace: 'pre-line' }}
                        disableTypography
                        primary={
                          <Typography component='span' style={{ display: 'block', whiteSpace: 'pre-line' }}>
                            {`\u25CF ${equipment.brand} ${equipment.model}, ${equipment.serialNumber}\n`}
                            {equipment.location ? (
                              <>
                                ({equipment.location} -{' '}
                                <Chip
                                  key={'main'}
                                  label={
                                    equipment.isMain ? `Main Equipment ${equipment.index! + 1 ?? ''}` : `Sub Equipment ${equipment.index! + 1 ?? ''}`
                                  }
                                  className={classes.chip}
                                  size='small'
                                  style={{
                                    color: equipment.isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                                    backgroundColor: equipment.isMain ? theme.palette.primary.light : theme.palette.secondary.light
                                  }}
                                />
                                )
                              </>
                            ) : (
                              <>
                                (
                                <Chip
                                  key={'main'}
                                  label={
                                    equipment.isMain ? `Main Equipment ${equipment.index! + 1 ?? ''}` : `Sub Equipment ${equipment.index! + 1 ?? ''}`
                                  }
                                  className={classes.chip}
                                  size='small'
                                  style={{
                                    color: equipment.isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                                    backgroundColor: equipment.isMain ? theme.palette.primary.light : theme.palette.secondary.light
                                  }}
                                />
                                )
                              </>
                            )}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            ) : (
              '-'
            )}
          </TableCell>
          <TableCell width={'10%'}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body2'>{value.displayName || '-'}</Typography>}
          </TableCell>
          <TableCell width={'10%'}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <FormControlLabel
                control={
                  <IOSSwitch
                    checked={!value.isHide}
                    onChange={event => handleChange(event, index, value.id, !value.isHide!)}
                    name='showhideJobNote'
                  />
                }
                disabled={isProcessing}
                labelPlacement='end'
                label={!value.isHide ? 'Yes' : 'No'}
                style={{ marginRight: 0 }}
              />
            )}
          </TableCell>
          <TableCell width={'10%'}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <>
                {value.JobNoteMedia && value.JobNoteMedia.length > 0 && value.JobNoteMedia[0].imageUrl && (
                  <Tooltip title='Download File'>
                    <IconButton disabled={isProcessing} onClick={() => handleDownloadButton(value.JobNoteMedia!)} style={{ marginTop: 8 }}>
                      <DownloadIcon color='primary' />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title='Edit Job Note'>
                  <IconButton disabled={isProcessing} onClick={() => handleEditJobNote(JobNoteType.EQUIPMENT, index)} style={{ marginTop: 8 }}>
                    <EditIcon color='primary' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Delete Job Note'>
                  <IconButton disabled={isProcessing} onClick={() => handleOpenDialog(value.id, index)} style={{ marginTop: 8 }}>
                    <DeleteIcon color='error' />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </TableCell>
        </TableRow>
      ));
    } else {
      return (
        <TableRow key='empty-general'>
          <TableCell align='center' colSpan={6} className={classes.noneBorder}>
            <Typography variant='body2' id='form-subtitle' color='textSecondary'>
              No Job Notes
            </Typography>
          </TableCell>
        </TableRow>
      );
    }
  };

  return (
    <>
      {renderJobNotes()}
      {openViewModal && <MediaPreview open={openViewModal} setOpen={setOpenViewModal} media={selectedMedia} />}
      {openConfirmation && (
        <StandardConfirmationDialog
          variant={'warning'}
          message={'Are you sure you want to delete this job note?'}
          open={openConfirmation}
          handleClose={() => setOpenConfirmation(false)}
          onConfirm={() => handleDeleteJobNote(selectedNote, selectedIndex)}
          isLoading={isProcessing}
        />
      )}
    </>
  );
};

export default BodyRow;
