import { FC, useState, useEffect, Fragment } from 'react';
import { Backdrop, CircularProgress, Grid, makeStyles, Theme } from '@material-ui/core';

import TechnicianRating from './components/TechnicianRating';
import CompanyRating from './components/CompanyRating';
import FeedbackCustomer from './components/FeedbackCustomer';

import axios, { CancelTokenSource } from 'axios';
import { startOfYear, endOfYear, subYears } from 'date-fns';
import { GET_ACTIVE_TECHNICIANS_URL } from 'constants/url';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  },
  buttonGroup: {
    margin: theme.spacing(4)
  },
  button: {
    width: 150
  }
}));

const FeedbackContent: FC = () => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [selectMaster, setSelectMaster] = useState<Select[]>([]);
  const [selectedId, setSelectedId] = useState<number>(0);

  const currentYear = startOfYear(new Date());
  const [firstDate, setFirstDate] = useState<Date | null>(subYears(currentYear, 1));
  const [secondDate, setSecondDate] = useState<Date | null>(endOfYear(new Date()));

  const [openFeedback, setOpenFeedBack] = useState<boolean>(false);

  const loadProperties = async () => {
    try {
      setIsLoadingData(true);

      const masterData: Select[] = [];

      const { data } = await axios.get(`${GET_ACTIVE_TECHNICIANS_URL}`, { cancelToken: cancelTokenSource.token });
      data.activeUsers.map((value: any) => {
        return masterData.push({ id: value.id, name: value.displayName });
      });

      setSelectMaster(masterData);
      setSelectedId(masterData[0].id);
      setIsLoadingData(false);
    } catch (err) {
      console.log(err);
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadProperties();

    return () => {
      cancelTokenSource.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <Backdrop className={classes.backdrop} open={isLoadingData}>
        <CircularProgress color='inherit' />
      </Backdrop>
      <Grid container spacing={1}>
        <Grid item xs={openFeedback ? 7 : 12}>
          <TechnicianRating
            setIsLoadingData={setIsLoadingData}
            selectMaster={selectMaster}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            firstDate={firstDate}
            setFirstDate={setFirstDate}
            secondDate={secondDate}
            setSecondDate={setSecondDate}
            openFeedback={openFeedback}
            setOpenFeedback={setOpenFeedBack}
          />
        </Grid>
        {openFeedback && (
          <Grid item xs={5}>
            <FeedbackCustomer setIsLoadingData={setIsLoadingData} />
          </Grid>
        )}
      </Grid>
      <CompanyRating setIsLoadingData={setIsLoadingData} firstDate={firstDate} secondDate={secondDate} />
    </Fragment>
  );
};

export default FeedbackContent;
