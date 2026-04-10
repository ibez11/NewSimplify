import React, { FC, Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import MUIRichTextEditor from 'mui-rte';
import { Grid, makeStyles, Button, Typography, Tooltip, Card, Tabs, Tab, Divider, CardContent } from '@material-ui/core';
import { GET_ENTITY_IMAGE_URL } from 'constants/url';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import dummyImage from 'images/noimage.png';

import { convertHtml } from 'utils';
import { dummyEntity } from 'constants/dummy';
import { Skeleton } from '@material-ui/lab';
import theme from 'theme';
import SideBarContent from 'components/SideBarContent';
import EntityForm from './EntityForm';

interface Props {
  isLoading: boolean;
  entities: EntityModel[];
  setEntities: React.Dispatch<React.SetStateAction<EntityModel[]>>;
  handleSnackbar(variant: 'success' | 'error', message: string): void;
}

const useStyles = makeStyles(() => ({
  card: {
    margin: 'auto',
    width: '100%',
    marginBottom: theme.spacing(2)
  },
  image: {
    position: 'relative',
    width: '10em',
    height: '10em',
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
  imageView: {
    width: '10em',
    height: '10em',
    objectFit: 'contain',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '.4em',
    display: 'grid',
    placeItems: 'center'
  },
  spacingNewLine: {
    marginBottom: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
    width: '100%',
    height: '100%',
    textAlign: 'center'
  }
}));

const EntitiesContent: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, entities, setEntities, handleSnackbar } = props;

  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedEntity, setSelectedEntity] = useState<EntityModel>(dummyEntity);
  const [logoView, setLogoView] = useState<string>('');
  const [qrView, setQrView] = useState<string>('');
  const [currentInvoiceFooter, setCurrentInvoiceFooter] = useState<string>('');

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  useEffect(() => {
    if (entities.length === 0) {
      return;
    }
    const selectedEntity = entities[selectedTab];
    const { logo, qrImage, invoiceFooter } = selectedEntity;

    const getImage = async () => {
      if (logo) {
        const response = await axios.get(`${GET_ENTITY_IMAGE_URL(logo)}`);

        setLogoView(response.data.logo);
      } else {
        setLogoView('');
      }
    };

    const getQrImage = async () => {
      if (qrImage) {
        const response = await axios.get(`${GET_ENTITY_IMAGE_URL(qrImage)}`);

        setQrView(response.data.logo);
      } else {
        setQrView('');
      }
    };
    if (invoiceFooter) {
      setCurrentInvoiceFooter(convertHtml(invoiceFooter));
    } else {
      setCurrentInvoiceFooter('');
    }

    getImage();
    getQrImage();
    setSelectedEntity(selectedEntity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, entities]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const addNewEntity = (entity: EntityModel) => {
    entities.unshift(entity);
    setEntities([...entities]);
  };

  const updateIndividualEntity = (entityIndex: number) => {
    return (updatedEntityProperties: Partial<EntityModel>) => {
      setEntities(
        entities!.map((entitiy, index) => {
          if (index !== entityIndex) {
            return entitiy;
          }

          return Object.assign({}, entitiy, updatedEntityProperties);
        })
      );
    };
  };

  const renderTabPanel = () => {
    const { logo, qrImage, name, countryCode, contactNumber, email, address, needGST, registerNumberGST, uenNumber } = selectedEntity;

    return (
      <>
        <Grid item container xs={12} sm={12} justify='flex-end'>
          <Button
            variant='contained'
            disableElevation
            color='primary'
            startIcon={<EditIcon />}
            onClick={() => {
              setIsEdit(true);
              setOpenForm(true);
            }}
          >
            Edit
          </Button>
        </Grid>
        <Grid item xs={12} sm={2}>
          <Grid item xs={12} container justify='center' alignItems='center' style={{ marginTop: 16 }}>
            {isLoading ? (
              <Skeleton height={'15em'} width={'10em'} />
            ) : logo ? (
              <img src={logoView} alt='logo' className={classes.imageView} />
            ) : (
              <img src={dummyImage} alt='logo' className={classes.imageView} />
            )}
            <div className={classes.spacingNewLine}>
              <Typography variant='body2' gutterBottom>
                Entity Logo
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} container justify='center' alignItems='center' style={{ marginTop: !isLoading ? 64 : 0 }}>
            {isLoading ? (
              <Skeleton height={'15em'} width={'10em'} />
            ) : qrImage ? (
              <img src={qrView} alt='qr' className={classes.imageView} />
            ) : (
              <img src={dummyImage} alt='qr' className={classes.imageView} />
            )}
            <div className={classes.spacingNewLine}>
              <Typography variant='body2' gutterBottom>
                QR Payment
              </Typography>
            </div>
          </Grid>
        </Grid>
        <Grid item container spacing={2} xs={12} sm={9} alignItems='flex-start'>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>Entity Name</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle1'>{name}</Typography>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>Contact Number</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <Typography variant='subtitle1'>
                {countryCode}
                {contactNumber}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>Email</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle1'>{email}</Typography>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>Address</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <Typography variant='subtitle1' style={{ whiteSpace: 'pre-line' }}>
                {address}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>GST</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle1'>{needGST ? 'Yes' : 'No'}</Typography>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>GST Register Number</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle1'>{registerNumberGST || 'N.A'}</Typography>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>UEN Number</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='subtitle1'>{uenNumber || 'N.A'}</Typography>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant='h6'>Invoice Footer</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : currentInvoiceFooter ? (
              <MUIRichTextEditor controls={[]} readOnly defaultValue={currentInvoiceFooter} />
            ) : (
              <Typography variant='subtitle1'>{'N.A'}</Typography>
            )}
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <>
      <Card variant='outlined' className={classes.card}>
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          textColor='primary'
          indicatorColor='primary'
          selectionFollowsFocus
          variant='scrollable'
          style={{ maxWidth: '100%' }}
        >
          {entities.map((_, index) => (
            <Tab
              value={index}
              label={
                entities.length > 0 ? (
                  <Fragment key={index}>
                    <Typography variant='body1' style={{ textTransform: 'capitalize' }}>
                      Entity {index + 1}
                    </Typography>
                  </Fragment>
                ) : (
                  <Typography variant='body1' style={{ textTransform: 'capitalize' }}>
                    Entity {index + 1}
                  </Typography>
                )
              }
              style={{ minWidth: 100 }}
            />
          ))}
          <Tooltip title={entities.length > 0 ? 'Add More Entity' : 'Add Entity'}>
            <Button onClick={() => setOpenForm(true)} style={{ height: 48 }}>
              <AddIcon fontSize='small' color='disabled' />
            </Button>
          </Tooltip>
        </Tabs>
        <Divider style={{ marginBottom: 8 }} />
        <CardContent>
          <Grid container spacing={2}>
            {entities.length > 0 ? (
              renderTabPanel()
            ) : (
              <Grid container xs={12} sm={12} justify='center'>
                <Typography variant='h6' color='textSecondary'>
                  There is no entity data, please add new entity
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <SideBarContent
        title={isEdit ? 'Edit Entity' : 'Add New Entity'}
        open={openForm}
        onClickDrawer={() => {
          setOpenForm(false);
          setIsEdit(false);
        }}
        width={'65%'}
      >
        <EntityForm
          entity={isEdit ? selectedEntity : dummyEntity}
          logoUrl={isEdit ? logoView : ''}
          qrUrl={isEdit ? qrView : ''}
          isEdit={isEdit}
          setSelectedTab={setSelectedTab}
          addNewEntity={addNewEntity}
          updateIndividualEntitiy={updateIndividualEntity(selectedTab)}
          handleClose={() => {
            setOpenForm(false);
            setIsEdit(false);
          }}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
    </>
  );
};

export default EntitiesContent;
