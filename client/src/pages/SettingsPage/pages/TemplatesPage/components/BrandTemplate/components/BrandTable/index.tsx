import React, { FC, useState, useEffect, useCallback } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';

import CreateEditBrandTemplateForm from './components/CreateEditBrandTemplateForm';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';
import { dummyBrandTemplate } from 'constants/dummy';
import { BRAND_TEMPLATE_BASE_URL, GET_EDIT_BRAND_TEMPLATE_URL } from 'constants/url';

interface Props {
  isLoadingData: boolean;
  brandTemplates: BrandTemplateModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  openCreateBrandTemplate: boolean;
  handleCancelCreateBrandTemplate(): void;
  openEditBrandTemplate: boolean;
  brandTemplate?: BrandTemplateModel;
  currentEditingBrandTemplateIndex: number;
  handleOpenEditBrandTemplate: (brandtemplateIndex: number) => React.MouseEventHandler;
  handleCancelEditBrandTemplate(): void;
  addNewBrandTemplate(brandtemplate: BrandTemplateModel): void;
  updateIndividualBrandTemplate: (updatedBrandTemplateProperties: Partial<BrandTemplateModel>) => void;
  deleteIndividualBrandTemplate: (brandtemplateIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const BrandTemplateTable: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const {
    isLoadingData,
    brandTemplates,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    openCreateBrandTemplate,
    handleCancelCreateBrandTemplate,
    openEditBrandTemplate,
    brandTemplate,
    currentEditingBrandTemplateIndex,
    handleOpenEditBrandTemplate,
    handleCancelEditBrandTemplate,
    addNewBrandTemplate,
    updateIndividualBrandTemplate,
    deleteIndividualBrandTemplate,
    handleSnackbar
  } = props;

  const [isLoading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [description, setDesription] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');

  const resetInputFormValues = () => {
    setName('');
  };

  const resetEditFormValues = useCallback(() => {
    if (!brandTemplate) {
      return;
    }

    const { name, description } = brandTemplate;

    setName(name);
    setDesription(description);
  }, [brandTemplate]);

  const clearFormErrors = () => {
    setNameError('');
  };

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  useEffect(() => {
    if (!openEditBrandTemplate) {
      if (isLoadingData) {
        setShowSkeleton(true);
      }

      resetInputFormValues();
      clearFormErrors();

      return () => {
        setShowSkeleton(false);
      };
    } else {
      resetEditFormValues();
      clearFormErrors();
    }
  }, [openEditBrandTemplate, isLoadingData, resetEditFormValues]);

  const validateForm = () => {
    let ret = true;
    clearFormErrors();

    if (!name || !name.trim()) {
      setNameError('Please enter brand name');
      ret = false;
    }

    return ret;
  };

  const handleCloseCreateBrandTemplate = () => {
    handleCancelCreateBrandTemplate();
    resetInputFormValues();
    clearFormErrors();
  };

  const handleCloseEditBrandTemplate = () => {
    handleCancelEditBrandTemplate();
    resetInputFormValues();
    clearFormErrors();
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      cancelTokenSource = axios.CancelToken.source();
      if (!openEditBrandTemplate) {
        const response = await axios.post(
          `${BRAND_TEMPLATE_BASE_URL}`,
          {
            name,
            description
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewBrandTemplate(response.data);
        handleSnackbar('success', 'Successfully added new brand template');
      } else {
        const response = await axios.put(
          `${GET_EDIT_BRAND_TEMPLATE_URL(brandTemplate!.id)}`,
          {
            name,
            description
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualBrandTemplate(response.data);
        handleSnackbar('success', 'Successfully edited brand template');
      }
      !openEditBrandTemplate ? handleCancelCreateBrandTemplate() : handleCancelEditBrandTemplate();
    } catch (err) {
      handleSnackbar('error', !openEditBrandTemplate ? 'Failed to add brand template' : 'Failed to edit brand template');
    }

    setLoading(false);
  };

  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow headers={[{ label: 'Brands' }, { label: 'Action', pL: '110px', pR: '0px', pT: '0px', pB: '0px' }]} />
        </TableHead>
        <TableBody>
          {openCreateBrandTemplate && (
            <CreateEditBrandTemplateForm
              name={name}
              setName={setName}
              nameError={nameError}
              setNameError={setNameError}
              isSubmitting={isLoading}
              onSubmit={handleOnSubmit}
              onCancel={handleCloseCreateBrandTemplate}
              primaryButtonLabel={'Save'}
            />
          )}
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map(index => (
              <BodyRow
                index={index}
                key={index}
                brandTemplate={dummyBrandTemplate}
                onEditBrandTemplate={handleOpenEditBrandTemplate(index)}
                isLoadingData={showSkeleton}
                deleteIndividualBrandTemplate={deleteIndividualBrandTemplate}
                handleSnackbar={handleSnackbar}
              />
            ))
          ) : brandTemplates.length > 0 ? (
            brandTemplates.map((brandTemplate, index) =>
              openEditBrandTemplate && currentEditingBrandTemplateIndex === index ? (
                <CreateEditBrandTemplateForm
                  key={brandTemplate.id}
                  name={name}
                  setName={setName}
                  nameError={nameError}
                  setNameError={setNameError}
                  isSubmitting={isLoading}
                  onSubmit={handleOnSubmit}
                  onCancel={handleCloseEditBrandTemplate}
                  primaryButtonLabel={'Save'}
                  customBackground={'#F4F9FC'}
                />
              ) : (
                <BodyRow
                  index={index}
                  key={brandTemplate.id}
                  brandTemplate={brandTemplate}
                  onEditBrandTemplate={handleOpenEditBrandTemplate(index)}
                  isLoadingData={showSkeleton}
                  deleteIndividualBrandTemplate={deleteIndividualBrandTemplate}
                  handleSnackbar={handleSnackbar}
                />
              )
            )
          ) : (
            <TableRow>
              <BodyCell colSpan={2}>
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

export default BrandTemplateTable;
