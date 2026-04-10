import { FC, Fragment, useState, useEffect } from 'react';
import { Divider, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import axios, { CancelTokenSource } from 'axios';
import SettingCodes from 'typings/SettingCodes';
import { SETTING_BASE_URL } from 'constants/url';
import { dummySetting, dummyGeneralSettingInfo, dummyTenantPlanDetail } from 'constants/dummy';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import ClientDuplication from './components/ClientDuplication';
import GeneralInfo from './components/GeneralInfo';
import OperationHour from './components/OperationHour';
import ActionSnackbar from 'components/ActionSnackbar';
import PriceVisibility from './components/PriceVisibility';
import PriceReportVisibility from './components/PriceReportVisibility';
import JobHistoryVisibility from './components/JobHistoryVisibility';
import FutureJobVisibility from './components/FutureJobVisibility';
import CollateItemReport from './components/CollateItemReport';
import WhatsappConfirmation from './components/WhatsappConfirmation';
import EmailReminder from './components/EmailReminder';
import SendJobReport from './components/SendJobReport';
import SmartRank from './components/SmartRank';
import ClientCallPermission from './components/ClientCallPermission';

const useStyles = makeStyles((theme: Theme) => ({
  textSubHeader: { marginTop: theme.spacing(5), marginBottom: theme.spacing(5) },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  marginDense: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

const GeneralSettingPage: FC = () => {
  useCurrentPageTitleUpdater('General');
  const classes = useStyles();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tenantPlanDetail, setTenantPlanDetail] = useState<TentantPlantDetail>(dummyTenantPlanDetail);
  const [settingDuplicateClient, setSettingDuplicateClient] = useState<SettingModel>(dummySetting);
  const [settingNotifCompleteEmail, setSettingNotifCompleteEmail] = useState<SettingModel>(dummySetting);
  const [generalSettingInfo, setGeneralSettingInfo] = useState<GeneralSettingInfo>(dummyGeneralSettingInfo);
  const [operatingId, setOperatingId] = useState<number>(0);
  const [startOperatingHour, setStartOperatingHour] = useState<string>('08:00:00');
  const [endOperatingHour, setEndOperatingHour] = useState<string>('21:00:00');
  const [settingPriceVisibility, setSettingPriceVisibility] = useState<SettingModel>(dummySetting);
  const [settingPriceReportVisibility, setSettingPriceReportVisibility] = useState<SettingModel>(dummySetting);
  const [settingJobHistoriesVisibility, setSettingJobHistoriesVisibility] = useState<SettingModel>(dummySetting);
  const [settingFutureJobsVisibility, setSettingFutureJobsVisibility] = useState<SettingModel>(dummySetting);
  const [reminderIdWA, setReminderIdWA] = useState<number>(0);
  const [reminderDayWA, setReminderDayWA] = useState<number>(0);
  const [reminderIsActiveWA, setReminderIsActiveWA] = useState<boolean>(false);
  const [reminderIdEmail, setReminderIdEmail] = useState<number>(0);
  const [reminderDayEmail, setReminderDayEmail] = useState<number>(0);
  const [reminderIsActiveEmail, setReminderIsActiveEmail] = useState<boolean>(false);
  const [settingCollateItem, setSettingCollateItem] = useState<SettingModel>(dummySetting);
  const [settingSmartRank, setSettingSmartRank] = useState<SettingModel>(dummySetting);
  const [settingCallClientPermission, setSettingCallClientPermission] = useState<SettingModel>(dummySetting);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const tenant = await axios.get(`${SETTING_BASE_URL}/${SettingCodes.TENANTSUBSCRIPIONEXP}`, { cancelToken: cancelTokenSource.token });

        const { data } = await axios.get(SETTING_BASE_URL, { cancelToken: cancelTokenSource.token });
        const duplicateClient = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.DUPLICATECLIENT);
        const notifJobEmail = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.NOTIFCOMPLETEJOBEMAIL);
        const operatingHours: SettingModel = data.detailSetting.Setting.find((setting: any) => setting.label === 'OperationHours');
        const priceVisibility = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.PRICEVISIBILITY);
        const priceReportVisibility = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.PRICEREPORTVISIBILITY);
        const jobHistoriesVisibility = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.JOBHISTORIESVISIBILITY);
        const futureJobsVisibility = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.FUTUREJOBSVISIBILITY);
        const reminderSettingWA = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.WHATSAPPNOTIFICATION);
        const reminderSettingEmail = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.EMAILNOTIFICATION);
        const collateItem = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.COLLATEITEMS);
        const smartRank = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.SMARTRANKING);
        const arrayOperatingHours = operatingHours.value!.split(',');
        const callClientPermission = data.detailSetting.Setting.find((setting: any) => setting.code === SettingCodes.CALLCLIENTPERMISSION);

        setGeneralSettingInfo(data.detailSetting);
        setSettingNotifCompleteEmail(notifJobEmail);
        setSettingDuplicateClient(duplicateClient);
        setTenantPlanDetail(tenant.data);
        setOperatingId(operatingHours.id);
        setStartOperatingHour(arrayOperatingHours[0]);
        setEndOperatingHour(arrayOperatingHours[1]);
        setSettingPriceVisibility(priceVisibility);
        setSettingPriceReportVisibility(priceReportVisibility);
        setSettingJobHistoriesVisibility(jobHistoriesVisibility);
        setSettingFutureJobsVisibility(futureJobsVisibility);
        setReminderDayWA(reminderSettingWA.value);
        setReminderIdWA(reminderSettingWA.id);
        setReminderIsActiveWA(reminderSettingWA.isActive);
        setReminderDayEmail(reminderSettingEmail.value);
        setReminderIdEmail(reminderSettingEmail.id);
        setReminderIsActiveEmail(reminderSettingEmail.isActive);
        setSettingCollateItem(collateItem);
        setSettingSmartRank(smartRank);
        setSettingCallClientPermission(callClientPermission);
      } catch (err) {
        console.log(err);
      }
      setIsLoading(false);
    };

    fetchSettings();

    return () => {
      cancelTokenSource.cancel();
    };
  }, []);

  const handleOpenSnackbar = (type: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(type);
    setSnackbarMessage(message);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Fragment>
      <Grid item md={12} sm container>
        <GeneralInfo isLoading={isLoading} generalSettingInfo={generalSettingInfo} tenantPlanDetail={tenantPlanDetail} />
      </Grid>
      <Typography variant='h4' className={classes.textSubHeader}>
        Operation
      </Typography>
      <OperationHour
        operatingId={operatingId}
        startOperatingHour={startOperatingHour}
        setStartOperatingHour={setStartOperatingHour}
        endOperatingHour={endOperatingHour}
        setEndOperatingHour={setEndOperatingHour}
        handleOpenSnackbar={handleOpenSnackbar}
      />
      <Divider className={classes.divider} />
      <Typography variant='h4' className={classes.textSubHeader}>
        Job & Client
      </Typography>
      <Grid container spacing={4} className={classes.marginDense}>
        <FutureJobVisibility
          settingFutureJobsVisibility={settingFutureJobsVisibility}
          setSettingFutureJobsVisibility={setSettingFutureJobsVisibility}
          handleOpenSnackbar={handleOpenSnackbar}
        />
      </Grid>
      <Grid container spacing={4} className={classes.marginDense}>
        <JobHistoryVisibility
          settingJobHistoriesVisibility={settingJobHistoriesVisibility}
          setSettingJobHistoriesVisibility={setSettingJobHistoriesVisibility}
          handleOpenSnackbar={handleOpenSnackbar}
        />
        <PriceVisibility
          settingPriceVisibility={settingPriceVisibility}
          setSettingPriceVisibility={setSettingPriceVisibility}
          handleOpenSnackbar={handleOpenSnackbar}
        />
        <PriceReportVisibility
          settingPriceReportVisibility={settingPriceReportVisibility}
          setSettingPriceReportVisibility={setSettingPriceReportVisibility}
          handleOpenSnackbar={handleOpenSnackbar}
        />
        <CollateItemReport
          settingCollateItem={settingCollateItem}
          setSettingCollateItem={setSettingCollateItem}
          handleOpenSnackbar={handleOpenSnackbar}
        />
        <ClientDuplication
          settingDuplicateClient={settingDuplicateClient}
          setSettingDuplicateClient={setSettingDuplicateClient}
          handleOpenSnackbar={handleOpenSnackbar}
        />
        <SmartRank settingSmartRank={settingSmartRank} setSettingSmartRank={setSettingSmartRank} handleOpenSnackbar={handleOpenSnackbar} />
        <ClientCallPermission
          settingCallClientPermission={settingCallClientPermission}
          setSettingCallClientPermission={setSettingCallClientPermission}
          handleOpenSnackbar={handleOpenSnackbar}
        />
      </Grid>

      <Divider className={classes.divider} />
      <Typography variant='h4' className={classes.textSubHeader}>
        Notification
      </Typography>
      <Grid container spacing={4} className={classes.marginDense}>
        <WhatsappConfirmation
          isLoading={isLoading}
          reminderIdWA={reminderIdWA}
          remiderDayWA={reminderDayWA}
          reminderIsActiveWA={reminderIsActiveWA}
          setReminderDayWA={setReminderDayWA}
          setReminderIsActiveWA={setReminderIsActiveWA}
          handleOpenSnackbar={handleOpenSnackbar}
        />
        <EmailReminder
          isLoading={isLoading}
          reminderIdEmail={reminderIdEmail}
          remiderDayEmail={reminderDayEmail}
          reminderIsActiveEmail={reminderIsActiveEmail}
          setReminderDayEmail={setReminderDayEmail}
          setReminderIsActiveEmail={setReminderIsActiveEmail}
          handleOpenSnackbar={handleOpenSnackbar}
        />
        <SendJobReport
          settingNotifCompleteEmail={settingNotifCompleteEmail}
          setSettingNotifCompleteEmail={setSettingNotifCompleteEmail}
          handleOpenSnackbar={handleOpenSnackbar}
        />
      </Grid>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </Fragment>
  );
};

export default GeneralSettingPage;
