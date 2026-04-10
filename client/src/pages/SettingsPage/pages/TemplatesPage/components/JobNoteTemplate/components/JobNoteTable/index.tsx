import React, { FC, useState, useEffect, useCallback } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';

import CreateEditJobNoteTemplateForm from './components/CreateEditJobNoteTemplateForm';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';
import { dummyJobNoteTemplate } from 'constants/dummy';
import { JOB_NOTE_TEMPLATE_BASE_URL, GET_EDIT_JOB_NOTE_TEMPLATE_URL } from 'constants/url';

interface Props {
  isLoadingData: boolean;
  jobNoteTemplates: JobNoteTemplateModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  openCreateJobNoteTemplate: boolean;
  handleCancelCreateJobNoteTemplate(): void;
  openEditJobNoteTemplate: boolean;
  jobNoteTemplate?: JobNoteTemplateModel;
  currentEditingJobNoteTemplateIndex: number;
  handleOpenEditJobNoteTemplate: (jobnotetemplateIndex: number) => React.MouseEventHandler;
  handleCancelEditJobNoteTemplate(): void;
  addNewJobNoteTemplate(jobnotetemplate: JobNoteTemplateModel): void;
  updateIndividualJobNoteTemplate: (updatedJobNoteTemplateProperties: Partial<JobNoteTemplateModel>) => void;
  deleteIndividualJobNoteTemplate: (jobnotetemplateIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const JobNoteTemplateTable: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const {
    isLoadingData,
    jobNoteTemplates,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    openCreateJobNoteTemplate,
    handleCancelCreateJobNoteTemplate,
    openEditJobNoteTemplate,
    jobNoteTemplate,
    currentEditingJobNoteTemplateIndex,
    handleOpenEditJobNoteTemplate,
    handleCancelEditJobNoteTemplate,
    addNewJobNoteTemplate,
    updateIndividualJobNoteTemplate,
    deleteIndividualJobNoteTemplate,
    handleSnackbar
  } = props;

  const [isLoading, setLoading] = useState<boolean>(false);

  const [notes, setNotes] = useState<string>('');
  const [notesError, setNotesError] = useState<string>('');

  const resetInputFormValues = () => {
    setNotes('');
  };

  const resetEditFormValues = useCallback(() => {
    if (!jobNoteTemplate) {
      return;
    }

    const { notes } = jobNoteTemplate;

    setNotes(notes);
  }, [jobNoteTemplate]);

  const clearFormErrors = () => {
    setNotesError('');
  };

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  useEffect(() => {
    if (!openEditJobNoteTemplate) {
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
  }, [openEditJobNoteTemplate, isLoadingData, resetEditFormValues]);

  const validateForm = () => {
    let ret = true;
    clearFormErrors();

    if (!notes || !notes.trim()) {
      setNotesError('Please enter notes');
      ret = false;
    }

    return ret;
  };

  const handleCloseCreateJobNoteTemplate = () => {
    handleCancelCreateJobNoteTemplate();
    resetInputFormValues();
    clearFormErrors();
  };

  const handleCloseEditJobNoteTemplate = () => {
    handleCancelEditJobNoteTemplate();
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
      if (!openEditJobNoteTemplate) {
        const response = await axios.post(
          `${JOB_NOTE_TEMPLATE_BASE_URL}`,
          {
            notes
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewJobNoteTemplate(response.data);
        handleSnackbar('success', 'Successfully added new job note template');
      } else {
        const response = await axios.put(
          `${GET_EDIT_JOB_NOTE_TEMPLATE_URL(jobNoteTemplate!.id)}`,
          {
            notes
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualJobNoteTemplate(response.data);
        handleSnackbar('success', 'Successfully editeed job note template');
      }
      !openEditJobNoteTemplate ? handleCancelCreateJobNoteTemplate() : handleCancelEditJobNoteTemplate();
    } catch (err) {
      handleSnackbar('error', !openEditJobNoteTemplate ? 'Failed to add new job note template' : 'Failed to edit a job note template');
    }

    setLoading(false);
  };

  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow headers={[{ label: 'Notes' }, { label: 'Action', pL: '110px', pR: '0px', pT: '0px', pB: '0px' }]} />
        </TableHead>
        <TableBody>
          {openCreateJobNoteTemplate && (
            <CreateEditJobNoteTemplateForm
              notes={notes}
              setNotes={setNotes}
              notesError={notesError}
              setNotesError={setNotesError}
              isSubmitting={isLoading}
              onSubmit={handleOnSubmit}
              onCancel={handleCloseCreateJobNoteTemplate}
              primaryButtonLabel={'Save'}
            />
          )}
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map(index => (
              <BodyRow
                index={index}
                key={index}
                jobNoteTemplate={dummyJobNoteTemplate}
                onEditJobNoteTemplate={handleOpenEditJobNoteTemplate(index)}
                isLoadingData={showSkeleton}
                deleteIndividualJobNoteTemplate={deleteIndividualJobNoteTemplate}
                handleSnackbar={handleSnackbar}
              />
            ))
          ) : jobNoteTemplates.length > 0 ? (
            jobNoteTemplates.map((jobNoteTemplate, index) =>
              openEditJobNoteTemplate && currentEditingJobNoteTemplateIndex === index ? (
                <CreateEditJobNoteTemplateForm
                  key={jobNoteTemplate.id}
                  notes={notes}
                  setNotes={setNotes}
                  notesError={notesError}
                  setNotesError={setNotesError}
                  isSubmitting={isLoading}
                  onSubmit={handleOnSubmit}
                  onCancel={handleCloseEditJobNoteTemplate}
                  primaryButtonLabel={'Save'}
                  customBackground={'#F4F9FC'}
                />
              ) : (
                <BodyRow
                  index={index}
                  key={jobNoteTemplate.id}
                  jobNoteTemplate={jobNoteTemplate}
                  onEditJobNoteTemplate={handleOpenEditJobNoteTemplate(index)}
                  isLoadingData={showSkeleton}
                  deleteIndividualJobNoteTemplate={deleteIndividualJobNoteTemplate}
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

export default JobNoteTemplateTable;
