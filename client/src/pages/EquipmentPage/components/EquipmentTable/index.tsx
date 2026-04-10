import React, { FC, useState, useEffect, Fragment } from 'react';
import { Divider, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import TablePagination from 'components/TablePagination';
import ToolBar from './components/ToolBar';
import BodyRow from './components/BodyRow';
import { dummyEquipments } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  equipments: EquipmentModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  order: 'asc' | 'desc';
  orderBy: string;
  query: string;
  brandMaster: Select[];
  brandFilter: ColumnFilter[];
  serviceAddressFilter: ColumnFilter[];
  selectedIndex: number;
  selectedSubEquipmentIndex?: number;
  isMain: boolean;
  column: any[];
  tableSettingId: number;
  csv: CSVEquipmentModel[];
  isExportingData: boolean;
  isSearchingClient: boolean;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setOrder: React.Dispatch<React.SetStateAction<'asc' | 'desc'>>;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  setBrandFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  setServiceAddressFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedSubEquipmentIndex: React.Dispatch<React.SetStateAction<number>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsForm: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddSub: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMain: React.Dispatch<React.SetStateAction<boolean>>;
  updateIndividualEquipment: (equipmentIndex: number) => (updatedEquipmentProperties: Partial<EquipmentModel>) => void;
  setColumn: React.Dispatch<React.SetStateAction<any[]>>;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleCsvClick: () => void;
  getClientName: (name: string) => Promise<ClientOption[]>;
  setClientId: React.Dispatch<React.SetStateAction<number>>;
  getServiceAddresses: (clientId: number) => Promise<Select[]>;

  //   handleViewEquipment: (equipmentId: number) => React.MouseEventHandler;
  //   handleDeleteEquipment: (equipmentId: number) => React.MouseEventHandler;
}

const EquipmentTable: FC<Props> = props => {
  const {
    isLoadingData,
    isExportingData,
    equipments,
    count,
    currentPage,
    rowsPerPage,
    handleChangeRowsPerPage,
    handleChangePage,
    handleSnackbar,
    setSelectedIndex,
    setSelectedSubEquipmentIndex,
    setOpen,
    setIsForm,
    setIsAddSub,
    setIsEdit,
    setIsMain,
    updateIndividualEquipment,
    column,
    setColumn,
    tableSettingId,
    csv,
    handleCsvClick,
    getClientName,
    setClientId,
    isSearchingClient,
    getServiceAddresses
  } = props;
  const { query, setQuery } = props;
  const { order, setOrder, orderBy, setOrderBy } = props;
  const { brandMaster, brandFilter, setBrandFilter, serviceAddressFilter, setServiceAddressFilter } = props;

  const [headers, setHeaders] = useState<HeaderTable[]>([]);
  const [columns, setColumns] = useState<SelectedColumn[]>([]);
  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);

  useEffect(() => {
    if (isLoadingData) {
      setShowSkeleton(true);
    }

    const SelectedColumns: SelectedColumn[] = [...column];
    const headers: HeaderTable[] = [];

    column.map((value: any) => {
      return headers.push({ id: value.field, label: value.name, isVisible: value.isVisible, sort: value.sort });
    });

    headers.push({ label: 'Action', verticalAlign: 'top', isVisible: true });
    headers.unshift({ label: '', verticalAlign: 'top', isVisible: true });

    setHeaders(headers);
    setColumns(SelectedColumns);

    return () => {
      setShowSkeleton(false);
    };
  }, [isLoadingData, column]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Fragment>
      <ToolBar
        isProcessing={isLoadingData}
        query={query}
        brandMaster={brandMaster}
        brandFilter={brandFilter}
        serviceAddressFilter={serviceAddressFilter}
        columns={columns}
        tableSettingId={tableSettingId}
        csv={csv}
        isExportingData={isExportingData}
        isSearchingClient={isSearchingClient}
        setQuery={setQuery}
        setBrandFilter={setBrandFilter}
        setServiceAddressFilter={setServiceAddressFilter}
        setColumns={setColumn}
        handleCsvClick={handleCsvClick}
        getClientName={getClientName}
        setClientId={setClientId}
        getServiceAddresses={getServiceAddresses}
      />
      <Divider style={{ marginTop: 16 }} />
      <Table>
        <TableHead>
          <HeaderRow headers={headers} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} isListPage={true} />
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
                setOpen={setOpen}
                setIsForm={setIsForm}
                setIsAddSub={setIsAddSub}
                setIsEdit={setIsEdit}
                setIsMain={setIsMain}
                updatedIndividualEquipment={updateIndividualEquipment(index)}
                column={columns}
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
                setOpen={setOpen}
                setIsForm={setIsForm}
                setIsAddSub={setIsAddSub}
                setIsEdit={setIsEdit}
                setIsMain={setIsMain}
                updatedIndividualEquipment={updateIndividualEquipment(index)}
                column={columns}
              />
            ))
          ) : (
            <TableRow>
              <BodyCell colSpan={13}>
                <Typography variant='body2' style={{ textAlign: 'center' }}>
                  No matching result
                </Typography>
              </BodyCell>
            </TableRow>
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          count={count}
          rowsPerPage={rowsPerPage}
          page={currentPage}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Table>
    </Fragment>
  );
};

export default EquipmentTable;
