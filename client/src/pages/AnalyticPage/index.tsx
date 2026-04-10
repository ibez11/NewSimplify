import React, { FC, useContext, useState } from 'react';
import { Container, Grid, makeStyles, Theme, Typography } from '@material-ui/core';

import AnalyticContent from './components/AnalyticContent';
import ReportContent from './components/ReportContent';
import FeedbackContent from './components/FeedbackContent';
import clsx from 'clsx';

import { CurrentPageContext } from 'contexts/CurrentPageContext';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';

import CustomizedTabs from 'components/CustomizedTabs';
import Breadcrumb from 'components/Breadcrumb';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  },
  container: {
    '& > :nth-child(n+2)': {
      marginTop: theme.spacing(2)
    }
  },
  paper: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    margin: 'auto'
  }
}));

const AnalyticPage: FC = () => {
  useCurrentPageTitleUpdater('Reports & Analytics Page');

  const classes = useStyles();
  const { currentPageTitle } = useContext(CurrentPageContext);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    action(actionParam);
  };

  const SelectedContent: FC<{ page: number }> = props => {
    switch (props.page) {
      case 0:
        return <ReportContent />;
      case 1:
        return <AnalyticContent />;
      case 2:
        return <FeedbackContent />;
      default:
        return <div />;
    }
  };

  return (
    <Container maxWidth={false} className={clsx(classes.root, classes.container)}>
      <Grid container spacing={3}>
        <Grid item sm={12}>
          <Typography variant='h4' gutterBottom>
            {currentPageTitle}
          </Typography>
          <Breadcrumb pages={[selectedTab === 0 ? 'reports' : selectedTab === 1 ? 'analytics' : 'feedbacks']} />
        </Grid>
      </Grid>
      <CustomizedTabs
        tabs={[
          { id: 0, name: 'Reports' },
          { id: 1, name: 'Analytics' },
          { id: 2, name: 'Feedback & Rating' }
        ]}
        selectedTabId={selectedTab}
        onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
      />
      <SelectedContent page={selectedTab} />
    </Container>
  );
};

export default AnalyticPage;
