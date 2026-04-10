import { FC, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Theme, Typography, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import NextIcon from '@material-ui/icons/NavigateNext';
import BackIcon from '@material-ui/icons/NavigateBefore';

interface ImageWithPreviewProps {
  media: JobNoteMediaModel[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  viewModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  imageFull: {
    width: 500,
    height: '50%',
    objectFit: 'scale-down'
  },
  contentGrid: {
    padding: theme.spacing(2),
    marginRight: theme.spacing(2)
  }
}));

const MediaPreview: FC<ImageWithPreviewProps> = props => {
  const { media, open, setOpen } = props;
  const classes = useStyles();

  const [imageIndex, setImageIndex] = useState<number>(0);
  const [imageCount, setImageCount] = useState<number>(media.length);

  const handleCloseViewModal = () => {
    setOpen(false);
    setImageIndex(0);
    setImageCount(0);
  };

  const handleButton = (index: number) => {
    setImageIndex(index);
  };

  const renderPreview = () => {
    if (media.length > 1) {
      if (media[imageIndex].fileType === 'image') {
        return <img src={media[imageIndex].imageUrl} alt='logo' className={classes.imageFull} />;
      } else {
        return <video width='500' src={`${media[imageIndex].imageUrl}#t=0.5`} controls />;
      }
    } else {
      if (media[0].fileType === 'image') {
        return <img src={media[0].imageUrl} alt='logo' className={classes.imageFull} />;
      } else {
        return <video width='500' src={`${media[0].imageUrl}#t=0.5`} controls />;
      }
    }
  };

  return (
    <Dialog open={open} className={classes.viewModal} closeAfterTransition onClose={handleCloseViewModal} scroll='body' fullWidth maxWidth='md'>
      <DialogTitle>
        <Typography variant='h5' id='invoice-modal'>
          Preview
        </Typography>
        <IconButton size='small' className={classes.closeButton} onClick={handleCloseViewModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container alignItems='center'>
          <Grid item xs className={classes.contentGrid} spacing={2}>
            {renderPreview()}
          </Grid>
        </Grid>
        {media.length > 1 && (
          <DialogActions>
            <Grid container justify='center'>
              <Button
                variant='contained'
                disableElevation
                disabled={imageIndex === 0}
                onClick={() => handleButton(imageIndex - 1)}
                style={{ marginRight: 8 }}
              >
                <BackIcon fontSize='small' /> Prev
              </Button>
              <Button variant='contained' disableElevation disabled={imageIndex + 1 === imageCount} onClick={() => handleButton(imageIndex + 1)}>
                Next <NextIcon fontSize='small' />
              </Button>
            </Grid>
          </DialogActions>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreview;
