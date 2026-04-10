import React, { FC, useState, useContext } from 'react';
import clsx from 'clsx';
import { Container, Grid, makeStyles, Theme, Typography } from '@material-ui/core';
import { CurrentPageContext } from 'contexts/CurrentPageContext';
import SettingPageContents from 'typings/SettingPageContents';
import SubMenu from './components/SubMenu';
import Breadcrumb from 'components/Breadcrumb';
import ServiceItemTemplatePage from './pages/ServiceItemTemplatePage';
import EmployeesPage from './pages/EmployeesPage';
import CompanyPage from './pages/CompanyPage';
import VehiclesPage from './pages/VehiclesPage';
import AgentPage from './pages/AgentPage';
import GeneralSettingPage from './pages/GeneralSettingPage';
import AppLogPage from './pages/AppLogPage';
import SkillPage from './pages/SkillPage';
import TemplatesPage from './pages/TemplatesPage';
import SecurityRolePage from './pages/SecurityRolePage';
import PDFLayoutPage from './pages/PDFLayoutPage';
import BookingPage from './pages/BookingPage';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(4)
    }
  },
  subMenuGrid: {
    borderRight: '1px solid #dcdcdc',
    maxWidth: 150
  },
  content: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(0.2)
  },
  rightContent: {
    maxHeight: 800,
    overflow: 'auto'
  },
  headerPageTitleContainer: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(2)
  },
  contentContainer: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(0)
  }
}));

const SettingsPage: FC = () => {
  const classes = useStyles();
  const { currentPageTitle } = useContext(CurrentPageContext);

  const [selectedContent, setSelectedContent] = useState<SettingPageContents>(SettingPageContents.GeneralSetting);
  const selectedRenderContent = (selectedContent: SettingPageContents): React.MouseEventHandler => () => {
    setSelectedContent(selectedContent);
  };

  const SelectedPage: FC<{ page: SettingPageContents }> = props => {
    switch (props.page) {
      case SettingPageContents.GeneralSetting:
        return <GeneralSettingPage />;
      case SettingPageContents.Company:
        return <CompanyPage />;
      case SettingPageContents.Employees:
        return <EmployeesPage />;
      case SettingPageContents.Services:
        return <ServiceItemTemplatePage />;
      case SettingPageContents.Vehicles:
        return <VehiclesPage />;
      case SettingPageContents.Agents:
        return <AgentPage />;
      case SettingPageContents.AppLog:
        return <AppLogPage />;
      case SettingPageContents.Skills:
        return <SkillPage />;
      case SettingPageContents.Templates:
        return <TemplatesPage />;
      case SettingPageContents.PDFLayout:
        return <PDFLayoutPage />;
      case SettingPageContents.Security:
        return <SecurityRolePage />;
      case SettingPageContents.CustomerBooking:
        return <BookingPage />;
      default:
        return <div />;
    }
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Typography variant='h4' gutterBottom>
            Settings Page
          </Typography>
          <Breadcrumb pages={['settings']} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item className={classes.subMenuGrid}>
          <SubMenu selectedRenderContent={selectedRenderContent} subMenuActive={selectedContent} />
        </Grid>
        <Grid item xs={12} sm container>
          <Grid item xs container direction='column' spacing={2}>
            <Grid item xs>
              <Container className={classes.headerPageTitleContainer}>
                <Typography variant='h5'>{currentPageTitle} Settings</Typography>
              </Container>
              <Container className={classes.contentContainer}>
                <SelectedPage page={selectedContent} />
              </Container>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SettingsPage;
