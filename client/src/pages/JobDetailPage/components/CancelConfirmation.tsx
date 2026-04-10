import React from 'react';
import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  Typography,
  Theme,
  RadioGroup,
  Radio,
  Dialog,
  DialogContent,
  DialogActions
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { orange } from '@material-ui/core/colors';
import WarningIcon from '@material-ui/icons/Warning';

interface Props {
  open: boolean;
  handleClose(): void;
  setOpenPasswordConfirmation: React.Dispatch<React.SetStateAction<boolean>>;
  isDeduct: boolean;
  setIsDeduct: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceNumber: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    lineHeight: 1,
    marginTop: theme.spacing(2),
    fontWeight: 'bold'
  },
  dialogActions: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1)
  },
  button: {
    width: 200,
    marginRight: theme.spacing(2)
  }
}));

const CancelConfirmation: React.FC<Props> = props => {
  const classes = useStyles();

  const { open, handleClose, setOpenPasswordConfirmation, isDeduct, setIsDeduct, invoiceNumber } = props;

  const handleDeductChange = (value: any) => {
    setIsDeduct(value);
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <Grid container justify='center' alignItems='center'>
          <WarningIcon style={{ fontSize: 80, color: orange[500] }} />
        </Grid>
        <Typography align='center' variant='h4' className={classes.text} gutterBottom>
          Cancel Job Confirmation
        </Typography>
        {invoiceNumber && (
          <Typography align='center' variant='body1' color='textSecondary' gutterBottom style={{ whiteSpace: 'pre-line' }}>
            {`The contract of this job already have invoice,\ncontract amount will not deduct when job is cancel`}
          </Typography>
        )}
        <Grid container justify='center' alignItems='center'>
          <FormControl component='fieldset'>
            <RadioGroup aria-label='isDeduct' name='isDeduct' row value={String(isDeduct)} onChange={event => handleDeductChange(event.target.value)}>
              <FormControlLabel
                value='true'
                disabled={invoiceNumber ? true : false}
                control={<Radio color='primary' />}
                label='Deduct contract amount'
              />
              <FormControlLabel value='false' control={<Radio color='primary' />} label='Do not deduct contract amount' />
            </RadioGroup>
          </FormControl>
        </Grid>
      </DialogContent>
      <DialogActions className={classes.dialogActions}>
        <Grid container justify='center' alignItems='center'>
          <Button variant='contained' disableElevation className={classes.button} onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='contained' disableElevation color='primary' className={classes.button} onClick={() => setOpenPasswordConfirmation(true)}>
            Yes
          </Button>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default CancelConfirmation;
