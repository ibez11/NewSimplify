import React, { FC, Fragment } from 'react';
import { ButtonBase, createStyles, Grid, makeStyles, Paper, Theme, Tooltip, Typography, IconButton } from '@material-ui/core';
import UploadIcon from '@material-ui/icons/CloudUpload';
import DeleteIcon from '@material-ui/icons/Close';

interface Props {
  isSubmitting: boolean;
  isEdit: boolean;

  logoView: string;
  logoError: string;
  setLogo: React.Dispatch<React.SetStateAction<string>>;
  setLogoView: React.Dispatch<React.SetStateAction<string>>;
  setUploadImage: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    leftPaper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      height: '100%'
    },
    root: {
      minWidth: '100%',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    },
    bigAvatar: (props: Props) => ({
      width: 80,
      height: 80,
      color: `${props.logoError !== '' ? '#f44336' : '#C4C4C4'}`,
      backgroundColor: '#FFFFFF',
      boxShadow: `0px 1px 1px 1px ${props.logoError !== '' ? '#f44336' : ''}`
    }),
    spacingNewLine: {
      marginBottom: theme.spacing(1.5),
      width: '100%',
      height: '100%'
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
      maxWidth: '100%'
    },
    closeButton: {
      marginRight: theme.spacing(-1)
    },
    icon: {
      fontSize: 20
    }
  })
);

const LeftContent: FC<Props> = props => {
  const classes = useStyles(props);

  const { isEdit, logoView, setLogoView, setLogo, setUploadImage, logoError } = props;

  const renderImageComponent = () => {
    if (logoView === '') {
      return (
        <Fragment>
          <input
            accept='image/*'
            className={classes.inputImageStyle}
            id='outlined-button-file'
            type='file'
            onChange={event => handleChooseImage(event)}
          />
          <label htmlFor='outlined-button-file'>
            <ButtonBase focusRipple key={'Upload'} component='span' disableRipple disabled={!isEdit}>
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
                <IconButton size='small' onClick={cancelImage} className={classes.closeButton}>
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
            id='outlined-button-file'
            type='file'
            onChange={event => handleChooseImage(event)}
            disabled={!isEdit}
          />
          <label htmlFor='outlined-button-file'>
            <ButtonBase focusRipple key={'Upload'} className={classes.buttonBaseStyle} component='span' disableRipple disabled={!isEdit}>
              <Tooltip title='Choose an image' placement='top'>
                <img src={logoView} alt='logo' className={classes.imageView} />
              </Tooltip>
            </ButtonBase>
          </label>
        </Fragment>
      );
    }
  };

  const handleChooseImage = (event: any) => {
    let image;
    let imageView;
    if (event.target.files[0] === undefined) {
      image = '';
      imageView = '';
    } else {
      image = event.target.files[0];
      imageView = URL.createObjectURL(event.target.files[0]);
    }
    setLogo(image);
    setLogoView(imageView);
    setUploadImage(true);
  };

  const cancelImage = () => {
    setLogo('');
    setLogoView('');
    setUploadImage(false);
  };

  return (
    <Paper variant='outlined' className={classes.leftPaper}>
      <Grid className={classes.root} spacing={0} alignItems='center' justify='center'>
        {renderImageComponent()}
        <div className={classes.spacingNewLine}>
          <Typography color={logoError ? 'error' : 'inherit'} variant='body2' display='block' gutterBottom>
            {logoError ? logoError : 'Company Image'}
          </Typography>
        </div>
      </Grid>
    </Paper>
  );
};

export default LeftContent;
