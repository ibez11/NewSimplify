import React, { FC, useState, useEffect, useCallback } from 'react';
import { Button, Divider, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';

import SearchInput from 'components/SearchInput';
import useDebounce from 'hooks/useDebounce';
import BrandTable from './components/BrandTable';
import ActionSnackbar from 'components/ActionSnackbar';

import { BRAND_TEMPLATE_BASE_URL } from 'constants/url';
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

const BrandTemplate: FC = () => {
  const classes = useStyles();

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const [isSearchingBrandTemplate, setSearchingBrandTemplate] = useState<boolean>(false);
  const [, setSearchBrandTemplateError] = useState<boolean>(false);
  const [brandTemplates, setBrandTemplates] = useState<BrandTemplateModel[]>([]);
  const [count, setCount] = useState<number>(0);

  const [openCreateBrandTemplate, setOpenCreateBrandTemplate] = useState<boolean>(false);
  const [openEditBrandTemplate, setOpenEditBrandTemplate] = useState<boolean>(false);
  const [currentEditingBrandTemplateIndex, setCurrentEditingBrandTemplateIndex] = useState<number>(0);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  // Search BrandTemplate whenever rowsPerPage, currentPage, queryString changes
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

    const searchBrandTemplate = async () => {
      setSearchingBrandTemplate(true);
      setSearchBrandTemplateError(false);

      try {
        const url = `${BRAND_TEMPLATE_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setBrandTemplates(data.BrandTemplates);
      } catch (err) {
        setSearchBrandTemplateError(true);
      }

      setSearchingBrandTemplate(false);
    };

    searchBrandTemplate();

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

  const handleOpenCreateBrandTemplate = () => {
    setOpenEditBrandTemplate(false);
    setOpenCreateBrandTemplate(true);
  };

  const handleCancelCreateBrandTemplate = () => {
    setOpenCreateBrandTemplate(false);
  };

  const handleOpenEditBrandTemplate = (skillIndex: number): React.MouseEventHandler => () => {
    setCurrentEditingBrandTemplateIndex(skillIndex);
    setOpenCreateBrandTemplate(false);
    setOpenEditBrandTemplate(true);
  };

  const handleCancelEditBrandTemplate = () => {
    setOpenEditBrandTemplate(false);
  };

  const addNewBrandTemplate = (brandTemplate: BrandTemplateModel) => {
    brandTemplate.new = true;
    brandTemplates.unshift(brandTemplate);
    setBrandTemplates([...brandTemplates]);
    setCount(c => c + 1);
  };

  const updateIndividualBrandTemplate = (updatedBrandTemplateProperties: Partial<BrandTemplateModel>) => {
    setBrandTemplates(
      brandTemplates!.map((brandTemplate, index) => {
        if (index !== currentEditingBrandTemplateIndex) {
          return brandTemplate;
        }

        return Object.assign({}, brandTemplate, updatedBrandTemplateProperties);
      })
    );
  };

  const deleteIndividualBrandTemplate = (skillIndex: number) => {
    brandTemplates.splice(skillIndex, 1);
    setBrandTemplates([...brandTemplates]);
    setCount(c => c - 1);
  };

  return (
    <Paper variant='outlined' className={classes.paper}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search Brands...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
        <Button
          color='primary'
          size='medium'
          variant='contained'
          disabled={isSearchingBrandTemplate}
          disableElevation
          className={classes.addButton}
          startIcon={<AddIcon />}
          onClick={() => {
            handleOpenCreateBrandTemplate();
          }}
        >
          New Template
          <LoadingButtonIndicator isLoading={isSearchingBrandTemplate} />
        </Button>
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <BrandTable
        isLoadingData={isSearchingBrandTemplate}
        brandTemplates={brandTemplates}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event, page) => setCurrentPage(page)}
        handleChangeRowsPerPage={event => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
        openCreateBrandTemplate={openCreateBrandTemplate}
        handleCancelCreateBrandTemplate={handleCancelCreateBrandTemplate}
        addNewBrandTemplate={addNewBrandTemplate}
        openEditBrandTemplate={openEditBrandTemplate}
        brandTemplate={brandTemplates[currentEditingBrandTemplateIndex]}
        currentEditingBrandTemplateIndex={currentEditingBrandTemplateIndex}
        handleOpenEditBrandTemplate={handleOpenEditBrandTemplate}
        handleCancelEditBrandTemplate={handleCancelEditBrandTemplate}
        updateIndividualBrandTemplate={updateIndividualBrandTemplate}
        deleteIndividualBrandTemplate={deleteIndividualBrandTemplate}
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

export default BrandTemplate;
