import React, { FC, useState } from 'react';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/styles';
import { Button, Fade, Grid, Paper, Theme, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface Props {
  openPopper: boolean;
  setOpenPopper: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: HTMLElement | null;
  placement: any;
  containerWidth: number;
  fadeTransition: number;
  mT?: number;
  mR?: number;
  mB?: number;
  mL?: number;
  options: Select[];
  setFilterValue: React.Dispatch<React.SetStateAction<number>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  popper: (props: Props) => ({
    marginTop: theme.spacing(props.mT !== undefined ? props.mT : 0),
    marginRight: theme.spacing(props.mR !== undefined ? props.mR : 0),
    marginBottom: theme.spacing(props.mB !== undefined ? props.mB : 0),
    marginLeft: theme.spacing(props.mL !== undefined ? props.mL : 0),
    width: props.containerWidth,
    zIndex: 99
  }),
  paper: {
    borderRadius: '5px'
  },
  clearButton: {
    color: '#89BED3',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#53A0BE'
    },
    padding: theme.spacing(0)
  },
  textFieldFont: {
    fontSize: '12px',
    height: 18
  },
  paddingMargin: {
    padding: theme.spacing(1)
  }
}));

const SearchFilter: FC<Props> = props => {
  const classes = useStyles(props);

  const { openPopper, setOpenPopper, anchorEl, placement, fadeTransition, options, setFilterValue } = props;

  const [value, setValue] = useState<Select | null>();

  const handleValueChage = (value: any) => {
    if (value) {
      setValue(value);
    } else {
      setValue(null);
    }
  };

  const handleButton = () => {
    setFilterValue(value ? value.id : 0);
    setOpenPopper(false);
  };

  const renderContent = () => {
    return (
      <Grid container spacing={1} className={classes.paddingMargin}>
        <Grid item xs={12}>
          <Autocomplete
            id='service-address'
            options={options}
            value={value}
            getOptionLabel={option => option.name}
            fullWidth
            onChange={(event: any, value: any) => handleValueChage(value)}
            renderInput={params => <TextField {...params} label='Service Address' variant='outlined' />}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid container direction='row' justify='flex-end' alignItems='center'>
            <Button variant='contained' color='primary' onClick={handleButton}>
              Done
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <Popper open={openPopper} anchorEl={anchorEl} placement={placement} className={classes.popper} transition disablePortal>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={fadeTransition}>
          <Paper className={classes.paper}>{renderContent()}</Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default SearchFilter;
