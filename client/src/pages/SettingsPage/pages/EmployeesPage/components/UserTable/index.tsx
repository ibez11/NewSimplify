import React, { FC, useState, useEffect } from 'react';
import { Table, TableBody, TableHead, TableFooter, TableRow, TablePagination, Typography } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import { dummyUser } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  users: UserDetailsModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  updateIndividualUser: (userIndex: number) => (updatedUserProperties: Partial<UserDetailsModel>) => void;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleOpenEditUser: (userIndex: number) => React.MouseEventHandler;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const UserTable: FC<Props> = props => {
  const {
    isLoadingData,
    users,
    count,
    currentPage,
    rowsPerPage,
    updateIndividualUser,
    handleChangeRowsPerPage,
    handleChangePage,
    handleOpenEditUser,
    handleSnackbar
  } = props;

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

  return (
    <Table>
      <TableHead>
        <HeaderRow
          headers={[
            { label: 'Name', verticalAlign: 'top' },
            { label: 'Contact Number & Email Address', verticalAlign: 'top' },
            { label: 'Home District & Postal Code', verticalAlign: 'top' },
            { label: 'Skill', verticalAlign: 'top' },
            { label: 'Status', verticalAlign: 'top' },
            { label: 'Action', verticalAlign: 'top' }
          ]}
        />
      </TableHead>
      <TableBody>
        {showSkeleton ? (
          [1, 2, 3, 4, 5].map(index => (
            <BodyRow
              key={index}
              user={dummyUser}
              updateUser={updateIndividualUser(index)}
              onEditUser={handleOpenEditUser(index)}
              isLoadingData={showSkeleton}
              handleSnackbar={handleSnackbar}
            />
          ))
        ) : users.length > 0 ? (
          users.map((user, index) => (
            <BodyRow
              key={user.id}
              user={user}
              updateUser={updateIndividualUser(index)}
              onEditUser={handleOpenEditUser(index)}
              isLoadingData={showSkeleton}
              handleSnackbar={handleSnackbar}
            />
          ))
        ) : (
          <TableRow>
            <BodyCell colSpan={6}>
              <Typography variant='body2' color='textSecondary' style={{ textAlign: 'center' }}>
                No matching result
              </Typography>
            </BodyCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            rowsPerPageOptions={[5, 10, 15]}
            colSpan={6}
            count={count}
            rowsPerPage={rowsPerPage}
            page={currentPage}
            SelectProps={{
              inputProps: { 'aria-label': 'Rows per page' },
              native: true
            }}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default UserTable;
