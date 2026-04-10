import { FC } from 'react';
import { Card, Divider, Grid, Theme, makeStyles } from '@material-ui/core';
import InvoiceTracker from './components/InvoiceTracker';
import InvoiceInfo from './components/InvoiceInfo';
import InvoiceJob from './components/InvoiceJob';

interface Props {
  isLoading: boolean;
  invoice: InvoiceDetailModel;
}

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    height: 3
  },
  mainContent: {
    paddingRight: theme.spacing(3)
  }
}));

const Content: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, invoice } = props;
  const { InvoiceHistory } = invoice;

  return (
    <Grid item container>
      <Grid item xs={12} md={9} className={classes.mainContent}>
        <Card variant='outlined'>
          <InvoiceInfo isLoading={isLoading} invoice={invoice} />
          <Divider className={classes.divider} />
          <InvoiceJob isLoading={isLoading} invoice={invoice} />
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <InvoiceTracker isLoading={isLoading} invoiceHistory={InvoiceHistory} />
      </Grid>
    </Grid>
  );
};

export default Content;
