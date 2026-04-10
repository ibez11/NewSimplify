import React, { FC, useState, useEffect } from 'react';
import { Table, TableBody, TableHead, TableFooter, TableRow, TablePagination, Typography } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import { dummySecurityRoles } from 'constants/dummy';
// import BodyRow from './components/BodyRow';

interface Props {
  isLoadingData: boolean;
  securityRoles: SecurityRolesModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  //   updateIndividualUser: (userIndex: number) => (updatedUserProperties: Partial<UserDetailsModel>) => void;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleOpenEditSecurityRole: (index: number) => React.MouseEventHandler;
}

const SecurityRoleTable: FC<Props> = props => {
  const {
    isLoadingData,
    securityRoles,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenEditSecurityRole
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
            { label: 'Role Name', verticalAlign: 'top' },
            { label: 'Description', verticalAlign: 'top' },
            { label: 'Action', verticalAlign: 'top', textAlign: 'center' }
          ]}
        />
      </TableHead>
      <TableBody>
        {showSkeleton ? (
          [1, 2, 3, 4, 5].map(index => (
            <BodyRow
              key={index}
              securityRole={dummySecurityRoles}
              //   updateUser={updateIndividualUser(index)}
              onEditSecurityRole={handleOpenEditSecurityRole(index)}
              isLoadingData={showSkeleton}
            />
          ))
        ) : securityRoles.length > 0 ? (
          securityRoles.map((role, index) => (
            <BodyRow
              key={role.id}
              securityRole={role}
              //   updateUser={updateIndividualUser(index)}
              onEditSecurityRole={handleOpenEditSecurityRole(index)}
              isLoadingData={showSkeleton}
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
            colSpan={3}
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

export default SecurityRoleTable;
