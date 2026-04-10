import { FC, useState, useEffect, Fragment } from 'react';
import { Backdrop, Button, ButtonGroup, CircularProgress, Grid, makeStyles, Theme } from '@material-ui/core';

import JobCompletedReport from './components/JobCompletedReport';
import JobValueCompletedReport from './components/JobValueCompletedReport';
// import TotalJobHourReport from './components/TotalJobHourReport';
// import JobOvertimeReport from './components/JobOvertimeReport';
// import JobOverdueReport from './components/JobOverdueReport';
import axios, { CancelTokenSource } from 'axios';
import { startOfMonth, endOfMonth } from 'date-fns';
import { GET_ACTIVE_TECHNICIANS_URL, GET_ACTIVE_VEHICLE_URL } from 'constants/url';

const useStyles = makeStyles((theme: Theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff'
  },
  buttonGroup: {
    margin: theme.spacing(2)
  },
  button: {
    width: 150
  }
}));

const ReportContent: FC = () => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState<string>('technician');
  const [selectMaster, setSelectMaster] = useState<Select[]>([]);
  const [selectedId, setSelectedId] = useState<number>(0);

  const [filterBy, setFilterBy] = useState<number>(0);
  const [firstDate, setFirstDate] = useState<Date | null>(startOfMonth(new Date()));
  const [secondDate, setSecondDate] = useState<Date | null>(endOfMonth(new Date()));

  const buttonHandleChange = (value: string) => {
    setActiveButton(value);
    loadProperties(value);
  };

  const loadProperties = async (value: any) => {
    try {
      setIsLoadingData(true);

      const masterData: Select[] = [];
      if (value === 'technician') {
        const { data } = await axios.get(`${GET_ACTIVE_TECHNICIANS_URL}`, { cancelToken: cancelTokenSource.token });
        data.activeUsers.map((value: any) => {
          return masterData.push({ id: value.id, name: value.displayName });
        });
      } else {
        const { data } = await axios.get(`${GET_ACTIVE_VEHICLE_URL}`, { cancelToken: cancelTokenSource.token });
        data.vehicles.map((value: any) => {
          return masterData.push({ id: value.id, name: value.carplateNumber });
        });
      }

      setSelectMaster(masterData);
      setSelectedId(masterData[0].id);
      setIsLoadingData(false);
    } catch (err) {
      console.log(err);
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadProperties(activeButton);

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
        <ButtonGroup size='small' variant='outlined' className={classes.buttonGroup}>
          <Button
            color={activeButton === 'technician' ? 'primary' : 'default'}
            className={classes.button}
            onClick={() => buttonHandleChange('technician')}
          >
            Technicians
          </Button>
          <Button color={activeButton === 'vehicle' ? 'primary' : 'default'} className={classes.button} onClick={() => buttonHandleChange('vehicle')}>
            vehicles
          </Button>
        </ButtonGroup>
      </Grid>
      <JobValueCompletedReport
        setIsLoadingData={setIsLoadingData}
        selectMaster={selectMaster}
        activeButton={activeButton}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        firstDate={firstDate}
        setFirstDate={setFirstDate}
        secondDate={secondDate}
        setSecondDate={setSecondDate}
      />
      <JobCompletedReport
        setIsLoadingData={setIsLoadingData}
        activeButton={activeButton}
        selectedId={selectedId}
        filterBy={filterBy}
        firstDate={firstDate}
        secondDate={secondDate}
      />
    </Fragment>
  );
};

export default ReportContent;
