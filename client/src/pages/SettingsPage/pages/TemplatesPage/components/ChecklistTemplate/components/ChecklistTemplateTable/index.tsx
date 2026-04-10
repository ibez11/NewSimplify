import React, { FC, useEffect, useState } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';
import { dummyChecklistTemplate } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  checklistTemplates: ChecklistTemplateModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  handleOpenEditChecklistTemplate: (checklistTemplateIndex: number) => React.MouseEventHandler;
  addNewChecklistTemplate(checklistTemplate: ChecklistTemplateModel): void;
  deleteIndividualChecklistTemplate: (checklistTemplateIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const ChecklistTemplateTable: FC<Props> = props => {
  const classes = useStyles();

  const {
    isLoadingData,
    checklistTemplates,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleOpenEditChecklistTemplate,
    deleteIndividualChecklistTemplate,
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

  // headerNameWithPaddings['headerName:pL:pR:pT:pB']
  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow
            headers={[
              { label: 'Checklist Name' },
              { label: 'Description' },
              { label: 'Items' },
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
                checklistTemplate={dummyChecklistTemplate}
                deleteIndividualChecklistTemplate={deleteIndividualChecklistTemplate}
                onEditChecklistTemplate={handleOpenEditChecklistTemplate(index)}
                isLoadingData={showSkeleton}
                handleSnackbar={handleSnackbar}
              />
            ))
          ) : checklistTemplates.length > 0 ? (
            checklistTemplates.map((checklistTemplate, index) => (
              <BodyRow
                index={index}
                key={checklistTemplate.id}
                checklistTemplate={checklistTemplate}
                deleteIndividualChecklistTemplate={deleteIndividualChecklistTemplate}
                onEditChecklistTemplate={handleOpenEditChecklistTemplate(index)}
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

export default ChecklistTemplateTable;
