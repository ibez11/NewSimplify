import { FC, useEffect, useState } from 'react';
import { Checkbox, Fade, Grid, List, ListItem, ListItemText, makeStyles, Theme, Typography, Popper, Paper } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import LoadingButton from './LoadingButton';
import axios from 'axios';
import { GET_EDIT_TABLE_COLUMN_SETTING_URL } from 'constants/url';

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  anchorEl: HTMLElement | null;
  columns: SelectedColumn[];
  setColumns: React.Dispatch<React.SetStateAction<SelectedColumn[]>>;
  tableSettingId: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  popper: {
    width: 250,
    zIndex: 99
  },
  paper: {
    borderRadius: '5px',
    padding: theme.spacing(2)
  },
  listItem: {
    padding: theme.spacing(0),
    marginTop: theme.spacing(-1),
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  checkBoxSize: {
    fontSize: 24
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  }
}));

const FilterTable: FC<Props> = props => {
  const classes = useStyles();
  const { open, setOpen, anchorEl, columns, setColumns, tableSettingId } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentColumns, setCurrentColumns] = useState<SelectedColumn[]>([]);

  useEffect(() => {
    if (!columns) {
      return;
    }
    setCurrentColumns(JSON.parse(JSON.stringify(columns)));
  }, [columns]);

  const handleChangeCheckbox = (index: number) => {
    const newColumns = [...currentColumns];
    newColumns[index].isVisible = !newColumns[index].isVisible;
    setCurrentColumns(newColumns);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      if (currentColumns.length > 0) {
        await axios.put(`${GET_EDIT_TABLE_COLUMN_SETTING_URL(tableSettingId)}`, { column: currentColumns });
        setColumns(currentColumns);
      }
      setOpen(false);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  return (
    <Popper open={open} anchorEl={anchorEl} placement={'bottom-end'} className={classes.popper} transition disablePortal>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Paper className={classes.paper} elevation={1}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant='h5'>Show/Hide Column</Typography>
              </Grid>
              <Grid item xs={12}>
                <List>
                  {currentColumns &&
                    currentColumns.map((value, index) => {
                      return (
                        <ListItem
                          key={index}
                          button
                          disableRipple
                          disabled={value.isDisabled}
                          onClick={() => handleChangeCheckbox(index)}
                          className={classes.listItem}
                        >
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxSize} />}
                            checkedIcon={<CheckBoxIcon className={classes.checkBoxSize} />}
                            edge='start'
                            color='primary'
                            className={classes.checkBox}
                            checked={value.isVisible}
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText id={`${value.field}`} primary={value.name} />
                        </ListItem>
                      );
                    })}
                </List>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <LoadingButton
                    fullWidth
                    variant='contained'
                    disableElevation
                    isLoading={isLoading}
                    delay={100}
                    onClick={() => {
                      setOpen(false);
                      setCurrentColumns(columns);
                    }}
                  >
                    Cancel
                  </LoadingButton>
                </Grid>
                <Grid item xs={6}>
                  <LoadingButton
                    fullWidth
                    variant='contained'
                    color='primary'
                    disableElevation
                    isLoading={isLoading}
                    delay={100}
                    onClick={handleSave}
                  >
                    Save
                  </LoadingButton>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default FilterTable;
