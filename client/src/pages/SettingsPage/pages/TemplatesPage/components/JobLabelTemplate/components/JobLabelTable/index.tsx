import React, { FC, useState, useEffect, useCallback } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';

import CreateEditJobLabelTemplateForm from './components/CreateEditJobLabelTemplateForm';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';
import { dummyJobLabelTemplate } from 'constants/dummy';
import { JOB_LABEL_TEMPLATE_BASE_URL, GET_EDIT_JOB_LABEL_TEMPLATE_URL } from 'constants/url';

interface Props {
  isLoadingData: boolean;
  jobLabelTemplates: JobLabelTemplateModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  openCreateJobLabelTemplate: boolean;
  handleCancelCreateJobLabelTemplate(): void;
  openEditJobLabelTemplate: boolean;
  jobLabelTemplate?: JobLabelTemplateModel;
  currentEditingJobLabelTemplateIndex: number;
  handleOpenEditJobLabelTemplate: (joblabeltemplateIndex: number) => React.MouseEventHandler;
  handleCancelEditJobLabelTemplate(): void;
  addNewJobLabelTemplate(joblabeltemplate: JobLabelTemplateModel): void;
  updateIndividualJobLabelTemplate: (updatedJobLabelTemplateProperties: Partial<JobLabelTemplateModel>) => void;
  deleteIndividualJobLabelTemplate: (joblabeltemplateIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const JobLabelTemplateTable: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const {
    isLoadingData,
    jobLabelTemplates,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    openCreateJobLabelTemplate,
    handleCancelCreateJobLabelTemplate,
    openEditJobLabelTemplate,
    jobLabelTemplate,
    currentEditingJobLabelTemplateIndex,
    handleOpenEditJobLabelTemplate,
    handleCancelEditJobLabelTemplate,
    addNewJobLabelTemplate,
    updateIndividualJobLabelTemplate,
    deleteIndividualJobLabelTemplate,
    handleSnackbar
  } = props;

  const [isLoading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [color, setColor] = useState<string>('#53A0BE');
  const [colorError, setColorError] = useState<string>('');

  const resetInputFormValues = () => {
    setName('');
    setDescription('');
    setColor('#53A0BE');
  };

  const resetEditFormValues = useCallback(() => {
    if (!jobLabelTemplate) {
      return;
    }

    const { name, description, color } = jobLabelTemplate;

    setName(name);
    setDescription(description);
    setColor(color);
  }, [jobLabelTemplate]);

  const clearFormErrors = () => {
    setNameError('');
    setColorError('');
  };

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  useEffect(() => {
    if (!openEditJobLabelTemplate) {
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
  }, [openEditJobLabelTemplate, isLoadingData, resetEditFormValues]);

  const validateForm = () => {
    let ret = true;
    clearFormErrors();

    if (!name || !name.trim()) {
      setNameError('Please enter label name');
      ret = false;
    }

    if (!color || !color.trim()) {
      setNameError('Please select label color');
      ret = false;
    }

    return ret;
  };

  const handleCloseCreateJobLabelTemplate = () => {
    handleCancelCreateJobLabelTemplate();
    resetInputFormValues();
    clearFormErrors();
  };

  const handleCloseEditJobLabelTemplate = () => {
    handleCancelEditJobLabelTemplate();
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
      if (!openEditJobLabelTemplate) {
        const response = await axios.post(
          `${JOB_LABEL_TEMPLATE_BASE_URL}`,
          {
            name,
            description,
            color
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewJobLabelTemplate(response.data);
        handleSnackbar('success', 'Successfully added new job label template');
      } else {
        const response = await axios.put(
          `${GET_EDIT_JOB_LABEL_TEMPLATE_URL(jobLabelTemplate!.id)}`,
          {
            name,
            description,
            color
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualJobLabelTemplate(response.data);
        handleSnackbar('success', 'Successfully edited job label template');
      }
      !openEditJobLabelTemplate ? handleCancelCreateJobLabelTemplate() : handleCancelEditJobLabelTemplate();
    } catch (err) {
      handleSnackbar('error', !openEditJobLabelTemplate ? 'Failed to add job label template' : 'Failed to edit job label template');
    }

    setLoading(false);
  };

  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow
            headers={[
              { label: 'label name' },
              { label: 'description' },
              { label: '' },
              { label: 'Action', pL: '110px', pR: '0px', pT: '0px', pB: '0px' }
            ]}
          />
        </TableHead>
        <TableBody>
          {openCreateJobLabelTemplate && (
            <CreateEditJobLabelTemplateForm
              setName={setName}
              nameError={nameError}
              setNameError={setNameError}
              setDescription={setDescription}
              setColor={setColor}
              colorError={colorError}
              isSubmitting={isLoading}
              onSubmit={handleOnSubmit}
              onCancel={handleCloseCreateJobLabelTemplate}
              primaryButtonLabel={'Save'}
            />
          )}
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map(index => (
              <BodyRow
                index={index}
                key={index}
                jobLabelTemplate={dummyJobLabelTemplate}
                onEditJobLabelTemplate={handleOpenEditJobLabelTemplate(index)}
                isLoadingData={showSkeleton}
                deleteIndividualJobLabelTemplate={deleteIndividualJobLabelTemplate}
                handleSnackbar={handleSnackbar}
              />
            ))
          ) : jobLabelTemplates.length > 0 ? (
            jobLabelTemplates.map((jobLabelTemplate, index) =>
              openEditJobLabelTemplate && currentEditingJobLabelTemplateIndex === index ? (
                <CreateEditJobLabelTemplateForm
                  key={jobLabelTemplate.id}
                  jobLabelTemplate={jobLabelTemplate}
                  setName={setName}
                  nameError={nameError}
                  setNameError={setNameError}
                  setDescription={setDescription}
                  setColor={setColor}
                  colorError={colorError}
                  isSubmitting={isLoading}
                  onSubmit={handleOnSubmit}
                  onCancel={handleCloseEditJobLabelTemplate}
                  primaryButtonLabel={'Save'}
                  customBackground={'#F4F9FC'}
                />
              ) : (
                <BodyRow
                  index={index}
                  key={jobLabelTemplate.id}
                  jobLabelTemplate={jobLabelTemplate}
                  onEditJobLabelTemplate={handleOpenEditJobLabelTemplate(index)}
                  isLoadingData={showSkeleton}
                  deleteIndividualJobLabelTemplate={deleteIndividualJobLabelTemplate}
                  handleSnackbar={handleSnackbar}
                />
              )
            )
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
    </div>
  );
};

export default JobLabelTemplateTable;
