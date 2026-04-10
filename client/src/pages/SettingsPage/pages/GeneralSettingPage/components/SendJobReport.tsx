import React, { useState, useEffect } from 'react';
import { withStyles, Theme, createStyles, Grid, Typography, makeStyles } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { grey } from '@material-ui/core/colors';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import axios, { CancelTokenSource } from 'axios';

import { GET_SETTING_UPDATE_BASE_URL } from 'constants/url';
import CustomizedDialog from 'components/CustomizedDialog';

interface PageProps {
  settingNotifCompleteEmail: SettingModel;
  setSettingNotifCompleteEmail: React.Dispatch<React.SetStateAction<SettingModel>>;
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

const SendJobReport: React.FC<PageProps> = props => {
  const classes = useStyles();
  const { settingNotifCompleteEmail, setSettingNotifCompleteEmail, handleOpenSnackbar } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [notifCompleteEmail, setNotifCompleteEmail] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  useEffect(() => {
    setNotifCompleteEmail(settingNotifCompleteEmail.isActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingNotifCompleteEmail]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked === false) {
      setOpenConfirm(true);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let cancelTokenSource: CancelTokenSource;
      cancelTokenSource = axios.CancelToken.source();
      const { data } = await axios.put(
        `${GET_SETTING_UPDATE_BASE_URL(settingNotifCompleteEmail!.id)}`,
        { isActive: !notifCompleteEmail },
        { cancelToken: cancelTokenSource.token }
      );

      setSettingNotifCompleteEmail(data);
      setNotifCompleteEmail(data.isActive);
      setOpenConfirm(false);
      handleOpenSnackbar('success', 'Successfully updated setting data.');
    } catch (err) {
      console.log(err);
      handleOpenSnackbar('error', 'Error update setting data.');
    }

    setLoading(false);
  };

  return (
    <>
      <Grid item xs={4}>
        <Typography variant='h5'>Auto-send Job Reports</Typography>
        <Typography variant='body1' className={classes.secondText}>
          Job report email will be automatically sent to your customers when any job has been completed by technicians
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <FormControlLabel
          control={<IOSSwitch checked={notifCompleteEmail} onChange={handleChange} name='completeNotifEmail' />}
          disabled={isLoading}
          labelPlacement='end'
          label={notifCompleteEmail ? 'Active' : 'Inactive'}
        />
      </Grid>
      {openConfirm && (
        <CustomizedDialog
          isLoading={isLoading}
          open={openConfirm}
          isConfirmation
          variant='warning'
          title='Are you sure you want to deactivate ALL Job Report emails?'
          message=''
          secondMessage='This will affect ALL Clients, if you want to deactivate email for Job Report on specific Client, you can go to Client Profile'
          primaryButtonLabel='Ok'
          secondaryButtonLabel='Cancel'
          primaryActionButton={handleSubmit}
          secondaryActionButton={() => {
            setOpenConfirm(false);
            setNotifCompleteEmail(settingNotifCompleteEmail.isActive);
          }}
          handleClose={() => setOpenConfirm(false)}
        />
      )}
    </>
  );
};

export default SendJobReport;
