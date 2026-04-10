import { AppBar, Avatar, Badge, IconButton, ListItemIcon, makeStyles, Menu, MenuItem, Theme, Toolbar, Tooltip, Typography } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import NotificationsIcon from '@material-ui/icons/NotificationsNone';
import IdentifyIcon from '@material-ui/icons/PermIdentityRounded';
import HelpIcon from '@material-ui/icons/HelpOutline';
import WhatsappIcon from '@material-ui/icons/WhatsApp';
import EmailIcon from '@material-ui/icons/Email';
import HelpCenterIcon from '@material-ui/icons/Headset';
import LogoutIcon from '@material-ui/icons/PowerSettingsNewRounded';
import axios, { CancelTokenSource } from 'axios';
import clsx from 'clsx';
import { green } from '@material-ui/core/colors';
import React, { FC, useContext, useState, useEffect } from 'react';
import { LOGOUT_URL } from 'constants/url';
import { CurrentUserContext } from 'contexts/CurrentUserContext';
import logo from 'images/favicon.png';
import { getCurrentUserAvatarName, getCurrentCompanyName, getCurrentUserId } from 'selectors';
import SearchInput from './SearchInput';
import useDebounce from 'hooks/useDebounce';
import ActionSnackBar from './ActionSnackbar';
import UpdateProfileModal from './ProfileModal/UpdateProfileModal';
import NotificationPopper from './NotificationPopper';
import { USER_BASE_URL, CLIENT_BASE_URL, NOTIFICATION_BASE_URL } from 'constants/url';
import { onMessageListener } from '../utils/Firebase';

interface Props {
  open: boolean;
  handleDrawerOpen(): void;
}

const { REACT_APP_DRAWER_WIDTH = '240' } = process.env;

