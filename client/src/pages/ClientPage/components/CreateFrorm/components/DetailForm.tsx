import React, { FC, useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Theme,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  createStyles,
  withStyles,
  Card,
  CardHeader,
  CardContent
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import { ClientBody } from 'typings/body/ClientBody';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
  client: ClientBody;
  setClient: React.Dispatch<React.SetStateAction<ClientBody>>;
  agentMaster: Select[];
  nameError: string;
  setNameError: React.Dispatch<React.SetStateAction<string>>;
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
  card: {
    margin: 'auto',
    width: '100%'
  },
  required: {
    color: 'red'
  },
  textfield: {
    marginBottom: theme.spacing(1)
  }
}));

const DetailForm: FC<Props> = props => {
  const classes = useStyles();
  const { client, setClient, agentMaster, nameError, setNameError } = props;

  const { name, clientType, remarks, emailReminder, whatsAppReminder, emailJobReport, priceReportVisibility } = client;
  const [agent, setAgent] = useState<string>('');
  const [agentValue, setAgentValue] = useState<Select>({ id: 0, name: '' });

  const handleNameValidation = (name: string) => {
    setNameError('');
    if (!name || !name.trim()) {
      setNameError('Please enter client name');
    }

    return;
  };

  const handleChangeEmailReminder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClient({ ...client, emailReminder: event.target.checked });
  };

  const handleJobReportReminder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClient({ ...client, emailJobReport: event.target.checked });
  };

  const handleWhatsAppReminder = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClient({ ...client, whatsAppReminder: event.target.checked });
  };

  const handlePriceReportVisibility = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClient({ ...client, priceReportVisibility: event.target.checked });
  };

  const handleFreeTextAgentName = (value: any) => {
    setAgent(value);
    setAgentValue(value);
    setClient({ ...client, agentId: 0, agentName: value });
  };

  const handleChangeAgent = (value: any) => {
    if (value) {
      setAgent(value.name);
      setAgentValue(value);
      setClient({ ...client, agentId: value.id, agentName: value.name });
    } else {
      setAgent('');
      setAgentValue({ id: 0, name: '' });
    }
  };

  return (
    <Card variant='outlined' className={classes.card}>
      <CardHeader title={<Typography variant='subtitle2'>Client Information</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
      <CardContent>
        <Grid container spacing={2} alignItems='center'>
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
              placeholder='input client name'
              error={nameError !== ''}
              helperText={nameError}
              value={name}
              onChange={event => setClient({ ...client, name: event.target.value })}
              onBlur={event => handleNameValidation(event.target.value)}
              autoComplete='off'
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='h6'>Client Type</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <FormControl component='fieldset'>
              <RadioGroup
                aria-label='clientType'
                name='clientType'
                value={clientType}
                onChange={event => setClient({ ...client, clientType: event.target.value })}
                row
              >
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
              id='agent'
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
              control={<IOSSwitch checked={emailJobReport} name='emailReminder' color='primary' onChange={handleJobReportReminder} />}
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
              control={<IOSSwitch checked={emailReminder} name='emailReminder' color='primary' onChange={handleChangeEmailReminder} />}
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
              control={<IOSSwitch checked={whatsAppReminder} name='emailReminder' color='primary' onChange={handleWhatsAppReminder} />}
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
              control={
                <IOSSwitch checked={priceReportVisibility} name='priceReportVisibility' color='primary' onChange={handlePriceReportVisibility} />
              }
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
              rows='2'
              fullWidth
              id='remarks'
              value={remarks}
              onChange={event => setClient({ ...client, remarks: event.target.value })}
              autoComplete='off'
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DetailForm;
