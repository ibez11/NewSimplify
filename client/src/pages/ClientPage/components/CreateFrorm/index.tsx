import { FC, useState, useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, DialogActions, Theme, Grid, Typography, List, ListItem, Card, ListItemText, ListItemSecondaryAction } from '@material-ui/core';

import CheckIcon from '@material-ui/icons/CheckCircle';
import axios, { CancelTokenSource } from 'axios';
import { CLIENT_BASE_URL, SETTING_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { ClientBody } from 'typings/body/ClientBody';
import { dummyClientBody, dummyContactPerson, dummyServiceAddressBody } from 'constants/dummy';
import DetailForm from './components/DetailForm';
import LocationForm from './components/LocationForm';
import ContactForm from './components/ContactForm';
import SummaryForm from './components/SummaryForm';
import { SettingCodes } from 'constants/enum';
import { isValidEmail } from 'utils';
import { CreateLogEvent } from 'utils/Firebase';
import { CurrentUserContext } from 'contexts/CurrentUserContext';

interface Props {
  agentMaster: Select[];
  addNewClient(client: ClientModel): void;
  handleCancel(): void;
  handleSnackbar: (varient: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  contentGrid: {
    padding: theme.spacing(2),
    background: '#F5F8FA',
    maxHeight: 580,
    overflow: 'auto'
  },
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  menuList: {
    minHeight: 40
  },
  menuListActive: {
    minHeight: 40,
    background: '#DFFBFB'
  },
  checkIcon: {
    color: theme.palette.success.main
  }
}));

