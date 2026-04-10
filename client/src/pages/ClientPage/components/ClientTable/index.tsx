import React, { FC, useState, useEffect, Fragment } from 'react';
import { createStyles, Divider, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';
import BodyRow from './components/BodyRow';
import BodyCell from 'components/BodyCell';
import TablePagination from 'components/TablePagination';
import ToolBar from './components/ToolBar';
import { dummyClient } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  isExportingData: boolean;
  clients: ClientModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarVarient: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleViewClient: (clientId: number) => React.MouseEventHandler;
  handleViewContract: (clientId: number) => React.MouseEventHandler;
  handleViewJob: (clientId: number) => React.MouseEventHandler;
  handleViewEquipment: (clientId: number) => React.MouseEventHandler;
  handleDeleteClient: (clientId: number) => React.MouseEventHandler;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  agents: Select[];
  columnFilter: ColumnFilter[];
  setColumnFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  handleCsvClick: () => void;
  csv: CSVClientModel[];
  column: any[];
  setColumn: React.Dispatch<React.SetStateAction<any[]>>;
  tableSettingId: number;
  currentRoleGrants: RoleGrantModel[];
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const ClientTable: FC<Props> = props => {
  const classes = useStyles();
  const {
    isLoadingData,
    isExportingData,
    clients,
    count,
    currentPage,
    rowsPerPage,
    handleChangeRowsPerPage,
    handleChangePage,
    handleViewClient,
    handleViewContract,
    handleViewJob,
    handleViewEquipment,
    handleDeleteClient,
    agents,
    csv,
    handleCsvClick,
    column,
    setColumn,
    tableSettingId,
    currentRoleGrants
  } = props;

  const { query, setQuery } = props;
  const { columnFilter, setColumnFilter } = props;
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
      return headers.push({ label: value.name, isVisible: value.isVisible });
    });

    headers.push({ label: 'Action', verticalAlign: 'top', isVisible: true });
    headers.unshift({ label: '', verticalAlign: 'top', isVisible: true });

    setHeaders(headers);
    setColumns(SelectedColumns);

    return () => {
      setShowSkeleton(false);
    };
  }, [isLoadingData, column]);

  return (
    <Fragment>
      <ToolBar
        isProcessing={isLoadingData}
        isExportingData={isExportingData}
        query={query}
        setQuery={setQuery}
        agents={agents}
        columnFilter={columnFilter}
        setColumnFilter={setColumnFilter}
        csv={csv}
        handleCsvClick={handleCsvClick}
        columns={columns}
        setColumns={setColumn}
        tableSettingId={tableSettingId}
      />
      <Divider style={{ marginTop: 16 }} />
      <div className={classes.tableWrapper}>
        <Table>
          <TableHead>
            <HeaderRow headers={headers} isListPage={true} />
          </TableHead>
          <TableBody>
            {showSkeleton ? (
              [1, 2, 3, 4, 5].map(index => (
                <BodyRow
                  key={index}
                  clients={dummyClient}
                  isLoadingData={showSkeleton}
                  onViewClient={handleViewClient(index)}
                  onViewContract={handleViewContract(index)}
                  onViewJob={handleViewJob(index)}
                  onViewEquipment={handleViewEquipment(index)}
                  onDeleteClient={handleDeleteClient(index)}
                  column={columns}
                  currentRoleGrants={currentRoleGrants}
                />
              ))
            ) : clients && clients.length > 0 ? (
              clients.map(client => (
                <BodyRow
                  key={client.id}
                  clients={client}
                  isLoadingData={showSkeleton}
                  onViewClient={handleViewClient(client.id)}
                  onViewContract={handleViewContract(client.id)}
                  onViewJob={handleViewJob(client.id)}
                  onViewEquipment={handleViewEquipment(client.id)}
                  onDeleteClient={handleDeleteClient(client.id)}
                  column={columns}
                  currentRoleGrants={currentRoleGrants}
                />
              ))
            ) : (
              <TableRow>
                <BodyCell colSpan={9}>
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
      </div>
    </Fragment>
  );
};

export default ClientTable;
