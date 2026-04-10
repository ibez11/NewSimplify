import { Chip, Grid, Link, Theme, Tooltip, Typography, makeStyles } from '@material-ui/core';
import { FC } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import theme from 'theme';
import { format } from 'date-fns';

interface Props {
  isLoading: boolean;
  invoice: InvoiceDetailModel;
}

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    borderRadius: 50,
    padding: theme.spacing(1)
  }
}));

const InvoiceInfo: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, invoice } = props;
  const { Client, invoiceStatus, invoiceNumber, invoiceDate, termEnd, dueDate, contractId, invoiceRemarks, attnTo } = invoice;
  const { name, billingAddress, ContactPersons } = Client;

  const handleViewContract = () => {
    window.open(`/quotations/${contractId}`, '_blank');
  };

  return (
    <Grid container spacing={1} style={{ padding: 16 }}>
      <Grid item container xs={12}>
        <Grid item xs={6}>
          <Typography variant='h5'>Bill to</Typography>
        </Grid>
        <Grid item xs={6} container justify='flex-end'>
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            <Chip
              key={invoiceStatus}
              label={invoiceStatus}
              size='medium'
              className={classes.chip}
              style={{
                color:
                  invoiceStatus === 'FULLY PAID'
                    ? theme.palette.success.main
                    : invoiceStatus === 'PARTIALLY PAID'
                    ? theme.palette.secondary.main
                    : theme.palette.error.main,
                background:
                  invoiceStatus === 'FULLY PAID'
                    ? theme.palette.success.light
                    : invoiceStatus === 'PARTIALLY PAID'
                    ? theme.palette.secondary.light
                    : theme.palette.error.light
              }}
            />
          )}
        </Grid>
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={12} md={8}>
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            <>
              <Typography variant='h4' gutterBottom>
                {name}
              </Typography>
              <Typography variant='body1' gutterBottom>
                {billingAddress}
              </Typography>
              <Typography variant='body1' gutterBottom>
                Contact Person: {ContactPersons[0].contactPerson}
              </Typography>
              <Typography variant='body1' gutterBottom>
                Contact Number: {ContactPersons[0].countryCode}
                {ContactPersons[0].contactNumber}
              </Typography>
              <Typography variant='body1' gutterBottom>
                Contact Email: {ContactPersons[0].contactEmail}
              </Typography>
            </>
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          <Grid container>
            {isLoading ? (
              <Skeleton width={'100%'} />
            ) : (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' gutterBottom>
                    Invoice Number
                  </Typography>
                </Grid>
                <Grid item container justify='flex-end' xs={12} md={6}>
                  <Typography variant='body1' gutterBottom>
                    {invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' gutterBottom>
                    Invoice Date
                  </Typography>
                </Grid>
                <Grid item container justify='flex-end' xs={12} md={6}>
                  <Typography variant='body1' gutterBottom>
                    {format(new Date(invoiceDate), 'dd MMM yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' gutterBottom>
                    Term End
                  </Typography>
                </Grid>
                <Grid item container justify='flex-end' xs={12} md={6}>
                  <Typography variant='body1' gutterBottom>
                    {format(termEnd ? new Date(termEnd) : new Date(), 'dd MMM yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' gutterBottom>
                    Due Date
                  </Typography>
                </Grid>
                <Grid item container justify='flex-end' xs={12} md={6}>
                  <Typography variant='body1' gutterBottom>
                    {dueDate}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' gutterBottom>
                    Attention to
                  </Typography>
                </Grid>
                <Grid item container justify='flex-end' xs={12} md={6}>
                  <Typography variant='body1' gutterBottom>
                    {attnTo || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' gutterBottom>
                    Quotation Reference
                  </Typography>
                </Grid>
                <Grid item container justify='flex-end' xs={12} md={6}>
                  <Tooltip title='View Quotation Detail'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewContract}>
                      <Typography variant='body1' gutterBottom>
                        #{contractId}
                      </Typography>
                    </Link>
                  </Tooltip>
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item container xs={12}>
        <Grid item xs={12}>
          <Typography variant='subtitle1' gutterBottom>
            Remarks
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='body1' gutterBottom style={{ whiteSpace: 'pre-line' }}>
            {invoiceRemarks}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default InvoiceInfo;
