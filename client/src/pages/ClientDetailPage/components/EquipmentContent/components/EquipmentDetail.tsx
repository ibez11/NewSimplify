import { FC, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Grid, Typography, IconButton, Divider, Card, CardHeader, CardContent, Tooltip, Chip } from '@material-ui/core';

import axios, { CancelTokenSource } from 'axios';

import { format } from 'date-fns';
import CalendarIcon from '@material-ui/icons/InsertInvitation';
import ViewIcon from '@material-ui/icons/Visibility';
import dummyImage from 'images/noimage.png';

import { GET_JOB_NOTE_BY_EQUIPMENT_ID_URL } from 'constants/url';
import theme from 'theme';
import { grey } from '@material-ui/core/colors';
import MediaPreview from 'components/MediaPreview';

interface Props {
  equipment: EquipmentModel;
  isMain: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  contentGrid: {
    padding: theme.spacing(2)
  },
  divider: {
    marginRight: theme.spacing(2)
  },
  imageDisplay: {
    width: 120,
    height: 120,
    objectFit: 'scale-down',
    borderRadius: 10
  },
  imageContainer: {
    position: 'relative',
    textAlign: 'center',
    width: 120
  },
  middle: {
    opacity: 1,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    msTransform: 'translate(-50%, -50%)',
    textAlign: 'center',
    background: '#E5E5E580',
    borderRadius: 50
  },
  cardHeader: {
    backgroundColor: grey[200],
    color: 'inherit',
    height: theme.spacing(5)
  },
  dateValue: {
    marginLeft: theme.spacing(1)
  },
  chip: {
    borderRadius: 50,
    marginRight: theme.spacing(1),
    minWidth: 100
  }
}));

const EquipmentDetailModal: FC<Props> = props => {
  const classes = useStyles();

  const { equipment, isMain } = props;
  const { id, brand, model, serialNumber, location, address } = equipment!;

  const [jobNotes, setJobNotes] = useState<JobNoteModel[]>([]);
  const [openViewModal, setOpenViewModal] = useState<boolean>(false);
  const [selectedMedia, setSelectedMedia] = useState<JobNoteMediaModel[]>([]);

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const loadJobNote = async () => {
      try {
        const { data } = await axios.get(`${GET_JOB_NOTE_BY_EQUIPMENT_ID_URL(id)}`, { cancelToken: cancelTokenSource.token });

        setJobNotes(data.jobNotes);
      } catch (err) {
        console.log(err);
      }
    };

    loadJobNote();
    return () => {
      cancelTokenSource.cancel();
    };
  }, [id]);

  const handleOpenViewModal = (index: number) => {
    const media = jobNotes[index].JobNoteMedia!;
    setOpenViewModal(true);
    setSelectedMedia(media);
  };

  const renderMedia = (media: JobNoteMediaModel[], index: number) => {
    if (media.length === 0) {
      return (
        <div className={classes.imageContainer}>
          <img src={dummyImage} alt='logo' className={classes.imageDisplay} />
        </div>
      );
    }

    return (
      <>
        {media[0].imageUrl !== '' ? (
          <>
            {media[0].fileType === 'image' ? (
              <>
                <div className={classes.imageContainer}>
                  <img src={media[0].imageUrl} alt='logo' className={classes.imageDisplay} />
                  <div className={classes.middle}>
                    <Tooltip title='View Image'>
                      <IconButton onClick={() => handleOpenViewModal(index)}>
                        {media.length > 1 ? <Typography variant='h5'>+{media.length - 1}</Typography> : <ViewIcon fontSize='small' />}
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
                      <ViewIcon fontSize='small' />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={classes.imageContainer}>
            <img src={dummyImage} alt='logo' className={classes.imageDisplay} />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Card variant='outlined' style={{ margin: theme.spacing(2) }}>
        <CardHeader
          title={
            <Grid container spacing={1} alignItems='center'>
              <Grid item xs={8}>
                <Typography variant='h5'>{brand}</Typography>
              </Grid>
              <Grid item container justify='flex-end' xs={4}>
                <Chip
                  key={'main'}
                  label={isMain ? 'Main Equipment' : 'Sub Equipment'}
                  className={classes.chip}
                  style={{
                    color: isMain ? theme.palette.primary.main : theme.palette.secondary.main,
                    backgroundColor: isMain ? theme.palette.primary.light : theme.palette.secondary.light
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='body1'>{address}</Typography>
              </Grid>
              <Grid item xs={12} style={{ marginTop: theme.spacing(0.5) }}>
                <Grid container spacing={2} alignItems='center'>
                  <Grid item>
                    <Typography variant='body1' color='textSecondary'>
                      Model: {model}
                    </Typography>
                  </Grid>
                  <Divider orientation='vertical' flexItem />
                  <Grid item>
                    <Typography variant='body1' color='textSecondary'>
                      Serial No.: {serialNumber}
                    </Typography>
                  </Grid>
                  <Divider orientation='vertical' flexItem />
                  <Grid item>
                    <Typography variant='body1' color='textSecondary'>
                      Location: {location || '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          }
        />
        <CardContent>
          <Grid container spacing={1} alignItems='center'>
            <Grid item xs={12}>
              {jobNotes.length > 0 ? (
                jobNotes.map((value, index) => {
                  return (
                    <Card variant='outlined'>
                      <CardHeader
                        title={
                          <Grid container alignItems='center'>
                            <CalendarIcon />
                            <Typography variant='h6' className={classes.dateValue}>
                              {format(new Date(value.createdAt!), 'dd MMMM yyyy, hh:mm a')}
                            </Typography>
                          </Grid>
                        }
                        className={classes.cardHeader}
                      />
                      <Divider />
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={2}>
                            {renderMedia(value.JobNoteMedia!, index)}
                          </Grid>
                          <Grid item xs={9} className={classes.dateValue}>
                            <Typography variant='h5' gutterBottom>
                              {value.UserProfile ? value.UserProfile.displayName : '-'}
                            </Typography>
                            <Typography variant='body2'>{value.notes}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card variant='outlined'>
                  <CardHeader className={classes.cardHeader} />
                  <CardContent>
                    <Grid spacing={2}>
                      <Grid item container justify='center' xs={12}>
                        <Typography variant='subtitle1'>No Work History</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {openViewModal && <MediaPreview open={openViewModal} setOpen={setOpenViewModal} media={selectedMedia} />}
    </>
  );
};

export default EquipmentDetailModal;
