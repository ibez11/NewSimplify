import { FC, Fragment, useContext, useEffect, useState } from 'react';
import {
  Checkbox,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  Theme,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  DialogActions,
  Tooltip,
  MenuItem
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/styles';
import NumberFormatCustom from 'components/NumberFormatCustom';
import { isValidEmail } from 'utils';
import { ucWords } from 'utils';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import InfoIcon from '@material-ui/icons/Info';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import axios, { CancelTokenSource } from 'axios';
import { dummyUser } from 'constants/dummy';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { GET_EDIT_USER_URL, USER_BASE_URL } from 'constants/url';
import { PhoneCodeContext } from 'contexts/PhoneCodeContext';

interface Props {
  user: UserDetailsModel;
  isEdit: boolean;
  skillMaster: SkillsModel[];
  handleClose(): void;
  addNewUser(user: UserDetailsModel): void;
  updateIndividualUser: (updatedUserProperties: Partial<UserDetailsModel>) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

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

const districtGroupOptions = [
  'Central / Town',
  'Central East',
  'Central North',
  'Central West',
  'East',
  'North',
  'North Central',
  'North East',
  'West'
];

// --- Postal Sector -> District Group mapping (from your table) ---
const sectorGroups: Array<{ group: string; sectors: string[] }> = [
  {
    group: 'Central / Town',
    sectors: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
  },
  { group: 'Central West', sectors: ['11', '12', '13'] },
  { group: 'Central North', sectors: ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33'] },
  { group: 'Central East', sectors: ['34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] },
  { group: 'East', sectors: ['46', '47', '48', '49', '50', '51', '52', '81'] },
  { group: 'North East', sectors: ['53', '54', '55', '82'] },
  { group: 'North Central', sectors: ['56', '57', '58', '59', '65', '66', '67', '68'] },
  { group: 'West', sectors: ['60', '61', '62', '63', '64', '69', '70', '71'] },
  { group: 'North', sectors: ['72', '73', '75', '76', '77', '78', '79', '80'] }
];

const sectorToGroup: Record<string, string> = sectorGroups.reduce((acc, { group, sectors }) => {
  sectors.forEach(s => (acc[s] = group));
  return acc;
}, {} as Record<string, string>);

const digitsOnly = (s: unknown) => String(s ?? '').replace(/\D/g, '');
const normalizeDistrictValue = (v: unknown) => {
  const raw = String(v ?? '').trim();
  if (!raw) return '';
  // normalize common variations so it matches dropdown option exactly
  if (raw === 'Central/Town' || raw === 'Central Town' || raw === 'CentralTown') return 'Central / Town';
  return raw
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getGroupFromPostal = (postal: unknown) => {
  const p = digitsOnly(postal).slice(0, 6);
  if (p.length < 2) return '';
  const sector = p.slice(0, 2);
  return sectorToGroup[sector] || '';
};

const UserForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { user, isEdit, skillMaster, handleClose, addNewUser, updateIndividualUser, handleSnackbar } = props;
  const { countries } = useContext(PhoneCodeContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserDetailsModel>(dummyUser);
  const [isShowPassword, setShowPassword] = useState<boolean>(false);
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [oldContactNumber, setOldContactNumber] = useState<string>('');
  const [oldRoleId, setOldRoleId] = useState<number>(0);

  const isEmpty = (value: string | undefined) => !value || !value.trim();
  const [error, setError] = useState<any[]>([
    { field: 'name', message: '' },
    { field: 'email', message: '' },
    { field: 'contactNumber', message: '' },
    { field: 'password', message: '' },
    { field: 'confirmPassword', message: '' }
  ]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const skillData: any = [];
    if (user.userSkills) {
      user.userSkills.map(skill => {
        return skillData.push({ name: skill.skill });
      });
    }

    setOldContactNumber(user.contactNumber);
    setOldRoleId(user.roleId);
    setCurrentUser({
      ...user,
      userSkills: skillData,
      homeDistrict: normalizeDistrictValue(user.homeDistrict) || getGroupFromPostal(user.homePostalCode)
    });
  }, [user]);

  const handleChangeSelectedSkills = (skills: Select[]) => {
    const selected: any = [];
    for (const skill of skills) {
      selected.push({ name: skill.name });
    }
    setCurrentUser({ ...currentUser, userSkills: selected });
  };

  const handlePasswordBlur = () => {
    setError(prev => {
      prev[3].message = '';
      prev[4].message = ''; // Clear confirm password error as well
      return [...prev];
    });

    const { roleId, password } = currentUser;

    if (roleId === 2) return;

    if (isEmpty(password)) {
      setError(prev => {
        prev[3].message = 'Please enter your password';
        return [...prev];
      });
      return;
    }

    if (isEmpty(confirmPassword)) {
      setError(prev => {
        prev[4].message = 'Please enter your confirm password';
        return [...prev];
      });
      return;
    }

    if (password !== confirmPassword) {
      setError(prev => {
        prev[3].message = 'Password and confirm password are different';
        prev[4].message = 'Password and confirm password are different';
        return [...prev];
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const { displayName, contactNumber, email, roleId, password } = currentUser;

    const setErrorMessage = (index: number, message: string) => {
      setError(prev => {
        prev[index].message = message;
        return [...prev];
      });
    };

    const validateEmail = () => {
      if (isEmpty(email)) {
        setErrorMessage(1, 'Please enter email');
        isValid = false;
      } else if (!isValidEmail(email)) {
        setErrorMessage(1, 'Please enter valid email address');
        isValid = false;
      }
    };

    const validatePassword = () => {
      if (roleId !== 2) {
        if (isEmpty(password)) {
          setErrorMessage(3, 'Please enter password');
          isValid = false;
          return;
        }

        if (isEmpty(confirmPassword)) {
          setErrorMessage(4, 'Please enter your confirm password');
          isValid = false;
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage(3, 'Password and confirm password are different');
          setErrorMessage(4, 'Password and confirm password are different');
          isValid = false;
        }
      }
    };

    const validateDisplayName = () => {
      if (!displayName || !displayName.trim()) {
        setErrorMessage(0, 'Please enter employee name');
        isValid = false;
      }
    };

    const validateContactNumber = () => {
      if (isEmpty(contactNumber)) {
        setErrorMessage(2, 'Please enter contact number');
        isValid = false;
      } else if (contactNumber.length < 8) {
        setErrorMessage(2, 'Contact number is less than 8 digits');
        isValid = false;
      }
    };

    validateEmail();
    if (roleId !== oldRoleId) {
      validatePassword();
    }
    validateDisplayName();
    validateContactNumber();

    return isValid;
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    let message = '';

    try {
      if (isEdit) {
        const response = await axios.put(
          `${GET_EDIT_USER_URL(user.id)}`,
          {
            ...currentUser,
            skills: currentUser.userSkills,
            oldContactNumber,
            newPassword: currentUser.password
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualUser(response.data);
        message = 'Successfully edit employee';
      } else {
        const response = await axios.post(
          `${USER_BASE_URL}`,
          {
            ...currentUser,
            skills: currentUser.userSkills
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewUser(response.data);
        message = 'Successfully add new employee';
      }
      handleSnackbar('success', message);
      handleClose();
    } catch (err) {
      console.log(err);
      const error = err as any;
      const { errorCode } = error.data;

      if (errorCode === 5) {
        message = 'Email has been registered';
      } else if (errorCode === 38) {
        message = 'Contact number has been registered';
      } else if (errorCode === 55) {
        message = 'Exceeded license usage';
      } else if (errorCode === 50) {
        message = 'Cannot change role while this user is still logged in or has an active session';
      } else {
        message = isEdit ? 'Failed to edit employee' : 'Failed to add new employee';
      }
      handleSnackbar('error', message);
    }
    setIsLoading(false);
  };

  const handlePostalBlur = () => {
    const postal = digitsOnly(currentUser.homePostalCode).slice(0, 6);
    const group = getGroupFromPostal(postal);

    setCurrentUser(prev => ({
      ...prev,
      homePostalCode: postal,
      ...(group ? { homeDistrict: group } : {})
    }));
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Employee Name <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='name'
            label='Name'
            error={error[0].message !== ''}
            helperText={error[0].message}
            value={currentUser.displayName}
            onChange={event => setCurrentUser({ ...currentUser, displayName: event.target.value })}
            onBlur={event => {
              if (event.target.value) {
                setError(prev => {
                  prev[0].message = '';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[0].message = 'Please enter employee name';
                  return [...prev];
                });
              }
            }}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Email <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='email'
            label='Email'
            error={error[1].message !== ''}
            helperText={error[1].message}
            value={currentUser.email}
            onChange={event => setCurrentUser({ ...currentUser, email: event.target.value })}
            onBlur={event => {
              if (event.target.value) {
                setError(prev => {
                  prev[1].message = '';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[1].message = 'Please enter email';
                  return [...prev];
                });
              }
            }}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Contact Number <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            margin='dense'
            fullWidth
            id='clientcountryCode'
            label='Country Code'
            value={currentUser.countryCode}
            onChange={event => setCurrentUser({ ...currentUser, countryCode: event.target.value })}
            variant='outlined'
            autoComplete='off'
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
        <Grid item xs={12} sm={5}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='contactNumber'
            label='Contact Number'
            error={error[2].message !== ''}
            helperText={error[2].message}
            value={currentUser.contactNumber}
            onChange={event => setCurrentUser({ ...currentUser, contactNumber: event.target.value })}
            onBlur={event => {
              if (event.target.value) {
                setError(prev => {
                  prev[2].message = '';
                  return [...prev];
                });
              } else {
                setError(prev => {
                  prev[2].message = 'Please enter contact number';
                  return [...prev];
                });
              }
            }}
            autoComplete='off'
            InputProps={{
              inputComponent: NumberFormatCustom as any,
              endAdornment: currentUser.token && (
                <Tooltip title='Please contact technician to logout'>
                  <InfoIcon color='error' />
                </Tooltip>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Home Postal Code</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='homePostalCode'
            label='Home Postal Code'
            value={currentUser.homePostalCode || ''}
            onChange={event => setCurrentUser({ ...currentUser, homePostalCode: event.target.value })}
            onBlur={handlePostalBlur}
            autoComplete='off'
            inputProps={{ maxLength: 6, inputMode: 'numeric' }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Home District</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            select
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='homeDistrict'
            label='Home District'
            value={currentUser.homeDistrict || ''}
            onChange={event =>
              setCurrentUser({
                ...currentUser,
                homeDistrict: event.target.value
              })
            }
            autoComplete='off'
          >
            {districtGroupOptions.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Role <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <FormControl component='fieldset'>
            <RadioGroup
              aria-label='roleEmployee'
              name='Role'
              value={currentUser.roleId}
              onChange={event => setCurrentUser({ ...currentUser, roleId: Number(event.target.value) })}
              row
            >
              <FormControlLabel value={1} control={<Radio color='primary' />} label='Admin' labelPlacement='end' />
              <FormControlLabel value={2} control={<Radio color='primary' />} label='Technician' labelPlacement='end' />
              <FormControlLabel value={3} control={<Radio color='primary' />} label='Manager' labelPlacement='end' />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Skill</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Autocomplete
            multiple
            id='skills'
            options={skillMaster}
            value={currentUser.userSkills}
            disableCloseOnSelect
            getOptionLabel={option => option.name}
            getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
            onChange={(event, value) => handleChangeSelectedSkills(value)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip size='small' color='primary' label={`${option.name}`} {...getTagProps({ index })} />)
            }
            renderOption={(option, { selected }) => (
              <Fragment>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxIcon} />}
                  checkedIcon={<CheckBoxIcon className={classes.checkBoxIcon} />}
                  color='primary'
                  disableRipple
                  className={classes.checkBox}
                  checked={selected}
                />
                {ucWords(option.name)}
              </Fragment>
            )}
            renderInput={params => (
              <TextField {...params} fullWidth margin='dense' id='skills' label='Skills' variant='outlined' autoComplete='off' />
            )}
          />
        </Grid>
        {currentUser.roleId !== 2 && (
          <>
            <Grid item xs={12} sm={4}>
              <Typography variant='h6'>
                Password <span className={classes.required}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                variant='outlined'
                margin='dense'
                required
                fullWidth
                name='password'
                label='Password'
                type={isShowPassword ? 'text' : 'password'}
                id='password'
                autoComplete='current-password'
                error={error[3].message !== ''}
                helperText={error[3].message}
                onChange={event => setCurrentUser({ ...currentUser, password: event.target.value })}
                onBlur={handlePasswordBlur}
                value={currentUser.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' aria-label='toggle password visibility' onClick={event => setShowPassword(!isShowPassword)}>
                        {isShowPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant='h6'>
                Confirm Password <span className={classes.required}>*</span>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                variant='outlined'
                margin='dense'
                required
                fullWidth
                name='confirmPassword'
                label='Confirm Password'
                type={isShowPassword ? 'text' : 'password'}
                id='confirmPassword'
                autoComplete='current-password'
                error={error[4].message !== ''}
                helperText={error[4].message}
                onChange={event => setConfirmPassword(event.target.value)}
                onBlur={handlePasswordBlur}
                value={confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' aria-label='toggle password visibility' onClick={event => setShowPassword(!isShowPassword)}>
                        {isShowPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </>
        )}
      </Grid>
      <DialogActions>
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

export default UserForm;
