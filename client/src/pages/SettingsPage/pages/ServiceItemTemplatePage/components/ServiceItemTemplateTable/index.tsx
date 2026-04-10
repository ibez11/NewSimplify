import React, { FC, useState, useEffect, useCallback } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';

import CreateEditServiceItemForm from './components/CreateEditServiceItemForm';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';
import { SERVICE_ITEM_TEMPLATE_BASE_URL, GET_EDIT_SERVICE_ITEM_TEMPLATE_URL } from 'constants/url';
import { dummyServiceItemTemplate } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  serviceItemTemplates: ServiceItemTemplatesModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  openCreateServiceItemTemplate: boolean;
  handleCancelCreateServiceItemTemplate(): void;
  openEditServiceItemTemplate: boolean;
  serviceItemTemplate?: ServiceItemTemplatesModel;
  currentEditingServiceTemplateIndex: number;
  handleOpenEditServiceItemTemplate: (serviceItemTemplateIndex: number) => React.MouseEventHandler;
  handleCancelEditServiceItemTemplate(): void;
  addNewServiceItemTemplate(serviceItemTemplate: ServiceItemTemplatesModel): void;
  updateIndividualServiceItemTemplate: (updatedServiceItemTemplateProperties: Partial<ServiceItemTemplatesModel>) => void;
  deleteIndividualServiceItemTemplate: (serviceItemTemplateIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const ServiceItemTemplateTable: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const {
    isLoadingData,
    serviceItemTemplates,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    openCreateServiceItemTemplate,
    handleCancelCreateServiceItemTemplate,
    openEditServiceItemTemplate,
    serviceItemTemplate,
    currentEditingServiceTemplateIndex,
    handleOpenEditServiceItemTemplate,
    handleCancelEditServiceItemTemplate,
    addNewServiceItemTemplate,
    updateIndividualServiceItemTemplate,
    deleteIndividualServiceItemTemplate,
    handleSnackbar
  } = props;

  const [isLoading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<number>(0);

  const [nameError, setNameError] = useState<string>('');

  const resetInputFormValues = () => {
    setName('');
    setDescription('');
    setUnitPrice(0);
  };

  const resetEditFormValues = useCallback(() => {
    if (!serviceItemTemplate) {
      return;
    }

    const { name, description, unitPrice } = serviceItemTemplate;

    setName(name);
    setDescription(description === null ? '' : description);
    setUnitPrice(unitPrice);
  }, [serviceItemTemplate]);

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  useEffect(() => {
    if (!openEditServiceItemTemplate) {
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
  }, [openEditServiceItemTemplate, isLoadingData, resetEditFormValues]);

  const handleCloseCreateServiceItemTemplate = () => {
    handleCancelCreateServiceItemTemplate();
    resetInputFormValues();
    clearFormErrors();
  };

  const handleCloseEditServiceItemTemplate = () => {
    handleCancelEditServiceItemTemplate();
    resetInputFormValues();
    clearFormErrors();
  };

  const clearFormErrors = () => {
    setNameError('');
  };

  const validateForm = () => {
    let ret = true;
    clearFormErrors();

    if (!name || !name.trim()) {
      setNameError('Please enter task name');
      ret = false;
    }

    return ret;
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      cancelTokenSource = axios.CancelToken.source();
      if (!openEditServiceItemTemplate) {
        const response = await axios.post(
          `${SERVICE_ITEM_TEMPLATE_BASE_URL}`,
          {
            name,
            description,
            unitPrice
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewServiceItemTemplate(response.data);
        handleSnackbar('success', 'Successfully added new service item');
      } else {
        const response = await axios.put(
          `${GET_EDIT_SERVICE_ITEM_TEMPLATE_URL(serviceItemTemplate!.id)}`,
          {
            name,
            description,
            unitPrice
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualServiceItemTemplate(response.data);
        handleSnackbar('success', 'Successfully edited service item');
      }
      !openEditServiceItemTemplate ? handleCloseCreateServiceItemTemplate() : handleCloseEditServiceItemTemplate();
    } catch (err) {
      handleSnackbar('error', !openEditServiceItemTemplate ? 'Failed to add new service item' : 'Failed to edit  service item');

      const error = err as any;
      const { errorCode } = error.data;
      if (errorCode === 21) {
        handleSnackbar('error', 'This service name has been added in the system');
      } else {
        handleSnackbar('error', 'Failed to create service name');
      }
    }

    setLoading(false);
  };

  // headerNameWithPaddings['headerName:pL:pR:pT:pB']
  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow
            headers={[
              { label: 'Service Item Name' },
              { label: 'Description' },
              { label: 'Cost' },
              { label: 'Action', pL: '110px', pR: '0px', pT: '0px', pB: '0px' }
            ]}
          />
        </TableHead>
        <TableBody>
          {openCreateServiceItemTemplate && (
            <CreateEditServiceItemForm
              name={name}
              setName={setName}
              nameError={nameError}
              description={description}
              setDescription={setDescription}
              unitPrice={unitPrice}
              setUnitPrice={setUnitPrice}
              isSubmitting={isLoading}
              onSubmit={handleOnSubmit}
              onCancel={handleCloseCreateServiceItemTemplate}
              primaryButtonLabel={'Save'}
            />
          )}
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map(index => (
              <BodyRow
                index={index}
                key={index}
                serviceItemTemplate={dummyServiceItemTemplate}
                deleteIndividualServiceItemTemplate={deleteIndividualServiceItemTemplate}
                onEditServiceItemTemplate={handleOpenEditServiceItemTemplate(index)}
                isLoadingData={showSkeleton}
                handleSnackbar={handleSnackbar}
              />
            ))
          ) : serviceItemTemplates.length > 0 ? (
            serviceItemTemplates.map((serviceItemTemplate, index) =>
              openEditServiceItemTemplate && currentEditingServiceTemplateIndex === index ? (
                <CreateEditServiceItemForm
                  key={serviceItemTemplate.id}
                  name={name}
                  setName={setName}
                  nameError={nameError}
                  description={description}
                  setDescription={setDescription}
                  unitPrice={unitPrice}
                  setUnitPrice={setUnitPrice}
                  isSubmitting={isLoading}
                  onSubmit={handleOnSubmit}
                  onCancel={handleCloseEditServiceItemTemplate}
                  primaryButtonLabel={'Save'}
                  customBackground={'#F4F9FC'}
                />
              ) : (
                <BodyRow
                  index={index}
                  key={serviceItemTemplate.id}
                  serviceItemTemplate={serviceItemTemplate}
                  deleteIndividualServiceItemTemplate={deleteIndividualServiceItemTemplate}
                  onEditServiceItemTemplate={handleOpenEditServiceItemTemplate(index)}
                  isLoadingData={showSkeleton}
                  handleSnackbar={handleSnackbar}
                />
              )
            )
          ) : (
            <TableRow>
              <BodyCell colSpan={5}>
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

export default ServiceItemTemplateTable;
