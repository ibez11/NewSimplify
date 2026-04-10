import { FC, Fragment, useEffect, useState } from 'react';
import { Button, DialogActions, FormControlLabel, Grid, TextField, Theme, Typography } from '@material-ui/core';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import { createStyles, makeStyles, withStyles } from '@material-ui/styles';
import axios, { CancelTokenSource } from 'axios';
import { dummyRoleGrants, dummySecurityRoles } from 'constants/dummy';
import { GET_EDIT_ROLE_ACCESS_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import theme from 'theme';

interface PageProps {
  roleId: number;
  updateIndividualSecurityRole: (updatedSecurityRoleProperties: Partial<SecurityRoleDetailModel>) => void;
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

interface SecurityRoleDetailModel extends SecurityRolesModel {
  roleGrants: RoleGrantModel[];
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
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  required: {
    color: 'red'
  },
  inputAdornmentClass: {
    marginLeft: theme.spacing(2)
  },
  checkBoxIcon: {
    fontSize: '16px'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  },
  flagImg: {
    height: 13,
    width: 20,
    marginRight: 10
  }
}));

const SecurityRoleForm: FC<PageProps> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { roleId, updateIndividualSecurityRole, handleClose, handleSnackbar } = props;

  const dummySecurityRolesDetail: SecurityRoleDetailModel = { ...dummySecurityRoles, roleGrants: [...dummyRoleGrants] };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentSecurityRole, setCurrentSecurityRole] = useState<SecurityRoleDetailModel>(dummySecurityRolesDetail);
  const [errorName, setErrorName] = useState<string>('');

  useEffect(() => {
    if (roleId === 0) {
      return;
    }

    const loadData = async () => {
      setIsLoading(true);

      try {
        const { data } = await axios.get(`${GET_EDIT_ROLE_ACCESS_BASE_URL(roleId)}`, { cancelToken: cancelTokenSource.token });
        setCurrentSecurityRole(data);
      } catch (err) {
        console.log(err);
        handleSnackbar('error', 'Failed to load data');
      }
      setIsLoading(false);
    };

    loadData();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleId]);

  const handleChangeStatus = (event: any, index: number) => {
    const newRoleGrants: RoleGrantModel[] = [...currentSecurityRole.roleGrants];
    newRoleGrants[index].isActive = event.target.checked;
    const isActive = event.target.checked;
    const targetModule = newRoleGrants[index].module;
    const isMain = newRoleGrants[index].isMain;

    if (!isActive) {
      if (isMain) {
        // Iterate through the role grants and set isActive to false for the same module where isMain is false
        newRoleGrants.forEach(grant => {
          if (grant.module === targetModule) {
            grant.isActive = false;
          }
        });
      } else {
        newRoleGrants[index].isActive = false;
      }
    }

    setCurrentSecurityRole({ ...currentSecurityRole, roleGrants: newRoleGrants });
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!currentSecurityRole.name || !currentSecurityRole.name.trim()) {
      setIsLoading(false);
      setErrorName('Please enter role name');
      return;
    }

    try {
      const response = await axios.put(GET_EDIT_ROLE_ACCESS_BASE_URL(roleId), { ...currentSecurityRole });
      updateIndividualSecurityRole(response.data);
      handleClose();
      handleSnackbar('success', 'Success edit role security');
    } catch (err) {
      handleSnackbar('error', 'Failed to edit role security');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid} alignItems='flex-start'>
        <Grid item xs={12} sm={3}>
          <Typography variant='h6'>
            Role Name <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={9}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='rolename'
            label='Role Name'
            error={errorName !== ''}
            helperText={errorName}
            value={currentSecurityRole.name}
            onChange={event => setCurrentSecurityRole({ ...currentSecurityRole, name: event.target.value })}
            onBlur={event => {
              if (event.target.value) {
                setErrorName('');
              } else {
                setErrorName('Please enter Role Name');
              }
            }}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='h6'>Description</Typography>
        </Grid>
        <Grid item xs={12} sm={9}>
          <TextField
            margin='dense'
            fullWidth
            id='descriptionRole'
            label='Description'
            value={currentSecurityRole.description}
            onChange={event => setCurrentSecurityRole({ ...currentSecurityRole, description: event.target.value })}
            variant='outlined'
            autoComplete='off'
            multiline
            rows={4}
            rowsMax='4'
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant='h6'>
            Access Setting<span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={9}>
          {currentSecurityRole.roleGrants.map((value, index) => {
            return (
              <Grid key={`role-${index}`} container spacing={5} justify='space-between'>
                <Grid item style={{ marginLeft: value.isMain ? 0 : theme.spacing(5) }}>
                  <Typography variant='h6'>{value.label}</Typography>
                  <Typography variant='body1' color='textSecondary'>
                    {value.description}
                  </Typography>
                </Grid>
                <Grid item>
                  <Fragment>
                    <FormControlLabel
                      control={
                        <IOSSwitch
                          checked={value.isActive ? true : false}
                          onChange={(event: any) => handleChangeStatus(event, index)}
                          name='status'
                        />
                      }
                      label={value.isActive ? 'Yes' : 'No'}
                    />
                  </Fragment>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      <DialogActions style={{ marginTop: theme.spacing(2) }}>
        <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' disableElevation color='primary' disabled={isLoading} onClick={handleSubmit}>
          Save
          {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
        </Button>
      </DialogActions>
    </>
  );
};

export default SecurityRoleForm;
