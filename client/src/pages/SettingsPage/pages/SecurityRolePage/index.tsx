import React, { FC, useState, useEffect, useCallback } from 'react';
import { Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import ActionSnackbar from 'components/ActionSnackbar';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { ROLE_BASE_URL } from 'constants/url';
import SecurityRoleTable from './components/SecurityRoleTable';
import SideBarContent from 'components/SideBarContent';
import SecurityRoleForm from './components/SecurityRoleForm';

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

const SecurityRolePage: FC = () => {
  useCurrentPageTitleUpdater('Employee Roles');

  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const [isSearching, setSearching] = useState<boolean>(false);
  const [securityRoles, setSecurityRoles] = useState<SecurityRolesModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (queryString) {
      params.append('q', queryString);
    }

    params.append('s', (currentPage * rowsPerPage).toString());
    params.append('l', rowsPerPage.toString());

    return params.toString();
  }, [queryString, currentPage, rowsPerPage]);

  const searchSecurityRoles = useCallback(async () => {
    setSearching(true);

    try {
      const url = `${ROLE_BASE_URL}?${getQueryParams()}`;
      const { data } = await axios.get(url);
      setCount(data.count);
      setSecurityRoles(data.roles);
    } catch (err) {
      console.error(err);
      setSearching(false);
    }

    setSearching(false);
  }, [getQueryParams]);

  useEffect(() => {
    searchSecurityRoles();
  }, [searchSecurityRoles]);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    setCurrentPage(0);
    action(actionParam);
  };

  const handleSearch = useCallback((searchQuery: string) => {
    performActionAndRevertPage(setQueryString, searchQuery);
  }, []);

  const debouncedSearchTerm = useDebounce(query, 500);
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      handleSearch(debouncedSearchTerm);
    } else if (debouncedSearchTerm.length === 0) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch]);

  const handleOpenEditSecurityRoles = (index: number): React.MouseEventHandler => () => {
    setSelectedIndex(index);
    setOpenForm(true);
    setIsEdit(true);
  };

  const handleCancelEditSecurityRoles = () => {
    setOpenForm(false);
    setIsEdit(false);
    setSelectedIndex(0);
  };

  const updateIndividualSecurityRole = (updatedSecurityRolesProperties: Partial<SecurityRolesModel>) => {
    setSecurityRoles(
      securityRoles!.map((role, index) => {
        if (index !== selectedIndex) {
          return role;
        }

        return Object.assign({}, role, updatedSecurityRolesProperties);
      })
    );
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Role...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <SecurityRoleTable
        isLoadingData={isSearching}
        securityRoles={securityRoles}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        handleOpenEditSecurityRole={handleOpenEditSecurityRoles}
      />
      <SideBarContent title={isEdit ? 'Edit Role' : 'Add Role'} open={openForm} onClickDrawer={() => setOpenForm(false)} width={'65%'}>
        <SecurityRoleForm
          roleId={isEdit ? securityRoles[selectedIndex].id : 0}
          updateIndividualSecurityRole={updateIndividualSecurityRole}
          handleClose={handleCancelEditSecurityRoles}
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
  );
};

export default SecurityRolePage;
