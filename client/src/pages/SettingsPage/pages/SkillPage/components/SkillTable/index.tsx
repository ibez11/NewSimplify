import React, { FC, useState, useEffect, useCallback } from 'react';
import { createStyles, makeStyles, Table, TableBody, TableHead, TableRow, Typography } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';

import CreateEditSkillForm from './components/CreateEditSkillForm';

import HeaderRow from 'components/HeaderRow';
import BodyCell from 'components/BodyCell';
import BodyRow from './components/BodyRow';
import TablePagination from 'components/TablePagination';
import { SKILL_TEMPLATE_BASE_URL, GET_EDIT_SKILL_TEMPLATE_URL } from 'constants/url';
import { dummySkill } from 'constants/dummy';

interface Props {
  isLoadingData: boolean;
  skills: SkillsModel[];
  count: number;
  currentPage: number;
  rowsPerPage: number;
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement> | null, page: number) => void;
  handleChangeRowsPerPage: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  openCreateSkill: boolean;
  handleCancelCreateSkill(): void;
  openEditSkill: boolean;
  skill?: SkillsModel;
  currentEditingSkillIndex: number;
  handleOpenEditSkill: (skillIndex: number) => React.MouseEventHandler;
  handleCancelEditSkill(): void;
  addNewSkill(skill: SkillsModel): void;
  updateIndividualSkill: (updatedSkillProperties: Partial<SkillsModel>) => void;
  deleteIndividualSkill: (skillIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    tableWrapper: {
      overflowX: 'auto'
    }
  })
);

const SkillTable: FC<Props> = props => {
  const classes = useStyles();
  let cancelTokenSource: CancelTokenSource;

  const {
    isLoadingData,
    skills,
    count,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    openCreateSkill,
    handleCancelCreateSkill,
    openEditSkill,
    skill,
    currentEditingSkillIndex,
    handleOpenEditSkill,
    handleCancelEditSkill,
    addNewSkill,
    updateIndividualSkill,
    deleteIndividualSkill,
    handleSnackbar
  } = props;

  const [isLoading, setLoading] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [nameError, setNameError] = useState<string>('');

  const resetInputFormValues = () => {
    setName('');
    setDescription('');
  };

  const resetEditFormValues = useCallback(() => {
    if (!skill) {
      return;
    }

    const { name, description } = skill;

    setName(name);
    setDescription(description ? description : '');
  }, [skill]);

  // The below logic introduces a 500ms delay for showing the skeleton
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  useEffect(() => {
    if (!openEditSkill) {
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
  }, [openEditSkill, isLoadingData, resetEditFormValues]);

  const handleCloseCreateSkill = () => {
    handleCancelCreateSkill();
    resetInputFormValues();
    clearFormErrors();
  };

  const handleCloseEditSkill = () => {
    handleCancelEditSkill();
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
      setNameError('Please enter skill name');
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
      if (!openEditSkill) {
        const response = await axios.post(
          `${SKILL_TEMPLATE_BASE_URL}`,
          {
            name,
            description
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewSkill(response.data);
        handleSnackbar('success', 'Successfully added new skill');
      } else {
        const response = await axios.put(
          `${GET_EDIT_SKILL_TEMPLATE_URL(skill!.id)}`,
          {
            name,
            description
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualSkill(response.data);
        handleSnackbar('success', 'Successfully edited skill');
      }
      !openEditSkill ? handleCloseCreateSkill() : handleCloseEditSkill();
    } catch (err) {
      const error = err as any;
      const { errorCode } = error.data;
      if (errorCode === 28) {
        handleSnackbar('error', 'This skill has been added in the system');
      } else {
        handleSnackbar('error', !openEditSkill ? 'Failed to add new skill' : 'Failed to edit  skill');
      }
    }

    setLoading(false);
  };

  return (
    <div className={classes.tableWrapper}>
      <Table>
        <TableHead>
          <HeaderRow
            headers={[{ label: 'Skill Name' }, { label: 'Description' }, { label: 'Action', pL: '110px', pR: '0px', pT: '0px', pB: '0px' }]}
          />
        </TableHead>
        <TableBody>
          {openCreateSkill && (
            <CreateEditSkillForm
              name={name}
              setName={setName}
              nameError={nameError}
              description={description}
              setDescription={setDescription}
              isSubmitting={isLoading}
              onSubmit={handleOnSubmit}
              onCancel={handleCloseCreateSkill}
              primaryButtonLabel={'Save'}
            />
          )}
          {showSkeleton ? (
            [1, 2, 3, 4, 5].map(index => (
              <BodyRow
                index={index}
                key={index}
                skill={dummySkill}
                onEditSkill={handleOpenEditSkill(index)}
                isLoadingData={showSkeleton}
                deleteIndividualSkill={deleteIndividualSkill}
                handleSnackbar={handleSnackbar}
              />
            ))
          ) : skills.length > 0 ? (
            skills.map((skill, index) =>
              openEditSkill && currentEditingSkillIndex === index ? (
                <CreateEditSkillForm
                  key={skill.id}
                  name={name}
                  setName={setName}
                  nameError={nameError}
                  description={description}
                  setDescription={setDescription}
                  isSubmitting={isLoading}
                  onSubmit={handleOnSubmit}
                  onCancel={handleCloseEditSkill}
                  primaryButtonLabel={'Save'}
                  customBackground={'#F4F9FC'}
                />
              ) : (
                <BodyRow
                  index={index}
                  key={skill.id}
                  skill={skill}
                  onEditSkill={handleOpenEditSkill(index)}
                  isLoadingData={showSkeleton}
                  deleteIndividualSkill={deleteIndividualSkill}
                  handleSnackbar={handleSnackbar}
                />
              )
            )
          ) : (
            <TableRow>
              <BodyCell colSpan={3}>
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

export default SkillTable;
