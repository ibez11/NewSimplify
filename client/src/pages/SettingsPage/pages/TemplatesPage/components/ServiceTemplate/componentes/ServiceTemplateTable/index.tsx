import React, { FC, useEffect, useState } from 'react';
import { Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';

interface Props {
  isLoadingData: boolean;
  serviceTemplates: ServiceTemplatesModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleOpenEditServiceTemplate: (serviceTemplateIndex: number) => React.MouseEventHandler;
  addNewServiceTemplate(serviceTemplate: ServiceTemplatesModel): void;
  deleteIndividualServiceTemplate: (serviceTemplateIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const ServiceTemplateTable: FC<Props> = props => {
  const {
    isLoadingData,
    serviceTemplates,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenEditServiceTemplate,
    deleteIndividualServiceTemplate,
    handleSnackbar
  } = props;

  const dummyServiceTemplate: ServiceTemplatesModel = {
    id: 0,
    name: '',
    description: '',
    termCondition: ''
  };

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
    <Table>
      <TableHead>
        <HeaderRow
          headers={[
            { label: 'Quotation Name' },
            { label: 'Description' },
            { label: 'Terms & Conditions' },
            { label: 'Action', pL: '110px', pR: '0px', pT: '0px', pB: '0px' }
          ]}
        />
      </TableHead>
      <TableBody>
        {isLoadingData ? (
          [1, 2, 3, 4, 5].map(index => (
            <BodyRow
              index={index}
              key={index}
              serviceTemplate={dummyServiceTemplate}
              deleteIndividualServiceTemplate={deleteIndividualServiceTemplate}
              onEditServiceTemplate={handleOpenEditServiceTemplate(index)}
              isLoadingData={showSkeleton}
              handleSnackbar={handleSnackbar}
            />
          ))
        ) : serviceTemplates.length > 0 ? (
          serviceTemplates.map((serviceTemplate, index) => (
            <BodyRow
              index={index}
              key={serviceTemplate.id}
              serviceTemplate={serviceTemplate}
              deleteIndividualServiceTemplate={deleteIndividualServiceTemplate}
              onEditServiceTemplate={handleOpenEditServiceTemplate(index)}
              isLoadingData={showSkeleton}
              handleSnackbar={handleSnackbar}
            />
          ))
        ) : (
          <TableRow>
            <BodyCell colSpan={4}>
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
  );
};

export default ServiceTemplateTable;
