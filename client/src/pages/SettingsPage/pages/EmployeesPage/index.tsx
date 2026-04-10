import React, { FC, useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { green } from '@material-ui/core/colors';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import AddIcon from '@material-ui/icons/Add';
import axios, { CancelTokenSource } from 'axios';

import useDebounce from 'hooks/useDebounce';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { Container, Grid, Button, makeStyles, Theme, Paper, Divider } from '@material-ui/core';
import SearchInput from 'components/SearchInput';
import UserTable from './components/UserTable';
import ActionSnackbar from 'components/ActionSnackbar';
import { ROLE_BASE_URL, USER_BASE_URL, SKILL_TEMPLATE_BASE_URL } from 'constants/url';
import CustomizedTabs from 'components/CustomizedTabs';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import SideBarContent from 'components/SideBarContent';
import UserForm from './components/UserForm';
import { dummyUser } from 'constants/dummy';

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto'
  },
  root: {
    paddingBottom: theme.spacing(4),
    paddingLeft: 0,
    paddingRight: 0
  },
  contentContainer: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(2)
    }
  },
  tableRoot: {
    width: '100%',
    overflowX: 'auto'
  },
  success: {
    backgroundColor: green[600]
  },
  error: {
    backgroundColor: theme.palette.error.dark
  },
  addButton: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  extendedIcon: {
    paddingRight: theme.spacing(1)
  }
}));

const EmployeesPage: FC = () => {
  useCurrentPageTitleUpdater('Employees');

  const classes = useStyles();

  const [roles, setRoles] = useState<Role[]>([{ id: 0, name: 'All' }]);

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [selectedRole, setSelectedRole] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearchingUser, setSearchingUser] = useState<boolean>(false);
  const [, setSearchUserError] = useState<boolean>(false);
  const [users, setUsers] = useState<UserDetailsModel[]>([]);
  const [count, setCount] = useState<number>(0);
  const [skillMaster, setSkillMaster] = useState<SkillsModel[]>([]);

  const [currentEditingUserIndex, setCurrentEditingUserIndex] = useState<number>(0);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  // Loading all the roles to populate the tabs once
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getAllRoles = async () => {
      try {
        const { data } = await axios.get(ROLE_BASE_URL, { cancelToken: cancelTokenSource.token });

        let roleData: Role[] = [...roles];
        data.roles.map((value: any) => roleData.push({ id: value.id, name: value.name }));
        setRoles(roleData);
      } catch (err) {
        console.log(err);
      }
    };

    const getAllSkills = async () => {
      try {
        const { data } = await axios.get(SKILL_TEMPLATE_BASE_URL, { cancelToken: cancelTokenSource.token });

        setSkillMaster(data.SkillTemplates);
      } catch (err) {
        console.log(err);
      }
    };

    getAllRoles();
    getAllSkills();

    return () => {
      // Canceling the request if component is unmounted
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search User whenever rowsPerPage, currentPage, queryString, selectedRole changes
  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getQueryParams = () => {
      const params = new URLSearchParams();
      if (queryString) {
        params.append('q', queryString);
      }

      if (selectedRole) {
        params.append('role', selectedRole.toString());
      }

      params.append('s', (currentPage * rowsPerPage).toString());
      params.append('l', rowsPerPage.toString());

      return params.toString();
    };

    const searchUser = async () => {
      setSearchingUser(true);
      setSearchUserError(false);

      try {
        const url = `${USER_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setUsers(data.users);
      } catch (err) {
        setSearchUserError(true);
      }

      setSearchingUser(false);
    };

    searchUser();

    return () => {
      cancelTokenSource.cancel();
    };
  }, [rowsPerPage, currentPage, queryString, selectedRole]);

  const addNewUser = (user: UserDetailsModel) => {
    user.new = true;
    users.unshift(user);
    setUsers([...users]);
    setCount(c => c + 1);
  };

  const updateIndividualUser = (userIndex: number) => {
    return (updatedUserProperties: Partial<UserDetailsModel>) => {
      setUsers(
        users!.map((user, index) => {
          if (index !== userIndex) {
            return user;
          }

          return Object.assign({}, user, updatedUserProperties);
        })
      );
    };
  };

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

  const handleOpenEditUser = (userIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingUserIndex(userIndex);
    // setOpenEditUserModal(true);
    setOpenForm(true);
    setIsEdit(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setIsEdit(false);
    setCurrentEditingUserIndex(0);
  };

  // Should not render until role response came back
  return roles.length === 0 ? null : (
    <Container maxWidth='lg' className={clsx(classes.root, classes.contentContainer)}>
      <Grid container justify='space-between'>
        <CustomizedTabs
          tabs={roles.map(role => ({
            id: role.id,
            name: role.name
          }))}
          selectedTabId={selectedRole}
          onSelect={(tabId: number) => performActionAndRevertPage(setSelectedRole, tabId)}
        />
      </Grid>
      <Paper variant='outlined' className={classes.paper}>
        <Grid container justify='space-between' style={{ padding: 16 }}>
          <SearchInput
            withBorder
            withTransition={false}
            width={150}
            placeHolder='Search Employee...'
            iconColor='#989898'
            tableSearchValue={query}
            setTableSearchValue={setQuery}
          />
          <Button
            color='primary'
            size='medium'
            variant='contained'
            disabled={isSearchingUser}
            disableElevation
            className={classes.addButton}
            startIcon={<AddIcon />}
            onClick={() => setOpenForm(true)}
          >
            Add Employee
            <LoadingButtonIndicator isLoading={isSearchingUser} />
          </Button>
        </Grid>
        <Divider style={{ marginTop: 16 }} />
        <UserTable
          isLoadingData={isSearchingUser}
          users={users}
          count={count}
          updateIndividualUser={updateIndividualUser}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleChangePage={(event, page) => setCurrentPage(page)}
          handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
          handleOpenEditUser={handleOpenEditUser}
          handleSnackbar={handleSnackbar}
        />
        <SideBarContent title={isEdit ? 'Edit Employee' : 'Add Employee'} open={openForm} onClickDrawer={handleCloseForm} width={'55%'}>
          <UserForm
            user={isEdit ? users[currentEditingUserIndex] : dummyUser}
            isEdit={isEdit}
            skillMaster={skillMaster}
            addNewUser={addNewUser}
            updateIndividualUser={updateIndividualUser(currentEditingUserIndex)}
            handleClose={handleCloseForm}
            handleSnackbar={handleSnackbar}
          />
        </SideBarContent>
        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={() => setOpenSnackbar(false)}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        />
      </Paper>
    </Container>
  );
};

export default EmployeesPage;
