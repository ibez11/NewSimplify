import React, { FC, Fragment, useContext, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  ClickAwayListener,
  Divider,
  Grid,
  List,
  ListSubheader,
  ListItem,
  Typography,
  Theme,
  withStyles,
  Tabs,
  Tab,
  createStyles,
  ListItemSecondaryAction,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import Skeleton from 'react-loading-skeleton';
import axios, { CancelTokenSource } from 'axios';
import CheckIcon from '@material-ui/icons/DoneAll';
import ConfirmIcon from '@material-ui/icons/AssignmentTurnedIn';
import PendingConfirmIcon from '@material-ui/icons/AssignmentLate';
import RescheduleIcon from '@material-ui/icons/Restore';
import PhoneCallbackIcon from '@material-ui/icons/PhoneCallback';
import { format } from 'date-fns';
import { StandardConfirmationDialog } from 'components/AppDialog';
import { GET_EDIT_ALL_NOTIFICATION_BASE_URL, GET_EDIT_INDIVIDUAL_NOTIFICATION_BASE_URL } from 'constants/url';
import { CurrentUserContext } from 'contexts/CurrentUserContext';

interface Props {
  setOpenPopper?: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingData?: boolean;
  notifications: NotificationModel[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationModel[]>>;
  setTotalNotification: React.Dispatch<React.SetStateAction<number>>;
  handleSnackbar?: (variant: 'success' | 'error', message: string) => void; // ✅ new
}

const useStyles = makeStyles((theme: Theme) => ({
  list: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    overflow: 'auto',
    maxHeight: 400,
    borderRadius: '5px',
    '&:hover': { backgroundColor: '#ffffffff' }
  },
  inline: { display: 'inline' },
  notFound: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4)
  },
  headerGrid: { color: '#000000', background: '#F5F8FA', padding: theme.spacing(2) },
  markButton: { padding: theme.spacing(0) },
  listGridUnRead: {
    backgroundColor: '#E3F0F5',
    '&:hover': { backgroundColor: '#ffffffff' }
  },
  checkIcon: { fontSize: 20, marginLeft: theme.spacing(1) },
  tabs: { padding: '0 8px' },
  resolveBtn: {
    textTransform: 'none',
    padding: theme.spacing(0.5, 1)
  },
  // ✅ Ensure text doesn't render beneath the SecondaryAction button
  listItemText: {
    marginRight: theme.spacing(12) // ~96px; adjust if your button area is wider
  }
}));

const AntTabs = withStyles({ indicator: { backgroundColor: 'inherit' } })(Tabs);
const AntTab: any = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      color: 'textSecondary',
      minWidth: 50,
      minHeight: 40,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(1),
      '&:hover': { color: '#53A0BE', opacity: 1 },
      '&$selected': {
        color: '#53A0BE',
        background: theme.palette.primary.light,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: 10,
        fontWeight: theme.typography.fontWeightMedium
      },
      '&:focus': { color: '#53A0BE' }
    },
    selected: {}
  })
)((props: any) => <Tab disableRipple {...props} wrapped />);

