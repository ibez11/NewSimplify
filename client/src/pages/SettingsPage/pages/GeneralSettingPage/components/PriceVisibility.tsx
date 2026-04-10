import React, { useState, useEffect } from 'react';
import { withStyles, Theme, createStyles, Grid, Typography, makeStyles } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { grey } from '@material-ui/core/colors';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import axios, { CancelTokenSource } from 'axios';

import { GET_SETTING_UPDATE_BASE_URL } from 'constants/url';

interface PageProps {
  settingPriceVisibility: SettingModel;
  setSettingPriceVisibility: React.Dispatch<React.SetStateAction<SettingModel>>;
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

const PriceVisibility: React.FC<PageProps> = props => {
  const { settingPriceVisibility, setSettingPriceVisibility, handleOpenSnackbar } = props;

  const [isLoading, setLoading] = useState<boolean>(false);
  const [priceVisibility, setPriceVisibility] = useState<boolean>(false);

  const classes = useStyles();

  useEffect(() => {
    setPriceVisibility(settingPriceVisibility.isActive);
  }, [settingPriceVisibility]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPriceVisibility(event.target.checked);
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let cancelTokenSource: CancelTokenSource;
      cancelTokenSource = axios.CancelToken.source();
      const { data } = await axios.put(
        `${GET_SETTING_UPDATE_BASE_URL(settingPriceVisibility!.id)}`,
        { isActive: !priceVisibility },
        { cancelToken: cancelTokenSource.token }
      );

      setSettingPriceVisibility(data);
      setPriceVisibility(data.isActive);
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
        <Typography variant='h5'>Price Visibility</Typography>
        <Typography variant='body1' className={classes.secondText}>
          Hide/show price for technician/customer
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <FormControlLabel
          control={<IOSSwitch checked={priceVisibility} onChange={handleChange} name='priceVisibility' />}
          disabled={isLoading}
          labelPlacement='end'
          label={priceVisibility ? 'Show' : 'Hide'}
        />
      </Grid>
    </>
  );
};

export default PriceVisibility;
