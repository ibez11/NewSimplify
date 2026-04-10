import React, { FC, useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Theme,
  Tooltip,
  Typography
} from '@material-ui/core';
import Skeleton from 'react-loading-skeleton';
import NumberFormat from 'react-number-format';
import HeaderRow from 'components/HeaderRow';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import axios from 'axios';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { GET_DELETE_JOB_EXPENSES_BY_ID_URL } from 'constants/url';
import SideBarContent from 'components/SideBarContent';
import { ucWords } from 'utils';
import ExpensesForm from './components/ExpensesForm';
import { dummyJobExpenses } from 'constants/dummy';

interface Props {
  isLoading: boolean;
  job: JobDetailModel;
  setJob: React.Dispatch<React.SetStateAction<JobDetailModel>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarVarient: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: 10
  },
  cardHeader: {
    padding: theme.spacing(2)
  },
  CardContent: { padding: 0 },
  noneBorder: {
    borderStyle: 'none'
  },
  border: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  subtitle: {
    color: '#b2b2b2'
  },
  cellAlignTop: {
    verticalAlign: 'top'
  }
}));

const JobExpensesContent: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, job, setJob, handleSnackbar } = props;
  const { JobExpenses, jobId } = job;

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  let totalExpenses = 0;

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
    setSelectedId(0);
    setSelectedIndex(0);
  };

  const handleEditJobExpense = (index: number) => {
    setOpenForm(true);
    setIsEdit(true);
    setSelectedIndex(index);
  };

  const handleDeleteConfirmation = (expensesId: number, index: number) => {
    setOpenConfirmation(true);
    setSelectedIndex(index);
    setSelectedId(expensesId);
  };

  const deleteJobExpense = async (expensesId: number, index: number) => {
    setIsProcessing(true);
    try {
      await axios.delete(GET_DELETE_JOB_EXPENSES_BY_ID_URL(expensesId));
      const currentJobExpenses = JobExpenses && [...JobExpenses];
      currentJobExpenses!.splice(index, 1);
      setJob({ ...job, JobExpenses: currentJobExpenses });
      handleSnackbar('success', 'Successfully deleted job expenses');

      setIsProcessing(false);
    } catch (error) {
      console.log(error);
      handleSnackbar('error', 'Failed to deleted job expenses');
      setIsProcessing(false);
    }
  };

  const addNewJobExpense = (newExpense: JobExpensesModel) => {
    const currentJobExpenses: JobExpensesModel[] = JobExpenses ? [...JobExpenses] : [];
    currentJobExpenses.push(newExpense);
    setJob({ ...job, JobExpenses: currentJobExpenses });
  };

  const updateJobExpense = (updateExpense: JobExpensesModel) => {
    const currentJobExpenses: JobExpensesModel[] = JobExpenses ? [...JobExpenses] : [];
    currentJobExpenses[selectedIndex] = updateExpense;
    setJob({ ...job, JobExpenses: currentJobExpenses });
  };

  const renderExpenses = () => {
    const render =
      JobExpenses &&
      JobExpenses.length > 0 &&
      JobExpenses.map((value, index) => {
        totalExpenses = totalExpenses + value.totalExpenses;

        return (
          <TableRow>
            <TableCell align='left' width={'5%'} className={classes.cellAlignTop}>
              {index + 1}
            </TableCell>
            <TableCell align='left' width={'35%'} className={classes.cellAlignTop}>
              <Typography style={{ whiteSpace: 'pre-line' }}>{value.header}</Typography>
            </TableCell>
            <TableCell align='left' width={'30%'}>
              {value.JobExpensesItems && value.JobExpensesItems.length > 0 ? (
                value.JobExpensesItems.map(item => {
                  return (
                    <Typography gutterBottom style={{ whiteSpace: 'pre-line' }}>
                      {`\u2022 ${item.itemName}`}
                    </Typography>
                  );
                })
              ) : (
                <Typography variant='body1'>No Item</Typography>
              )}
            </TableCell>
            <TableCell align='right' width={'15%'}>
              {value.JobExpensesItems && value.JobExpensesItems.length > 0 ? (
                value.JobExpensesItems.map(item => {
                  return (
                    <Typography gutterBottom variant='body1' id='form-subtitle'>
                      <NumberFormat
                        value={item.price}
                        displayType={'text'}
                        thousandSeparator={true}
                        prefix={'$'}
                        decimalScale={2}
                        fixedDecimalScale={true}
                      />
                    </Typography>
                  );
                })
              ) : (
                <Typography variant='body1'>No Item</Typography>
              )}
            </TableCell>
            <TableCell align='center' width={'15%'} className={classes.cellAlignTop}>
              <Tooltip title='Edit Expense'>
                <IconButton onClick={() => handleEditJobExpense(index)}>
                  <EditIcon color='primary' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete Expense'>
                <IconButton onClick={() => handleDeleteConfirmation(value.id, index)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      });
    return render;
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card variant='outlined' className={classes.card}>
          <CardHeader
            className={classes.cardHeader}
            title={
              <Grid container direction='row' justify='space-between' alignItems='center'>
                <Typography variant='h5'>Job Expenses Items</Typography>
                <Button
                  color='primary'
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setOpenForm(true);
                    setIsEdit(false);
                  }}
                >
                  Add Job Expenses
                </Button>
              </Grid>
            }
          />
          <Divider />
          <CardContent style={{ padding: 0 }}>
            <Table component='table'>
              <TableHead>
                <HeaderRow
                  headers={[
                    { label: 'No', verticalAlign: 'top' },
                    { label: 'Title', verticalAlign: 'top' },
                    { label: 'Expenses Item', verticalAlign: 'top' },
                    { label: 'Price', verticalAlign: 'top', textAlign: 'right' },
                    { label: 'Action', verticalAlign: 'top', textAlign: 'center' }
                  ]}
                />
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <Skeleton width={100} />
                ) : JobExpenses && JobExpenses.length > 0 ? (
                  <>
                    {renderExpenses()}
                    <TableRow>
                      <TableCell colSpan={2} className={classes.noneBorder}></TableCell>
                      <TableCell className={classes.noneBorder}>
                        <Typography variant='subtitle2' id='form-subtitle' align='right'>
                          Total Amount Expenses
                        </Typography>
                      </TableCell>
                      <TableCell align='right' colSpan={1} className={classes.noneBorder}>
                        {isLoading ? (
                          <Skeleton width={100} />
                        ) : (
                          <Typography variant='subtitle2' id='form-subtitle'>
                            <NumberFormat
                              value={totalExpenses}
                              displayType={'text'}
                              thousandSeparator={true}
                              prefix={'$'}
                              decimalScale={2}
                              fixedDecimalScale={true}
                            />
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell align='center' colSpan={5} className={classes.noneBorder}>
                      <Typography variant='body1' color='textSecondary'>
                        No Job Expenses
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
      <SideBarContent
        title={ucWords(isEdit ? 'edit expenses' : 'add expenses')}
        open={openForm}
        onClickDrawer={() => setOpenForm(false)}
        width={'50%'}
      >
        <ExpensesForm
          jobId={jobId}
          isEdit={isEdit}
          jobExpense={isEdit && JobExpenses ? JobExpenses[selectedIndex] : dummyJobExpenses}
          addNewJobExpense={addNewJobExpense}
          updateJobExpense={updateJobExpense}
          handleCancel={() => setOpenForm(false)}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
      {openConfirmation && (
        <StandardConfirmationDialog
          variant={'warning'}
          message={'Are you sure you want to delete this job expenses?'}
          open={openConfirmation}
          handleClose={handleCloseConfirmation}
          onConfirm={() => deleteJobExpense(selectedId, selectedIndex)}
          isLoading={isProcessing}
        />
      )}
    </Grid>
  );
};

export default JobExpensesContent;
