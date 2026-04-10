import { FC } from 'react';
import {
  Theme,
  makeStyles,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Divider,
  Grid
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

interface Props {
  title: string;
  open: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
  children: JSX.Element;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  buttonAciton: {
    margin: 8
  }
}));

const FilterDialog: FC<Props> = props => {
  const classes = useStyles();
  const { title, open, handleClose, handleSubmit, children } = props;

  return (
    <Dialog open={open} scroll='body' fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h5' id='filter-title-modal'>
          {title}
        </Typography>
        <IconButton size='small' className={classes.closeButton} onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {children}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' disableElevation onClick={handleClose}>
          Close
        </Button>
        <Button variant='contained' disableElevation onClick={handleSubmit} color='primary' autoFocus>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterDialog;
