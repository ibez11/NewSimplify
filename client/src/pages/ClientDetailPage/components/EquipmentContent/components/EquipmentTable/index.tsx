import React, { FC, Fragment, useState, useEffect } from 'react';

import { Divider, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import { dummyEquipments } from 'constants/dummy';

import HeaderRow from 'components/HeaderRow';
import TablePagination from 'components/TablePagination';
import ToolBar from './components/ToolBar';
import BodyRow from './components/BodyRow';
import BodyCell from 'components/BodyCell';
import EquipmentDetail from '../EquipmentDetail';
import SideBarContent from 'components/SideBarContent';

interface Props {
  isLoadingData: boolean;
  count: number;
  equipments: EquipmentModel[];
  currentPage: number;
  rowsPerPage: number;
  query: string;
  order: 'asc' | 'desc';
  setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  orderBy: string;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  filterBy: string;
  setFilterBy: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  serviceAddressMaster: Select[];
  serviceAddressFilter: ColumnFilter[];
  setServiceAddressFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedSubEquipmentIndex?: number;
  setSelectedSubEquipmentIndex: React.Dispatch<React.SetStateAction<number>>;
  setOpenForm: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddSub: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  isMain: boolean;
  setIsMain: React.Dispatch<React.SetStateAction<boolean>>;
  updateIndividualEquipment: (equipmentIndex: number) => (updatedEquipmentProperties: Partial<EquipmentModel>) => void;
  csv: CSVEquipmentModel[];
  isExportingData: boolean;
  handleCsvClick: () => void;
}

const EquipmentTable: FC<Props> = props => {
  const {
    isLoadingData,
    count,
    equipments,
    currentPage,
    rowsPerPage,
    query,
    setQuery,
    filterBy,
    setFilterBy,
    serviceAddressMaster,
    serviceAddressFilter,
    setServiceAddressFilter,
    handleChangeRowsPerPage,
    handleChangePage,
    handleSnackbar,
    selectedIndex,
    setSelectedIndex,
    selectedSubEquipmentIndex,
    setSelectedSubEquipmentIndex,
    setOpenForm,
    setIsAddSub,
    setIsEdit,
    isMain,
    setIsMain,
    updateIndividualEquipment
  } = props;

  const { order, setOrder, orderBy, setOrderBy } = props;
  const { startDate, setStartDate } = props;
  const { endDate, setEndDate } = props;
  const { csv, isExportingData, handleCsvClick } = props;

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isLoadingData) {
      setShowSkeleton(true);
    }

    return () => {
      setShowSkeleton(false);
    };
  }, [isLoadingData]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Fragment>
      <ToolBar
        query={query}
        setQuery={setQuery}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        serviceAddressMaster={serviceAddressMaster}
        serviceAddressFilter={serviceAddressFilter}
        setServiceAddressFilter={setServiceAddressFilter}
        csv={csv}
        isExportingData={isExportingData}
        handleCsvClick={handleCsvClick}
      />
      <Divider style={{ marginTop: 16 }} />
      <Table>
        <TableHead>
          <HeaderRow
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            headers={[
              { id: '', label: '', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'id', label: 'ID', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'description', label: 'ID', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'brand', label: 'Brand', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'model', label: 'Model', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'serialNumber', label: 'Serial Number', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'serviceAddress', label: 'Service Address', sort: false, pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'location', label: 'Location', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'dateWorkDone', label: 'Last Date Work Done', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'updatedBy', label: 'Last Updated By', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'warrantyDate', label: 'Warranty Date', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { id: 'isActive', label: 'Status', pL: '10px', pR: '10px', verticalAlign: 'top' },
              { label: 'Action', pL: '10px', pR: '10px', verticalAlign: 'top' }
            ]}
          />
        </TableHead>
        <TableBody>
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map(index => (
              <BodyRow
                key={index}
                index={index}
                equipment={dummyEquipments}
                isLoadingData={showSkeleton}
                handleSnackbar={handleSnackbar}
                setSelectedIndex={setSelectedIndex}
                setSelectedSubEquipmentIndex={setSelectedSubEquipmentIndex}
                setOpenForm={setOpenForm}
                setIsAddSub={setIsAddSub}
                setIsEdit={setIsEdit}
                setIsMain={setIsMain}
                updatedIndividualEquipment={updateIndividualEquipment(index)}
                setOpen={setOpen}
              />
            ))
          ) : equipments.length > 0 ? (
            equipments.map((equipment, index) => (
              <BodyRow
                key={equipment.id}
                index={index}
                equipment={equipment}
                isLoadingData={showSkeleton}
                handleSnackbar={handleSnackbar}
                setSelectedIndex={setSelectedIndex}
                setSelectedSubEquipmentIndex={setSelectedSubEquipmentIndex}
                setOpenForm={setOpenForm}
                setIsAddSub={setIsAddSub}
                setIsEdit={setIsEdit}
                setIsMain={setIsMain}
                updatedIndividualEquipment={updateIndividualEquipment(index)}
                setOpen={setOpen}
              />
            ))
          ) : (
            <TableRow>
              <BodyCell colSpan={10}>
                <Typography variant='body2' style={{ textAlign: 'center' }}>
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
      <SideBarContent title='Work History' open={open} onClickDrawer={() => setOpen(false)} width='55%'>
        <EquipmentDetail
          equipment={
            isMain
              ? equipments[selectedIndex]
              : {
                  ...(equipments[selectedIndex].SubEquipments?.[selectedSubEquipmentIndex!] ?? dummyEquipments),
                  address: equipments[selectedIndex].address // ✅ inherit address from main
                }
          }
          isMain={isMain}
        />
      </SideBarContent>
    </Fragment>
  );
};

export default EquipmentTable;
