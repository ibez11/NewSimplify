import { FC } from 'react';
import { Button, Card, CardContent, CardHeader, Grid, Table, TableBody, Theme, Tooltip, Typography, makeStyles } from '@material-ui/core';
import TableHeader from './components/TableHeader';
import TableBodyChecklist from './components/TableBodyChecklist';
import AddIcon from '@material-ui/icons/Add';
import { ServiceType } from 'constants/enum';

interface Props {
  isLoading: boolean;
  service: ServiceDetailModel;
  isEditable: boolean;
  handleOpenForm(form: string): void;
}

const useStyles = makeStyles((theme: Theme) => ({
  cardHeader: { borderBottom: '1px solid rgba(224, 224, 224, 1)' },
  divider: {
    marginRight: theme.spacing(1)
  }
}));

const ServiceChecklist: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, service, isEditable, handleOpenForm } = props;
  const { Jobs } = service;

  return (
    <Card variant='outlined'>
      <CardHeader
        title={
          <Grid container direction='row' justify='space-between' alignItems='center'>
            <Typography variant='h5'>Job Checklist</Typography>
            <Tooltip
              title={
                !isEditable || service.invoiceNumber !== null
                  ? service.serviceType === ServiceType.ADDITIONAL
                    ? 'Cannot edit because this is separate quotation'
                    : 'Cannot edit because quotation already have invoice or quotation is cancelled'
                  : ''
              }
            >
              <span style={{ cursor: !isEditable || service.invoiceNumber !== null ? 'not-allowed' : 'default' }}>
                <Button
                  color='primary'
                  disabled={isLoading || !isEditable || service.invoiceNumber !== null}
                  onClick={() => handleOpenForm('Add Checklist')}
                >
                  <AddIcon />
                  Add Job Checklist
                </Button>
              </span>
            </Tooltip>
          </Grid>
        }
        className={classes.cardHeader}
      />
      <CardContent style={{ padding: 0 }}>
        <Table component='table'>
          <TableHeader
            headers={[
              { label: 'No.', verticalAlign: 'top' },
              { label: 'Job ID', verticalAlign: 'top' },
              { label: 'Checklist Title & Description', verticalAlign: 'top' },
              { label: 'Checklist Items', verticalAlign: 'top' }
            ]}
          />
          <TableBody>
            <TableBodyChecklist isLoading={isLoading} Jobs={Jobs} />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServiceChecklist;
