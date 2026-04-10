import { FC } from 'react';
import { Chip, Divider, Grid, Paper, Theme, Typography, makeStyles } from '@material-ui/core';
import theme from 'theme';
import { format } from 'date-fns';

interface Props {
  isLoading: boolean;
  invoiceHistory: InvoiceHistoryModel[];
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(1.5)
  },
  chip: {
    borderRadius: 50,
    padding: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(0.5)
  }
}));

const InvoiceTracker: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, invoiceHistory } = props;

  return (
    <Paper variant='outlined' className={classes.root}>
      <Grid style={{ marginBottom: theme.spacing(3) }}>
        <Typography variant='h5' gutterBottom>
          Invoice Tracker
        </Typography>
      </Grid>
      <Grid style={{ flexGrow: 1, overflowY: 'scroll', overflowX: 'hidden', height: 700, maxHeight: 700 }}>
        {!isLoading &&
          invoiceHistory.length > 0 &&
          invoiceHistory.map((value, index) => (
            <div>
              <Grid container spacing={1}>
                <Grid container xs={12} style={{ marginBottom: theme.spacing(1) }}>
                  <Grid item xs={12} md={4}>
                    <Chip
                      key={`${value.label}-${index}`}
                      label={value.label}
                      size='small'
                      className={classes.chip}
                      style={{
                        color:
                          value.label === 'FULLY PAID'
                            ? theme.palette.success.main
                            : value.label === 'PARTIALLY PAID'
                            ? theme.palette.secondary.main
                            : value.label === 'UNPAID'
                            ? theme.palette.error.main
                            : theme.palette.primary.main,
                        background:
                          value.label === 'FULLY PAID'
                            ? theme.palette.success.light
                            : value.label === 'PARTIALLY PAID'
                            ? theme.palette.secondary.light
                            : value.label === 'UNPAID'
                            ? theme.palette.error.light
                            : theme.palette.primary.light
                      }}
                    />
                  </Grid>
                  <Grid item container justify='flex-end' xs={12} md={8} style={{ marginTop: theme.spacing(1), paddingRight: theme.spacing(1) }}>
                    <Typography variant='body1' color='textSecondary'>
                      {format(new Date(value.createdAt), 'dd MMM yyyy, hh:mm a')}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={12}>
                  <Typography variant='body1'>{value.description}</Typography>
                </Grid>
              </Grid>
              {index !== invoiceHistory.length - 1 && <Divider style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(2) }} />}
            </div>
          ))}
      </Grid>
    </Paper>
  );
};

export default InvoiceTracker;
