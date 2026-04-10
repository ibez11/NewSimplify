import { FC } from 'react';
import { Chip, Link, TableCell, TableRow, Theme, Tooltip, Typography, makeStyles } from '@material-ui/core';
import { format } from 'date-fns';
import NumberFormat from 'react-number-format';
import Skeleton from 'react-loading-skeleton';
import { ucWords } from 'utils';

interface Props {
  isLoading: boolean;
  Jobs: ServiceJobModel[];
}

const useStyles = makeStyles((theme: Theme) => ({
  cellAlignTop: {
    verticalAlign: 'top'
  },
  chip: {
    borderRadius: 50,
    padding: theme.spacing(1)
  },
  unassignedColor: {
    backgroundColor: theme.palette.unassigned.main,
    color: theme.palette.unassigned.contrastText
  },
  confirmedColor: {
    backgroundColor: theme.palette.confirmed.main,
    color: theme.palette.confirmed.contrastText
  },
  assignedColor: {
    backgroundColor: theme.palette.assigned.main,
    color: theme.palette.assigned.contrastText
  },
  inprogressColor: {
    backgroundColor: theme.palette.inProgress.main,
    color: theme.palette.inProgress.contrastText
  },
  pausedColor: {
    backgroundColor: theme.palette.paused.main,
    color: theme.palette.paused.contrastText
  },
  completedColor: {
    backgroundColor: theme.palette.completed.main,
    color: theme.palette.completed.contrastText
  },
  cancelledColor: {
    backgroundColor: theme.palette.cancelled.main,
    color: theme.palette.cancelled.contrastText
  }
}));

const TableBodySchedule: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, Jobs } = props;

  const handleViewJob = (jobId: number) => {
    window.open(`/jobs/${jobId}`, '_blank');
  };

  const renderContent = () => {
    const render = Jobs.map((value, index) => {
      return value.serviceItemsJob.map((serviceItem, serviceItemIndex) => (
        <TableRow key={index}>
          {serviceItemIndex === 0 && (
            <>
              <TableCell width={'5%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? <Skeleton width={'100%'} /> : <Typography variant='body2'>{index + 1}</Typography>}
              </TableCell>
              <TableCell width={'7%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
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
              <TableCell width={'15%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? (
                  <Skeleton width={'100%'} />
                ) : (
                  <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                    {`${format(new Date(value.startDateTime), `EEE, dd MMM yyyy hh:mm a`)} - \n${format(
                      new Date(value.endDateTime),
                      `EEE, dd MMM yyyy hh:mm a`
                    )} `}
                  </Typography>
                )}
              </TableCell>
            </>
          )}
          <TableCell width={'25%'} className={classes.cellAlignTop}>
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
              <TableCell width={'8%'} rowSpan={value.serviceItemsJob.length} className={classes.cellAlignTop}>
                {isLoading ? (
                  <Skeleton width={'100%'} />
                ) : (
                  <Typography variant='body2' align='right'>
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
                  <Skeleton width={100} />
                ) : (
                  <Chip
                    key={`${value.jobStatus}-${index}`}
                    label={ucWords(value.jobStatus.replace('_', ' '))}
                    className={`${classes.chip} ${
                      value.jobStatus === 'COMPLETED'
                        ? classes.completedColor
                        : value.jobStatus === 'ASSIGNED'
                        ? classes.assignedColor
                        : value.jobStatus === 'IN_PROGRESS'
                        ? classes.inprogressColor
                        : value.jobStatus === 'PAUSED'
                        ? classes.pausedColor
                        : value.jobStatus === 'CONFIRMED'
                        ? classes.confirmedColor
                        : value.jobStatus === 'CANCELLED'
                        ? classes.cancelledColor
                        : classes.unassignedColor
                    }`}
                    style={{ width: '100%' }}
                  />
                )}
              </TableCell>
            </>
          )}
        </TableRow>
      ));
    });

    return render;
  };

  return Jobs.length > 0 ? <>{renderContent()} </> : <></>;
};

export default TableBodySchedule;
