import React, { FC, useState } from 'react';
import { Grid } from '@material-ui/core';

import TableNote from './components/TableNote.tsx';
import { JobNoteType } from 'constants/enum';
import SideBarContent from 'components/SideBarContent';
import { ucWords } from 'utils/index';
import NoteForm from './components/NoteForm/NoteForm';

interface Props {
  isLoading: boolean;
  jobId: number;
  serviceAddressId: number;
  jobNotes: JobNoteModel[];
  setJobNotes: React.Dispatch<React.SetStateAction<JobNoteModel[]>>;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
}

const JobNoteContent: FC<Props> = props => {
  const { isLoading, jobId, serviceAddressId, jobNotes, setJobNotes, handleSnackbar } = props;

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleOpenForm = () => {
    setOpenForm(true);
  };

  const handleEditJobNote = (noteType: JobNoteType, index: number) => {
    setOpenForm(true);
    setIsEdit(true);
    setSelectedIndex(index);
  };

  const addNewJobNote = (jobNote: JobNoteModel) => {
    const currentJobNote = jobNotes ? [...jobNotes] : [];
    currentJobNote.push(jobNote);
    setJobNotes(currentJobNote);
  };

  const updateJobNoteVisibility = (jobNoteIndex: number, jobNoteStatus: boolean) => {
    const currentJobNotes = jobNotes ? [...jobNotes] : [];
    currentJobNotes[jobNoteIndex].isHide = jobNoteStatus;
    setJobNotes(currentJobNotes);
  };

  const updateJobNote = (jobNoteIndex: number, jobNote: JobNoteModel) => {
    const currentJobNotes = jobNotes ? [...jobNotes] : [];
    currentJobNotes[jobNoteIndex] = jobNote;
    setJobNotes(currentJobNotes);
  };

  const deleteIndividualJobNote = (jobNoteIndex: number) => {
    const currentJobNote = [...jobNotes];
    currentJobNote.splice(jobNoteIndex, 1);
    setJobNotes(currentJobNote);
  };

  return (
    <Grid container spacing={3}>
      <TableNote
        isLoading={isLoading}
        jobId={jobId}
        jobNotes={jobNotes}
        updateJobNoteVisibility={updateJobNoteVisibility}
        deleteIndividualJobNote={deleteIndividualJobNote}
        handleSnackbar={handleSnackbar}
        handleOpenForm={handleOpenForm}
        handleEditJobNote={handleEditJobNote}
      />
      <SideBarContent
        title={ucWords(isEdit ? `Edit Job Note` : `Add Job Note`)}
        open={openForm}
        onClickDrawer={() => {
          setOpenForm(false);
          setIsEdit(false);
        }}
        width={'50%'}
      >
        <NoteForm
          jobId={jobId}
          serviceAddressId={serviceAddressId}
          isEdit={isEdit}
          jobNoteIndex={isEdit ? selectedIndex : undefined}
          jobNote={isEdit ? jobNotes[selectedIndex] : undefined}
          addNewJobNote={addNewJobNote}
          updateJobNote={updateJobNote}
          handleClose={() => {
            setOpenForm(false);
            setIsEdit(false);
          }}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
    </Grid>
  );
};

export default JobNoteContent;
