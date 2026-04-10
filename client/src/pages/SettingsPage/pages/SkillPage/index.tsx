import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import SkillTable from './components/SkillTable';
import ActionSnackbar from 'components/ActionSnackbar';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { SKILL_TEMPLATE_BASE_URL } from 'constants/url';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto'
  },
  addButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  }
}));

const SkillPage: FC = () => {
  useCurrentPageTitleUpdater('Skill Management');

  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const [isSearchingSkill, setSearchingSkill] = useState<boolean>(false);
  const [, setSearchSkillError] = useState<boolean>(false);
  const [skills, setSkills] = useState<SkillsModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openCreateSkill, setOpenCreateSkill] = useState<boolean>(false);
  const [openEditSkill, setOpenEditSkill] = useState<boolean>(false);
  const [currentEditingSkillIndex, setCurrentEditingSkillIndex] = useState<number>(0);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  // Search Skill whenever rowsPerPage, currentPage, queryString changes
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }

      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchSkill = async () => {
      setSearchingSkill(true);
      setSearchSkillError(false);

      try {
        const url = `${SKILL_TEMPLATE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setSkills(data.SkillTemplates);
      } catch (err) {
        setSearchSkillError(true);
      }

      setSearchingSkill(false);
    };

    searchSkill();

    return () => {
      cancelTokenSource.cancel();
    };
  }, [rowsPerPage, currentPage, queryString]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  const handleSearch = useCallback((searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  }, []);

  const debouncedSearchTerm = useDebounce(query, 500);
  // Load client data to populate on search list
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const handleOpenCreateSkill = () => {
    setOpenEditSkill(false);
    setOpenCreateSkill(true);
  };

  const handleCancelCreateSkill = () => {
    setOpenCreateSkill(false);
  };

  const handleOpenEditSkill = (skillIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingSkillIndex(skillIndex);
    setOpenCreateSkill(false);
    setOpenEditSkill(true);
  };

  const handleCancelEditSkill = () => {
    setOpenEditSkill(false);
  };

  const addNewSkill = (skill: SkillsModel) => {
    skill.new = true;
    skills.unshift(skill);
    setSkills([...skills]);
    setCount(c => c + 1);
  };

  const updateIndividualSkill = (updatedSkillProperties: Partial<SkillsModel>) => {
    setSkills(
      skills!.map((skill, index) => {
        if (index !== currentEditingSkillIndex) {
          return skill;
        }

        return Object.assign({}, skill, updatedSkillProperties);
      })
    );
  };

  const deleteIndividualSkill = (skillIndex: number) => {
    skills.splice(skillIndex, 1);
    setSkills([...skills]);
    setCount(c => c - 1);
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Skill...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingSkill}
          disableElevation
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={() => {
            handleOpenCreateSkill();
          }}
        >
          New Skill
          <LoadingButtonIndicator isLoading={isSearchingSkill} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <SkillTable
        isLoadingData={isSearchingSkill}
        skills={skills}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        openCreateSkill={openCreateSkill}
        handleCancelCreateSkill={handleCancelCreateSkill}
        addNewSkill={addNewSkill}
        openEditSkill={openEditSkill}
        skill={skills[currentEditingSkillIndex]}
        currentEditingSkillIndex={currentEditingSkillIndex}
        handleOpenEditSkill={handleOpenEditSkill}
        handleCancelEditSkill={handleCancelEditSkill}
        updateIndividualSkill={updateIndividualSkill}
        deleteIndividualSkill={deleteIndividualSkill}
        handleSnackbar={handleSnackbar}
      />
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={() => setOpenSnackbar(false)}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </Paper>
  );
};

export default SkillPage;
