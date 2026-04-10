import React, { FC, Fragment, useState } from 'react';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';

import CustomizedTabs from 'components/CustomizedTabs';
import ProfileDetails from './components/ProfileDetails';
import BusinessDetails from './components/BusinessDetails';
import Entities from './components/Entities';

const CompanyPage: FC = () => {
  useCurrentPageTitleUpdater('Company');

  const [selectedTab, setSelectedTab] = useState<number>(0);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    action(actionParam);
  };

  const SelectedContent: FC<{ page: number }> = props => {
    switch (props.page) {
      case 0:
        return <Entities />;
      case 1:
        return <ProfileDetails />;
      case 2:
        return <BusinessDetails />;
      default:
        return <div />;
    }
  };

  return (
    <Fragment>
      <CustomizedTabs
        tabs={[{ id: 0, name: 'Entities' }]}
        selectedTabId={selectedTab}
        onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
      />
      <SelectedContent page={selectedTab} />
    </Fragment>
  );
};

export default CompanyPage;
