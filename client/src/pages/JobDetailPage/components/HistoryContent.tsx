import { FC, Fragment } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Button, IconButton, Theme, DialogActions, Grid, Table, TableHead, TableBody, TableCell, TableRow, Tooltip, Paper } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';
import MarkerIcon from '@material-ui/icons/Room';
import { format } from 'date-fns';
import { ucWords } from 'utils';

interface Props {
  job: JobDetailModel;
  handleClose(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  paper: {
    margin: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    width: '100%'
  }
}));

const HistoryForm: FC<Props> = props => {
  const classes = useStyles();

  const { job, handleClose } = props;
  const { JobHistories } = job;

  const renderJobHistories = () => {
    if (JobHistories && JobHistories.length > 0) {
      return JobHistories.map((value, index) => (
        <TableRow key={`history-${index}`}>
          <TableCell width={'10%'} style={{ whiteSpace: 'pre-line' }}>
            {index + 1}
          </TableCell>
          <TableCell width={'15%'} style={{ whiteSpace: 'pre-line' }}>
            {value.jobStatus.includes('IN_PROGRESS') ? 'In Progress' : ucWords(value.jobStatus)}
          </TableCell>
          <TableCell width={'20%'} style={{ whiteSpace: 'pre-line' }}>
            {format(new Date(value.dateTime), `EEE dd-MM-yyyy,'\n'hh:mm a`)}
          </TableCell>
          <TableCell width={'40%'} style={{ whiteSpace: 'pre-line' }}>
            {value.location ? (
              <Fragment>
                {ucWords(value.location)}
                <Tooltip title='Open Map'>
                  <IconButton href={`https://maps.google.com/?q=${value.location}`} target={'_blank'}>
                    <MarkerIcon color='primary' />
                  </IconButton>
                </Tooltip>
              </Fragment>
            ) : (
              '-'
            )}
          </TableCell>
          <TableCell width={'20%'} style={{ whiteSpace: 'pre-line' }}>
            {value.UserProfile ? value.UserProfile[0].displayName : '-'}
          </TableCell>
        </TableRow>
      ));
    } else {
      return (
        <TableRow>
          <TableCell colSpan={5} style={{ textAlign: 'center' }}>
            There is no job history.
          </TableCell>
        </TableRow>
      );
    }
  };

  return (
    <Grid container spacing={2} className={classes.contentGrid}>
      <Paper variant='outlined' className={classes.paper}>
        <Table>
          <TableHead>
            <HeaderRow
              headers={[
                { id: 'no', label: 'No' },
                { id: 'status', label: 'Status' },
                { id: 'datetime', label: 'Date & Time' },
                { id: 'location', label: 'Location' },
                { id: 'updatedBy', label: 'Updated By' }
              ]}
              height={30}
            />
          </TableHead>
          <TableBody>{renderJobHistories()}</TableBody>
        </Table>
      </Paper>
      <Grid container justify='flex-end' spacing={1}>
        <DialogActions>
          <Button variant='contained' disableElevation onClick={handleClose} style={{ marginTop: 8 }}>
            Close
          </Button>
        </DialogActions>
      </Grid>
    </Grid>
    // <Dialog open={open} scroll='body' fullWidth maxWidth='md'>
    //   <DialogTitle>
    //     <Typography variant='h4' id='modal-title' className={classes.headerModalText}>
    //       Job Histories
    //     </Typography>
    //     <IconButton size='small' className={classes.closeButton} onClick={handleOnClose}>
    //       <CloseIcon />
    //     </IconButton>
    //   </DialogTitle>
    //   <DialogContent>
    //     <Table component='table'>
    //       <TableHead>
    //         <HeaderRow
    //           headers={[
    //             { label: 'No.', verticalAlign: 'top' },
    //             { label: 'Status', verticalAlign: 'top' },
    //             { label: 'Date & Time', verticalAlign: 'top' },
    //             { label: 'Location', verticalAlign: 'top' },
    //             { label: 'Updated By', verticalAlign: 'top' }
    //           ]}
    //         />
    //       </TableHead>
    //       <TableBody>
    //         {jobHistories ? (
    //           jobHistories.length > 0 ? (
    //             jobHistories.map((value, index) => (
    //               <TableRow>
    //                 <CustomTableCell align='left'>{index + 1}.</CustomTableCell>
    //                 <CustomTableCell align='left'>{value.jobStatus}</CustomTableCell>
    //                 <CustomTableCell align='left'>{format(new Date(value.dateTime), 'dd-MM-yyyy HH:mm')}</CustomTableCell>
    //                 <CustomTableCell align='left'>
    //                   {value.location ? (
    //                     <Fragment>
    //                       {value.location}
    //                       <Tooltip title='Open Map'>
    //                         <IconButton href={`https://maps.google.com/?q=${value.location}`} target={'_blank'}>
    //                           <MarkerIcon color='primary' />
    //                         </IconButton>
    //                       </Tooltip>
    //                     </Fragment>
    //                   ) : (
    //                     '-'
    //                   )}
    //                 </CustomTableCell>
    //                 <CustomTableCell align='left'>{value.UserProfile ? value.UserProfile[0].displayName : '-'}</CustomTableCell>
    //               </TableRow>
    //             ))
    //           ) : (
    //             <TableRow>
    //               <CustomTableCell align='center' colSpan={5}>
    //                 No data
    //               </CustomTableCell>
    //             </TableRow>
    //           )
    //         ) : (
    //           <TableRow>
    //             <CustomTableCell align='center' colSpan={5}>
    //               No data
    //             </CustomTableCell>
    //           </TableRow>
    //         )}
    //       </TableBody>
    //     </Table>
    //   </DialogContent>
    //   <DialogButton>
    //     <Grid container item justify='center' xs={12} sm={12} md={12} lg={12} xl={12} className={classes.controlDiv}>
    //       <Button variant='contained' color='secondary' onClick={handleCancel}>
    //         OK
    //       </Button>
    //     </Grid>
    //   </DialogButton>
    // </Dialog>
  );
};

export default HistoryForm;
