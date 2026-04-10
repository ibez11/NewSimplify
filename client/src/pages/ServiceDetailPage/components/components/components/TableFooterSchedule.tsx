import { FC } from 'react';
import { Grid, TableCell, TableRow, Typography } from '@material-ui/core';

import Skeleton from '@material-ui/lab/Skeleton';
import NumberFormat from 'react-number-format';

interface Props {
  isLoading: boolean;
  service: ServiceDetailModel;
}
const TableFooter: FC<Props> = props => {
  const { isLoading, service } = props;
  const { contractAmount, contractDiscount, totalAmount, gstTax, gstAmount, grandTotal } = service;

  const renderFooter = (title: string, value: any, isDiscount?: boolean) => {
    return (
      <>
        <Grid item container justify='flex-end' xs={11}>
          <Typography variant='body1'>{title}</Typography>
        </Grid>
        <Grid item container justify='flex-end' xs={1}>
          {isLoading ? (
            <Skeleton width={100} />
          ) : (
            <Typography variant='body1' color={isDiscount ? 'error' : 'initial'}>
              {isDiscount && '-'}
              <NumberFormat value={value || 0} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
            </Typography>
          )}
        </Grid>
      </>
    );
  };

  return (
    <TableRow>
      <TableCell colSpan={7} style={{ borderStyle: 'none' }}>
        <Grid container spacing={1}>
          {renderFooter('Quotation Amount', contractAmount)}
          {renderFooter('Quotation Discount', contractDiscount, true)}
          {renderFooter('Total Amount', totalAmount)}
          {renderFooter(`GST ${gstTax}%`, gstAmount)}
          {renderFooter('Grand Total', grandTotal)}
        </Grid>
      </TableCell>
    </TableRow>
  );
};
export default TableFooter;
