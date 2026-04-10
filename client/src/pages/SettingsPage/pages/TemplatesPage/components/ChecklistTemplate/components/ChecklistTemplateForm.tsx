import { FC, useEffect, useState } from 'react';
import { Checkbox, Grid, IconButton, TextField, Button, Theme, Typography, FormControlLabel, DialogActions, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import axios, { CancelTokenSource } from 'axios';
import { dummyChecklistTemplate } from 'constants/dummy';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import { CHECKLIST_TEMPLATE_BASE_URL, GET_EDIT_CHECKLIST_TEMPLATE_URL } from 'constants/url';

interface Props {
  checklistTemplate: ChecklistTemplateModel;
  isEdit: boolean;
  handleClose(): void;
  addNewChecklistTemplate(checklist: ChecklistTemplateModel): void;
  updateIndividualChecklistTemplate: (updatedChecklistTemplateProperties: Partial<ChecklistTemplateModel>) => void;
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
  checkboxList: {
    width: '100%'
  },
  subtaskItem: {
    maxHeight: 300,
    width: '100%',
    marginTop: theme.spacing(1),
    flexGrow: 1,
    overflow: 'auto',
    flexBasis: '100%'
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
  }
}));

const ChecklistTemplateForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { checklistTemplate, isEdit, handleClose, addNewChecklistTemplate, updateIndividualChecklistTemplate, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<ChecklistTemplateModel>(dummyChecklistTemplate);
  const [checklistItem, setChecklistItem] = useState<string>('');

  const [checklistTitleError, setChecklistTitleError] = useState<string>('');
  const [itemNameError, setItemNameError] = useState<string>('');
  const [checklistItemsError, setChecklistItemsError] = useState<string>('');

  useEffect(() => {
    if (!checklistTemplate) {
      return;
    }
    const { ChecklistItems } = checklistTemplate;

    setChecklist({
      ...checklistTemplate,
      ChecklistItems: ChecklistItems.map(value => {
        return { ...value };
      })
    });
  }, [checklistTemplate]);

  const handleAddChecklistItem = () => {
    if (checklistItem) {
      const currentChecklistItems = [...checklist.ChecklistItems];
      currentChecklistItems.push({ id: 0, name: checklistItem, status: false });
      setChecklist({ ...checklist, ChecklistItems: currentChecklistItems });
      setItemNameError('');
      setChecklistItem('');
    } else {
      setItemNameError('Please insert item name');
    }
  };

  const handleDeleteChecklistItem = (itemIndex: number) => {
    const currentChecklistItems = [...checklist.ChecklistItems];
    currentChecklistItems.splice(itemIndex, 1);
    setChecklist({ ...checklist, ChecklistItems: currentChecklistItems });
  };

  const validateForm = () => {
    let ret = true;

    if (!checklist.name && !checklist.name.trim()) {
      setChecklistTitleError('Please enter a title');
      ret = false;
    }

    if (checklist.ChecklistItems.length <= 0) {
      setChecklistItemsError('Please Insert Expense Item');
      ret = false;
    }

    return ret;
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
          `${GET_EDIT_CHECKLIST_TEMPLATE_URL(checklist.id)}`,
          {
            ...checklist,
            checklistItems: checklist.ChecklistItems
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualChecklistTemplate(response.data);
        message = 'Successfully edit checklist template';
      } else {
        const response = await axios.post(
          `${CHECKLIST_TEMPLATE_BASE_URL}`,
          {
            ...checklist,
            checklistItems: checklist.ChecklistItems
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewChecklistTemplate(response.data);
        message = 'Successfully add checklist template';
      }
      handleSnackbar('success', message);
      handleClose();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', isEdit ? 'Failed to edit checklist template' : 'Failed to add checklist template');
    }

    setIsLoading(false);
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={12}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='name'
            label='Name'
            error={checklistTitleError !== ''}
            helperText={checklistTitleError}
            value={checklist.name}
            onChange={event => setChecklist({ ...checklist, name: event.target.value })}
            onBlur={event => {
              if (!event.target.value) {
                setChecklistTitleError('Please enter a title');
              } else {
                setChecklistTitleError('');
              }
            }}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            variant='outlined'
            margin='dense'
            fullWidth
            id='description'
            label='Description'
            value={checklist.description}
            onChange={event => setChecklist({ ...checklist, description: event.target.value })}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12}>
          <Typography>Checklist Items :</Typography>
        </Grid>
        <Grid item xs={12} className={classes.subtaskItem}>
          {checklist.ChecklistItems.length > 0 ? (
            checklist.ChecklistItems.map((item, index) => (
              <Grid container spacing={1} alignItems='center'>
                <Grid item xs={11}>
                  <FormControlLabel
                    className={classes.checklistItem}
                    control={<Checkbox checked name='checkedE' disabled color='primary' />}
                    label={item.name}
                  />
                </Grid>
                <Grid item xs={1}>
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
            value={checklistItem}
            onChange={event => setChecklistItem(event.target.value)}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={1}>
          <Tooltip title='Add Item'>
            <IconButton>
              <AddIcon onClick={handleAddChecklistItem} color='primary' />
            </IconButton>
          </Tooltip>
        </Grid>
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

export default ChecklistTemplateForm;
