import React, { FC, useState } from 'react';
import {
  Typography,
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Theme,
  Tooltip,
  IconButton,
  Grid,
  Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';
import { ServiceBody } from 'typings/body/ServiceBody';
import HeaderRow from 'components/HeaderRow';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ChecklistModal from './components/ChecklistModal';
import { dummyChecklist } from 'constants/dummy';

interface Props {
  checklistMaster: ChecklistTemplateModel[];
  service: ServiceBody;
  setService: React.Dispatch<React.SetStateAction<ServiceBody>>;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: 'auto',
    width: '100%'
  },
  cellAlignTop: {
    verticalAlign: 'top'
  },
  button: {
    marginTop: theme.spacing(2)
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
  noneBorder: {
    borderStyle: 'none'
  }
}));

const ChecklistForm: FC<Props> = props => {
  const classes = useStyles();
  const { checklistMaster, service, setService } = props;

  const { Checklists } = service;

  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleSubmitModal = (checklist: JobChecklistModel) => {
    const currentChecklist: JobChecklistModel[] = Checklists ? Checklists : [];
    if (isEdit) {
      currentChecklist[selectedIndex] = {
        id: checklist.id,
        name: checklist.name,
        description: checklist.description,
        remarks: checklist.remarks,
        ChecklistItems: checklist.ChecklistItems
      };
    } else {
      currentChecklist.push({
        id: checklist.id,
        name: checklist.name,
        description: checklist.description,
        remarks: '',
        ChecklistItems: checklist.ChecklistItems
      });
    }
    setService({ ...service, Checklists: currentChecklist });
  };

  const handleDeleteChecklist = (index: number) => {
    const currentChecklist: JobChecklistModel[] = Checklists ? Checklists : [];
    currentChecklist.splice(index, 1);
    setService({ ...service, Checklists: currentChecklist });
  };

  const handleEditJobChecklist = (index: number) => {
    setOpenAddModal(true);
    setIsEdit(true);
    setSelectedIndex(index);
  };

  const renderChecklist = () => {
    if (Checklists) {
      const render = Checklists.map((value, index) => {
        return (
          <TableRow key={value.id}>
            <TableCell width={'5%'} className={classes.cellAlignTop}>
              <Typography variant='body1'>{index + 1}</Typography>
            </TableCell>
            <TableCell width={'15%'} className={classes.cellAlignTop}>
              <Typography variant='body1'>{value.name}</Typography>
              <Typography variant='body1' color='textSecondary'>
                {value.description}
              </Typography>
            </TableCell>
            <TableCell width={'25%'} className={classes.cellAlignTop}>
              {value.ChecklistItems && value.ChecklistItems.length > 0 ? (
                value.ChecklistItems.map(item => {
                  return (
                    <div key={`${item.id}-${item.name}`}>
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
            <TableCell align='center' width={'15%'} className={classes.cellAlignTop}>
              <Tooltip title='Edit Checklist'>
                <IconButton onClick={() => handleEditJobChecklist(index)}>
                  <EditIcon color='primary' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Delete Checklist'>
                <IconButton onClick={() => handleDeleteChecklist(index)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        );
      });

      return render;
    }
  };

  return (
    <Card variant='outlined' className={classes.card}>
      <CardHeader title={<Typography variant='subtitle2'>Job Checklist</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
      <CardContent>
        <Card variant='outlined' className={classes.card}>
          <CardContent style={{ padding: 0 }}>
            <Table component='table'>
              <TableHead>
                <HeaderRow
                  headers={[
                    { label: 'No', verticalAlign: 'top' },
                    { label: 'Title & Description', verticalAlign: 'top' },
                    { label: 'Item', verticalAlign: 'top' },
                    { label: 'Action', verticalAlign: 'top', textAlign: 'center' }
                  ]}
                />
              </TableHead>
              <TableBody>
                {Checklists && Checklists.length > 0 ? (
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
        <Grid container justify='flex-end'>
          <Button
            color='primary'
            className={classes.button}
            onClick={() => {
              setOpenAddModal(true);
              setIsEdit(false);
            }}
          >
            <AddIcon />
            Add Job Checklist
          </Button>
        </Grid>
      </CardContent>
      {openAddModal && (
        <ChecklistModal
          open={openAddModal}
          checklistMaster={checklistMaster}
          checklist={isEdit ? Checklists![selectedIndex] : dummyChecklist}
          isEdit={isEdit}
          handleSubmitModal={handleSubmitModal}
          handleClose={() => setOpenAddModal(false)}
        />
      )}
    </Card>
  );
};

export default ChecklistForm;
