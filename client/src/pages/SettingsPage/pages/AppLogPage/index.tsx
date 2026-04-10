import React, { FC, useState, useEffect, useCallback } from 'react';
import { Divider, Grid, Paper } from '@material-ui/core';
import axios, { CancelTokenSource } from 'axios';

import useDebounce from 'hooks/useDebounce';
import SearchInput from 'components/SearchInput';
import AppLogTable from './components/AppLogTable';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import { APPLOG_BASE_URL } from 'constants/url';

const AppLogPage: FC = () => {
  useCurrentPageTitleUpdater('App Logs');

  const [query, setQuery] = useState<string>('');
  const [queryString, setQueryString] = useState<string>();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isSearching, setSearching] = useState<boolean>(false);
  const [, setSearchError] = useState<boolean>(false);
  const [appLogs, setAppLogs] = useState<AppLogModel[]>([]);
  const [count, setCount] = useState<number>(0);

  // Search whenever rowsPerPage, currentPage, queryString changes
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

    const searchServiceTemplate = async () => {
      setSearching(true);
      setSearchError(false);

      try {
        const url = `${APPLOG_BASE_URL}?${getQueryParams()}`;
        const { data } = await axios.get(url, { cancelToken: cancelTokenSource.token });
        setCount(data.count);
        setAppLogs(data.appLogs);
      } catch (err) {
        setSearchError(true);
      }

      setSearching(false);
    };

    searchServiceTemplate();

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

  return (
    <Paper variant='outlined' style={{ margin: 'auto' }}>
      <Grid container justify='space-between' style={{ padding: 16 }}>
        <SearchInput
          withBorder
          withTransition={false}
          width={150}
          placeHolder='Search App Logs...'
          iconColor='#989898'
          tableSearchValue={query}
          setTableSearchValue={setQuery}
        />
      </Grid>
      <Divider style={{ marginTop: 16 }} />
      <AppLogTable
        isLoadingData={isSearching}
        appLogs={appLogs}
        count={count}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        handleChangePage={(event: any, page: React.SetStateAction<number>) => setCurrentPage(page)}
        handleChangeRowsPerPage={(event: any) => performActionAndRevertPage(setRowsPerPage, +event.target.value)}
      />
    </Paper>
  );
};

export default AppLogPage;
