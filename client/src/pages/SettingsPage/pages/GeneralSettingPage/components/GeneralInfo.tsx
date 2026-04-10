import React from 'react';
import { Grid, Typography, Card, CardContent, makeStyles, Avatar } from '@material-ui/core';
import VehicleIcon from 'images/SettingIcon/vehicle.png';
import AdminIcon from 'images/SettingIcon/admin.png';
import ClientIcon from 'images/SettingIcon/client.png';
import AgentIcon from 'images/SettingIcon/agent.png';
import VerifiedIcon from '@material-ui/icons/VerifiedUser';
import { format } from 'date-fns';
import { Skeleton } from '@material-ui/lab';

interface Props {
  isLoading: boolean;
  generalSettingInfo: GeneralSettingInfo;
  tenantPlanDetail: TentantPlantDetail;
}

const useStyles = makeStyles(() => ({
  gridContainer: {
    padding: 8
  }
}));

const GeneralInfo: React.FC<Props> = props => {
  const { isLoading, generalSettingInfo, tenantPlanDetail } = props;
  const classes = useStyles();
  const { key, numberOfLicense, subscriptExpDate, createdAt, planType } = tenantPlanDetail;

  const renderInfo = (icon: string, title: string, value: any) => {
    return (
      <Grid item xs>
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='body1' gutterBottom>
              {title}
            </Typography>
            {isLoading ? (
              <Skeleton width={'50%'} />
            ) : (
              <Typography variant='h4' style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar variant='square' src={icon} />
                <span style={{ marginLeft: 8 }}>{value || 0}</span>
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={3} style={{ display: 'flex', flexDirection: 'column' }}>
        <Card
          variant='outlined'
          style={{
            flex: 1,
            background: 'linear-gradient(180deg, #53A0BE -17.63%, #0F315B 117.63%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Grid className={classes.gridContainer}>
              <Typography gutterBottom style={{ fontSize: 13, color: 'white' }}>
                Your Product Plan Package
              </Typography>
              {isLoading ? (
                <Skeleton width={'50%'} />
              ) : (
                <Typography gutterBottom style={{ fontSize: 25, fontWeight: 'bold', color: 'white' }}>
                  {planType} Plan Package <VerifiedIcon color='inherit' />
                </Typography>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={9}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card variant='outlined'>
              <CardContent>
                <Grid container alignContent='center' className={classes.gridContainer}>
                  <Grid item xs={3}>
                    <Typography variant='body1' gutterBottom>
                      Subscription Code
                    </Typography>
                    {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='h5'>{tenantPlanDetail ? `${key}` : '-'}</Typography>}
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant='body1' gutterBottom>
                      Employee License Limit
                    </Typography>
                    {isLoading ? <Skeleton width={'50%'} /> : <Typography variant='h5'>{tenantPlanDetail ? numberOfLicense : '0'} Users</Typography>}
                    <Typography variant='caption'>(Admin + Technician)</Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant='body1' gutterBottom>
                      Sign up On
                    </Typography>
                    {isLoading ? (
                      <Skeleton width={'50%'} />
                    ) : (
                      <Typography variant='h5'>{createdAt ? format(new Date(createdAt), 'dd MMM yyyy') : '-'}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant='body1' gutterBottom>
                      Expire On
                    </Typography>
                    {isLoading ? (
                      <Skeleton width={'50%'} />
                    ) : (
                      <Typography variant='h5'>{subscriptExpDate ? format(new Date(subscriptExpDate), 'dd MMM yyyy') : '-'}</Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item container spacing={2}>
            {renderInfo(VehicleIcon, 'Active Vehicles', generalSettingInfo.activeVehicle)}
            {renderInfo(AdminIcon, 'Active Employees', generalSettingInfo.activeAdmin + generalSettingInfo.activeTechnician)}
            {renderInfo(AgentIcon, 'Agents', generalSettingInfo.agent)}
            {renderInfo(ClientIcon, 'Clients', generalSettingInfo.client)}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container justify='space-between'></Grid>
      </Grid>
    </Grid>
  );
};

export default GeneralInfo;
