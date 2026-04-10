import React, { FC, useState, useEffect, Fragment } from 'react';

import { IconButton, makeStyles, TableRow, Theme, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import NewIcon from '@material-ui/icons/FiberNewOutlined';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Skeleton from 'react-loading-skeleton';

import axios from 'axios';
import { GET_DELETE_SERVICE_TEMPLATE_URL } from 'constants/url';
import BodyCell from 'components/BodyCell';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { convertToRaw, convertFromHTML, ContentState } from 'draft-js';

interface Props {
  isLoadingData: boolean;
  serviceTemplate: ServiceTemplatesModel;
  index: number;
  deleteIndividualServiceTemplate: (serviceTemplateIndex: number) => void;
  onEditServiceTemplate: React.MouseEventHandler;
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
  const { isLoadingData, serviceTemplate, index, deleteIndividualServiceTemplate, onEditServiceTemplate, handleSnackbar } = props;

  const { id, name, description, termCondition, new: isNew } = serviceTemplate;

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isProcessing, setProcessing] = useState<boolean>(false);

  const [currentDescription, setCurrentDescription] = useState<any>({ blocks: [{ text: '' }] });
  const [currentTermCondition, setCurrentTermCondition] = useState<any>({ blocks: [{ text: '' }] });

  useEffect(() => {
    if (!description && !termCondition) {
      return;
    }

    const contentHTMLDescription = convertFromHTML(description);
    const contentHTMLTermCondition = convertFromHTML(termCondition);

    // 2. Create the ContentState object
    const stateDescription = ContentState.createFromBlockArray(contentHTMLDescription.contentBlocks, contentHTMLDescription.entityMap);
    const stateTermCondition = ContentState.createFromBlockArray(contentHTMLTermCondition.contentBlocks, contentHTMLTermCondition.entityMap);

    // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
    const contentDescription = JSON.stringify(convertToRaw(stateDescription));
    const contentTermCondition = JSON.stringify(convertToRaw(stateTermCondition));

    setCurrentDescription(contentDescription ? JSON.parse(contentDescription) : '');
    setCurrentTermCondition(contentTermCondition ? JSON.parse(contentTermCondition) : '');
  }, [description, termCondition]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const actionWrapper = async (action: () => Promise<void>) => {
    setProcessing(true);

    try {
      await action();
      handleSnackbar('success', 'Successfully delete quotation template');
    } catch (err) {
      handleSnackbar('error', 'Failed to delete quotation template');
    }

    setProcessing(false);
  };

  const deleteServiceItemTemplate: React.MouseEventHandler<HTMLButtonElement> = async event => {
    await actionWrapper(async () => {
      await axios.delete(GET_DELETE_SERVICE_TEMPLATE_URL(id));
    });
    deleteIndividualServiceTemplate(index);
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
        <BodyCell cellWidth='30%'>
          {isLoadingData ? (
            <Skeleton width={100} />
          ) : (
            currentDescription && currentDescription.blocks[0] && currentDescription.blocks[0].text.substr(0, 15) + '....'
          )}
        </BodyCell>
        <BodyCell cellWidth='30%'>
          {isLoadingData ? (
            <Skeleton width={200} />
          ) : (
            currentTermCondition && currentTermCondition.blocks[0] && currentTermCondition.blocks[0].text.substr(0, 15) + '....'
          )}
        </BodyCell>
        <BodyCell cellWidth='30%' pL='110px' isComponent={true}>
          {isLoadingData ? (
            <Skeleton width={100} />
          ) : (
            <Fragment>
              <Tooltip title={'Edit'} placement='top'>
                <IconButton size='small' onClick={onEditServiceTemplate} disabled={isProcessing} color='primary'>
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
        onConfirm={deleteServiceItemTemplate}
      />
    </Fragment>
  );
};

export default BodyRow;
