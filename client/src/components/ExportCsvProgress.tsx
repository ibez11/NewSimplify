import { FC } from 'react';

import { Box, Grid, LinearProgress, LinearProgressProps, makeStyles, Modal, Paper, Theme, Typography } from '@material-ui/core';

interface Props {
  open: boolean;
  progress: number;
}

const LinearProgressWithLabel = (props: LinearProgressProps & { value: number }) => {
  return (
    <Box display='flex' alignItems='center'>
      <Box width='100%' mr={1}>
        <LinearProgress variant='determinate' {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant='body2' color='textSecondary'>{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    outline: 'none',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 4,
    width: 700
  },
  headerFlex: {
    display: 'flex'
  },
  otherTextCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  marginBottom: {
    marginBottom: theme.spacing(2)
  }
}));

const ExportCsvProgress: FC<Props> = props => {
  const classes = useStyles();
  const { open, progress } = props;

  return (
    <Modal aria-labelledby='modal-title' open={open} disableBackdropClick={true}>
      <Paper className={classes.paper}>
        <Grid container spacing={2} className={classes.marginBottom}>
          <Grid item xs={12}>
            <Grid container direction='row' justify='center' alignItems='center'>
              <div className={classes.headerFlex}>
                <div className={classes.otherTextCell}>
                  <Typography variant='h5' style={{ textAlign: 'center' }}>
                    Export Progress
                  </Typography>
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='body1'>Please Wait...</Typography>
          </Grid>
          <Grid item xs={12}>
            <LinearProgressWithLabel value={progress} />
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default ExportCsvProgress;
