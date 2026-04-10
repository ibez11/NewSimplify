import React, { FC, Fragment } from 'react';
import { ButtonBase, createStyles, Grid, makeStyles, Paper, Theme, Tooltip, Typography, IconButton } from '@material-ui/core';
import UploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Close';

interface Props {
  isSubmitting: boolean;
  isEdit: boolean;

  paynowGstView: string;
  paynowGstError: string;
  setPaynowGst: React.Dispatch<React.SetStateAction<string>>;
  setPaynowGstView: React.Dispatch<React.SetStateAction<string>>;
  setUploadImageGst: React.Dispatch<React.SetStateAction<boolean>>;

  paynowNonGstView: string;
  paynowNonGstError: string;
  setPaynowNonGst: React.Dispatch<React.SetStateAction<string>>;
  setPaynowNonGstView: React.Dispatch<React.SetStateAction<string>>;
  setUploadImageNonGst: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    leftPaper: {
      padding: theme.spacing(2),
      textAlign: 'center'
    },
    firstPaper: {
      marginBottom: theme.spacing(2),
      padding: theme.spacing(2),
      textAlign: 'center'
    },
    secondPaper: {
      padding: theme.spacing(2),
      textAlign: 'center'
    },
    spacingNewLine: {
      marginBottom: theme.spacing(1.5)
    },
    buttonBaseStyle: {
      position: 'relative',
      [theme.breakpoints.down('xs')]: {
        width: '100% !important'
      }
    },
    inputImageStyle: {
      display: 'none'
    },
    cancelImage: {
      fontSize: '12px',
      cursor: 'pointer'
    },
    imageView: {
      maxWidth: '70%'
    },
    closeButton: {
      marginRight: theme.spacing(-1)
    },
    icon: {
      fontSize: 20
    }
  })
);