const useStyles = makeStyles((theme: Theme) => ({
  avatar: {
    margin: 10,
    width: 30,
    height: 30,
    backgroundColor: '#53a0be'
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    backgroundColor: '#F5F8FA'
  },
  appBarShift: {
    marginLeft: REACT_APP_DRAWER_WIDTH,
    width: `calc(100% - ${REACT_APP_DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  menuButtonHidden: {
    display: 'none'
  },
  title: {
    flexGrow: 1
  },
  ListItemIcon: {
    minWidth: theme.spacing(5)
  },
  logo: {
    width: '1em'
  },
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  }
}));

const AppHeader: FC<Props> = props => {
  const classes = useStyles();
  const { currentUser, unsetCurrentUser } = useContext(CurrentUserContext);

  const currentUserAvatarName = getCurrentUserAvatarName(currentUser);
  const companyName = getCurrentCompanyName(currentUser);
  const userProfileId = getCurrentUserId(currentUser);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState<null | HTMLElement>(null);

  const { open, handleDrawerOpen } = props;
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');

  const [queryString] = useState<string>();
  const [user, setUser] = useState<UserDetailsModel>();

  const roles: Role[] = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'TECHNICIAN' },
    { id: 3, name: 'MANAGER' }
  ];

  const [openProfileModal, setOpenProfileModal] = useState<boolean>(false);
  const [currentEditingUserProfileId, setCurrentEditingUserProfileId] = useState<number>(0);

  const [globalSearchValue, setGlobalSearchValue] = useState<string>('');
  const [openPopper, setOpenPopper] = useState(false);

  const [isSearchingClient, setSearchingClient] = useState<boolean>(false);
  const [clients, setClients] = useState<ClientModel[]>([]);

  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [totalNotification, setTotalNotification] = useState<number>(0);
  const [openNotificationPopper, setNotificationOpenPopper] = useState(false);
  const [notificationAnchorEl, setNotificationHelpAnchorEl] = useState<null | HTMLElement>(null);

  const [hasNotification, setNotification] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Get User Data whenever
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }
      params.append('order', 'id');
      return params.toString();
    };
    const userData = async () => {
      try {
        const url = `${USER_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        const currentUser = data.users.find((value: any) => value.id === userProfileId);
        setUser(currentUser);
      } catch (err) {}
    };

    // const getQueryNotificationParams = () => {
    //   const params = new URLSearchParams();
    //   params.append('q', 'unread');

    //   return params.toString();
    // };

    const getNotification = async () => {
      try {
        // const url = `${NOTIFICATION_BASE_URL}?${getQueryNotificationParams()}`;
        const url = `${NOTIFICATION_BASE_URL}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });

        const notifData: NotificationModel[] = data.notifications;
        const countUnread = notifData.filter(notif => notif.status === 'unread').length;

        setNotifications(notifData);
        setTotalNotification(countUnread);
      } catch (err) {
        console.log(err);
      }
    };

    userData();
    getNotification();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  useEffect(() => {
    onMessageListener()
      .then((payload: any) => {
        const currentNotifications = notifications;
        const { data } = payload;
        const { notifId, JobId, type, title, body } = data;
        const notificationTitle = title;
        const notificationOptions = {
          body,
          icon: `${process.env.PUBLIC_URL}/favicon.png`
        };
        const url = `${process.env.PUBLIC_URL}/jobs/${Number(JobId)}`;

        const newNotification = new Notification(notificationTitle, notificationOptions);
        newNotification.onclick = function(event) {
          event.preventDefault(); // prevent the browser from focusing the Notification's tab
          window.open(url, '_blank');
          newNotification.close();
        };

        currentNotifications.unshift({
          id: Number(notifId),
          title,
          description: body,
          type,
          status: 'unread',
          jobId: Number(JobId),
          updatedAt: new Date().toDateString(),
          createdAt: new Date().toDateString()
        });

        const countUnread = currentNotifications.filter(notif => notif.status === 'unread').length;

        setNotification(true);
        setMessage(body);
        setNotifications(currentNotifications);
        setTotalNotification(countUnread);
      })
      .catch(err => console.log('failed: ', err));
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHelpClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setHelpAnchorEl(event.currentTarget);
  };

  const handleNoficationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationHelpAnchorEl(event.currentTarget);
    setNotificationOpenPopper(!openNotificationPopper);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseHelp = () => {
    setHelpAnchorEl(null);
  };

  const handleWhatsapp = () => {
    window.open('https://wa.me/+6588471170', '_blank');
  };

  const handleEmail = () => {
    var link = `mailto:hello@noid.com.sg?cc=david@noid.com.sg&subject=Please Help Me!`;
    window.location.href = link;
  };

  const handleHelpCenter = () => {
    window.open('https://simplify.asia/help-centre/', '_blank');
  };

  const handleOpenProfileModal = (userProfileId: number): React.MouseEventHandler => () => {
    handleClose();
    setCurrentEditingUserProfileId(userProfileId);
    // curent user
    setOpenProfileModal(true);
  };

  const handleCancelProfileModal = () => {
    setOpenProfileModal(false);
  };

  const handleLogout = async () => {
    handleClose();

    try {
      await axios.post(LOGOUT_URL);
    } catch (err) {
      // do nothing. Log out even if server request failed
    }

    unsetCurrentUser();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleNotifCloseSnackbar = () => {
    setNotification(false);
  };

  const debouncedSearchTerm = useDebounce(globalSearchValue, 500);

  // Load client data to populate on search list
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    if (debouncedSearchTerm) {
      if (debouncedSearchTerm.length >= 3) {
        const getQueryParams = () => {
          const params = new URLSearchParams();
          if (debouncedSearchTerm) {
            params.append('q', debouncedSearchTerm);
          }
          return params.toString();
        };

        const searchClient = async () => {
          setSearchingClient(true);

          try {
            const url = `${CLIENT_BASE_URL}?${getQueryParams()}`;
            const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
            setClients(data.clients);
            setOpenPopper(true);
          } catch (err) {
            console.log(err);
          }

          setSearchingClient(false);
        };

        searchClient();

        return () => {
          cancelTokenSource.cancel();
        };
      } else {
        setOpenPopper(false);
      }
    } else {
      setOpenPopper(false);
    }
  }, [debouncedSearchTerm]);
  // Only call effect if debounced search term changes
  return (
    <AppBar position='absolute' color='inherit' elevation={0} className={clsx(classes.appBar, open && classes.appBarShift)}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge='start'
          color='inherit'
          aria-label='Open drawer'
          onClick={handleDrawerOpen}
          className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
        >
          <img src={logo} alt='' className={classes.logo} />
        </IconButton>
        <Typography component='h1' variant='h4' color='inherit' noWrap className={classes.title}>
          {companyName}
        </Typography>
        <SearchInput
          isAppbar={true}
          globalSearchValue={globalSearchValue}
          setGlobalSearchValue={setGlobalSearchValue}
          openPopper={openPopper}
          setOpenPopper={setOpenPopper}
          isLoadingData={isSearchingClient}
          clients={clients}
        />
        <IconButton color='inherit' onClick={handleNoficationClick}>
          <Badge color='secondary'>
            <Tooltip title='Notification'>
              <Badge badgeContent={totalNotification} max={99} color='error'>
                <NotificationsIcon />
              </Badge>
            </Tooltip>
          </Badge>
        </IconButton>
        <NotificationPopper
          openPopper={openNotificationPopper}
          setOpenPopper={setNotificationOpenPopper}
          anchorEl={notificationAnchorEl}
          notifications={notifications}
          setNotifications={setNotifications}
          setTotalNotification={setTotalNotification}
          placement='bottom'
        />
        <IconButton color='inherit' onClick={handleHelpClick}>
          <Badge color='secondary'>
            <Tooltip title='Help'>
              <HelpIcon />
            </Tooltip>
          </Badge>
        </IconButton>
        <Menu
          id='profile-menu'
          anchorEl={helpAnchorEl}
          keepMounted
          elevation={1}
          getContentAnchorEl={null}
          open={Boolean(helpAnchorEl)}
          onClose={handleCloseHelp}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <MenuItem onClick={handleWhatsapp}>
            <ListItemIcon className={classes.ListItemIcon}>
              <WhatsappIcon />
            </ListItemIcon>
            Whatsapp
          </MenuItem>
          <MenuItem onClick={handleEmail}>
            <ListItemIcon className={classes.ListItemIcon}>
              <EmailIcon />
            </ListItemIcon>
            Email Us
          </MenuItem>
          <MenuItem onClick={handleHelpCenter}>
            <ListItemIcon className={classes.ListItemIcon}>
              <HelpCenterIcon />
            </ListItemIcon>
            Help Center
          </MenuItem>
        </Menu>
        <IconButton size='small' color='primary' onClick={handleClick}>
          <Tooltip title='Profile'>
            <Avatar className={classes.avatar}>{currentUserAvatarName}</Avatar>
          </Tooltip>
        </IconButton>
        <Menu
          id='profile-menu'
          anchorEl={anchorEl}
          keepMounted
          elevation={1}
          getContentAnchorEl={null}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <MenuItem onClick={handleOpenProfileModal(userProfileId)}>
            <ListItemIcon className={classes.ListItemIcon}>
              <IdentifyIcon />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon className={classes.ListItemIcon}>
              <LogoutIcon />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
      <ActionSnackBar
        variant={snackbarVarient}
        message={snackbarVarient === 'success' ? 'Update is successful' : 'Operation failed'}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
      <ActionSnackBar variant={'success'} message={message} open={hasNotification} handleClose={handleNotifCloseSnackbar} Icon={NotificationsIcon} />
      <UpdateProfileModal
        open={openProfileModal}
        roles={roles}
        user={user}
        userId={currentEditingUserProfileId}
        handleCancel={handleCancelProfileModal}
        setOpenSnackbar={setOpenSnackbar}
        setSnackbarVarient={setSnackbarVarient}
      />
    </AppBar>
  );
};

export default AppHeader;
