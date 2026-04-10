import { FC } from 'react';
import { Button, Card, CardContent, CardHeader, Grid, Table, TableBody, Theme, Tooltip, Typography, makeStyles } from '@material-ui/core';
import TableHeader from './components/TableHeader';
import TableBodySchedule from './components/TableBodySchedule';
import TableFooter from './components/TableFooterSchedule';
import EditIcon from '@material-ui/icons/Edit';
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

const ServiceSchedule: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, service, isEditable, handleOpenForm } = props;
  const { Jobs, invoiceNumber } = service;

  return (
    <Card variant='outlined'>
      <CardHeader
        title={
          <Grid container direction='row' justify='space-between' alignItems='center'>
            <Typography variant='h5'>Job Schedules</Typography>
            <Tooltip
              title={
                !isEditable || invoiceNumber !== null
                  ? service.serviceType === ServiceType.ADDITIONAL
                    ? 'Cannot edit because this is separate quotation'
                    : 'Cannot edit because quotation already have invoice or quotation is cancelled'
                  : 'Edit schedule will affect to job with status unassigned or confirmed or assigned'
              }
            >
              <span style={{ cursor: !isEditable || service.invoiceNumber !== null ? 'not-allowed' : 'default' }}>
                <Button
                  color='primary'
                  disabled={isLoading || !isEditable || service.invoiceNumber !== null}
                  onClick={() => handleOpenForm('edit schedules')}
                >
                  <EditIcon />
                  Edit Job Schedules
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
              { label: 'Job Occurrences', verticalAlign: 'top' },
              { label: 'Job ID', verticalAlign: 'top' },
              { label: 'Start & End Date Time', verticalAlign: 'top' },
              { label: 'Item & Description', verticalAlign: 'top' },
              { label: 'Quantity', verticalAlign: 'top' },
              { label: 'Price', verticalAlign: 'top' },
              { label: 'Job Amount', verticalAlign: 'top' },
              { label: 'Job Status', verticalAlign: 'top' }
            ]}
          />
          <TableBody>
            <TableBodySchedule isLoading={isLoading} Jobs={Jobs} />
          </TableBody>
          <TableFooter isLoading={isLoading} service={service} />
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServiceSchedule;
