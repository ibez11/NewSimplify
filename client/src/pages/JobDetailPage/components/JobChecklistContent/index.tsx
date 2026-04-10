import React, { FC, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
  makeStyles
} from '@material-ui/core';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SideBarContent from 'components/SideBarContent';
import { ucWords } from 'utils/index';
import HeaderRow from 'components/HeaderRow';
import Skeleton from 'react-loading-skeleton';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { GET_DELETE_CHECKLIST_JOB_BASE_URL } from 'constants/url';
import axios from 'axios';
import ChecklistForm from './components/ChecklistForm';
import { dummyChecklist } from 'constants/dummy';

interface Props {
  isLoading: boolean;
  isEditable: boolean;
  jobId: number;
  checklist: JobChecklistModel[];
  setChecklist: React.Dispatch<React.SetStateAction<JobChecklistModel[]>>;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: 10
  },
  cardHeader: {
    padding: theme.spacing(2)
  },
  noneBorder: {
    borderStyle: 'none'
  },
  border: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  itemRemarks: {
    paddingLeft: theme.spacing(4),
    fontSize: '12px'
  },
  disabledLabel: {
    '&.MuiFormControlLabel-label.Mui-disabled': {
      color: '#000000'
    }
  },
  cellAlignTop: {
    verticalAlign: 'top'
  }
}));

const JobChecklistContent: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, isEditable, jobId, checklist, setChecklist, handleSnackbar } = props;

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const addNewChecklist = (newChecklist: JobChecklistModel) => {
    const currentChecklist: JobChecklistModel[] = checklist ? checklist : [];
    currentChecklist.push({
      id: newChecklist.id,
      name: newChecklist.name,
      description: newChecklist.description,
      remarks: '',
      ChecklistItems: newChecklist.ChecklistItems
    });
    setChecklist(currentChecklist);
  };

  const updateChecklist = (updateChecklist: JobChecklistModel) => {
    const currentChecklist: JobChecklistModel[] = checklist;
    currentChecklist[selectedIndex] = {
      id: updateChecklist.id,
      name: updateChecklist.name,
      description: updateChecklist.description,
      remarks: updateChecklist.remarks,
      ChecklistItems: updateChecklist.ChecklistItems
    };
    setChecklist(currentChecklist);
  };

  const deleteChecklist = (subtaskIndex: number) => {
    const currentChecklist: JobChecklistModel[] = checklist;
    currentChecklist.splice(subtaskIndex, 1);
    setChecklist(currentChecklist);
  };

  const handleEditJobChecklist = (index: number) => {
    setOpenForm(true);
    setIsEdit(true);
    setSelectedIndex(index);
  };

  const handleCloseConfirmation = () => {
    setOpenConfirmation(false);
    setSelectedId(0);
    setSelectedIndex(0);
  };

  const handleDeleteConfirmation = (subtaskId: number, index: number) => {
    setSelectedId(subtaskId);
    setSelectedIndex(index);
    setOpenConfirmation(true);
  };

  const handleDeleteChecklist = async () => {
    setIsProcessing(true);
    try {
      await axios.delete(`${GET_DELETE_CHECKLIST_JOB_BASE_URL(selectedId)}`);
      deleteChecklist(selectedIndex);
      handleSnackbar('success', 'Successfully deleted job checklist');
    } catch (err) {
      console.log(err);
      handleSnackbar('error', 'Failed to delete job checklist');
    }
    setIsProcessing(false);
  };

  const renderChecklist = () => {
    const render = checklist.map((value, index) => {
      return (
        <TableRow key={value.id}>
          <TableCell width={'5%'} className={classes.cellAlignTop}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{index + 1}</Typography>}
          </TableCell>
          <TableCell width={'15%'} className={classes.cellAlignTop}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <>
                <Typography variant='body1'>{value.name}</Typography>
                <Typography variant='body1' color='textSecondary'>
                  {value.description}
                </Typography>
              </>
            )}
          </TableCell>
          <TableCell width={'25%'} className={classes.cellAlignTop}>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : value.ChecklistItems && value.ChecklistItems.length > 0 ? (
              value.ChecklistItems.map(item => {
                return (
                  <div>
                    <FormControlLabel
                      control={<Checkbox checked={item.status!} name='checkedE' disabled />}
                      label={item.name}
                      style={{ width: '100%' }}
                      classes={{ label: classes.disabledLabel }}
                    />
                    <Typography color='textSecondary' className={classes.itemRemarks}>
                      {item.remarks ? 'Remarks : ' : item.remarks}
                    </Typography>
                    <Typography color='textSecondary' className={classes.itemRemarks} style={{ whiteSpace: 'pre-line' }}>
                      {item.remarks ? item.remarks : item.remarks}
                    </Typography>
                  </div>
                );
              })
            ) : (
              <Typography variant='body1'>No Item</Typography>
            )}
          </TableCell>
          <TableCell width={'5%'} className={classes.cellAlignTop}>
            {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body1'>{value.remarks || '-'}</Typography>}
          </TableCell>
          <TableCell align='center' width={'15%'} className={classes.cellAlignTop}>
            <Tooltip title='Edit Checklist'>
              <IconButton onClick={() => handleEditJobChecklist(index)}>
                <EditIcon color='primary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete Checklist'>
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
                <Typography variant='h5'>Job Checklist</Typography>
                <Tooltip title={!isEditable ? 'Cannot edit because quotation is cancelled' : ''}>
                  <span style={{ cursor: !isEditable ? 'not-allowed' : 'default' }}>
                    <Button
                      color='primary'
                      disabled={isLoading || !isEditable}
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setOpenForm(true);
                        setIsEdit(false);
                      }}
                    >
                      Add Job Checklist
                    </Button>
                  </span>
                </Tooltip>
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
                    { label: 'Title & Description', verticalAlign: 'top' },
                    { label: 'Items', verticalAlign: 'top' },
                    { label: 'Remarks', verticalAlign: 'top' },
                    { label: 'Action', verticalAlign: 'top', textAlign: 'center' }
                  ]}
                />
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <Skeleton width={100} />
                ) : checklist && checklist.length > 0 ? (
                  renderChecklist()
                ) : (
                  <TableRow>
                    <TableCell align='center' colSpan={5} className={classes.noneBorder}>
                      <Typography variant='body1' id='form-subtitle' color='textSecondary'>
                        No Job Checklist
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <SideBarContent
          title={ucWords(isEdit ? 'edit checklist' : 'add checklist')}
          open={openForm}
          onClickDrawer={() => setOpenForm(false)}
          width={'50%'}
        >
          <ChecklistForm
            jobId={jobId}
            isEdit={isEdit}
            checklist={isEdit && checklist ? checklist[selectedIndex] : dummyChecklist}
            addNewChecklist={addNewChecklist}
            updateChecklist={updateChecklist}
            handleCancel={() => setOpenForm(false)}
            handleSnackbar={handleSnackbar}
          />
        </SideBarContent>
        {openConfirmation && (
          <StandardConfirmationDialog
            variant={'warning'}
            message={'Are you sure you want to delete this job checklist?'}
            open={openConfirmation}
            handleClose={handleCloseConfirmation}
            onConfirm={handleDeleteChecklist}
            isLoading={isProcessing}
          />
        )}
      </Grid>
    </Grid>
  );
};

export default JobChecklistContent;
