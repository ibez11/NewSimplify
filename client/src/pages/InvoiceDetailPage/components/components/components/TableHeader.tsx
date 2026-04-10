import { FC } from 'react';
import { TableHead } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';

const TableHeader: FC = () => {
  return (
    <TableHead>
      <HeaderRow
        headers={[
          { label: 'Job ID', verticalAlign: 'top' },
          { label: 'Date & Time', verticalAlign: 'top' },
          { label: 'Service Item', verticalAlign: 'top' },
          { label: 'Quantity', verticalAlign: 'top' },
          { label: 'Price', verticalAlign: 'top' },
          { label: 'Job Amount', verticalAlign: 'top' },
          { label: 'Collected Amount & By', verticalAlign: 'top' },
          { label: 'Payment Method', verticalAlign: 'top' }
        ]}
      />
    </TableHead>
  );
};

export default TableHeader;
