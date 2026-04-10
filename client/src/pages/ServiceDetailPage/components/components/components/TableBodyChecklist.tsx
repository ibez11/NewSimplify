import { FC, useEffect, useState } from 'react';
import { Checkbox, FormControlLabel, TableCell, TableRow, Theme, Typography, makeStyles } from '@material-ui/core';
import Skeleton from 'react-loading-skeleton';

interface Props {
  isLoading: boolean;
  Jobs: ServiceJobModel[];
}

const useStyles = makeStyles((theme: Theme) => ({
  cellAlignTop: {
    verticalAlign: 'top'
  },
  noneBorder: {
    borderStyle: 'none'
  }
}));

const TableBodyChecklist: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, Jobs } = props;

  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  useEffect(() => {
    let check = true;
    Jobs.map(value => {
      if (value.ChecklistJob.length > 0) {
        check = false;
      }
      return check;
    });

    setIsEmpty(check);
  }, [Jobs]);

  const renderContent = () => {
    const render = Jobs.map((value, index) => {
      return (
        value.ChecklistJob.length > 0 &&
        value.ChecklistJob.map((checklist, checklistIndex) => (
          <TableRow key={index}>
            {checklistIndex === 0 && (
              <>
                <TableCell width={'5%'} rowSpan={value.ChecklistJob.length} className={classes.cellAlignTop}>
                  {isLoading ? <Skeleton width={'100%'} /> : <Typography variant='body2'>{index + 1}</Typography>}
                </TableCell>
                <TableCell width={'5%'} rowSpan={value.ChecklistJob.length} className={classes.cellAlignTop}>
                  {isLoading ? <Skeleton width={'100%'} /> : <Typography variant='body2'>#{value.id}</Typography>}
                </TableCell>
              </>
            )}
            <TableCell width={'30%'} className={classes.cellAlignTop}>
              {isLoading ? (
                <Skeleton width={'100%'} />
              ) : (
                <>
                  <Typography variant='body2'> {checklist.name}</Typography>
                  <Typography variant='caption' color='textSecondary' style={{ whiteSpace: 'pre-line' }}>
                    {checklist.description}
                  </Typography>
                </>
              )}
            </TableCell>
            <TableCell width={'40%'} className={classes.cellAlignTop}>
              {isLoading ? (
                <Skeleton width={'100%'} />
              ) : checklist.ChecklistItems ? (
                checklist.ChecklistItems.map(item => (
                  <FormControlLabel
                    key={`checklist-item-${index}`}
                    control={<Checkbox name='checkedE' disabled checked={item.status} />}
                    label={item.name}
                    style={{ width: '100%' }}
                  />
                ))
              ) : (
                <Typography variant='body1'>No Item</Typography>
              )}
            </TableCell>
          </TableRow>
        ))
      );
    });

    return render;
  };

  return !isEmpty ? (
    <>{renderContent()}</>
  ) : (
    <>
      {isLoading ? (
        <Skeleton width={'100%'} />
      ) : (
        <TableRow>
          <TableCell align='center' colSpan={4} className={classes.noneBorder}>
            <Typography variant='body2' id='form-subtitle'>
              No Items
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default TableBodyChecklist;
