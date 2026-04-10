import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { Button, createStyles, FormControlLabel, makeStyles, MenuItem, TableRow, TextField, Theme, Tooltip, withStyles } from '@material-ui/core';

import BodyCell from 'components/BodyCell';
import clsx from 'clsx';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';

interface PageProps {
  activeUsers: ActiveUser[];
  model: string;
  carplateNumber: string;
  coeExpiryDate: Date | null;
  vehicleStatus: boolean;
  employeeInCharge: number;

  setModel: React.Dispatch<React.SetStateAction<string>>;
  setCarplateNumber: React.Dispatch<React.SetStateAction<string>>;
  setCoeExpiryDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setVehicleStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setEmployeeInCharge: React.Dispatch<React.SetStateAction<number>>;
  setCarplateNumberError: React.Dispatch<React.SetStateAction<string>>;

  carplateNumberError: string;

  isSubmitting: boolean;
  onSubmit: React.FormEventHandler;
  onCancel: React.MouseEventHandler;

  primaryButtonLabel: string;
  customBackground?: string;
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
  serviceItemTemplateForm: {
    height: 64
  },
  textFieldRoot: (props: PageProps) => ({
    backgroundColor: props.customBackground
  }),
  textFieldFont: {
    fontSize: '13px',
    height: 18
  },
  buttonContainer: {
    display: 'flex'
  },
  cancelButton: {
    marginRight: theme.spacing(2),
    width: 100
  },
  addButton: {
    width: 100
  }
}));

const CreateEditVehicleForm: React.FC<PageProps> = props => {
  const classes = useStyles(props);

  const { model, setModel } = props;
  const { carplateNumber, setCarplateNumber, carplateNumberError, setCarplateNumberError } = props;
  const { coeExpiryDate, setCoeExpiryDate } = props;
  const { vehicleStatus, setVehicleStatus } = props;
  const { employeeInCharge, setEmployeeInCharge } = props;

  const { activeUsers, primaryButtonLabel, customBackground, isSubmitting, onSubmit, onCancel } = props;

  const handleCoeExpiryDateChange = (date: Date | null) => {
    setCoeExpiryDate(date);
  };

  return (
    <TableRow className={classes.serviceItemTemplateForm}>
      <BodyCell cellWidth='14%' pR='10px' isComponent={true}>
        <Tooltip title={carplateNumberError} placement='top' open={carplateNumberError === ('' || 'Empty') ? false : true}>
          <TextField
            margin='dense'
            required
            fullWidth
            className={clsx({ [classes.textFieldRoot]: customBackground })}
            id='vehicleNumber'
            label='Veh. No'
            error={carplateNumberError !== ''}
            value={carplateNumber}
            onChange={event => setCarplateNumber(event.target.value.toUpperCase())}
            onBlur={event => {
              if (carplateNumber) {
                setCarplateNumberError('');
              } else {
                setCarplateNumberError('Carplate Number can not be empty');
              }
            }}
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
            multiline
            rowsMax='4'
          />
        </Tooltip>
      </BodyCell>
      <BodyCell cellWidth='20%' pL='10px' pR='10px' isComponent={true}>
        <TextField
          margin='dense'
          fullWidth
          className={clsx({ [classes.textFieldRoot]: customBackground })}
          id='model'
          label='Type & Make'
          value={model}
          onChange={event => setModel(event.target.value)}
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
          multiline
          rowsMax='4'
        />
      </BodyCell>
      <BodyCell cellWidth='18%' pL='10px' pR='10px' isComponent={true}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            margin='dense'
            required
            fullWidth
            className={clsx({ [classes.textFieldRoot]: customBackground })}
            id='coeExpiryDate'
            label='Coe Expiry Date'
            value={coeExpiryDate}
            variant='dialog'
            inputVariant='outlined'
            format='dd/MM/yyyy'
            onChange={handleCoeExpiryDateChange}
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
            InputProps={{
              classes: {
                input: classes.textFieldFont
              }
            }}
            InputLabelProps={{
              className: classes.textFieldFont
            }}
            InputAdornmentProps={{ position: 'start' }}
          />
        </MuiPickersUtilsProvider>
      </BodyCell>
      <BodyCell cellWidth='20%' pL='10px' pR='10px' isComponent={true}>
        <TextField
          select
          margin='dense'
          fullWidth
          className={clsx({ [classes.textFieldRoot]: customBackground })}
          id='employeeInCharge'
          label='Employee Name'
          value={employeeInCharge}
          onChange={event => setEmployeeInCharge(+event.target.value)}
          variant='outlined'
          autoComplete='off'
          InputProps={{
            classes: {
              input: classes.textFieldFont
            }
          }}
          InputLabelProps={{
            className: classes.textFieldFont,
            shrink: employeeInCharge === 0 ? false : true
          }}
        >
          <MenuItem key={0} value=''>
            <em>None</em>
          </MenuItem>
          {activeUsers.map(activeUser => (
            <MenuItem key={activeUser.id} value={activeUser.id}>
              {activeUser.displayName}
            </MenuItem>
          ))}
        </TextField>
      </BodyCell>
      <BodyCell cellWidth='15%' pL='10px' pR='10px' isComponent={true}>
        <FormControlLabel
          control={
            <IOSSwitch
              checked={vehicleStatus ? true : false}
              onChange={vehicleStatus ? event => setVehicleStatus(false) : event => setVehicleStatus(true)}
            />
          }
          label={vehicleStatus ? 'Active' : 'Not Active'}
        />
      </BodyCell>
      <BodyCell cellWidth='15%' isComponent={true}>
        <div className={classes.buttonContainer}>
          <Button variant='contained' className={classes.cancelButton} onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} variant='contained' color='secondary' className={classes.addButton} disabled={isSubmitting}>
            {primaryButtonLabel}
          </Button>
        </div>
      </BodyCell>
    </TableRow>
  );
};

export default CreateEditVehicleForm;
