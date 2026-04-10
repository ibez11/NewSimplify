import { FC } from 'react';
import { TableHead } from '@material-ui/core';
import HeaderRow from 'components/HeaderRow';

interface Props {
  headers: any[];
}

const TableHeader: FC<Props> = props => {
  const { headers } = props;

  return (
    <TableHead>
      <HeaderRow headers={headers} />
    </TableHead>
  );
};

export default TableHeader;
