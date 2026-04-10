import React, { useState, useEffect } from 'react';
import {
  withStyles,
  Theme,
  createStyles,
  Grid,
  Typography,
  makeStyles,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  IconButton
} from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { grey } from '@material-ui/core/colors';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import axios, { CancelTokenSource } from 'axios';

import { GET_SETTING_UPDATE_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import EditIcon from '@material-ui/icons/Edit';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import NumberFormatCustom from 'components/NumberFormatCustom';
import theme from 'theme';

interface PageProps {
  settingFutureJobsVisibility: SettingModel;
  setSettingFutureJobsVisibility: React.Dispatch<React.SetStateAction<SettingModel>>;
  handleOpenSnackbar: (type: 'success' | 'error', message: string) => void;
}

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
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
)(({ classes, ...props }: Props) => {
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
  paddingRight: {
    paddingRight: theme.spacing(1)
  },
  marginDense: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  secondText: {
    color: grey[500]
  }
}));

const FutureJobVisibility: React.FC<PageProps> = props => {
  const classes = useStyles();

  const { settingFutureJobsVisibility, setSettingFutureJobsVisibility, handleOpenSnackbar } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [futureJobVisibility, setFutureJobVisibility] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [value, setValue] = useState<number>(1);

  useEffect(() => {
    setFutureJobVisibility(settingFutureJobsVisibility.isActive);
    setValue(Number(settingFutureJobsVisibility.value) || 1);
  }, [settingFutureJobsVisibility]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFutureJobVisibility(event.target.checked);
    handleSubmit();
  };

  const handleCancel = () => {
    setIsEdit(!isEdit);
    setValue(Number(settingFutureJobsVisibility.value) || 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let cancelTokenSource: CancelTokenSource;
      cancelTokenSource = axios.CancelToken.source();
      const { data } = await axios.put(
        `${GET_SETTING_UPDATE_BASE_URL(settingFutureJobsVisibility!.id)}`,
        { isActive: isEdit ? futureJobVisibility : !futureJobVisibility, value },
        { cancelToken: cancelTokenSource.token }
      );

      setSettingFutureJobsVisibility(data);
      setFutureJobVisibility(data.isActive);
      setLoading(false);
      handleOpenSnackbar('success', 'Successfully updated setting data.');
    } catch (err) {
      console.log(err);
      setLoading(false);
      handleOpenSnackbar('error', 'Error update setting data.');
    }
  };

  return (
    <>
      <Grid item xs={4}>
        <Typography variant='h5'>Future Job Visibility</Typography>
        <Typography variant='body1' className={classes.secondText}>
          Hide/show future job in technician app
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <FormControlLabel
          control={<IOSSwitch checked={futureJobVisibility} onChange={handleChange} name='futureJobVisibility' />}
          disabled={isLoading}
          labelPlacement='end'
          label={futureJobVisibility ? 'Show' : 'Hide'}
        />
      </Grid>
      <Grid item xs={6}>
        <Grid container spacing={1} alignItems='center'>
          <Grid item xs={4}>
            <TextField
              fullWidth
              id='dayWA'
              label='Set days'
              margin='dense'
              disabled={!isEdit}
              value={value}
              onChange={event => setValue(Number(event.target.value))}
              onBlur={event => {
                if (Number(event.target.value) < 1) {
                  setValue(1);
                } else if (Number(event.target.value) > 99) {
                  setValue(99);
                } else {
                  setValue(Number(event.target.value));
                }
              }}
              variant='outlined'
              autoComplete='off'
              InputProps={{
                inputComponent: NumberFormatCustom as any,
                endAdornment: (
                  <>
                    <InputAdornment position='end'>Day(s)</InputAdornment>
                    <Tooltip title={'Set restrictions on how far in advance technicians can view upcoming jobs'} arrow>
                      <InfoIcon fontSize='small' color='primary' style={{ marginLeft: theme.spacing(1) }} />
                    </Tooltip>
                  </>
                ),
                inputProps: { min: 1, max: 99 }
              }}
            />
          </Grid>
          {isEdit ? (
            <Grid item xs={6}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button fullWidth variant='contained' disableElevation onClick={handleCancel}>
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant='contained'
                    disableElevation
                    color='primary'
                    onClick={() => {
                      handleSubmit();
                      setIsEdit(!isEdit);
                    }}
                  >
                    Save
                    <LoadingButtonIndicator isLoading={isLoading} />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          ) : (
            <Grid item xs={1}>
              <Tooltip title={'Edit'} placement='top'>
                <IconButton disabled={!futureJobVisibility} size='small' onClick={() => setIsEdit(!isEdit)}>
                  <EditIcon color={!futureJobVisibility ? 'disabled' : 'primary'} />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default FutureJobVisibility;
