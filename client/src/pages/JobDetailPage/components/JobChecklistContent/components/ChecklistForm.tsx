import { FC, useState, useEffect, useContext } from 'react';
import {
  Divider,
  Tooltip,
  Grid,
  IconButton,
  TextField,
  Typography,
  Theme,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import axios, { CancelTokenSource } from 'axios';
import { CHECKLIST_JOB_BASE_URL, CHECKLIST_TEMPLATE_BASE_URL, GET_EDIT_CHECKLIST_JOB_BASE_URL } from 'constants/url';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';

interface Props {
  jobId: number;
  isEdit: boolean;
  checklist: JobChecklistModel;
  addNewChecklist(checklist: JobChecklistModel): void;
  updateChecklist(checklist: JobChecklistModel): void;
  handleCancel(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  contentGrid: {
    padding: theme.spacing(2),
    maxHeight: 580,
    overflow: 'auto'
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
  }
}));

const ChecklistForm: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { jobId, isEdit, checklist, addNewChecklist, updateChecklist, handleCancel, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [checklistMaster, setChecklistMaster] = useState<ChecklistTemplateModel[]>([]);
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
    const getChecklistTemplates = async () => {
      const { data } = await axios.get(CHECKLIST_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });
      setChecklistMaster(data.checklistTemplates);
    };

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

    getChecklistTemplates();
    return () => {
      cancelTokenSource.cancel();
    };
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

  const handleChangeDescription = (value: string) => {
    setChecklistDescription(value);
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
    setIsLoading(true);

    if (!checklistTitle || !checklistTitle.trim()) {
      setChecklistTitleError('Please enter checklist title');
      setIsLoading(false);
      return;
    }

    if (checklistItems && checklistItems.length <= 0) {
      setChecklistItemsError('Please Insert Expense Item');
      setIsLoading(false);
      return;
    }

    try {
      if (isEdit) {
        const { id } = checklist;
        const { data } = await axios.put(
          `${GET_EDIT_CHECKLIST_JOB_BASE_URL(id)}`,
          { name: checklistTitle, description: checklistDescription, ChecklistItems: checklistItems, checklistJobId: id },
          { cancelToken: cancelTokenSource.token }
        );

        updateChecklist(data);
        handleSnackbar('success', 'Successfully edit job checklist');
        setIsLoading(false);
        handleCancel();
      } else {
        const { data } = await axios.post(
          `${CHECKLIST_JOB_BASE_URL}`,
          { name: checklistTitle, description: checklistDescription, ChecklistItems: checklistItems, jobId },
          { cancelToken: cancelTokenSource.token }
        );
        addNewChecklist(data);
        handleSnackbar('success', 'Successfully add job checklist');
        setIsLoading(false);
        handleCancel();
      }
      CreateLogEvent('job_checklist', currentUser!);
    } catch (error) {
      console.log(error);
      handleSnackbar('error', isEdit ? 'Failed to update checklist' : 'Failed to add checklist');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={12} className={classes.responsiveScale}>
          <Autocomplete
            id='combo-box-demo'
            options={checklistMaster}
            getOptionLabel={option => option.name}
            inputValue={checklistTitle}
            onInputChange={(_, value) => handleFreeTextChecklistTitle(value ? value : '')}
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
            onChange={event => handleChangeDescription(event.target.value)}
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
                    <IconButton onClick={() => handleDeleteChecklistItem(index)}>
                      <DeleteIcon color='error' />
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
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} style={{ marginTop: 8 }} onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant='contained' color='primary' disableElevation disabled={isLoading} style={{ marginTop: 8 }} onClick={handleSubmit}>
          Save
          <LoadingButtonIndicator isLoading={isLoading} />
        </Button>
      </DialogActions>
    </>
  );
};

export default ChecklistForm;
