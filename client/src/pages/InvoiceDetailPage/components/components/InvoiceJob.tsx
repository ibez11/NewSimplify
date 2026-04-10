import { FC } from 'react';
import TableHeader from './components/TableHeader';
import TableContent from './components/TableContent';
import TableFooter from './components/TableFooter';
import { Table } from '@material-ui/core';

interface Props {
  isLoading: boolean;
  invoice: InvoiceDetailModel;
}

const InvoiceJob: FC<Props> = props => {
  const { isLoading, invoice } = props;
  const { Job } = invoice;

  return (
    <Table component='table'>
      <TableHeader />
      <TableContent isLoading={isLoading} job={Job} />
      <TableFooter isLoading={isLoading} invoice={invoice} />
    </Table>
  );
};

export default InvoiceJob;
