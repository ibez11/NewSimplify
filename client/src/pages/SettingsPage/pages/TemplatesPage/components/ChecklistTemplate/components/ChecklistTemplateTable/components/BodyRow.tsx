import React, { FC, useState, Fragment } from 'react';

import { Checkbox, FormControlLabel, IconButton, makeStyles, TableRow, Theme, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import NewIcon from '@material-ui/icons/FiberNewOutlined';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Skeleton from 'react-loading-skeleton';

import axios from 'axios';
import { GET_DELETE_CHECKLIST_TEMPLATE_URL } from 'constants/url';
import BodyCell from 'components/BodyCell';
import { StandardConfirmationDialog } from 'components/AppDialog';

interface Props {
  isLoadingData: boolean;
  checklistTemplate: ChecklistTemplateModel;
  index: number;
  deleteIndividualChecklistTemplate: (checklistTemplateIndex: number) => void;
  onEditChecklistTemplate: React.MouseEventHandler;
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
  checkboxList: {
    width: '100%'
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoadingData, checklistTemplate, index, deleteIndividualChecklistTemplate, onEditChecklistTemplate, handleSnackbar } = props;

  const { id, name, description, ChecklistItems, new: isNew } = checklistTemplate;

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const actionWrapper = async (action: () => Promise<void>) => {
    setProcessing(true);

    try {
      await action();
      handleSnackbar('success', 'Successfully delete checklist template');
    } catch (err) {
      handleSnackbar('error', 'Failed to delete checklist template');
    }

    setProcessing(false);
  };

  const deleteChecklistItemModelTemplate: React.MouseEventHandler<HTMLButtonElement> = async event => {
    await actionWrapper(async () => {
      await axios.delete(GET_DELETE_CHECKLIST_TEMPLATE_URL(id));
    });
    deleteIndividualChecklistTemplate(index);
  };

  return (
    <Fragment>
      <TableRow className={classes.tableRow}>
        <BodyCell cellWidth='20%' isComponent={true}>
          <div className={classes.tableCellInner}>
            <div className={classes.nameTextCell}>
              <Typography variant='body1'>{isLoadingData ? <Skeleton width={150} /> : name}</Typography>
            </div>
            {isNew && (
              <div>
                <NewIcon className={classes.newIcon} />
              </div>
            )}
          </div>
        </BodyCell>
        <BodyCell cellWidth='30%'>{isLoadingData ? <Skeleton width={100} /> : description}</BodyCell>
        <BodyCell cellWidth='30%'>
          {isLoadingData ? (
            <Skeleton width={100} />
          ) : ChecklistItems ? (
            ChecklistItems.map(item => (
              <FormControlLabel className={classes.checkboxList} control={<Checkbox checked name='checkedE' disabled />} label={item.name} />
            ))
          ) : (
            <Typography variant='body1'>{isLoadingData ? <Skeleton width={150} /> : 'No Item'}</Typography>
          )}
        </BodyCell>
        <BodyCell cellWidth='20%' pL='110px' isComponent={true}>
          {isLoadingData ? (
            <Skeleton width={150} />
          ) : (
            <Fragment>
              <Tooltip title={'Edit'} placement='top'>
                <IconButton size='small' onClick={onEditChecklistTemplate} disabled={isProcessing} color='primary'>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Delete'} placement='top'>
                <IconButton size='small' onClick={event => setOpenDialog(true)} disabled={isProcessing}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            </Fragment>
          )}
        </BodyCell>
      </TableRow>
      <StandardConfirmationDialog
        variant={'warning'}
        message={'Are you sure you want to delete this?'}
        open={openDialog}
        handleClose={handleCloseDialog}
        onConfirm={deleteChecklistItemModelTemplate}
      />
    </Fragment>
  );
};

export default BodyRow;
