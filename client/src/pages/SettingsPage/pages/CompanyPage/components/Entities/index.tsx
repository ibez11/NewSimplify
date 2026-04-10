import { FC, useState, useEffect, Fragment } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { Grid } from '@material-ui/core';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import ActionSnackbar from 'components/ActionSnackbar';
import { ENTITY_BASE_URL } from 'constants/url';
import EntitiesContent from './components/EntitiesContent';

const Entities: FC = () => {
  const [isLoadingData, setLoadingData] = useState<boolean>(true);
  const [entities, setEntities] = useState<EntityModel[]>([]);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const getAllEntities = async () => {
      setLoadingData(true);
      try {
        const response = await axios.get(ENTITY_BASE_URL, { cancelToken: cancelTokenSource.token });
        setEntities(response.data.entities);
      } catch (err) {
        console.log(err);
      }
      setLoadingData(false);
    };

    getAllEntities();

    return () => {
      // Canceling the request if component is unmounted
      cancelTokenSource.cancel();
    };
  }, []);

  return (
    <Fragment>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <EntitiesContent isLoading={isLoadingData} entities={entities} setEntities={setEntities} handleSnackbar={handleSnackbar} />
        </Grid>
      </Grid>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={() => setOpenSnackbar(false)}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </Fragment>
  );
};

export default Entities;