const CreateForm: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);
  const { agentMaster, addNewClient, handleCancel, handleSnackbar } = props;

  const [isLoading, setIsloading] = useState<boolean>(false);
  const [steps, setSteps] = useState<any[]>([
    { label: 'Client Information', completed: false },
    { label: 'Service & Billing Address', completed: false },
    { label: 'Contact Information', completed: false },
    { label: 'Client Summary', completed: false }
  ]);
  const [activeStep, setActiveStep] = useState<number>(0);

  const [client, setClient] = useState<ClientBody>(dummyClientBody);
  const [tempPostalValue, setTempPostalValue] = useState<Select[]>([
    { id: 0, name: '' },
    { id: 0, name: '' }
  ]);
  const [nameError, setNameError] = useState<string>('');
  const [locationErrorMessage, setLocationErrorMessage] = useState<any[]>([
    { postalCode: '', address: '' },
    { postalCode: '', address: '' }
  ]);
  const [contactErrorMessage, setContactErorMessage] = useState<any[]>([{ contactPerson: '', contactNumber: '', contactEmail: '' }]);

  const [duplicateClientSetting, setDuplicateSetting] = useState<boolean>(true);

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    setIsloading(true);

    const loadProperties = async () => {
      try {
        const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

        const { data } = await axios.get(SETTING_BASE_URL, { cancelToken: cancelTokenSource.token });
        const duplicateClient = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.DUPLICATECLIENT);
        const emailJobReport = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.NOTIFCOMPLETEJOBEMAIL);
        const whatsAppReminder = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.WHATSAPPNOTIFICATION);
        const priceReportVisibility = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.PRICEREPORTVISIBILITY);
        const emailReminder = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.EMAILNOTIFICATION);

        setDuplicateSetting(duplicateClient.isActive);
        setClient({
          ...client,
          emailJobReport: emailJobReport.isActive,
          whatsAppReminder: whatsAppReminder.isActive,
          emailReminder: emailReminder.isActive,
          priceReportVisibility: priceReportVisibility.isActive,
          ServiceAddresses: [{ ...dummyServiceAddressBody }],
          ContactPersons: [{ ...dummyContactPerson }]
        });
      } catch (error) {}
    };

    loadProperties();
    setIsloading(false);
    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return <DetailForm client={client} setClient={setClient} agentMaster={agentMaster} nameError={nameError} setNameError={setNameError} />;
      case 1:
        return (
          <LocationForm
            client={client}
            setClient={setClient}
            tempPostalValue={tempPostalValue}
            setTempPostalValue={setTempPostalValue}
            locationErrorMessage={locationErrorMessage}
            setLocationErrorMessage={setLocationErrorMessage}
          />
        );
      case 2:
        return (
          <ContactForm
            client={client}
            setClient={setClient}
            contactErrorMessage={contactErrorMessage}
            setContactErorMessage={setContactErorMessage}
          />
        );
      default:
        return <SummaryForm client={client} />;
    }
  };

  const checkDuplicateClientName = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      const params = new URLSearchParams();
      params.append('name', client.name);

      const url = `${CLIENT_BASE_URL}/check-name?${params.toString()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

      if (data) {
        handleSnackbar('error', 'Client name already exists');
        return true;
      }
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const validateForm = async (step: number) => {
    let ret = true;
    const { name, billingPostal, billingAddress, ServiceAddresses, ContactPersons } = client;

    if (activeStep === 0) {
      if (!name || !name.trim()) {
        setNameError('Please enter client name');
        return (ret = false);
      } else {
        if (!duplicateClientSetting) {
          const check = await checkDuplicateClientName();

          if (check) {
            ret = false;
            return;
          }
        }
        setNameError('');

        ret = true;
      }
    } else if (activeStep === 1) {
      if (!billingAddress || !billingAddress.trim()) {
        setLocationErrorMessage(prev => {
          prev[0].address = 'Please enter address';
          return [...prev];
        });
        return (ret = false);
      } else {
        setLocationErrorMessage(prev => {
          prev[0].address = '';
          return [...prev];
        });
        ret = true;
      }
      if (!billingPostal || !billingPostal.trim()) {
        setLocationErrorMessage(prev => {
          prev[0].postalCode = 'Please enter postal code';
          return [...prev];
        });
        return (ret = false);
      } else {
        setLocationErrorMessage(prev => {
          prev[0].postalCode = '';
          return [...prev];
        });
        ret = true;
      }

      ServiceAddresses.map((value, index) => {
        if (!ret) {
          // eslint-disable-next-line array-callback-return
          return;
        }

        if (!value.address || !value.address.trim()) {
          setLocationErrorMessage(prev => {
            prev[index + 1].address = 'Please enter address';
            return [...prev];
          });
          return (ret = false);
        } else {
          setLocationErrorMessage(prev => {
            prev[index + 1].address = '';
            return [...prev];
          });
          ret = true;
        }
        if (!value.postalCode || !value.postalCode.trim()) {
          setLocationErrorMessage(prev => {
            prev[index + 1].postalCode = 'Please postal code';
            return [...prev];
          });
          return (ret = false);
        } else {
          setLocationErrorMessage(prev => {
            prev[index + 1].postalCode = '';
            return [...prev];
          });
          ret = true;
        }

        return ret;
      });
    } else if (activeStep === 2) {
      ContactPersons.map((value, index) => {
        if (!value.contactPerson || !value.contactPerson.trim()) {
          setContactErorMessage(prev => {
            prev[index].contactPerson = 'Please enter contact person';
            return [...prev];
          });
          return (ret = false);
        } else {
          setContactErorMessage(prev => {
            prev[index].contactPerson = '';
            return [...prev];
          });
          ret = true;
        }
        if (!value.contactNumber || !value.contactNumber.trim()) {
          setContactErorMessage(prev => {
            prev[index].contactNumber = 'Please enter contact number';
            return [...prev];
          });
          return (ret = false);
        } else if (value.contactNumber.length < 8) {
          setContactErorMessage(prev => {
            prev[index].contactNumber = 'Contact number is less than 8 digit';
            return [...prev];
          });
          return (ret = false);
        } else {
          setContactErorMessage(prev => {
            prev[index].contactNumber = '';
            return [...prev];
          });
          ret = true;
        }

        if (value.contactEmail && !isValidEmail(value.contactEmail)) {
          setContactErorMessage(prev => {
            prev[index].contactEmail = 'Please insert valid email';
            return [...prev];
          });
          return (ret = false);
        } else {
          setContactErorMessage(prev => {
            prev[index].contactEmail = '';
            return [...prev];
          });
          ret = true;
        }
        return ret;
      });
    }

    if (ret) {
      setActiveStep(step);
      setSteps(prev => {
        prev[activeStep].completed = true;
        return [...prev];
      });
    } else {
      setSteps(prev => {
        prev[activeStep].completed = false;
        return [...prev];
      });
    }

    return ret;
  };

  const handleMenu = (step: number) => {
    validateForm(step);
  };

  const handleNext = () => {
    validateForm(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    setIsloading(true);
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      const { data } = await axios.post(CLIENT_BASE_URL, { ...client }, { cancelToken: cancelTokenSource.token });
      addNewClient({ ...data, agentName: data.Agent ? data.Agent.name : '' });
      setClient({ ...dummyClientBody });
      setActiveStep(0);
      CreateLogEvent('create_client', currentUser!);
      handleSnackbar('success', `Successfully create client`);
      handleCancel();
    } catch (err) {
      console.log(err);
      const error = err as any;
      const { errorCode } = error.data;
      if (errorCode === 20) {
        handleSnackbar('error', `Client name is duplicate`);
      } else if (errorCode === 51) {
        handleSnackbar('error', `Client name cannot empty`);
      } else {
        handleSnackbar('error', `Failed create client`);
      }
    }
    setIsloading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={3}>
          <Card variant='outlined' className={classes.paper}>
            <List component='nav'>
              {steps.map((value, index) => (
                <ListItem
                  key={`list-menu-${index}`}
                  button
                  className={activeStep === index ? classes.menuListActive : classes.menuList}
                  onClick={() => handleMenu(index)}
                >
                  <ListItemText
                    disableTypography
                    primary={
                      <Typography variant='subtitle1' color={activeStep === index ? 'primary' : 'textPrimary'}>
                        {value.label}
                      </Typography>
                    }
                  />
                  {value.completed && (
                    <ListItemSecondaryAction>
                      <CheckIcon fontSize='small' className={classes.checkIcon} />
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={9}>
          {getStepContent(activeStep)}
        </Grid>
      </Grid>
      <DialogActions>
        <Button
          variant='contained'
          disableElevation
          disabled={isLoading}
          onClick={activeStep === 0 ? handleCancel : handleBack}
          style={{ marginTop: 8 }}
        >
          {activeStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          variant='contained'
          color='primary'
          disableElevation
          disabled={isLoading}
          style={{ marginTop: 8 }}
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Save' : 'Continue'}
          <LoadingButtonIndicator isLoading={isLoading} />
        </Button>
      </DialogActions>
    </>
  );
};

export default CreateForm;