const MiddleContent: FC<Props> = props => {
  const classes = useStyles(props);

  const { paynowGstView, setPaynowGstView, setPaynowGst, setUploadImageGst } = props;
  const { paynowNonGstView, setPaynowNonGstView, setPaynowNonGst, setUploadImageNonGst, isEdit } = props;

  const renderPaynowGstComponent = () => {
    if (paynowGstView === '') {
      return (
        <Fragment>
          <input
            accept='image/*'
            className={classes.inputImageStyle}
            id='outlined-button-file-gst'
            type='file'
            onChange={event => handleChoosePaynowGst(event)}
            disabled={isEdit ? false : true}
          />
          <label htmlFor='outlined-button-file-gst'>
            <ButtonBase focusRipple key={'Upload'} component='span' disableRipple disabled={isEdit ? false : true}>
              <Tooltip title='Choose an image' placement='top'>
                <UploadIcon fontSize='large' />
              </Tooltip>
            </ButtonBase>
          </label>
          <div className={classes.spacingNewLine}>
            <Typography color='textSecondary' variant='caption' display='block' gutterBottom>
              For best results, use an image
            </Typography>
            <Typography color='textSecondary' variant='caption' display='block' gutterBottom>
              at least 128px by 128px in .jpg format
            </Typography>
          </div>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {isEdit ? (
            <Grid container direction='row' justify='flex-end'>
              <Tooltip title='Remove Image' placement='top'>
                <IconButton size='small' onClick={cancelPaynowGst} className={classes.closeButton}>
                  <DeleteIcon className={classes.icon} />
                </IconButton>
              </Tooltip>
            </Grid>
          ) : (
            ''
          )}
          <input
            accept='image/*'
            className={classes.inputImageStyle}
            id='outlined-button-file-gst'
            type='file'
            onChange={event => handleChoosePaynowGst(event)}
            disabled={!isEdit}
          />
          <label htmlFor='outlined-button-file-gst'>
            <ButtonBase focusRipple key={'Upload'} className={classes.buttonBaseStyle} component='span' disableRipple disabled={!isEdit}>
              <Tooltip title='Choose an image' placement='top'>
                <img src={paynowGstView} alt='Paynow Non Gst' className={classes.imageView} />
              </Tooltip>
            </ButtonBase>
          </label>
        </Fragment>
      );
    }
  };

  const handleChoosePaynowGst = (event: any) => {
    let imagePaynowGst;
    let imagePaynowGstView;
    if (event.target.files[0] === undefined) {
      imagePaynowGst = '';
      imagePaynowGstView = '';
    } else {
      imagePaynowGst = event.target.files[0];
      imagePaynowGstView = URL.createObjectURL(event.target.files[0]);
    }
    setPaynowGst(imagePaynowGst);
    setPaynowGstView(imagePaynowGstView);
    setUploadImageGst(true);
  };

  const cancelPaynowGst = () => {
    setUploadImageGst(false);
    setPaynowGst('');
    setPaynowGstView('');
  };

  const renderPaynowNonGstComponent = () => {
    if (paynowNonGstView === '') {
      return (
        <Fragment>
          <input
            accept='image/*'
            className={classes.inputImageStyle}
            id='outlined-button-file-non'
            type='file'
            onChange={event => handleChoosePaynowNonGst(event)}
            disabled={isEdit ? false : true}
          />
          <label htmlFor='outlined-button-file-non'>
            <ButtonBase focusRipple key={'Upload'} component='span' disableRipple disabled={isEdit ? false : true}>
              <Tooltip title='Choose an image' placement='top'>
                <UploadIcon fontSize='large' />
              </Tooltip>
            </ButtonBase>
          </label>
          <div className={classes.spacingNewLine}>
            <Typography color='textSecondary' variant='caption' display='block' gutterBottom>
              For best results, use an image
            </Typography>
            <Typography color='textSecondary' variant='caption' display='block' gutterBottom>
              at least 128px by 128px in .jpg format
            </Typography>
          </div>
        </Fragment>
      );
    } else {
      return (
        <Fragment>
          {isEdit ? (
            <Grid container direction='row' justify='flex-end'>
              <Tooltip title='Remove Image' placement='top'>
                <IconButton size='small' onClick={cancelPaynowNonGst} className={classes.closeButton}>
                  <DeleteIcon className={classes.icon} />
                </IconButton>
              </Tooltip>
            </Grid>
          ) : (
            ''
          )}
          <input
            accept='image/*'
            className={classes.inputImageStyle}
            id='outlined-button-file-non'
            type='file'
            onChange={event => handleChoosePaynowNonGst(event)}
            disabled={!isEdit}
          />
          <label htmlFor='outlined-button-file-non'>
            <ButtonBase focusRipple key={'Upload'} className={classes.buttonBaseStyle} component='span' disableRipple disabled={!isEdit}>
              <Tooltip title='Choose an image' placement='top'>
                <img src={paynowNonGstView} alt='Paynow Non Gst' className={classes.imageView} />
              </Tooltip>
            </ButtonBase>
          </label>
        </Fragment>
      );
    }
  };

  const handleChoosePaynowNonGst = (event: any) => {
    let imagePaynowNonGst;
    let imagePaynowNonGstView;
    if (event.target.files[0] === undefined) {
      imagePaynowNonGst = '';
      imagePaynowNonGstView = '';
    } else {
      imagePaynowNonGst = event.target.files[0];
      imagePaynowNonGstView = URL.createObjectURL(event.target.files[0]);
    }
    setPaynowNonGst(imagePaynowNonGst);
    setPaynowNonGstView(imagePaynowNonGstView);
    setUploadImageNonGst(true);
  };

  const cancelPaynowNonGst = () => {
    setUploadImageNonGst(false);
    setPaynowNonGst('');
    setPaynowNonGstView('');
  };

  return (
    <Fragment>
      <Paper className={classes.firstPaper}>
        <Grid container direction='row' justify='center' alignItems='center'>
          <div className={classes.spacingNewLine}>{renderPaynowGstComponent()}</div>
          <div className={classes.spacingNewLine}>
            <Typography color='primary' variant='caption' display='block' gutterBottom>
              QRCODE for GST
            </Typography>
          </div>
        </Grid>
      </Paper>
      <Paper className={classes.secondPaper}>
        <Grid container direction='row' justify='center' alignItems='center'>
          <div className={classes.spacingNewLine}>{renderPaynowNonGstComponent()}</div>
          <div className={classes.spacingNewLine}>
            <Typography color='primary' variant='caption' display='block' gutterBottom>
              QRCODE for non GST
            </Typography>
          </div>
        </Grid>
      </Paper>
    </Fragment>
  );
};

export default MiddleContent;
