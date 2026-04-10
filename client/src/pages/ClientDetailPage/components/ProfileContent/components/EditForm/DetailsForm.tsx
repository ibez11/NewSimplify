import React, { useState, useEffect, useCallback, FC } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  DialogActions,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Switch,
  SwitchClassKey,
  SwitchProps,
  TextField,
  Theme,
  Typography,
  createStyles,
  withStyles
} from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';
import { AGENT_BASE_URL, CLIENT_BASE_URL, GET_EDIT_CLIENT_URL, GET_SETTING_CODE_BASE_URL } from 'constants/url';
import SettingCodes from 'typings/SettingCodes';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
  clients: ClientDetailsModel;
  setClients: React.Dispatch<React.SetStateAction<ClientDetailsModel>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  textfield: {
    marginBottom: theme.spacing(1)
  },
  rightPadding: {
    paddingRight: theme.spacing(1)
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  required: {
    color: 'red'
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

const DetailsForm: FC<Props> = props => {
  const classes = useStyles();

  const { clients, setClients, handleSnackbar, setOpenForm } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [clientId, setClientId] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [emailReminder, setEmailReminder] = useState<boolean>(true);
  const [whatsAppReminder, setWhatsAppReminder] = useState<boolean>(true);
  const [emailJobReport, setEmailJobReport] = useState<boolean>(true);
  const [priceReportVisibility, setPriceReportVisibility] = useState<boolean>(true);

  const [agentMaster, setAgentMaster] = useState<Select[]>([]);
  const [duplicateClientSetting, setDuplicateSetting] = useState<boolean>(true);

  const [agent, setAgent] = useState<string>('');
  const [agentValue, setAgentValue] = useState<Select>({ id: 0, name: '' });

  const resetFormValues = useCallback(() => {
    if (!clients) {
      return;
    }

    const { id, name, clientType, remarks, Agent, emailReminder, whatsAppReminder, emailJobReport, priceReportVisibility } = clients!;

    setClientId(id);
    setName(name);
    setType(clientType);
    setRemarks(remarks);
    setEmailReminder(emailReminder || false);
    setWhatsAppReminder(whatsAppReminder || false);
    setEmailJobReport(emailJobReport || false);
    setPriceReportVisibility(priceReportVisibility || false);
    setNameError('');
    setAgentValue({ id: Agent ? Agent.id : 0, name: Agent ? Agent.name : '' });
    setAgent(Agent ? Agent.name : '');
  }, [clients]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const loadProperties = async () => {
      setLoading(true);

      try {
        const { data } = await axios.get(`${AGENT_BASE_URL}`, { cancelToken: cancelTokenSource.token });

        let agentData: Select[] = [];
        data.agents.map((value: any) => {
          return agentData.push({ id: value.id, name: value.name });
        });
        setAgentMaster(agentData);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    const getClientSetting = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${GET_SETTING_CODE_BASE_URL(SettingCodes.DUPLICATECLIENT)}`, { cancelToken: cancelTokenSource.token });
        setDuplicateSetting(data.isActive);
      } catch (error) {}
    };

    loadProperties();
    getClientSetting();
    resetFormValues();
    return () => {
      cancelTokenSource.cancel();
    };
  }, [resetFormValues]);

  const handleCancel = () => {
    resetFormValues();
    setOpenForm(false);
  };

  const handleNameValidation = (name: string) => {
    let returnHandle = true;
    setNameError('');

    if (!name || !name.trim()) {
      setNameError('Please enter client name');
      returnHandle = false;
    }

    if (returnHandle) {
      setNameError('');
    }

    return returnHandle;
  };

  const handleChangeEmailReminder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailReminder(event.target.checked);
  };

  const handleJobReportReminder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailJobReport(event.target.checked);
  };

  const handleWhatsAppReminder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsAppReminder(event.target.checked);
  };

  const handlePriceReportVisibility = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPriceReportVisibility(event.target.checked);
  };

  const handleSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    setLoading(true);
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      if (!name || !name.trim()) {
        setNameError('Please enter client name');
      } else {
        if (!duplicateClientSetting) {
          const check = await checkDuplicateClientName();

          if (!check) {
            return;
          }
        }

        const { data } = await axios.put(
          `${GET_EDIT_CLIENT_URL(clientId)}`,
          {
            name,
            clientType: type,
            remarks,
            agentId: agentValue.id,
            agentName: agentValue.name,
            emailReminder,
            whatsAppReminder,
            emailJobReport,
            priceReportVisibility
          },
          { cancelToken: cancelTokenSource.token }
        );

        setClients({
          ...clients,
          name,
          clientType: type,
          remarks,
          Agent: data.Agent,
          emailReminder,
          whatsAppReminder,
          emailJobReport,
          priceReportVisibility
        });
        handleSnackbar('success', 'Successfully Edit Profile');
        handleCancel();
      }
    } catch (err) {
      const error = err as any;
      const { message } = error.data;

      if (message) {
        handleSnackbar('error', message);
      } else {
        handleSnackbar('error', 'Failed Edit Profile');
      }
    }
    setLoading(false);
  };

  const checkDuplicateClientName = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      const params = new URLSearchParams();
      params.append('id', String(clientId));
      params.append('name', name);

      const url = `${CLIENT_BASE_URL}/check-name?${params.toString()}`;
      const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

      if (data) {
        handleSnackbar('error', 'Client name already exists');
        setLoading(false);
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed check client name');
      setLoading(false);
      return false;
    }
  };

  const handleFreeTextAgentName = (value: any) => {
    setAgent(value);
    setAgentValue({ id: 0, name: value });
  };

  const handleChangeAgent = (value: any) => {
    if (value) {
      setAgent(value.name);
      setAgentValue(value);
    } else {
      setAgent('');
      setAgentValue({ id: 0, name: '' });
    }
  };

  return (
    <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>
          Client Name <span className={classes.required}>*</span>
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <TextField
          variant='outlined'
          margin='dense'
          required
          fullWidth
          id='clientname'
          error={nameError !== ''}
          helperText={nameError}
          value={name}
          onChange={event => setName(event.target.value)}
          onBlur={event => handleNameValidation(event.target.value)}
          autoComplete='off'
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>Client Type</Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <FormControl component='fieldset'>
          <RadioGroup aria-label='clientType' name='clientType' value={type} onChange={event => setType(event.target.value)} row>
            <FormControlLabel value='RESIDENTIAL' control={<Radio color='primary' />} label='Residential' labelPlacement='end' />
            <FormControlLabel value='COMMERCIAL' control={<Radio color='primary' />} label='Commercial' labelPlacement='end' />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>Agent Name</Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <Autocomplete
          id='agent-master'
          options={agentMaster}
          getOptionLabel={option => option.name}
          inputValue={agent ? agent : ''}
          onInputChange={(_event, value) => handleFreeTextAgentName(value ? value : '')}
          onChange={(_event: any, value: AgentsModel | any) => handleChangeAgent(value)}
          autoHighlight
          freeSolo
          renderInput={params => (
            <TextField
              {...params}
              required
              margin='dense'
              className={classes.textfield}
              id='agent'
              variant='outlined'
              value={agentValue}
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
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>Email for Job Report</Typography>
        <Typography variant='caption' color='textSecondary'>
          System will send you Job Report via Email when any job has been completed by technicians
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <FormControlLabel
          control={<IOSSwitch checked={emailJobReport} onChange={handleJobReportReminder} name='emailReminder' color='primary' />}
          labelPlacement='end'
          label={emailJobReport ? 'Active' : 'Inactive'}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>Email for Appointment Reminder</Typography>
        <Typography variant='caption' color='textSecondary'>
          System will automatic send Email to your clients before upcoming jobs
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <FormControlLabel
          control={<IOSSwitch checked={emailReminder} onChange={handleChangeEmailReminder} name='emailReminder' color='primary' />}
          labelPlacement='end'
          label={emailReminder ? 'Active' : 'Inactive'}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>WhatsApp for Appointment Confirmation</Typography>
        <Typography variant='caption' color='textSecondary'>
          System will automatic send WhatsApp to your clients before upcoming jobs
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <FormControlLabel
          control={<IOSSwitch checked={whatsAppReminder} onChange={handleWhatsAppReminder} name='emailReminder' color='primary' />}
          labelPlacement='end'
          label={whatsAppReminder ? 'Active' : 'Inactive'}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>Price Visibilty on Job Report</Typography>
        <Typography variant='caption' color='textSecondary'>
          Hide/show price on job reports
        </Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <FormControlLabel
          control={<IOSSwitch checked={priceReportVisibility} onChange={handlePriceReportVisibility} name='priceReportVisibility' color='primary' />}
          labelPlacement='end'
          label={priceReportVisibility ? 'Show' : 'Hide'}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Typography variant='h6'>Client Remarks</Typography>
      </Grid>
      <Grid item xs={12} md={8}>
        <TextField
          variant='outlined'
          margin='dense'
          multiline
          rows='4'
          fullWidth
          id='remarks'
          value={remarks}
          onChange={event => setRemarks(event.target.value)}
          autoComplete='off'
        />
      </Grid>
      <Grid item container xs={12} md={12} justify='flex-end'>
        <DialogActions>
          <Button variant='contained' disableElevation disabled={isLoading} onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant='contained' disableElevation color='primary' disabled={isLoading} onClick={handleSubmit}>
            Save
            {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
          </Button>
        </DialogActions>
      </Grid>
    </Grid>
  );
};

export default DetailsForm;
