import { FC } from 'react';
import { Grid, TableCell, TableRow, Typography } from '@material-ui/core';

import Skeleton from '@material-ui/lab/Skeleton';
import NumberFormat from 'react-number-format';

interface Props {
  isLoading: boolean;
  invoice: InvoiceDetailModel;
}

const TableFooter: FC<Props> = props => {
  const { isLoading, invoice } = props;
  const { contractAmount, contractDiscount, gstTax, gst, totalCollectedAmount, totalOutstandingAmount } = invoice;

  const totalAmount = contractAmount - contractDiscount;
  const grandTotal = contractAmount - contractDiscount + gst;

  return (
    <TableRow>
      <TableCell colSpan={8} style={{ borderStyle: 'none' }}>
        <Grid container spacing={1}>
          <Grid item container justify='flex-end' xs={10}>
            <Typography variant='body1'>Quotation Amount</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='body1'>
                <NumberFormat
                  value={contractAmount}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </Grid>
          <Grid item container justify='flex-end' xs={10}>
            <Typography variant='body1'>Quotation Discount</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='body1' color='error'>
                -
                <NumberFormat
                  value={contractDiscount}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </Grid>
          <Grid item container justify='flex-end' xs={10}>
            <Typography variant='body1'>Total Amount</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='body1'>
                <NumberFormat
                  value={totalAmount}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </Grid>
          <Grid item container justify='flex-end' xs={10}>
            <Typography variant='body1'>GST {gstTax}%</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='body1'>
                <NumberFormat value={gst} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
              </Typography>
            )}
          </Grid>
          <Grid item container justify='flex-end' xs={10}>
            <Typography variant='subtitle2'>Grand Total</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='subtitle2'>
                <NumberFormat
                  value={grandTotal}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </Grid>
          <Grid item container justify='flex-end' xs={10}>
            <Typography variant='subtitle2'>Total Collected</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='subtitle2'>
                <NumberFormat
                  value={totalCollectedAmount}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </Grid>
          <Grid item container justify='flex-end' xs={10}>
            <Typography variant='subtitle2'>Total Outstanding</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={2}>
            {isLoading ? (
              <Skeleton width={100} />
            ) : (
              <Typography variant='subtitle2'>
                <NumberFormat
                  value={totalOutstandingAmount}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </Grid>
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default TableFooter;
