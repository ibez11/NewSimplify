import React, { FC, Fragment, useState } from 'react';
import NumberFormat from 'react-number-format';
import {
  createStyles,
  TableRow,
  makeStyles,
  TableCell,
  Theme,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  FormControlLabel,
  withStyles
} from '@material-ui/core';
import { grey, green } from '@material-ui/core/colors';
import EditIcon from '@material-ui/icons/Edit';
import UnlockIcon from '@material-ui/icons/LockOpen';
import NewIcon from '@material-ui/icons/FiberNew';
import Skeleton from 'react-loading-skeleton';
import axios from 'axios';

import { GET_UNLOCK_USER_URL, GET_DEACTIVATE_USER_URL, GET_ACTIVATE_USER_URL } from 'constants/url';
import BodyCell from 'components/BodyCell';
import { StandardConfirmationDialog } from 'components/AppDialog';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import { ucWords } from 'utils';

interface PageProps {
  isLoadingData: boolean;
  user: UserDetailsModel;
  updateUser: (updatedUserProperties: Partial<UserDetailsModel>) => void;
  onEditUser: React.MouseEventHandler;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1)
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#53A0BE',
          opacity: 1,
          border: 'none'
        }
      },
      '&$focusVisible $thumb': {
        color: '#53A0BE',
        border: '6px solid #fff'
      }
    },
    thumb: {
      width: 24,
      height: 24
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border'])
    },
    checked: {},
    focusVisible: {}
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  );
});

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
  roleText: {
    color: grey[500]
  },
  wrapper: {
    position: 'relative'
  },
  newIcon: {
    color: green[500]
  },
  textCenter: {
    textAlign: 'center'
  },
  chip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

const BodyRow: FC<PageProps> = props => {
  const classes = useStyles();
  const { isLoadingData, user, updateUser, onEditUser, handleSnackbar } = props;
  const { id, role, displayName, countryCode, contactNumber, email, homeDistrict, homePostalCode, userSkills, active, lock, new: isNew } = user;

  const [isProcessing, setProcessing] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const actionWrapper = async (action: () => Promise<void>, actionStatus: string) => {
    setProcessing(true);

    try {
      await action();
      handleSnackbar('success', `Successfully ${actionStatus} employee`);
    } catch (err) {
      const error = err as any;
      console.log(error.data.errorCode);
      if (error.data.errorCode === 24) {
        setOpenDialog(true);
      } else {
        handleSnackbar('error', `Failed to ${actionStatus} employee`);
      }
    }

    setProcessing(false);
  };

  const unlockUser: React.MouseEventHandler<HTMLButtonElement> = async event => {
    await actionWrapper(async () => {
      await axios.post(GET_UNLOCK_USER_URL(id));
      updateUser({ lock: false });
    }, 'update status');
  };

  const deactivateUser: React.ChangeEventHandler<HTMLInputElement> = async event => {
    await actionWrapper(async () => {
      await axios.delete(GET_DEACTIVATE_USER_URL(id));
      updateUser({ active: false });
    }, 'update status');
  };

  const activateUser: React.ChangeEventHandler<HTMLInputElement> = async event => {
    await actionWrapper(async () => {
      await axios.post(GET_ACTIVATE_USER_URL(id));
      updateUser({ active: true });
    }, 'update status');
  };

  return (
    <TableRow className={classes.tableRow}>
      <Fragment>
        <TableCell>
          <div className={classes.tableCellInner}>
            <div className={classes.nameTextCell}>
              <Typography variant='body1'>{displayName || <Skeleton width={100} />}</Typography>
              <Typography variant='subtitle2' className={classes.roleText}>
                {ucWords(role) || <Skeleton width={100} />}
              </Typography>
            </div>
            {isNew && (
              <div>
                <NewIcon fontSize='large' className={classes.newIcon} />
              </div>
            )}
          </div>
        </TableCell>
        <BodyCell>
          <Typography variant='body1'>
            {isLoadingData ? (
              <Skeleton width={100} height={25} />
            ) : (
              <NumberFormat displayType='text' value={countryCode + contactNumber} format='+################' />
            )}
          </Typography>
          <Typography variant='subtitle2' className={classes.roleText}>
            {email || <Skeleton width={100} height={25} />}
          </Typography>
        </BodyCell>
        <BodyCell>
          <Typography variant='body1'>
            {isLoadingData ? <Skeleton width={100} height={25} /> : <Typography variant='body1'>{homeDistrict || '-'}</Typography>}
          </Typography>
          <Typography variant='subtitle2' className={classes.roleText}>
            {homePostalCode || <Skeleton width={100} height={25} />}
          </Typography>
        </BodyCell>
        <TableCell>
          <div className={classes.tableCellInner}>
            <div className={classes.wrapper}>
              {isLoadingData ? (
                <Skeleton height={50} width={50} />
              ) : userSkills ? (
                userSkills.map(skill => <Chip label={skill.skill} color='primary' className={classes.chip} />)
              ) : (
                '-'
              )}
            </div>
          </div>
        </TableCell>
        <BodyCell cellWidth='15%' pL='10px' pR='10px'>
          {isLoadingData ? (
            <Skeleton width={100} height={25} />
          ) : (
            <React.Fragment>
              <FormControlLabel
                control={<IOSSwitch checked={active ? true : false} onChange={active ? deactivateUser : activateUser} name='status' />}
                label={active ? 'Active' : 'Inactive'}
              />
            </React.Fragment>
          )}
        </BodyCell>
        <TableCell>
          {isLoadingData ? (
            <Skeleton width={100} />
          ) : (
            <React.Fragment>
              {lock && (
                <Tooltip title={'Unlock'} placement='top'>
                  <IconButton size='small' onClick={unlockUser} disabled={isProcessing}>
                    <UnlockIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={'Edit'} placement='top'>
                <IconButton onClick={onEditUser} disabled={isProcessing} color={'primary'}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </React.Fragment>
          )}
        </TableCell>
      </Fragment>
      {openDialog && (
        <StandardConfirmationDialog
          variant={'warning'}
          okLabel='OK'
          cancelLabel=''
          message='There are jobs still in progress for this technician.'
          secondMessage='Please change the job status to Unassigned before inactivate this technician.'
          open={openDialog}
          handleClose={() => setOpenDialog(false)}
          onConfirm={() => setOpenDialog(false)}
        />
      )}
    </TableRow>
  );
};

export default BodyRow;
