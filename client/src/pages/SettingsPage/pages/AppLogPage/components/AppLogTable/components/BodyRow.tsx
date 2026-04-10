import { FC } from 'react';
import { makeStyles, TableRow, Theme, Typography } from '@material-ui/core';
import Skeleton from 'react-loading-skeleton';
import BodyCell from 'components/BodyCell';
import { format } from 'date-fns';

interface Props {
  isLoadingData: boolean;
  appLog: AppLogModel;
  index: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    height: 64
  },
  tableCellInner: {
    display: 'flex',
    alignItems: 'center'
  },
  nameTextCell: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: theme.spacing(2)
  },
  textCenter: {
    textAlign: 'center'
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoadingData, appLog } = props;

  const { user, description, createdAt } = appLog;

  return (
    <TableRow className={classes.tableRow}>
      <BodyCell cellWidth='30%' isComponent={true}>
        <div className={classes.tableCellInner}>
          <div className={classes.nameTextCell}>
            <Typography variant='body1'>{isLoadingData ? <Skeleton width={150} /> : user}</Typography>
          </div>
        </div>
      </BodyCell>
      <BodyCell cellWidth='30%'>
        <div className={classes.tableCellInner}>
          <div className={classes.nameTextCell}>
            <Typography variant='body1'>{isLoadingData ? <Skeleton width={150} /> : description}</Typography>
          </div>
        </div>
      </BodyCell>
      <BodyCell cellWidth='30%'>
        <div className={classes.tableCellInner}>
          <div className={classes.nameTextCell}>
            <Typography variant='body1'>
              {isLoadingData ? <Skeleton width={150} /> : format(new Date(createdAt), 'EEE, dd-MM-yyyy | hh:mm:ss a')}
            </Typography>
          </div>
        </div>
      </BodyCell>
    </TableRow>
  );
};

export default BodyRow;
