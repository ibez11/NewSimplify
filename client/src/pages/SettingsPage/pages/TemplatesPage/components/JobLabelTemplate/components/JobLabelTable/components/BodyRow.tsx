import React, { FC, useState } from 'react';
import { Chip, IconButton, makeStyles, TableRow, Theme, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import NewIcon from '@material-ui/icons/FiberNewOutlined';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Skeleton from 'react-loading-skeleton';

import BodyCell from 'components/BodyCell';
import axios from 'axios';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { GET_DELETE_JOB_LABEL_TEMPLATE_URL } from 'constants/url';

interface Props {
  isLoadingData: boolean;
  jobLabelTemplate: JobLabelTemplateModel;
  index: number;
  onEditJobLabelTemplate: React.MouseEventHandler;
  deleteIndividualJobLabelTemplate: (jobLabelTemplateIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    height: 64
  },
  newIcon: {
    color: green[500],
    fontSize: 30
  },
  tableCellInner: {
    display: 'flex',
    alignItems: 'center'
  },
  nameTextCell: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing(2)
  },
  textCenter: {
    textAlign: 'center'
  },
  chip: {
    marginLeft: theme.spacing(1)
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoadingData, jobLabelTemplate, onEditJobLabelTemplate, deleteIndividualJobLabelTemplate, index, handleSnackbar } = props;
  const { id, name, description, color, new: isNew } = jobLabelTemplate;

  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const actionWrapper = async (action: () => Promise<void>, actionStatus: string) => {
    setProcessing(true);

    try {
      await action();
      handleSnackbar('success', `Successfully ${actionStatus} job label template`);
    } catch (err) {
      handleSnackbar('error', `Failed to ${actionStatus} a job label template`);
    }

    setProcessing(false);
  };

  const deleteSkill: React.MouseEventHandler<HTMLButtonElement> = async event => {
    await actionWrapper(async () => {
      await axios.delete(GET_DELETE_JOB_LABEL_TEMPLATE_URL(id));
    }, 'deleted');
    deleteIndividualJobLabelTemplate(index);
  };

  return (
    <>
      <TableRow className={classes.tableRow}>
        <BodyCell cellWidth='30%' isComponent={true}>
          <div className={classes.tableCellInner}>
            <div className={classes.nameTextCell}>
              {isLoadingData ? (
                <Skeleton width={150} />
              ) : (
                <Chip label={name} color='primary' style={{ color: color, backgroundColor: `${color}40` }} className={classes.chip} />
              )}
            </div>
            {isNew && (
              <div>
                <NewIcon className={classes.newIcon} />
              </div>
            )}
          </div>
        </BodyCell>
        <BodyCell cellWidth='40%' isComponent={true}>
          <div className={classes.tableCellInner}>
            <div className={classes.nameTextCell}>
              <Typography variant='body1'>{isLoadingData ? <Skeleton width={150} /> : description}</Typography>
            </div>
          </div>
        </BodyCell>
        <BodyCell cellWidth='20%' pL='110px' isComponent={true} colSpan={2}>
          {isLoadingData ? (
            <Skeleton width={150} />
          ) : (
            <>
              <Tooltip title={'Edit'} placement='top'>
                <IconButton size='small' onClick={onEditJobLabelTemplate} disabled={isProcessing} color='primary'>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Delete'} placement='top'>
                <IconButton size='small' onClick={() => setOpenDialog(true)} disabled={isProcessing}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </>
          )}
        </BodyCell>
      </TableRow>
      <StandardConfirmationDialog
        variant={'warning'}
        message={'Are you sure you want to delete this?'}
        open={openDialog}
        handleClose={handleCloseDialog}
        onConfirm={deleteSkill}
      />
    </>
  );
};

export default BodyRow;
