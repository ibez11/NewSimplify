import { FC } from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import NumberFormat from 'react-number-format';

interface Props {
  invoicesInfo: InvoiceInfoModel;
}

const InformationContent: FC<Props> = props => {
  const { invoicesInfo } = props;
  const {
    invoiceToday,
    valueInvoiceToday,
    invoiceThisWeek,
    valueInvoiceThisWeek,
    invoiceLastMonth,
    valueInvoiceLastMonth,
    unpaidInvoice,
    valueUnpaidInvoice
  } = invoicesInfo;

  const card = (title: string, value: number, secondValue: number) => {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='subtitle2' display='block' gutterBottom>
            {title}
          </Typography>
          <Typography variant='h4' color='secondary' display='block' gutterBottom>
            <NumberFormat value={value} displayType={'text'} prefix={'$'} thousandSeparator decimalScale={2} fixedDecimalScale />
          </Typography>
          <Typography variant='body1' color='textSecondary' display='block'>
            From {secondValue} invoices
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs>
        {card('Invoices Created Today', valueInvoiceToday, invoiceToday)}
      </Grid>
      <Grid item xs>
        {card('Total Value Created This Week', valueInvoiceThisWeek, invoiceThisWeek)}
      </Grid>
      <Grid item xs>
        {card('Total Value Created Last Month', valueInvoiceLastMonth, invoiceLastMonth)}
      </Grid>
      <Grid item xs>
        {card('Total All Unpaid Invoices', valueUnpaidInvoice, unpaidInvoice)}
      </Grid>
    </Grid>
  );
};

export default InformationContent;
