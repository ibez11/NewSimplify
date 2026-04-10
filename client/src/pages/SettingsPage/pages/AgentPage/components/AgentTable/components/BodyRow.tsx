import React, { FC, Fragment } from 'react';
import { IconButton, makeStyles, TableRow, Theme, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import NewIcon from '@material-ui/icons/FiberNewOutlined';
import EditIcon from '@material-ui/icons/Edit';
import Skeleton from 'react-loading-skeleton';

import BodyCell from 'components/BodyCell';

interface Props {
  isLoadingData: boolean;
  agent: AgentsModel;
  index: number;
  onEditAgent: React.MouseEventHandler;
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
  const { isLoadingData, agent, onEditAgent } = props;
  const { name, description, new: isNew } = agent;

  return (
    <Fragment>
      <TableRow className={classes.tableRow}>
        <BodyCell cellWidth='30%' isComponent={true}>
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
        <BodyCell cellWidth='30%'>{isLoadingData ? <Skeleton width={'80%'} /> : description}</BodyCell>
        <BodyCell cellWidth='20%' pL='110px' isComponent={true}>
          {isLoadingData ? (
            <Skeleton width={'80%'} />
          ) : (
            <Tooltip title={'Edit'} placement='top'>
              <IconButton size='small' color={'primary'} onClick={onEditAgent}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
        </BodyCell>
      </TableRow>
    </Fragment>
  );
};

export default BodyRow;
