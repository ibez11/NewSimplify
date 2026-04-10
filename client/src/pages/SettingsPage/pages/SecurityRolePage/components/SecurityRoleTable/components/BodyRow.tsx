import React, { FC, memo, useContext } from 'react';
import { TableRow, makeStyles, TableCell, Theme, Typography, IconButton, Tooltip } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import EditIcon from '@material-ui/icons/Edit';
import NewIcon from '@material-ui/icons/FiberNew';
import Skeleton from 'react-loading-skeleton';

import BodyCell from 'components/BodyCell';
import { CurrentUserContext } from 'contexts/CurrentUserContext';

interface Props {
  isLoadingData: boolean;
  securityRole: SecurityRolesModel;
  onEditSecurityRole: React.MouseEventHandler;
}

const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    height: 64
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
  newIcon: {
    color: green[500]
  }
}));

const BodyRow: FC<Props> = memo(props => {
  const classes = useStyles();
  const { isLoadingData, securityRole, onEditSecurityRole } = props;
  const { currentUser } = useContext(CurrentUserContext);
  const { id, name, description, isEdited, isNew } = securityRole;
  const isSameRoleId = id === currentUser!.roleId;

  return (
    <TableRow className={classes.tableRow}>
      <TableCell>
        <div className={classes.tableCellInner}>
          <div className={classes.nameTextCell}>
            <Typography variant='body1'>{name || <Skeleton width={100} />}</Typography>
          </div>
          {isNew && (
            <div>
              <NewIcon fontSize='large' className={classes.newIcon} />
            </div>
          )}
        </div>
      </TableCell>
      <BodyCell>
        <Typography variant='body1'>{isLoadingData ? <Skeleton width={100} height={25} /> : description}</Typography>
      </BodyCell>
      <BodyCell cellWidth='20%' pL='110px' isComponent={true}>
        {isLoadingData ? (
          <Skeleton width={80} />
        ) : (
          <Tooltip title={'Edit'} placement='top'>
            <IconButton size='small' onClick={onEditSecurityRole} disabled={!isEdited || isSameRoleId} color={'primary'}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </BodyCell>
    </TableRow>
  );
});

export default BodyRow;
