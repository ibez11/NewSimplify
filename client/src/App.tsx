import React, { useState, Fragment, useEffect } from 'react';
import clsx from 'clsx';
import { Box, Paper, Theme, Typography } from '@material-ui/core';
import { Switch, Route } from 'react-router';
import axios, { CancelTokenSource } from 'axios';
import { makeStyles } from '@material-ui/styles';

import ConditionalRoute from 'components/ConditionalRoute';
import LoginPage from 'pages/LoginPage';
import NotFoundPage from 'pages/NotFoundPage';
import ForgotPasswordPage from 'pages/ForgotPasswordPage';
import { CurrentUserProvider } from 'contexts/CurrentUserContext';
import { isUserAuthenticated, getCurrentNotifToken } from 'selectors';
import AppHeader from 'components/AppHeader';
import AppAlert from 'components/AppAlert';
import { attachTokenToHeader, detachTokenFromHeader } from 'utils/AxiosUtils';
import { GET_CURRENT_USER_URL, GET_EDIT_USER_TOKEN_URL, GCALANDER_HOLIDAY_URL, TABLE_COLUMN_SETTING_BASE_URL } from 'constants/url';
import { ALL_COUNTRY_CODE } from 'constants/countryCode';

import ServicesPage from 'pages/ServicesPage';
import ServiceDetailPage from 'pages/ServiceDetailPage';
import InvoiceDetailPage from 'pages/InvoiceDetailPage';
import InvoicePage from 'pages/InvoicePage';
import ClientPage from 'pages/ClientPage';
import ClientDetailPage from 'pages/ClientDetailPage';
import JobDetailPage from 'pages/JobDetailPage';
import JobsPage from 'pages/JobsPage';
import SchedulePage from 'pages/SchedulePage';
import AnalyticPage from 'pages/AnalyticPage';
import AppDrawer from 'components/AppDrawer';
import ResetPasswordPage from 'pages/ResetPassowordPage';
import SettingsPage from 'pages/SettingsPage';
import EquipmentPage from 'pages/EquipmentPage';
import { CurrentPageProvider } from 'contexts/CurrentPageContext';
import { PublicHolidayProvider } from 'contexts/PublicHolidayContext';
import { PhoneCodeProvider } from 'contexts/PhoneCodeContext';
import { TableColumnSettingProvider } from 'contexts/TableColumnSettingContext';
import { requestForToken } from './utils/Firebase';
import { AppDrawerProvider } from 'contexts/AppDrawerContext';
import CustomerBookingPage from 'pages/CustomerBookingPage';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex'
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '95vh',
    overflow: 'auto'
  },
  footerPaddingIsLoggedIn: {
    paddingRight: theme.spacing(6),
    marginTop: theme.spacing(1)
  }
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [currentPageTitle, setCurrentPageTitle] = useState<string>('');
  const [CurrentUserData, setCurrentUserData] = useState<CurrentUser>();
  const [holidayData, setHolidayData] = useState<any[]>([]);
  const [countryData, setCountriesData] = useState<any[]>([]);
  const [tableColumnSettingData, setTableColumnSettingData] = useState<any[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isAuthenticating, setAuthenticating] = useState(true);
  const [firstActiveMenu, setFirstActiveMenu] = useState<string>('/jobs'); // Set your default active menu

  const isLoggedIn = isUserAuthenticated(CurrentUserData);
  const notifToken = getCurrentNotifToken(CurrentUserData);

  //@ts-ignore
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  //@ts-ignore
  const isIE = /*@cc_on!@*/ false || !!document.documentMode;

  const hostname = window.location.hostname;
  const reservedSubdomains = ['app', 'dev', 'www']; // add more if needed

  const isLocal = hostname.includes('localhost');
  const mainDomain = isLocal ? 'localhost' : 'simplify.asia';

  const hostParts = hostname.split('.');
  const isSubdomain = hostParts.length >= 2 && hostname.endsWith(mainDomain);

  const firstPart = hostParts[0];
  const tenantSubdomain = isSubdomain && !reservedSubdomains.includes(firstPart) ? firstPart : null;

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  const setCurrentUser = (currentUser: CurrentUser, token: string): void => {
    localStorage.setItem('token', token);
    attachTokenToHeader(token);
    setCurrentUserData(currentUser);
  };

  const unsetCurrentUser = (): void => {
    localStorage.removeItem('token');
    detachTokenFromHeader();

    setCurrentUserData(undefined);
  };

  const setHolidays = (data: any[]): void => {
    setHolidayData(data);
  };

  const setCountries = (data: any[]): void => {
    setCountriesData(data);
  };

  const setTableColumn = (data: any[]): void => {
    setTableColumnSettingData(data);
  };

  useEffect(() => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    const getPersistedToken = () => {
      return localStorage.getItem('token');
    };

    const getCurrentUserData = async () => {
      setAuthenticating(true);
      const token = getPersistedToken();

      if (token) {
        try {
          const response = await axios.get(GET_CURRENT_USER_URL, {
            headers: { Authorization: `Bearer ${token}` },
            cancelToken: cancelTokenSource.token
          });
          const currentUser: CurrentUser = response.data;

          setCurrentUser(currentUser, token);
        } catch (err) {
          unsetCurrentUser();
        }
      }

      setAuthenticating(false);
    };

    const getHolidayData = async () => {
      try {
        const { data } = await axios.get(`${GCALANDER_HOLIDAY_URL}`, {
          transformRequest: (_data, headers) => {
            delete headers.common['Authorization'];
          }
        });

        let holidays: any[] = [];
        if (data.items) {
          data.items
            .filter((value: any) => {
              // Exclude observance days
              return !value.description?.toLowerCase().includes('observance');
            })
            .map((value: any) => {
              return holidays.push({ name: value.summary, date: value.start.date });
            });
        }
        setHolidays(holidays);
      } catch (err) {
        console.log(err);
      }
    };

    const getCallingCode = async () => {
      try {
        const countryCode = ALL_COUNTRY_CODE;

        let country: any[] = [];
        countryCode.map((value: any) => {
          return country.push({
            name: value.name.common,
            code: value.cca3,
            callingCode: value.idd.root + value.idd.suffixes,
            flag: value.flags.png
          });
        });

        setCountries(country.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.log(err);
      }
    };

    const getTableColumnSetting = async () => {
      const token = getPersistedToken();

      if (token) {
        try {
          const { data } = await axios.get(TABLE_COLUMN_SETTING_BASE_URL, {
            headers: { Authorization: `Bearer ${token}` },
            cancelToken: cancelTokenSource.token
          });

          setTableColumn(data);
        } catch (err) {
          console.log(err);
        }
      }
    };
    getCurrentUserData();

    if (isLoggedIn) {
      getHolidayData();
      getCallingCode();
      getTableColumnSetting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && !isSafari && !isIE) {
      Notification.requestPermission().then(async permission => {
        if (permission === 'granted') {
          const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
          const firebaseToken = await requestForToken();
          if (firebaseToken !== notifToken) {
            await axios.put(GET_EDIT_USER_TOKEN_URL, { token: firebaseToken }, { cancelToken: cancelTokenSource.token });
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      });
    }
  }, [isIE, isLoggedIn, isSafari, notifToken]);

  // ✅ Return booking-only UI if tenant subdomain detected
  if (isSubdomain && tenantSubdomain) {
    return (
      <Switch>
        <Route path='/' component={CustomerBookingPage} />
      </Switch>
    );
  }

  return isAuthenticating ? null : (
    <Box>
      <CurrentUserProvider
        value={{
          currentUser: CurrentUserData,
          setCurrentUser,
          unsetCurrentUser
        }}
      >
        <CurrentPageProvider
          value={{
            currentPageTitle,
            setCurrentPageTitle
          }}
        >
          <PublicHolidayProvider value={{ holidays: holidayData, setHolidays }}>
            <PhoneCodeProvider value={{ countries: countryData, setCountries }}>
              <TableColumnSettingProvider value={{ tableColumn: tableColumnSettingData, setTableColumn }}>
                <AppDrawerProvider value={{ firstActiveMenu, setFirstActiveMenu }}>
                  <div className={classes.root}>
                    {isLoggedIn && (
                      <Fragment>
                        <AppHeader open={openDrawer} handleDrawerOpen={handleDrawerOpen} />
                        <AppDrawer openDrawer={openDrawer} handleDrawerClose={handleDrawerClose} />
                      </Fragment>
                    )}
                    <main className={classes.content}>
                      {isLoggedIn && <div className={classes.appBarSpacer} />}
                      <Switch>
                        <ConditionalRoute exact={true} path={'/'} routeCondition={!isLoggedIn} component={LoginPage} redirectTo={firstActiveMenu} />
                        <ConditionalRoute
                          exact={true}
                          path={'/resetpassword'}
                          routeCondition={!isLoggedIn}
                          component={ResetPasswordPage}
                          redirectTo={'/'}
                        />
                        <ConditionalRoute
                          exact={true}
                          path={'/forgotpassword'}
                          routeCondition={!isLoggedIn}
                          component={ForgotPasswordPage}
                          redirectTo={firstActiveMenu}
                        />
                        <Paper elevation={0} style={{ marginBottom: 16, marginRight: 16 }}>
                          {isLoggedIn && <AppAlert />}
                          <ConditionalRoute
                            exact={true}
                            path={'/jobs'}
                            routeCondition={isLoggedIn}
                            module='JOBS'
                            component={JobsPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/jobs/:id'}
                            routeCondition={isLoggedIn}
                            module='JOBS'
                            component={JobDetailPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/invoices'}
                            routeCondition={isLoggedIn}
                            module='INVOICES'
                            component={InvoicePage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/invoices/:id'}
                            module='INVOICES'
                            routeCondition={isLoggedIn}
                            component={InvoiceDetailPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/quotations'}
                            routeCondition={isLoggedIn}
                            module='QUOTATIONS'
                            component={ServicesPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/quotations/:id'}
                            module='QUOTATIONS'
                            routeCondition={isLoggedIn}
                            component={ServiceDetailPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/schedule'}
                            routeCondition={isLoggedIn}
                            module='SCHEDULES'
                            component={SchedulePage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/clients'}
                            module='CLIENTS'
                            routeCondition={isLoggedIn}
                            component={ClientPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/clients/:id'}
                            routeCondition={isLoggedIn}
                            module='CLIENTS'
                            component={ClientDetailPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/equipments'}
                            routeCondition={isLoggedIn}
                            module='EQUIPMENTS'
                            component={EquipmentPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/analytics'}
                            routeCondition={isLoggedIn}
                            module='ANALYTICS'
                            component={AnalyticPage}
                            redirectTo={'/'}
                          />
                          <ConditionalRoute
                            exact={true}
                            path={'/settings'}
                            routeCondition={isLoggedIn}
                            module='SETTINGS'
                            component={SettingsPage}
                            redirectTo={'/'}
                          />
                          <Route path={'/notfound'} component={NotFoundPage} />
                        </Paper>
                      </Switch>
                    </main>
                  </div>
                </AppDrawerProvider>
              </TableColumnSettingProvider>
            </PhoneCodeProvider>
          </PublicHolidayProvider>
        </CurrentPageProvider>
      </CurrentUserProvider>
      <Typography
        variant={isLoggedIn ? 'body2' : 'h6'}
        color='textSecondary'
        align={!isLoggedIn ? 'center' : 'right'}
        className={clsx({ [classes.footerPaddingIsLoggedIn]: isLoggedIn })}
      >
        {'©' + new Date().getFullYear() + ' Simplify All Rights Reserved'}
      </Typography>
    </Box>
  );
};

export default App;
