import React, { FC, Fragment, useState } from 'react';
import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import CustomizedTabs from 'components/CustomizedTabs';

import QuotationEmailTemplate from './components/QuotationEmailTemplate';
import InvoiceEmailTemplate from './components/InvoiceEmailTemplate';
import JobEmailTemplate from './components/JobEmailTemplate';
import BrandTemplate from './components/BrandTemplate';
import ServiceTemplate from './components/ServiceTemplate';
import ChecklistTemplate from './components/ChecklistTemplate';
import JobNoteTemplate from './components/JobNoteTemplate';
import JobLabelTemplate from './components/JobLabelTemplate';

const EmailTemplatesPage: FC = () => {
  useCurrentPageTitleUpdater('Template');

  const [selectedTab, setSelectedTab] = useState<number>(0);

  const performActionAndRevertPage = (action: React.Dispatch<React.SetStateAction<any>>, actionParam: any) => {
    action(actionParam);
  };

  const SelectedContent: FC<{ page: number }> = props => {
    switch (props.page) {
      case 0:
        return <QuotationEmailTemplate />;
      case 1:
        return <InvoiceEmailTemplate />;
      case 2:
        return <JobEmailTemplate />;
      case 3:
        return <BrandTemplate />;
      case 4:
        return <ServiceTemplate />;
      case 5:
        return <ChecklistTemplate />;
      case 6:
        return <JobNoteTemplate />;
      case 7:
        return <JobLabelTemplate />;
      default:
        return <div />;
    }
  };

  return (
    <Fragment>
      <CustomizedTabs
        tabs={[
          { id: 0, name: 'Quotation Email' },
          { id: 1, name: 'Invoice Email' },
          { id: 2, name: 'Job Email' },
          { id: 3, name: 'Equipment Brand' },
          { id: 4, name: 'Quotation' },
          { id: 5, name: 'Checklist Job' },
          { id: 6, name: 'Job Note' },
          { id: 7, name: 'Job Label' }
        ]}
        selectedTabId={selectedTab}
        onSelect={(tabId: number) => performActionAndRevertPage(setSelectedTab, tabId)}
      />
      <SelectedContent page={selectedTab} />
    </Fragment>
  );
};

export default EmailTemplatesPage;
