import { FC, useState, useEffect } from 'react';

import {
  Button,
  IconButton,
  Theme,
  Grid,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Divider
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import CloseIcon from '@material-ui/icons/Close';
import Autocomplete from '@material-ui/lab/Autocomplete';

import AddIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';

interface Props {
  open: boolean;
  checklistMaster: ChecklistTemplateModel[];
  isEdit: boolean;
  checklist: JobChecklistModel;
  handleSubmitModal: (checklist: JobChecklistModel) => void;
  handleClose(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    fontSize: 20
  },
  responsiveScale: {
    width: '100%'
  },
  checklistItem: {
    width: '100%',
    flexGrow: 1,
    overflow: 'auto',
    flexBasis: '100%'
  },
  noDataSummaryGrid: {
    display: 'flex',
    height: 100
  },
  itemRemarks: {
    paddingLeft: theme.spacing(4),
    fontSize: '12px'
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  disabledLabel: {
    '&.MuiFormControlLabel-label.Mui-disabled': {
      color: '#000000'
    }
  }
}));

const ChecklistModal: FC<Props> = props => {
  const classes = useStyles();
  const { checklistMaster, open, isEdit, checklist, handleSubmitModal, handleClose } = props;

  const [checklistTitle, setChecklistTitle] = useState<string>('');
  const [checklistDescription, setChecklistDescription] = useState<string>('');
  const [checklistItemName, setChecklistItemName] = useState<string>('');
  const [checklistItemRemarks, setChecklistItemRemarks] = useState<string>('');
  const [checklistItems, setChecklistItems] = useState<ChecklistItemModel[]>([]);
  const [isEditItem, setIsEditItem] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const [checklistTitleError, setChecklistTitleError] = useState<string>('');
  const [itemNameError, setItemNameError] = useState<string>('');
  const [checklistItemsError, setChecklistItemsError] = useState<string>('');

  useEffect(() => {
    if (checklist) {
      const { name, description, ChecklistItems } = checklist;

      setChecklistTitle(name);
      setChecklistDescription(description);
      setChecklistItems(
        ChecklistItems.map(value => {
          return { ...value };
        })
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checklist]);

  const handleFreeTextChecklistTitle = (value: any) => {
    setChecklistTitle(value);
    setChecklistTitleError('');
  };

  const handleChecklistTitleChange = (value: any) => {
    if (value) {
      const { name, description, ChecklistItems } = value;
      const items: ChecklistItemModel[] = [];

      if (ChecklistItems.length > 0) {
        ChecklistItems.map((item: any) => {
          return items.push({ id: 0, name: item.name, status: false, remarks: item.remarks });
        });
      }
      setChecklistTitle(name);
      setChecklistDescription(description);
      setChecklistItems(items);
    } else {
      setChecklistTitle('');
      setChecklistDescription('');
      setChecklistItems([]);
    }
    setChecklistTitleError('');
  };

  const handleBlurTitle = () => {
    if (!checklistTitle || !checklistTitle.trim()) {
      setChecklistTitleError('Please enter checklist title');
      return;
    }
    setChecklistTitleError('');
  };

  const handleAddChecklistItem = () => {
    if (checklistItemName) {
      const currentChecklistItems = checklistItems ? [...checklistItems] : [];
      currentChecklistItems.push({ id: 0, name: checklistItemName, status: false, remarks: checklistItemRemarks });

      setChecklistItems(currentChecklistItems);
      setChecklistItemName('');
      setChecklistItemRemarks('');
      setItemNameError('');
    } else {
      setItemNameError('Please insert item name');
    }
  };

  const handleEditChecklistItem = (index: number) => {
    const currentChecklistItems = [...checklistItems];
    currentChecklistItems[index].name = checklistItemName;
    currentChecklistItems[index].remarks = checklistItemRemarks;
    setChecklistItems(currentChecklistItems);
    setChecklistItemName('');
    setChecklistItemRemarks('');
    setIsEditItem(false);
    setSelectedIndex(0);
  };

  const handleDeleteChecklistItem = (itemIndex: number) => {
    const currentChecklistItems = [...checklistItems];
    currentChecklistItems.splice(itemIndex, 1);
    setChecklistItems(currentChecklistItems);
  };

  const handleChangeCheckbox = (index: number) => {
    const currentChecklistItems = [...checklistItems];
    currentChecklistItems[index].status = !currentChecklistItems[index].status;
    setChecklistItems(currentChecklistItems);
  };

  const handleOpenEditChecklistItem = (index: number) => {
    const currentChecklistItems = [...checklistItems];
    setChecklistItemName(currentChecklistItems[index].name);
    setChecklistItemRemarks(currentChecklistItems[index].remarks || '');
    setIsEditItem(true);
    setSelectedIndex(index);
  };

  const handleSubmit = async () => {
    if (!checklistTitle || !checklistTitle.trim()) {
      setChecklistTitleError('Please enter checklist title');
      return;
    }

    if (checklistItems && checklistItems.length <= 0) {
      setChecklistItemsError('Please Insert Expense Item');
      return;
    }

    handleSubmitModal({
      id: checklist.id,
      name: checklistTitle,
      description: checklistDescription,
      ChecklistItems: checklistItems
    });
    handleClose();
  };

  return (
    <Dialog open={open} fullWidth maxWidth='md'>
      <DialogTitle>
        <Typography variant='h5'>{`${isEdit ? 'Edit' : 'Add New'} Checklist`}</Typography>
        <IconButton size='small' onClick={handleClose} className={classes.closeButton}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.responsiveScale}>
            <Autocomplete
              id='combo-box-demo'
              options={checklistMaster}
              getOptionLabel={option => option.name}
              inputValue={checklistTitle}
              onInputChange={(_, value, reason) => {
                if (reason === 'input') {
                  handleFreeTextChecklistTitle(value ? value : '');
                }
                if (reason === 'clear') {
                  setChecklistTitle('');
                  setChecklistDescription('');
                  setChecklistItems([]);
                }
              }}
              onChange={(_: any, value: ChecklistTemplateModel | any) => handleChecklistTitleChange(value)}
              onBlur={handleBlurTitle}
              autoHighlight={true}
              freeSolo
              renderInput={params => (
                <TextField
                  {...params}
                  required
                  margin='dense'
                  label='Checklist Title'
                  variant='outlined'
                  value={checklistTitle}
                  error={checklistTitleError !== ''}
                  helperText={checklistTitleError}
                />
              )}
            />
            <TextField
              variant='outlined'
              margin='dense'
              fullWidth
              id='description'
              label='Description'
              value={checklistDescription}
              multiline
              rows={3}
              onChange={event => setChecklistDescription(event.target.value)}
              autoComplete='off'
            />
          </Grid>
          <Grid item xs={12} className={classes.responsiveScale}>
            <Typography variant='subtitle1'>All Checklist Items :</Typography>
          </Grid>
          <Grid item xs={12} className={classes.checklistItem}>
            {checklistItems && checklistItems.length > 0 ? (
              checklistItems.map((item, index) => (
                <Grid container spacing={1} alignItems='center'>
                  <Grid item xs={10}>
                    <FormControlLabel
                      className={classes.checklistItem}
                      control={<Checkbox checked={item.status} name='checkedE' color='primary' onChange={() => handleChangeCheckbox(index)} />}
                      label={item.name}
                      disabled
                      classes={{ label: classes.disabledLabel }}
                    />
                    <Typography className={classes.itemRemarks}>{item.remarks ? 'Remarks : ' : item.remarks}</Typography>
                    <Typography className={classes.itemRemarks} style={{ whiteSpace: 'pre-line' }}>
                      {item.remarks ? item.remarks : item.remarks}
                    </Typography>
                  </Grid>
                  <Grid container item xs={2} direction='row'>
                    <Tooltip title='Edit checklist'>
                      <IconButton onClick={() => handleOpenEditChecklistItem(index)}>
                        <EditIcon color='primary' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete Item'>
                      <IconButton>
                        <DeleteIcon onClick={() => handleDeleteChecklistItem(index)} fontSize='small' color='error' />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              ))
            ) : (
              <Grid justify='center' alignItems='center' className={classes.noDataSummaryGrid}>
                <Typography variant='subtitle2' id='form-subtitle' color={checklistItemsError ? 'error' : 'textSecondary'}>
                  {checklistItemsError ? 'Please Insert Checklist Item' : ' No Checklist Item'}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.responsiveScale}>
          <Divider className={classes.divider} />
          <Grid container alignItems='center' justify='center'>
            <Grid item xs={11}>
              <TextField
                variant='outlined'
                margin='dense'
                required
                fullWidth
                id='itemName'
                label='Item Name'
                error={itemNameError !== ''}
                helperText={itemNameError}
                value={checklistItemName}
                onChange={event => setChecklistItemName(event.target.value)}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={1}>
              {isEditItem ? (
                <Tooltip title='Save'>
                  <IconButton>
                    <SaveIcon onClick={() => handleEditChecklistItem(selectedIndex)} color='primary' />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title='Add Item'>
                  <IconButton>
                    <AddIcon onClick={handleAddChecklistItem} color='primary' />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} className={classes.responsiveScale}>
          <TextField
            variant='outlined'
            margin='dense'
            multiline
            rows='4'
            fullWidth
            id='remarks'
            label='Item Remarks'
            value={checklistItemRemarks}
            onChange={event => setChecklistItemRemarks(event.target.value)}
            autoComplete='off'
          />
        </Grid>
        <Grid container justify='flex-end' style={{ marginTop: 16 }}>
          <DialogActions>
            <Button variant='contained' disableElevation style={{ marginTop: 8 }} onClick={handleClose}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' disableElevation style={{ marginTop: 8 }} onClick={handleSubmit}>
              Save
            </Button>
          </DialogActions>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistModal;
