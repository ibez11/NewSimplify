import { FC, useContext, useEffect, useState } from 'react';
import axios, { CancelTokenSource } from 'axios';
import {
  Grid,
  makeStyles,
  Theme,
  TextField,
  Button,
  ButtonBase,
  Typography,
  Tooltip,
  IconButton,
  MenuItem,
  Switch,
  withStyles,
  createStyles,
  SwitchClassKey,
  SwitchProps,
  FormControlLabel,
  DialogActions
} from '@material-ui/core';

import { ENTITY_BASE_URL, GET_EDIT_ENTITY_URL } from 'constants/url';
import MUIRichTextEditor from 'mui-rte';
import UploadIcon from '@material-ui/icons/AddPhotoAlternate';
import DeleteIcon from '@material-ui/icons/Delete';

import NumberFormatCustom from 'components/NumberFormatCustom';
import { convertHtml } from 'utils';
import { dummyEntity } from 'constants/dummy';
import { PhoneCodeContext } from 'contexts/PhoneCodeContext';
import { convertToHTML } from 'draft-convert';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import theme from 'theme';

interface Props {
  entity: EntityModel;
  logoUrl: string;
  qrUrl: string;
  isEdit: boolean;
  setSelectedTab: React.Dispatch<React.SetStateAction<number>>;
  addNewEntity(entity: EntityModel): void;
  updateIndividualEntitiy: (updatedEntitiyProperties: Partial<EntityModel>) => void;
  handleClose(): void;
  handleSnackbar(variant: 'success' | 'error', message: string): void;
}

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
      margin: theme.spacing(1)
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

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2),
    maxHeight: 600,
    overflow: 'auto'
  },
  required: {
    color: 'red'
  },
  input: {
    display: 'none'
  },
  imageView: {
    width: '10em',
    height: '10em',
    objectFit: 'contain',
    backgroundColor: theme.palette.primary.light,
    borderRadius: 5,
    border: `1px solid ${theme.palette.grey[300]}`
  },
  label: {
    width: '10em',
    height: '10em'
  },
  image: {
    position: 'relative',
    width: '100%',
    height: '100%',
    [theme.breakpoints.down('xs')]: {
      width: '100% !important', // Overrides inline-style
      height: '100% !important'
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%'
  },
  imageButton: {
    width: '10em',
    height: '10em',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.light,
    borderRadius: 5
  },
  spacingNewLine: {
    marginTop: theme.spacing(1),
    width: '100%',
    height: '100%',
    textAlign: 'center'
  },
  textField: {
    marginBottom: 8
  },
  flagImg: {
    height: 13,
    width: 20,
    marginRight: 10
  },
  rteGrid: {
    border: 'solid 1px',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 5,
    paddingBottom: '50px !important',
    paddingLeft: theme.spacing(2),
    overflow: 'auto',
    maxHeight: 300,
    height: 200
  }
}));

const EntityForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { entity, logoUrl, qrUrl, isEdit, setSelectedTab, addNewEntity, updateIndividualEntitiy, handleClose, handleSnackbar } = props;
  const { countries } = useContext(PhoneCodeContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentEntity, setCurrentEntity] = useState<EntityModel>(dummyEntity);
  const [currentInvoiceFooter, setCurrentInvoiceFooter] = useState<string>('');
  let invoiceFooterData = '';

  const [uploadLogo, setUploadLogo] = useState<boolean>(false);
  const [uploadQr, setUploadQr] = useState<boolean>(false);
  const [logo, setLogo] = useState<string>('');
  const [logoView, setLogoView] = useState<string>('');
  const [qrImage, setQrimage] = useState<string>('');
  const [qrView, setQrView] = useState<string>('');

  const [error, setError] = useState<any[]>([
    { field: 'logo', message: '' },
    { field: 'name', message: '' },
    { field: 'contactNumber', message: '' },
    { field: 'emailAddress', message: '' },
    { field: 'address', message: '' },
    { field: 'gstNumber', message: '' }
  ]);

  useEffect(() => {
    if (!isEdit) {
      return;
    }
    const { logo, qrImage, invoiceFooter } = entity;

    if (invoiceFooter) {
      const currentInvoiceFooter = convertHtml(invoiceFooter);
      setCurrentInvoiceFooter(currentInvoiceFooter);
    }

    setLogo(logo);
    setQrimage(qrImage || '');
    setLogoView(logoUrl);
    setQrView(qrUrl);
    setCurrentEntity(entity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, isEdit]);

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
    setUploadLogo(true);
    setLogo(image);
    setLogoView(imageView);
    setError(prev => {
      prev[0].message = '';
      return [...prev];
    });
  };

  const handleChooseQrImage = (event: any) => {
    let image;
    let imageView;
    if (event.target.files[0] === undefined) {
      image = '';
      imageView = '';
    } else {
      image = event.target.files[0];
      imageView = URL.createObjectURL(event.target.files[0]);
    }
    setUploadQr(true);
    setQrimage(image);
    setQrView(imageView);
  };

  const handleChangeInvoiceFooter = (event: any) => {
    invoiceFooterData = JSON.stringify(convertToHTML(event.getCurrentContent()));
    invoiceFooterData = invoiceFooterData.replace(/"/g, '');
    invoiceFooterData = invoiceFooterData.replace(/<p><\/p>/g, '<div>&shy;</div>');
  };

  const handleBlur = () => {
    if (invoiceFooterData === '<div>&shy;</div>') {
      setCurrentEntity({ ...currentEntity, invoiceFooter: '' });
      setCurrentInvoiceFooter('');
    } else {
      setCurrentEntity({ ...currentEntity, invoiceFooter: invoiceFooterData });
      setCurrentInvoiceFooter(convertHtml(invoiceFooterData));
    }
  };

  const validateForm = () => {
    let ret = true;

    if (!logo) {
      setError(prev => {
        prev[0].message = 'Please upload entity logo';
        return [...prev];
      });
      ret = false;
    }

    if (!currentEntity.name || !currentEntity.name.trim()) {
      setError(prev => {
        prev[1].message = 'Please enter entity name';
        return [...prev];
      });
      ret = false;
    }

    if (!currentEntity.contactNumber || !currentEntity.contactNumber.trim()) {
      setError(prev => {
        prev[2].message = 'Please enter entity contact number';
        return [...prev];
      });
      ret = false;
    }

    if (!currentEntity.email || !currentEntity.email.trim()) {
      setError(prev => {
        prev[3].message = 'Please enter entity email';
        return [...prev];
      });
      ret = false;
    }

    if (!currentEntity.address || !currentEntity.address.trim()) {
      setError(prev => {
        prev[4].message = 'Please enter entity address';
        return [...prev];
      });
      ret = false;
    }

    if (currentEntity.needGST) {
      if (!currentEntity.registerNumberGST!) {
        setError(prev => {
          prev[5].message = 'Please enter entity GST register number';
          return [...prev];
        });
        ret = false;
      }
    }
    return ret;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);

    try {
      let newImageKey = logo;
      let fileExtension = '';
      let newQrImageKey = qrImage;

      if (uploadLogo) {
        if (logo) {
          // @ts-ignore
          const imageType = logo ? logo.type : '';
          fileExtension = imageType ? imageType.split('/').pop()! : '';
          newImageKey = `${Date.now()}.${fileExtension}`;
        }
      }

      if (uploadQr) {
        if (qrImage) {
          // @ts-ignore
          const imageType = qrImage ? qrImage.type : '';
          fileExtension = imageType ? imageType.split('/').pop()! : '';
          newQrImageKey = `${Date.now()}-qr.${fileExtension}`;
        }
      }

      const formData = {
        ...currentEntity,
        logo: newImageKey,
        qrImage: newQrImageKey
      };
      const config = { cancelToken: cancelTokenSource.token };

      if (isEdit) {
        const { data } = await axios.put(`${GET_EDIT_ENTITY_URL(currentEntity.id)}`, formData, config);

        if (uploadLogo) {
          if (data.logo) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', `image/${fileExtension}`);

            const config = {
              method: 'PUT',
              headers: myHeaders,
              body: logo
            };

            await fetch(data.logo, config);
          }
        }

        if (uploadQr) {
          if (data.qrImage) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', `image/${fileExtension}`);

            const config = {
              method: 'PUT',
              headers: myHeaders,
              body: qrImage
            };

            await fetch(data.qrImage, config);
          }
        }
        data.logo = newImageKey;
        data.qrImage = newQrImageKey;

        updateIndividualEntitiy(data);
      } else {
        const { data } = await axios.post(`${ENTITY_BASE_URL}`, formData, config);

        if (data.logo) {
          const myHeaders = new Headers();
          myHeaders.append('Content-Type', `image/${fileExtension}`);

          const config = {
            method: 'PUT',
            headers: myHeaders,
            body: logo
          };

          await fetch(data.logo, config);
        }

        if (data.qrImage) {
          const myHeaders = new Headers();
          myHeaders.append('Content-Type', `image/${fileExtension}`);

          const config = {
            method: 'PUT',
            headers: myHeaders,
            body: qrImage
          };

          await fetch(data.qrImage, config);
        }
        data.logo = newImageKey;
        data.qrImage = newQrImageKey;
        addNewEntity(data);
        setSelectedTab(0);
      }
      handleSnackbar('success', isEdit ? 'Successfully to edit entity' : 'Successfully to add new entity');
      handleClose();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', isEdit ? 'Failed to edit entity' : 'Failed to add new entity');
    }

    setIsLoading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>
            Upload Entity Logo <span className={classes.required}>*</span>
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            SVG, PNG, OR JPG
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Grid container direction='row' alignItems='center'>
            <input
              accept='image/*'
              className={classes.input}
              id='contained-button-file'
              multiple
              type='file'
              onChange={event => handleChooseImage(event)}
            />
            <label htmlFor='contained-button-file' className={classes.label}>
              <ButtonBase focusRipple key={'Upload'} className={classes.image} component='span' disabled={isLoading}>
                <Tooltip title='Change image' placement='top'>
                  {logoView ? (
                    <img src={logoView} alt='logo' className={classes.imageView} />
                  ) : (
                    <span
                      className={classes.imageButton}
                      style={{
                        color: error[0].message !== '' ? theme.palette.error.main : theme.palette.grey[700],
                        border: error[0].message !== '' ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.grey[300]}`
                      }}
                    >
                      <Grid container>
                        <Grid item xs style={{ textAlign: 'center' }}>
                          <Grid container justify='center' alignItems='center'>
                            <Grid item xs={12}>
                              <UploadIcon fontSize='large' />
                            </Grid>
                            <Grid item xs={12}>
                              <Typography component='span' variant='subtitle1' color='inherit'>
                                {error[0].message !== '' ? error[0].message : 'Upload'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </span>
                  )}
                </Tooltip>
              </ButtonBase>
              {logoView && (
                <div className={classes.spacingNewLine}>
                  <Tooltip title='Remove Image' placement='top'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setLogo('');
                        setLogoView('');
                      }}
                    >
                      <DeleteIcon color='error' />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </label>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>Upload QR Payment</Typography>
          <Typography variant='caption' color='textSecondary'>
            SVG, PNG, OR JPG
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Grid container justify='center' alignItems='center'>
            <input
              accept='image/*'
              className={classes.input}
              id='contained-button-qr'
              multiple
              type='file'
              onChange={event => handleChooseQrImage(event)}
            />
            <label htmlFor='contained-button-qr' className={classes.label}>
              <ButtonBase focusRipple key={'Upload'} className={classes.image} component='span'>
                <Tooltip title='Change image' placement='top'>
                  {qrView ? (
                    <img src={qrView} alt='logo' className={classes.imageView} />
                  ) : (
                    <span
                      className={classes.imageButton}
                      style={{
                        border: `1px solid ${theme.palette.grey[300]}`
                      }}
                    >
                      <Grid container>
                        <Grid item xs style={{ textAlign: 'center' }}>
                          <Grid container justify='center' alignItems='center'>
                            <Grid item xs={12}>
                              <UploadIcon fontSize='large' />
                            </Grid>
                            <Grid item xs={12}>
                              <Typography component='span' variant='subtitle1' color='inherit'>
                                Upload
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </span>
                  )}
                </Tooltip>
              </ButtonBase>
              {qrView && (
                <div className={classes.spacingNewLine}>
                  <Tooltip title='Remove Image' placement='top'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setQrimage('');
                        setQrView('');
                      }}
                    >
                      <DeleteIcon color='error' />
                    </IconButton>
                  </Tooltip>
                </div>
              )}
            </label>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={2} style={{ marginTop: 32 }}>
          <Typography variant='h6'>
            Entity Name <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={10} style={{ marginTop: 32 }}>
          <TextField
            margin='dense'
            required
            fullWidth
            disabled={isLoading}
            id='companyName'
            label='Company Name'
            error={error[1].message !== ''}
            helperText={error[1].message}
            value={currentEntity.name}
            onChange={event => setCurrentEntity({ ...currentEntity, name: event.target.value })}
            onBlur={event => {
              if (!event.target.value) {
                setError(prev => {
                  prev[1].message = 'Please enter entity name';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[1].message = '';
                  return [...prev];
                });
              }
            }}
            variant='outlined'
            autoComplete='off'
            className={classes.textField}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>
            Contact Number <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item container spacing={1} xs={12} sm={10}>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              margin='dense'
              fullWidth
              id='phoneCode'
              label='Phone Code'
              value={currentEntity.countryCode}
              onChange={event => setCurrentEntity({ ...currentEntity, countryCode: event.target.value })}
              variant='outlined'
              autoComplete='off'
              className={classes.textField}
            >
              {countries.map(item => {
                return (
                  <MenuItem key={item.callingCode} value={item.callingCode}>
                    <img src={item.flag} className={classes.flagImg} alt={item.code} /> ({item.callingCode}) - {item.code}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={9}>
            <TextField
              margin='dense'
              required
              fullWidth
              disabled={isLoading}
              id='contactNumber'
              label='Contact Number'
              error={error[2].message !== ''}
              helperText={error[2].message}
              value={currentEntity.contactNumber}
              onChange={event => setCurrentEntity({ ...currentEntity, contactNumber: event.target.value })}
              onBlur={event => {
                if (!event.target.value) {
                  setError(prev => {
                    prev[2].message = 'Please enter entity contact number';
                    return [...prev];
                  });
                } else {
                  setError(prev => {
                    prev[2].message = '';
                    return [...prev];
                  });
                }
              }}
              variant='outlined'
              autoComplete='off'
              className={classes.textField}
              InputProps={{
                inputComponent: NumberFormatCustom as any
              }}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>
            Email Address <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={10}>
          <TextField
            margin='dense'
            required
            fullWidth
            disabled={isLoading}
            id='emailAddress'
            label='Email Address'
            error={error[3].message !== ''}
            helperText={error[3].message}
            value={currentEntity.email}
            onChange={event => setCurrentEntity({ ...currentEntity, email: event.target.value })}
            onBlur={event => {
              if (!event.target.value) {
                setError(prev => {
                  prev[3].message = 'Please enter entity email';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[3].message = '';
                  return [...prev];
                });
              }
            }}
            variant='outlined'
            autoComplete='off'
            className={classes.textField}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>
            Address <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={10}>
          <TextField
            margin='dense'
            required
            fullWidth
            disabled={isLoading}
            id='address'
            label='Address'
            error={error[4].message !== ''}
            helperText={error[4].message}
            value={currentEntity.address}
            onChange={event => setCurrentEntity({ ...currentEntity, address: event.target.value })}
            onBlur={event => {
              if (!event.target.value) {
                setError(prev => {
                  prev[4].message = 'Please enter entity address';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[4].message = '';
                  return [...prev];
                });
              }
            }}
            variant='outlined'
            autoComplete='off'
            className={classes.textField}
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>GST</Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControlLabel
            control={
              <IOSSwitch
                checked={currentEntity.needGST}
                name='needGST'
                color='primary'
                onChange={event =>
                  setCurrentEntity({ ...currentEntity, needGST: event.target.checked, registerNumberGST: !event.target.checked ? 'N.A' : '' })
                }
              />
            }
            labelPlacement='end'
            label={currentEntity.needGST ? 'Yes' : 'No'}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>GST Register Number</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            margin='dense'
            fullWidth
            disabled={isLoading || !currentEntity.needGST}
            id='registerNumberGST'
            label='Register Number GST'
            error={error[5].message !== ''}
            helperText={error[5].message}
            value={currentEntity.registerNumberGST}
            onChange={event => setCurrentEntity({ ...currentEntity, registerNumberGST: event.target.value })}
            onBlur={event => {
              if (currentEntity.needGST && !event.target.value) {
                setError(prev => {
                  prev[5].message = 'Please enter entity GST register number';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[5].message = '';
                  return [...prev];
                });
              }
            }}
            variant='outlined'
            autoComplete='off'
            className={classes.textField}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>UEN Number</Typography>
        </Grid>
        <Grid item xs={12} sm={10}>
          <TextField
            margin='dense'
            fullWidth
            disabled={isLoading}
            id='uenNumber'
            label='UEN Number'
            //   error={contactNumberError !== ''}
            //   helperText={contactNumberError}
            value={currentEntity.uenNumber}
            onChange={event => setCurrentEntity({ ...currentEntity, uenNumber: event.target.value })}
            variant='outlined'
            autoComplete='off'
            className={classes.textField}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <Typography variant='h6'>Invoice Footer</Typography>
          <Typography variant='caption' color='textSecondary'>
            This information Will Show As Footer in Invoice PDF
          </Typography>
        </Grid>
        <Grid item xs={12} sm={10}>
          <MUIRichTextEditor
            label='Invoice Footer'
            controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
            defaultValue={currentInvoiceFooter}
            onChange={handleChangeInvoiceFooter}
            onBlur={handleBlur}
            classes={{ container: `${classes.rteGrid}` }}
          />
        </Grid>
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' disableElevation disabled={isLoading} onClick={handleSubmit}>
          Save
          <LoadingButtonIndicator isLoading={isLoading} />
        </Button>
      </DialogActions>
    </>
  );
};

export default EntityForm;
