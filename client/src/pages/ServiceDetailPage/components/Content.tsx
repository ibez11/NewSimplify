import { FC } from 'react';
import ServiceInfo from './components/ServiceInfo';
import ServiceSchedule from './components/ServiceSchedule';
import ServiceChecklist from './components/ServiceChecklist';

interface Props {
  isLoading: boolean;
  service: ServiceDetailModel;
  isEditable: boolean;
  handleOpenForm(form: string): void;
  setOpenInvoiceForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const Content: FC<Props> = props => {
  const { isLoading, service, isEditable, handleOpenForm, setOpenInvoiceForm } = props;

  return (
    <>
      <ServiceInfo isLoading={isLoading} service={service} setOpenInvoiceForm={setOpenInvoiceForm} />
      <ServiceSchedule isLoading={isLoading} service={service} handleOpenForm={handleOpenForm} isEditable={isEditable} />
      <ServiceChecklist isLoading={isLoading} service={service} handleOpenForm={handleOpenForm} isEditable={isEditable} />
    </>
  );
};

export default Content;
