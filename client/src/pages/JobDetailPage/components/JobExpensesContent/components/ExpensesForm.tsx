import { FC, useState, useEffect, useContext } from 'react';
import { Divider, Tooltip, Grid, IconButton, TextField, Typography, Theme, DialogActions, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import NumberFormatCustom from 'components/NumberFormatCustom';
import { dummyJobExpensesItem } from 'constants/dummy';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import axios, { CancelTokenSource } from 'axios';
import { GET_EDIT_JOB_EXPENSES_URL, JOB_EXPENSES_BASE_URL } from 'constants/url';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { CreateLogEvent } from 'utils/Firebase';

interface Props {
  jobId: number;
  isEdit: boolean;
  jobExpense: JobExpensesModel;
  addNewJobExpense(jobExpense: JobExpensesModel): void;
  updateJobExpense(jobExpense: JobExpensesModel): void;
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
  expenseItem: {
    width: '100%',
    flexGrow: 1,
    overflow: 'auto',
    flexBasis: '100%'
  },
  noDataSummaryGrid: {
    display: 'flex',
    height: 100
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

const ExpensesForm: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser } = useContext(CurrentUserContext);
  const { jobId, isEdit, jobExpense, addNewJobExpense, updateJobExpense, handleCancel, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expenseTitle, setExpenseTitle] = useState<string>('');
  const [expensesItems, setExpensesItems] = useState<JobExpensesItemsModel[]>([]);
  const [itemName, setItemName] = useState<string>('');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [expenseTitleError, setExpenseTitleError] = useState<string>('');
  const [expensesItemsError, setExpensesItemsError] = useState<string>('');

  useEffect(() => {
    if (isEdit) {
      const { header, JobExpensesItems } = jobExpense;
      const totalPrice = JobExpensesItems.reduce((sum, value) => sum + value.price, 0);

      setExpenseTitle(header);
      setExpensesItems(
        JobExpensesItems.map(value => {
          return { ...value };
        })
      );
      setTotalPrice(totalPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const handleChangeExpenseTitle = (value: string) => {
    setExpenseTitle(value);
    setExpenseTitleError('');
  };

  const handleChangeItemName = (value: string, index: number) => {
    const currentExpenseItems = [...expensesItems];
    currentExpenseItems[index].itemName = value;
    setExpensesItems(currentExpenseItems);
    setExpensesItemsError('');
  };

  const handleChangeItemPrice = (value: number, index: number) => {
    const currentExpenseItems = [...expensesItems];
    currentExpenseItems[index].price = value;
    const totalPrice = currentExpenseItems.reduce((sum, value) => sum + value.price, 0);
    setTotalPrice(totalPrice);
    setExpensesItems(currentExpenseItems);
  };

  const handleAddItem = () => {
    if (itemName) {
      const currentExpenseItems = [...expensesItems];
      currentExpenseItems.push({ ...dummyJobExpensesItem, itemName: itemName, price: itemPrice });
      setTotalPrice(totalPrice + itemPrice);
      setExpensesItems(currentExpenseItems);
      setItemName('');
      setItemPrice(0);
    } else {
      setExpensesItemsError('Please enter item name');
    }
  };

  const handleDeleteItem = (index: number) => {
    const currentExpenseItems = [...expensesItems];
    const deletedItem = currentExpenseItems.splice(index, 1);
    setTotalPrice(totalPrice - deletedItem[0].price);
    setExpensesItems(currentExpenseItems);
    // setExpense({ ...expense, JobExpensesItems: currentExpenseItems });
  };

  const handleExpenseTitleBlur = () => {
    if (!expenseTitle || !expenseTitle.trim()) {
      setExpenseTitleError('Please enter expense title');
    } else {
      setExpenseTitleError('');
      // setExpense({ ...expense, header: expenseTitle });
    }
  };

  const handleItemNameBlur = () => {
    if (!itemName || !itemName.trim()) {
      setExpensesItemsError('Please enter item name');
    } else {
      setExpensesItemsError('');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const { id } = jobExpense;

    if (!expenseTitle) {
      setIsLoading(false);
      setExpenseTitleError('Please enter expense title');
      return;
    }

    if (expensesItems && expensesItems.length < 1) {
      setIsLoading(false);
      setExpensesItemsError('');
      return;
    }

    try {
      if (isEdit) {
        const { data } = await axios.put(
          GET_EDIT_JOB_EXPENSES_URL(id),
          { jobId, header: expenseTitle, expensesItems },
          { cancelToken: cancelTokenSource.token }
        );
        updateJobExpense(data);
        setIsLoading(false);
        handleSnackbar('success', 'Successfully edit job expense');
        handleCancel();
      } else {
        const { data } = await axios.post(
          JOB_EXPENSES_BASE_URL,
          { jobId, header: expenseTitle, expensesItems },
          { cancelToken: cancelTokenSource.token }
        );

        addNewJobExpense(data);
        setIsLoading(false);
        handleSnackbar('success', 'Successfully add job expense');
        handleCancel();
      }
      CreateLogEvent('job_expenses', currentUser!);
    } catch (error) {
      console.log(error);
      handleSnackbar('error', isEdit ? 'Failed to update expenses' : 'Failed to add expenses');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={12} className={classes.responsiveScale}>
          <TextField
            variant='outlined'
            margin='dense'
            fullWidth
            required
            id='description'
            label='Title'
            value={expenseTitle}
            error={expenseTitleError !== ''}
            helperText={expenseTitleError}
            onChange={event => handleChangeExpenseTitle(event.target.value)}
            onBlur={handleExpenseTitleBlur}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12} className={classes.responsiveScale}>
          <Typography variant='subtitle1'>All Expenses Items :</Typography>
        </Grid>
        <Grid item xs={12} className={classes.expenseItem}>
          {expensesItems && expensesItems.length > 0 ? (
            expensesItems.map((value, index) => {
              return (
                <Grid key={`${value}-${index}`} container spacing={1} alignItems='center'>
                  <Grid item sm={8}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id={`itemName${index}`}
                      label={`Item ${index + 1}`}
                      value={value.itemName}
                      onChange={event => handleChangeItemName(event.target.value, index)}
                      autoComplete='off'
                    />
                  </Grid>
                  <Grid item sm={3}>
                    <TextField
                      variant='outlined'
                      margin='dense'
                      fullWidth
                      id={`itemPrice${index}`}
                      label='Price'
                      value={value.price}
                      onChange={event => handleChangeItemPrice(+event.target.value, index)}
                      autoComplete='off'
                      InputProps={{
                        inputComponent: NumberFormatCustom as any,
                        inputProps: {
                          prefix: '$',
                          thousandSeparator: true,
                          decimalScale: 2,
                          fixedDecimalScale: true
                        }
                      }}
                    />
                  </Grid>
                  <Grid item sm={1} alignItems='center'>
                    <Tooltip title='Delete Item' placement='right'>
                      <IconButton aria-label='delete' onClick={() => handleDeleteItem(index)}>
                        <DeleteIcon color='error' />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              );
            })
          ) : (
            <Grid justify='center' alignItems='center' className={classes.noDataSummaryGrid}>
              <Typography variant='subtitle2' id='form-subtitle' color={expensesItemsError ? 'error' : 'textSecondary'}>
                {expensesItemsError ? 'Please Insert Expense Item' : ' No Expense Items'}
              </Typography>
            </Grid>
          )}
        </Grid>
        {expensesItems && expensesItems.length > 0 && (
          <>
            <Grid item container justify='flex-end' alignItems='center' sm={8}>
              <Typography variant='subtitle2'>Total Expenses</Typography>
            </Grid>
            <Grid item justify='flex-end' sm={3}>
              <TextField
                variant='outlined'
                margin='dense'
                fullWidth
                id='totalPrice'
                value={totalPrice}
                disabled
                InputProps={{
                  inputComponent: NumberFormatCustom as any,
                  inputProps: {
                    prefix: '$',
                    thousandSeparator: true,
                    decimalScale: 2,
                    fixedDecimalScale: true
                  }
                }}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12} spacing={1} className={classes.expenseItem}>
          <Divider className={classes.divider} />
          <Grid container spacing={1} alignItems='center'>
            <Grid item sm={8}>
              <TextField
                variant='outlined'
                margin='dense'
                fullWidth
                id='itemName'
                label='Item Name'
                value={itemName}
                error={expensesItemsError !== ''}
                helperText={expensesItemsError}
                onChange={event => setItemName(event.target.value)}
                onBlur={handleItemNameBlur}
                autoComplete='off'
              />
            </Grid>
            <Grid item sm={3}>
              <TextField
                variant='outlined'
                margin='dense'
                fullWidth
                id='itemPrice'
                label='Price'
                value={itemPrice}
                onChange={event => setItemPrice(+event.target.value)}
                autoComplete='off'
                InputProps={{
                  inputComponent: NumberFormatCustom as any,
                  inputProps: {
                    prefix: '$',
                    thousandSeparator: true,
                    decimalScale: 2,
                    fixedDecimalScale: true
                  }
                }}
              />
            </Grid>
            <Grid item sm={1} alignItems='center'>
              <Tooltip title='Add Item' placement='right'>
                <IconButton color='primary' aria-label='Add' onClick={handleAddItem}>
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
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

export default ExpensesForm;
