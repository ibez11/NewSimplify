import { Typography } from '@material-ui/core';
import { FC } from 'react';
import Skeleton from '@material-ui/lab/Skeleton';

interface Props {
  isLoading: boolean;
  invoiceRemarks: string;
}

const InvoiceRemarks: FC<Props> = props => {
  const { isLoading, invoiceRemarks } = props;

  return (
    <div style={{ flexGrow: 1 }}>
      <Typography variant='h5' gutterBottom>
        Invoice Remarks
      </Typography>
      {isLoading ? (
        <Skeleton width={'100%'} />
      ) : (
        <Typography variant='body1' style={{ whiteSpace: 'pre-line' }}>
          {invoiceRemarks}
        </Typography>
      )}
    </div>
  );
};

export default InvoiceRemarks;
