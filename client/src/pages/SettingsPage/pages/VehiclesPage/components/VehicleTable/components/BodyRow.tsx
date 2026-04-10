import React, { FC, useState } from 'react';
import { format } from 'date-fns';
import { createStyles, FormControlLabel, IconButton, makeStyles, TableRow, Theme, Tooltip, Typography, withStyles } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import NewIcon from '@material-ui/icons/FiberNewOutlined';
import EditIcon from '@material-ui/icons/Edit';
import Skeleton from 'react-loading-skeleton';

import axios from 'axios';
import { GET_ACTIVATE_VEHICLE_URL, GET_DEACTIVATE_VEHICLE_URL } from 'constants/url';
import BodyCell from 'components/BodyCell';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';

interface PageProps {
  isLoadingData: boolean;
  vehicle: VehicleModel;
  updateVehicle: (updatedVehicleProperties: Partial<VehicleModel>) => void;
  deleteIndividualVehicle: (vehicleIndex: number) => void;
  onEditVehicle: React.MouseEventHandler;
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
  newIcon: {
    color: green[500],
    fontSize: 30
  },
  actionIcon: {
    fontSize: 20
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

const BodyRow: FC<PageProps> = props => {
  const classes = useStyles();
  const { isLoadingData, vehicle, updateVehicle, onEditVehicle, handleSnackbar } = props;
  const { id, model, carplateNumber, coeExpiryDate, vehicleStatus, displayName, new: isNew } = vehicle;

  const [isProcessing, setProcessing] = useState<boolean>(false);

  const actionWrapper = async (action: () => Promise<void>, actionStatus: string) => {
    setProcessing(true);

    try {
      await action();
      handleSnackbar('success', `Successfully ${actionStatus} vehicle`);
    } catch (err) {
      handleSnackbar('error', `Failed to ${actionStatus} vehicle`);
    }

    setProcessing(false);
  };

  const deactivateVehicle: React.ChangeEventHandler<HTMLInputElement> = async event => {
    await actionWrapper(async () => {
      await axios.post(GET_DEACTIVATE_VEHICLE_URL(id));
    }, 'deactivate');
    updateVehicle({ vehicleStatus: false });
  };

  const activateVehicle: React.ChangeEventHandler<HTMLInputElement> = async event => {
    await actionWrapper(async () => {
      await axios.post(GET_ACTIVATE_VEHICLE_URL(id));
    }, 'activate');
    updateVehicle({ vehicleStatus: true });
  };

  return (
    <TableRow className={classes.tableRow}>
      <BodyCell cellWidth='14%' pR='10px' isComponent={true}>
        {isLoadingData ? (
          <Skeleton width={80} />
        ) : (
          <div className={classes.tableCellInner}>
            <div className={classes.nameTextCell}>
              <Typography variant='body1'>{carplateNumber}</Typography>
            </div>
            {isNew && (
              <div>
                <NewIcon className={classes.newIcon} />
              </div>
            )}
          </div>
        )}
      </BodyCell>
      <BodyCell cellWidth='20%' pL='10px' pR='10px'>
        {isLoadingData ? <Skeleton width={80} /> : model}
      </BodyCell>
      <BodyCell cellWidth='18%' pL='10px' pR='10px'>
        {isLoadingData ? <Skeleton width={80} /> : format(new Date(coeExpiryDate), 'dd-MM-yyyy')}
      </BodyCell>
      <BodyCell cellWidth='20%' pL='10px' pR='10px'>
        {isLoadingData ? <Skeleton width={80} /> : displayName || '-'}
      </BodyCell>
      <BodyCell cellWidth='15%' pL='10px' pR='10px' isComponent={true}>
        {isLoadingData ? (
          <Skeleton width={80} />
        ) : (
          <FormControlLabel
            control={<IOSSwitch checked={vehicleStatus ? true : false} onChange={vehicleStatus ? deactivateVehicle : activateVehicle} />}
            label={vehicleStatus ? 'Active' : 'Inactive'}
          />
        )}
      </BodyCell>
      <BodyCell cellWidth='15%' pL='120px' isComponent={true}>
        {isLoadingData ? (
          <Skeleton width={80} />
        ) : (
          <Tooltip title={'Edit'} placement='top'>
            <IconButton size='small' onClick={onEditVehicle} disabled={isProcessing} color={'primary'}>
              <EditIcon className={classes.actionIcon} />
            </IconButton>
          </Tooltip>
        )}
      </BodyCell>
    </TableRow>
  );
};

export default BodyRow;
