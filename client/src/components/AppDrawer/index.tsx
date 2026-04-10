import { Drawer, IconButton, List, Theme } from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { ReactComponent as JobsIcon } from 'images/MenuIcon/jobs.svg';
import { ReactComponent as ContractsIcon } from 'images/MenuIcon/quotations.svg';
import { ReactComponent as InvoiceIcon } from 'images/MenuIcon/invoices.svg';
import { ReactComponent as VehicleScheduleIcon } from 'images/MenuIcon/schedules.svg';
import { ReactComponent as ClientsIcon } from 'images/MenuIcon/clients.svg';
import { ReactComponent as ChartIcon } from 'images/MenuIcon/analytics.svg';
import { ReactComponent as SettingsIcon } from 'images/MenuIcon/settings.svg';
import { ReactComponent as EquipmentsIcon } from 'images/MenuIcon/equipments.svg';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import { FC, useContext, useEffect, useState } from 'react';
import logo from '../../images/simplify_logoC.png';
import DrawerItem from './components/DrawerItem';
import { hasAccessPermission } from 'utils';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import { getCurrentRoleGrants } from 'selectors';
import { AppDrawerContext } from 'contexts/AppDrawerContext';

interface Props {
  openDrawer: boolean;
  handleDrawerClose(): void;
}

const { REACT_APP_DRAWER_WIDTH = '240' } = process.env;

const useStyles = makeStyles((theme: Theme) => ({
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: +REACT_APP_DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    }),
    backgroundColor: '#F5F8FA',
    border: 'none'
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9)
    },
    backgroundColor: '#F5F8FA',
    border: 'none'
  },
  logoContainer: {
    textAlign: 'center'
  },
  logo: {
    width: '50%',
    margin: `0px ${theme.spacing(8)}px`
  }
}));

const AppDrawer: FC<Props> = props => {
  const classes = useStyles();
  const { openDrawer, handleDrawerClose } = props;
  const { currentUser } = useContext(CurrentUserContext);
  const currentRoleGrants = getCurrentRoleGrants(currentUser);
  const { setFirstActiveMenu } = useContext(AppDrawerContext);

  const [selected, setSelected] = useState<string>(window.location.pathname !== '/' ? window.location.pathname : '/jobs');

  const drawerItems = [
    { Icon: JobsIcon, path: '/jobs', label: 'Job List', module: 'JOBS' },
    { Icon: ContractsIcon, path: '/quotations', label: 'Quotation List', module: 'QUOTATIONS' },
    { Icon: InvoiceIcon, path: '/invoices', label: 'Invoice List', module: 'INVOICES' },
    { Icon: VehicleScheduleIcon, path: '/schedule', label: 'Schedule', module: 'SCHEDULES' },
    { Icon: ClientsIcon, path: '/clients', label: 'Client List', module: 'CLIENTS' },
    { Icon: EquipmentsIcon, path: '/equipments', label: 'Equipment List', module: 'EQUIPMENTS' },
    { Icon: ChartIcon, path: '/analytics', label: 'Reports & Analytics', module: 'ANALYTICS' },
    { Icon: SettingsIcon, path: '/settings', label: 'Settings', module: 'SETTINGS' }
  ];

  useEffect(() => {
    const firstActive = drawerItems.find(({ module }) => hasAccessPermission(module, 'ACCESS', currentRoleGrants));
    if (firstActive) {
      setFirstActiveMenu(firstActive.path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.location.pathname !== '/') {
      setSelected('/jobs');
    }

    setSelected(window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.pathname]);

  return (
    <Drawer
      variant='permanent'
      classes={{
        paper: clsx(classes.drawerPaper, !openDrawer && classes.drawerPaperClose)
      }}
      open={openDrawer}
      elevation={0}
    >
      <div className={classes.toolbarIcon}>
        <div className={classes.logoContainer}>
          <img src={logo} alt='' className={classes.logo} />
        </div>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <List>
        {drawerItems.map(({ Icon, path, label, module }) => {
          if (hasAccessPermission(module, 'ACCESS', currentRoleGrants)) {
            return <DrawerItem key={path} Icon={Icon} path={path} label={label} selected={selected} setSelected={setSelected} />;
          }
          return null;
        })}
      </List>
    </Drawer>
  );
};

export default AppDrawer;
