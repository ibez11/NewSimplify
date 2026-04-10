import React, { FC } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';
import { dummyVehicle } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  vehicles: VehicleModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleOpenEditVehicle: (vehicleIndex: number) => React.MouseEventHandler;
  addNewVehicle(vehicle: VehicleModel): void;
  updateIndividualVehicle: (vehicleIndex: number) => (updatedVehicleProperties: Partial<VehicleModel>) => void;
  deleteIndividualVehicle: (vehicleIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const VehicleTable: FC<Props> = props => {
  const classes = useStyles();

  const {
    isLoadingData,
    vehicles,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenEditVehicle,
    updateIndividualVehicle,
    deleteIndividualVehicle,
    handleSnackbar
  } = props;

  // headerNameWithPaddings['headerName:pL:pR:pT:pB']
  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow
            headers={[
              { label: 'Vehicle Number', pR: '10px', verticalAlign: 'top' },
              { label: 'Type & Make', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { label: 'Coe Expiry Date', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { label: 'Employee In Charge', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { label: 'Status', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { label: 'Action', pL: '120px', verticalAlign: 'top' }
            ]}
          />
        </TableHead>
        <TableBody>
          {isLoadingData ? (
            [1, 2, 3, 4, 5, 6].map(index => (
              <BodyRow
                key={index}
                vehicle={dummyVehicle}
                deleteIndividualVehicle={deleteIndividualVehicle}
                onEditVehicle={handleOpenEditVehicle(index)}
                updateVehicle={updateIndividualVehicle(index)}
                isLoadingData={isLoadingData}
                handleSnackbar={handleSnackbar}
              />
            ))
          ) : vehicles.length > 0 ? (
            vehicles.map((vehicle, index) => (
              <BodyRow
                key={vehicle.id}
                vehicle={vehicle}
                deleteIndividualVehicle={deleteIndividualVehicle}
                onEditVehicle={handleOpenEditVehicle(index)}
                updateVehicle={updateIndividualVehicle(index)}
                isLoadingData={isLoadingData}
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

export default VehicleTable;
