import React, { FC, useEffect, useState } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';

import HeaderRow from 'components/HeaderRow';
import BodyRow from './components/BodyRow';
import BodyCell from 'components/BodyCell';
import TablePagination from 'components/TablePagination';
import { dummyAppLog } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  appLogs: AppLogModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const AppLogTable: FC<Props> = props => {
  const classes = useStyles();

  const { isLoadingData, appLogs, count, currentPage, rowsPerPage, handleChangePage, handleChangeRowsPerPage } = props;

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  useEffect(() => {
    if (isLoadingData) {
      setShowSkeleton(true);
    }

    return () => {
      setShowSkeleton(false);
    };
  }, [isLoadingData]);

  // headerNameWithPaddings['headerName:pL:pR:pT:pB']
  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow headers={[{ label: 'User' }, { label: 'Description' }, { label: 'Time' }]} />
        </TableHead>
        <TableBody>
          {isLoadingData ? (
            [1, 2, 3, 4, 5].map(index => <BodyRow index={index} key={index} appLog={dummyAppLog} isLoadingData={showSkeleton} />)
          ) : appLogs.length > 0 ? (
            appLogs.map((appLog, index) => <BodyRow index={index} key={appLog.id} appLog={appLog} isLoadingData={showSkeleton} />)
          ) : (
            <TableRow>
              <BodyCell colSpan={3}>
                <Typography variant='body2' color='textSecondary' style={{ textAlign: 'center' }}>
                  No matching result
                </Typography>
              </BodyCell>
            </TableRow>
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          count={count}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Table>
    </div>
  );
};

export default AppLogTable;
