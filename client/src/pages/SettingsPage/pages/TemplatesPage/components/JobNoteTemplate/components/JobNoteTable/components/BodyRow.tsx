import React, { FC, useState } from 'react';
import { IconButton, makeStyles, TableRow, Theme, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import NewIcon from '@material-ui/icons/FiberNewOutlined';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Skeleton from 'react-loading-skeleton';

import BodyCell from 'components/BodyCell';
import axios from 'axios';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { GET_DELETE_JOB_NOTE_TEMPLATE_URL } from 'constants/url';

interface Props {
  isLoadingData: boolean;
  jobNoteTemplate: JobNoteTemplateModel;
  index: number;
  onEditJobNoteTemplate: React.MouseEventHandler;
  deleteIndividualJobNoteTemplate: (jobNoteTemplateIndex: number) => void;
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
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoadingData, jobNoteTemplate, onEditJobNoteTemplate, deleteIndividualJobNoteTemplate, index, handleSnackbar } = props;
  const { id, notes, new: isNew } = jobNoteTemplate;

  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const actionWrapper = async (action: () => Promise<void>, actionStatus: string) => {
    setProcessing(true);

    try {
      await action();
      handleSnackbar('success', `Successfully ${actionStatus} a job note template`);
    } catch (err) {
      handleSnackbar('error', `Failed to ${actionStatus} a job note template`);
    }

    setProcessing(false);
  };

  const deleteSkill: React.MouseEventHandler<HTMLButtonElement> = async event => {
    await actionWrapper(async () => {
      await axios.delete(GET_DELETE_JOB_NOTE_TEMPLATE_URL(id));
    }, 'deleted');
    deleteIndividualJobNoteTemplate(index);
  };

  return (
    <>
      <TableRow className={classes.tableRow}>
        <BodyCell cellWidth='80%' isComponent={true}>
          <div className={classes.tableCellInner}>
            <div className={classes.nameTextCell}>
              <Typography variant='body1' style={{ whiteSpace: 'pre-line' }}>
                {isLoadingData ? <Skeleton width={150} /> : notes}
              </Typography>
            </div>
            {isNew && (
              <div>
                <NewIcon className={classes.newIcon} />
              </div>
            )}
          </div>
        </BodyCell>
        <BodyCell cellWidth='20%' pL='110px' isComponent={true}>
          {isLoadingData ? (
            <Skeleton width={150} />
          ) : (
            <>
              <Tooltip title={'Edit'} placement='top'>
                <IconButton size='small' onClick={onEditJobNoteTemplate} disabled={isProcessing} color='primary'>
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