const NotificationList: FC<Props> = props => {
  const classes = useStyles(props);

  const { isLoadingData, notifications = [], setNotifications, setTotalNotification, setOpenPopper, handleSnackbar } = props;
  const [selectedTab, setSelectedTab] = useState<number>(0);

  // Mark-all dialog (optional)
  const [openMarkAllConfirmation, setOpenMarkAllConfirmation] = useState<boolean>(false);

  // Resolve confirmation
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [pendingResolveId, setPendingResolveId] = useState<number | null>(null);

  const { currentUser } = useContext(CurrentUserContext);

  const formatDate = (notifDate: string) => {
    const d = new Date(notifDate);
    return format(d, 'EEE dd-MM-yyyy, hh:mm a');
  };

  const handleChange = (_event: any, selected: number) => setSelectedTab(selected);

  const handleOkMarkAll = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    try {
      await axios.put(GET_EDIT_ALL_NOTIFICATION_BASE_URL, { q: 'unread', status: 'read' }, { cancelToken: cancelTokenSource.token });

      setNotifications(prev => prev.map(n => (n.status === 'unread' ? { ...n, status: 'read' } : n)));
      setTotalNotification(0);
      handleSnackbar && handleSnackbar('success', 'All marked as read');
    } catch (e) {
      handleSnackbar && handleSnackbar('error', 'Failed to mark all as read');
    } finally {
      setOpenMarkAllConfirmation(false); // only close dialog; keep popper open
    }
  };

  const markAsReadAndOpen = async (notifId: number, jobId: number) => {
    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      await axios.put(GET_EDIT_INDIVIDUAL_NOTIFICATION_BASE_URL(notifId), { status: 'read' }, { cancelToken: cancelTokenSource.token });

      setNotifications(prev => {
        const next = [...prev];
        const idx = next.findIndex(n => n.id === notifId);
        if (idx !== -1) next[idx] = { ...next[idx], status: 'read' };
        const count = next.filter(n => n.status === 'unread').length;
        setTotalNotification(count);
        return next;
      });

      // Opening job detail will close the popper (kept behavior)
      window.open(`/jobs/${jobId}`, '_blank');
      setOpenPopper && setOpenPopper(false);
    } catch (err) {
      console.log(err);
    }
  };

  const confirmResolve = (notifId: number) => {
    setPendingResolveId(notifId);
    setResolveDialogOpen(true);
  };

  const doResolve = async () => {
    if (pendingResolveId == null) return;
    try {
      const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
      await axios.put(GET_EDIT_INDIVIDUAL_NOTIFICATION_BASE_URL(pendingResolveId), { status: 'resolved' }, { cancelToken: cancelTokenSource.token });

      setNotifications(prev => {
        const next = [...prev];
        const idx = next.findIndex(n => n.id === pendingResolveId);
        if (idx !== -1) {
          const wasUnread = next[idx].status === 'unread';
          next[idx] = { ...next[idx], status: 'resolved', resolvedBy: currentUser?.displayName || 'Unknown' };
          if (wasUnread) {
            const count = next.filter(n => n.status === 'unread').length;
            setTotalNotification(count);
          }
        }
        return next;
      });

      handleSnackbar && handleSnackbar('success', 'Notification resolved');
    } catch (err) {
      handleSnackbar && handleSnackbar('error', 'Failed to resolve notification');
      console.log(err);
    } finally {
      setResolveDialogOpen(false); // only close dialog
      setPendingResolveId(null);
    }
  };

  const renderSkeleton = () =>
    [1, 2, 3, 4, 5].map(index => (
      <Fragment key={index}>
        <ListItem alignItems='flex-start' button>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Skeleton width={150} />
              <Skeleton width={150} />
            </Grid>
          </Grid>
        </ListItem>
        {index !== 4 && <Divider />}
      </Fragment>
    ));

  const renderNoResult = () => (
    <Typography variant='body2' align='center' color='textSecondary' className={classes.notFound}>
      No notifications
    </Typography>
  );

  // Tabs:
  // 0 = ALL (includes resolved)
  // 1 = CONFIRMED + PENDING CONFIRMED (exclude resolved)
  // 2 = RESCHEDULE (exclude resolved)
  // 3 = CALLBACK (exclude resolved)
  // 4 = RESOLVED (status === 'resolved')
  const filteredNotifications = useMemo(() => {
    if (selectedTab === 0) return notifications;
    if (selectedTab === 1) return notifications.filter(n => (n.type === 'CONFIRMED' || n.type === 'PENDING CONFIRMED') && n.status !== 'resolved');
    if (selectedTab === 2) return notifications.filter(n => n.type === 'RESCHEDULE' && n.status !== 'resolved');
    if (selectedTab === 3) return notifications.filter(n => n.type === 'CALLBACK' && n.status !== 'resolved');
    if (selectedTab === 4) return notifications.filter(n => n.status === 'resolved');
    return notifications;
  }, [notifications, selectedTab]);

  const renderIcon = (type: NotificationModel['type']) => {
    if (type === 'CONFIRMED') return <ConfirmIcon color='primary' />;
    if (type === 'PENDING CONFIRMED') return <PendingConfirmIcon color='primary' />;
    if (type === 'RESCHEDULE') return <RescheduleIcon color='primary' />;
    if (type === 'CALLBACK') return <PhoneCallbackIcon color='primary' />;
    return null;
  };

  const renderList = () =>
    filteredNotifications.map((notif, index) => (
      <Fragment key={`${notif.id}-${index}`}>
        <ListItem
          alignItems='flex-start'
          className={notif.status === 'unread' ? classes.listGridUnRead : ''}
          button
          onClick={() => markAsReadAndOpen(notif.id, notif.jobId)}
        >
          <ListItemIcon>{renderIcon(notif.type)}</ListItemIcon>

          <ListItemText
            classes={{ root: classes.listItemText }} // ✅ add margin-right to avoid overlap
            primary={
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant='subtitle1' align='left' gutterBottom>
                    {notif.title}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body2' align='left' gutterBottom>
                    {notif.description}
                  </Typography>
                </Grid>
              </Grid>
            }
            secondary={
              <Grid container>
                <Grid item xs={12}>
                  <Grid container alignItems='center' justify='space-between'>
                    <Grid item>
                      <Typography variant='caption' align='left' color='textSecondary'>
                        {formatDate(notif.createdAt)} {notif.resolvedBy && `| Resolved by ${notif.resolvedBy} (${formatDate(notif.updatedAt)})`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            }
          />

          <ListItemSecondaryAction>
            {notif.status !== 'resolved' && (
              <Button
                size='small'
                className={classes.resolveBtn}
                startIcon={<CheckIcon style={{ fontSize: 16 }} />}
                onClick={e => {
                  e.stopPropagation(); // don't open job
                  confirmResolve(notif.id);
                }}
                color='primary'
              >
                Resolve
              </Button>
            )}
          </ListItemSecondaryAction>
        </ListItem>
        {index !== filteredNotifications.length - 1 && <Divider />}
      </Fragment>
    ));

  const content = isLoadingData
    ? renderSkeleton()
    : notifications.length === 0
    ? renderNoResult()
    : filteredNotifications.length === 0
    ? renderNoResult()
    : renderList();

  // ✅ Prevent click-away close while dialogs are open (they render in a portal)
  const clickAwayEnabled = !resolveDialogOpen && !openMarkAllConfirmation;

  return (
    <Fragment>
      {clickAwayEnabled ? (
        <ClickAwayListener onClickAway={() => setOpenPopper && setOpenPopper(false)}>
          <List
            subheader={
              <ListSubheader disableGutters>
                <Grid container direction='row' justify='space-between' alignItems='center' className={classes.headerGrid}>
                  <Grid item>
                    <Typography variant='h5'>Notifications</Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      size='small'
                      color='primary'
                      className={classes.markButton}
                      startIcon={<CheckIcon />}
                      onClick={() => setOpenMarkAllConfirmation(true)}
                      disabled={notifications.filter(notif => notif.status === 'unread').length ? false : true}
                      disableRipple
                    >
                      Mark all as read
                    </Button>
                  </Grid>
                </Grid>

                <AntTabs value={selectedTab} onChange={handleChange} centered variant='fullWidth' className={classes.tabs}>
                  <AntTab value={0} label='All' />
                  <AntTab value={1} label='Confirmed Job' />
                  <AntTab value={2} label='Reschedule Job' />
                  <AntTab value={3} label='Callback' />
                  <AntTab value={4} label='Resolved' />
                </AntTabs>
              </ListSubheader>
            }
            className={classes.list}
          >
            {content}
          </List>
        </ClickAwayListener>
      ) : (
        // When dialog open, render without ClickAwayListener so popper stays open
        <List
          subheader={
            <ListSubheader disableGutters>
              <Grid container direction='row' justify='space-between' alignItems='center' className={classes.headerGrid}>
                <Grid item>
                  <Typography variant='h5'>Notifications</Typography>
                </Grid>
                <Grid item>
                  <Button
                    size='small'
                    className={classes.markButton}
                    startIcon={<CheckIcon />}
                    onClick={() => setOpenMarkAllConfirmation(true)}
                    color='primary'
                  >
                    Mark all as read
                  </Button>
                </Grid>
              </Grid>

              <AntTabs value={selectedTab} onChange={handleChange} centered variant='fullWidth' className={classes.tabs}>
                <AntTab value={0} label='All' />
                <AntTab value={1} label='Confirmed Job' />
                <AntTab value={2} label='Reschedule Job' />
                <AntTab value={3} label='Callback' />
                <AntTab value={4} label='Resolved' />
              </AntTabs>
            </ListSubheader>
          }
          className={classes.list}
        >
          {content}
        </List>
      )}

      {/* Mark all as read dialog */}
      <StandardConfirmationDialog
        variant={'warning'}
        message='Are you sure want to make all as read?'
        okLabel='OK'
        cancelLabel='cancel'
        open={openMarkAllConfirmation}
        handleClose={() => setOpenMarkAllConfirmation(false)} // only close dialog
        onConfirm={handleOkMarkAll}
      />

      {/* Resolve confirmation */}
      <StandardConfirmationDialog
        variant={'warning'}
        message='are you sure want to resolve this job?'
        secondMessage='It will be moved to the Resolved tab.'
        okLabel='Resolve'
        cancelLabel='Cancel'
        open={resolveDialogOpen}
        handleClose={() => {
          setResolveDialogOpen(false);
          setPendingResolveId(null);
        }}
        onConfirm={doResolve}
      />
    </Fragment>
  );
};

export default NotificationList;
