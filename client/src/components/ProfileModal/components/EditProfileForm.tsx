import React, { useContext, useState } from 'react';
import { Grid, InputAdornment, IconButton, TextField, MenuItem, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import NumberFormatCustom from 'components/NumberFormatCustom';
import { isValidEmail } from 'utils';
import { PhoneCodeContext } from 'contexts/PhoneCodeContext';

interface Props {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  countryCode: string;
  contactNumber: string;
  selectedRoleId: number;

  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setName: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  setCountryCode: React.Dispatch<React.SetStateAction<string>>;
  setContactNumber: React.Dispatch<React.SetStateAction<string>>;
  setSelectedRoleId: React.Dispatch<React.SetStateAction<number>>;

  emailError: string;
  nameError: string;
  passwordError: string;
  contactNumberError: string;
  roleIdError: string;

  setEmailError: React.Dispatch<React.SetStateAction<string>>;
  setNameError: React.Dispatch<React.SetStateAction<string>>;
  setPasswordError: React.Dispatch<React.SetStateAction<string>>;
  setContactNumberError: React.Dispatch<React.SetStateAction<string>>;
  setRoleIdError: React.Dispatch<React.SetStateAction<string>>;

  roles: Role[];
}

const useStyles = makeStyles((theme: Theme) => ({
  textFieldFont: {
    height: 18,
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2.5)
  },
  inputAdornmentClass: {
    marginLeft: theme.spacing(2),
    paddingTop: theme.spacing(0.5)
  },
  flagImg: {
    height: 13,
    width: 20,
    marginRight: 10
  }
}));

const EditProfileForm: React.FC<Props> = props => {
  const classes = useStyles();

  const { email, setEmail, emailError } = props;
  const { name, setName, nameError } = props;
  const { password, setPassword, passwordError } = props;
  const { confirmPassword, setConfirmPassword } = props;
  const { countryCode, setCountryCode, contactNumber, setContactNumber, contactNumberError } = props;
  const { selectedRoleId, setSelectedRoleId, roleIdError } = props;
  const { roles } = props;
  const { setEmailError, setNameError, setPasswordError, setContactNumberError } = props;
  const { countries } = useContext(PhoneCodeContext);

  const [isShowPassword, setShowPassword] = useState<boolean>(false);

  const handleBlurEmail = (email: string) => {
    setEmailError('');
    if (!email || !email.trim()) {
      setEmailError('Please enter email');
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter an valid email');
    }
  };

  const handleBlurName = (name: string) => {
    setNameError('');
    if (!name || !name.trim()) {
      setNameError('Please enter display name');
    }
  };

  const handleContactBlur = () => {
    setContactNumberError('');
    if (!contactNumber || !contactNumber.trim()) {
      setContactNumberError('Please enter contact number');
    } else if (contactNumber.replace(/\s/g, '').length < 8) {
      setContactNumberError('Please enter valid contact number');
    }
  };

  const handlePasswordBlur = () => {
    setPasswordError('');
    if (password !== confirmPassword) {
      setPasswordError('Password and confirm password is different');
    }
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='email'
            label='Email'
            error={emailError !== ''}
            helperText={emailError}
            value={email}
            onChange={event => setEmail(event.target.value)}
            onBlur={event => handleBlurEmail(event.target.value)}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='name'
            label='Name'
            error={nameError !== ''}
            helperText={nameError}
            value={name}
            onChange={event => setName(event.target.value)}
            onBlur={event => handleBlurName(event.target.value)}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='password'
            label='Password'
            type={isShowPassword ? 'text' : 'password'}
            id='password'
            autoComplete='current-password'
            error={passwordError !== ''}
            helperText={passwordError}
            onChange={event => setPassword(event.target.value)}
            onBlur={handlePasswordBlur}
            value={password}
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
        <Grid item xs={6}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            name='confirmPassword'
            label='Confirm Password'
            type={isShowPassword ? 'text' : 'password'}
            id='confirmPassword'
            autoComplete='current-password'
            error={passwordError !== ''}
            helperText={passwordError}
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
        <Grid item xs={4}>
          <TextField
            select
            margin='normal'
            fullWidth
            id='clientcountryCode'
            label='Country Code'
            value={countryCode}
            onChange={event => setCountryCode(event.target.value)}
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
        <Grid item xs={8}>
          <TextField
            variant='outlined'
            margin='normal'
            required
            fullWidth
            id='contactNumber'
            label='Contact Number'
            error={contactNumberError !== ''}
            helperText={contactNumberError}
            value={contactNumber}
            onChange={event => setContactNumber(event.target.value)}
            onBlur={handleContactBlur}
            autoComplete='off'
            InputProps={{
              classes: {
                input: classes.textFieldFont
              },
              inputComponent: NumberFormatCustom as any
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled
            variant='outlined'
            select
            margin='normal'
            required
            fullWidth
            id='role'
            label='Role'
            error={roleIdError !== ''}
            helperText={roleIdError}
            value={selectedRoleId}
            onChange={event => setSelectedRoleId(+event.target.value)}
            autoComplete='off'
          >
            {roles.map(role => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </>
  );
};

export default EditProfileForm;
