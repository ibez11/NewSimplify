import { FC } from 'react';
import { Link, TableCell, TableRow, Tooltip, Typography, makeStyles } from '@material-ui/core';
import { format } from 'date-fns';
import NumberFormat from 'react-number-format';
import Skeleton from 'react-loading-skeleton';

interface Props {
  isLoading: boolean;
  job: InvoiceJobModel[];
}

const useStyles = makeStyles(() => ({
  cellAlignTop: {
    verticalAlign: 'top'
  }
}));

const TableContent: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, job } = props;

  const handleViewJob = (jobId: number) => {
    window.open(`/jobs/${jobId}`, '_blank');
  };

  const renderContent = () => {
    const render = job.map((value, index) => {
      return value.serviceItemsJob.map((serviceItem, serviceItemIndex) => (
        <TableRow key={index}>
          {serviceItemIndex === 0 && (
            <>
              <TableCell width={'5%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? (
                  <Skeleton width={'100%'} />
                ) : (
                  <Tooltip title='View Job Detail'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={() => handleViewJob(value.id)}>
                      <Typography variant='body2'> #{value.id}</Typography>
                    </Link>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell width={'12%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? (
                  <Skeleton width={'100%'} />
                ) : (
                  <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                    {format(new Date(value.startDateTime), `EEE, dd MMM yyyy'\n'hh:mm a`)}
                  </Typography>
                )}
              </TableCell>
            </>
          )}
          <TableCell width={'18%'} className={classes.cellAlignTop}>
            {isLoading ? (
              <Skeleton width={'100%'} />
            ) : (
              <>
                <Typography variant='body2' gutterBottom style={{ whiteSpace: 'pre-line' }}>
                  {serviceItem.name}
                </Typography>
                <Typography variant='caption' color='textSecondary' style={{ whiteSpace: 'pre-line' }}>
                  {serviceItem.description}
                </Typography>
              </>
            )}
          </TableCell>
          <TableCell width={'3%'} align='center' className={classes.cellAlignTop}>
            {isLoading ? <Skeleton width={'100%'} /> : <Typography variant='body2'>{serviceItem.quantity}</Typography>}
          </TableCell>
          <TableCell width={'7%'} className={classes.cellAlignTop}>
            {isLoading ? (
              <Skeleton width={'100%'} />
            ) : (
              <Typography variant='body2'>
                <NumberFormat
                  value={serviceItem.unitPrice}
                  displayType={'text'}
                  thousandSeparator={true}
                  prefix={'$'}
                  decimalScale={2}
                  fixedDecimalScale={true}
                />
              </Typography>
            )}
          </TableCell>
          {serviceItemIndex === 0 && (
            <>
              <TableCell width={'10%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? (
                  <Skeleton width={'100%'} />
                ) : (
                  <Typography variant='body2'>
                    <NumberFormat
                      value={value.jobAmount}
                      displayType={'text'}
                      thousandSeparator={true}
                      prefix={'$'}
                      decimalScale={2}
                      fixedDecimalScale={true}
                    />
                  </Typography>
                )}
              </TableCell>
              <TableCell width={'10%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? (
                  <Skeleton width={'100%'} />
                ) : (
                  <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                    <NumberFormat
                      value={value.collectedAmount}
                      displayType={'text'}
                      thousandSeparator={true}
                      prefix={'$'}
                      decimalScale={2}
                      fixedDecimalScale={true}
                    />
                    {value.collectedBy && `\nby ${value.collectedBy}`}
                  </Typography>
                )}
              </TableCell>
              <TableCell width={'10%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? (
                  <Skeleton width={'100%'} />
                ) : (
                  <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                    {value.paymentMethod ? `${value.paymentMethod} ${value.chequeNumber ? `\n(No. ${value.chequeNumber})` : ''}` : '-'}
                  </Typography>
                )}
              </TableCell>
            </>
          )}
        </TableRow>
      ));
    });

    return render;
  };

  return job.length > 0 ? <>{renderContent()}</> : <></>;
};

export default TableContent;
