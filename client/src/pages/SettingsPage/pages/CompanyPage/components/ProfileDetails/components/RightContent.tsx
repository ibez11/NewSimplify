import React, { FC } from 'react';
import { Button, createStyles, Divider, Grid, InputAdornment, makeStyles, TextField, Theme, Typography } from '@material-ui/core';

import NumberFormatCustom from 'components/NumberFormatCustom';
import EditIcon from '@material-ui/icons/Edit';

interface Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  unitNumber: string;
  setUnitNumber: React.Dispatch<React.SetStateAction<string>>;
  postalCode: string;
  setPostalCode: React.Dispatch<React.SetStateAction<string>>;
  contactNumber: string;
  setContactNumber: React.Dispatch<React.SetStateAction<string>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  nameError: string;
  addressError: string;
  postalCodeError: string;
  contactNumberError: string;
  isSubmitting: boolean;
  handleCancel(): void;
  onSubmit: React.FormEventHandler;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dividerStyle: {
      marginTop: theme.spacing(1.5)
    },
    textFieldFont: {
      fontSize: '13px',
      height: 18
    },
    inputAdornmentClass: {
      marginLeft: theme.spacing(2)
    }
  })
);

const RightContent: FC<Props> = props => {
  const classes = useStyles();

  const { name, setName, nameError } = props;
  const { address, setAddress, addressError } = props;
  const { unitNumber, setUnitNumber } = props;
  const { postalCode, setPostalCode, postalCodeError } = props;
  const { contactNumber, setContactNumber, contactNumberError } = props;
  const { isEdit, setIsEdit, handleCancel } = props;

  const { onSubmit } = props;

  const handleSubmit = (event: any) => {
    onSubmit(event);
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant='body2' display='block' gutterBottom>
            Profile Info
          </Typography>
          <Typography color='textSecondary' variant='caption' display='block' gutterBottom>
            You can edit your profile information here
          </Typography>
          <Divider className={classes.dividerStyle} />
        </Grid>
        <Grid item xs={6} sm={6}>
          <TextField
            margin='dense'
            required
            fullWidth
            disabled={!isEdit}
            id='companyName'
            label='Company Name'
            error={nameError !== ''}
            helperText={nameError}
            value={name}
            onChange={event => setName(event.target.value)}
            variant='outlined'
            autoComplete='off'
            multiline
            rowsMax='4'
            InputProps={{
              classes: {
                input: classes.textFieldFont
              }
            }}
            InputLabelProps={{
              className: classes.textFieldFont
            }}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <TextField
            margin='dense'
            required
            fullWidth
            disabled={!isEdit}
            id='contactNumber'
            label='Contact Number'
            error={contactNumberError !== ''}
            helperText={contactNumberError}
            value={contactNumber}
            onChange={event => setContactNumber(event.target.value)}
            variant='outlined'
            autoComplete='off'
            InputProps={{
              classes: {
                input: classes.textFieldFont
              },
              inputComponent: NumberFormatCustom as any,
              inputProps: {
                format: '#### ####'
              },
              startAdornment: (
                <InputAdornment position='start' className={classes.inputAdornmentClass}>
                  +65
                </InputAdornment>
              )
            }}
            InputLabelProps={{
              className: classes.textFieldFont
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            margin='dense'
            required
            fullWidth
            disabled={!isEdit}
            id='companyAddress'
            label='Company Address'
            error={addressError !== ''}
            helperText={addressError}
            value={address}
            onChange={event => setAddress(event.target.value)}
            variant='outlined'
            autoComplete='off'
            multiline
            rows={4}
            rowsMax='4'
            InputProps={{
              classes: {
                input: classes.textFieldFont
              }
            }}
            InputLabelProps={{
              className: classes.textFieldFont
            }}
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <Grid container spacing={1}>
            <Grid item xs={6} sm={6}>
              <TextField
                margin='dense'
                fullWidth
                disabled={!isEdit}
                id='unitNumber'
                label='Unit Number'
                value={unitNumber}
                onChange={event => setUnitNumber(event.target.value)}
                variant='outlined'
                autoComplete='off'
                InputProps={{
                  classes: {
                    input: classes.textFieldFont
                  }
                }}
                InputLabelProps={{
                  className: classes.textFieldFont
                }}
              />
            </Grid>
            <Grid item xs={6} sm={6}>
              <TextField
                margin='dense'
                required
                fullWidth
                disabled={!isEdit}
                id='postalCode'
                label='Postal Code'
                error={postalCodeError !== ''}
                helperText={postalCodeError}
                value={postalCode}
                onChange={event => setPostalCode(event.target.value)}
                variant='outlined'
                autoComplete='off'
                InputProps={{
                  classes: {
                    input: classes.textFieldFont
                  },
                  inputComponent: NumberFormatCustom as any,
                  inputProps: {
                    format: '######'
                  }
                }}
                InputLabelProps={{
                  className: classes.textFieldFont
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {isEdit ? (
            <Grid container justify='flex-end'>
              <Button variant='contained' disableElevation onClick={handleCancel} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button onClick={event => handleSubmit(event)} variant='contained' disableElevation color='primary'>
                Save
              </Button>
            </Grid>
          ) : (
            <Grid container justify='flex-end'>
              <Button variant='contained' disableElevation color='primary' onClick={() => setIsEdit(!isEdit)}>
                <EditIcon /> Edit
              </Button>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default RightContent;
