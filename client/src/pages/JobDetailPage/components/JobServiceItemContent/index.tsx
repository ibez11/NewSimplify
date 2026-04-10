import { FC } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
  makeStyles
} from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';
import BodyRow from './components/BodyRow';
import NumberFormat from 'react-number-format';
import Skeleton from 'react-loading-skeleton';
import EditIcon from '@material-ui/icons/Edit';

interface Props {
  isLoading: boolean;
  isEditable: boolean;
  job: JobDetailModel;
  serviceItems: ServiceItemModel[];
  additionalServiceItems: ServiceItemModel[];
  handleOpenEditServiceItem(): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: 10
  },
  cardHeader: {
    padding: theme.spacing(2)
  },
  noneBorder: {
    borderStyle: 'none'
  },
  border: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

const JobServiceItemContent: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, isEditable, job, serviceItems, additionalServiceItems, handleOpenEditServiceItem } = props;

  const {
    jobAmount,
    jobCollectedAmount,
    jobDiscountAmount,
    gstTax,
    gstAmount,
    additionalJobAmount,
    additionalDiscountAmount,
    additionalGstTax,
    additionalGstAmount,
    totalAmount,
    additionalTotalAmount,
    contractCollectedAmount,
    contractOutstandingAmount,
    additionalCollectedAmount,
    additionalOutstandingAmount
  } = job;

  const isHaveAdditional = additionalServiceItems && additionalServiceItems.length > 0 ? true : false;

  const renderServiceItems = () => {
    return serviceItems.map((value, index) => <BodyRow key={value.id} isLoading={isLoading} index={index} item={value} />);
  };

  const renderAdditonalServiceItems = () => {
    return additionalServiceItems.map((value, index) => (
      <BodyRow key={value.id} isLoading={isLoading} index={index} item={value} isAdditional={true} />
    ));
  };

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
            <Typography variant='body1' color={isDiscount ? 'error' : 'initial'} style={{ whiteSpace: 'pre-line' }}>
              {isDiscount && '-'}
              <NumberFormat value={value || 0} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
            </Typography>
          )}
        </Grid>
      </>
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card variant='outlined' className={classes.card}>
          <CardHeader
            className={classes.cardHeader}
            title={
              <Grid container direction='row' justify='space-between' alignItems='center'>
                <Typography variant='h5'>Service Items</Typography>
                <Tooltip title={!isEditable ? 'Cannot edit because quotation is cancelled' : ''}>
                  <span style={{ cursor: !isEditable ? 'not-allowed' : 'default' }}>
                    <Button color='primary' disabled={isLoading || !isEditable} startIcon={<EditIcon />} onClick={handleOpenEditServiceItem}>
                      Edit Service Items
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
            }
          />
          <Divider />
          <CardContent style={{ padding: 0 }}>
            <Table component='table'>
              <TableHead>
                <HeaderRow
                  headers={[
                    { label: '', verticalAlign: 'top' },
                    { label: 'Item & Description', verticalAlign: 'top' },
                    { label: 'Qty', verticalAlign: 'top' },
                    { label: 'Price', verticalAlign: 'top' },
                    { label: 'Amount', verticalAlign: 'top', textAlign: 'center' }
                  ]}
                />
              </TableHead>
              <TableBody>
                {renderServiceItems()}
                {isHaveAdditional && renderAdditonalServiceItems()}
                <TableRow>
                  <TableCell colSpan={6} className={classes.noneBorder}>
                    <Grid container spacing={1}>
                      {renderFooter('Job Amount', jobAmount)}
                      {renderFooter('Discount', jobDiscountAmount, true)}
                      {renderFooter(`GST ${gstTax}%`, gstAmount)}
                      {isHaveAdditional && (
                        <>
                          {renderFooter('Additional Amount', additionalJobAmount)}
                          {renderFooter('Additional Discount', additionalDiscountAmount, true)}
                          {renderFooter(`Additional GST ${additionalGstTax}%`, additionalGstAmount)}
                        </>
                      )}
                      {renderFooter('Total Amount', totalAmount + additionalTotalAmount)}
                      {renderFooter('Total Amount Collected this Job', jobCollectedAmount + additionalCollectedAmount, false)}
                      {renderFooter('Total Amount Collected this Quotation/Invoice', contractCollectedAmount + additionalCollectedAmount)}
                      <Grid item container justify='flex-end' xs={11}>
                        <Typography variant='subtitle2'>Amount Outstanding</Typography>
                      </Grid>
                      <Grid item container justify='flex-end' xs={1}>
                        {isLoading ? (
                          <Skeleton width={100} />
                        ) : (
                          <Typography variant='subtitle2'>
                            <NumberFormat
                              value={contractOutstandingAmount + additionalOutstandingAmount || 0}
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
export default JobServiceItemContent;
