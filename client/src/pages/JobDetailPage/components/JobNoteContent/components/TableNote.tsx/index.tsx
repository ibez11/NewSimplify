import { FC } from 'react';
import { Button, Card, CardHeader, CardContent, Divider, Grid, makeStyles, Theme, Typography, Table, TableHead, TableBody } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import HeaderRow from 'components/HeaderRow';
import { JobNoteType } from 'constants/enum';
import BodyRow from './components/BodyRow';
import { dummyJobNote } from 'constants/dummy';

interface Props {
  isLoading: boolean;
  jobId: number;
  jobNotes: JobNoteModel[];
  updateJobNoteVisibility: (jobNoteIndex: number, jobNoteStatus: boolean) => void;
  deleteIndividualJobNote: (jobNoteIndex: number) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string, isCountdown?: boolean) => void;
  handleOpenForm(): void;
  handleEditJobNote: (noteType: JobNoteType, index: number) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    borderRadius: 10
  },
  cardHeader: {
    padding: theme.spacing(2)
  },
  grid: {
    borderBottom: 'solid 1px #E5E5E5',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  actionButton: {
    margin: '16px 0'
  },
  actionIcon: {
    fontSize: 20
  }
}));

const TableNote: FC<Props> = props => {
  const classes = useStyles();

  const { isLoading, jobNotes, updateJobNoteVisibility, deleteIndividualJobNote, handleSnackbar, handleOpenForm, handleEditJobNote } = props;

  return (
    <Grid item xs={12}>
      <Card className={classes.card} variant='outlined'>
        <CardHeader
          className={classes.cardHeader}
          title={
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Typography variant='h5'>Job Notes</Typography>
              <Button color='primary' disabled={isLoading} startIcon={<AddIcon />} onClick={handleOpenForm}>
                Add Job Note
              </Button>
            </Grid>
          }
        />
        <Divider />
        <CardContent style={{ padding: 0 }}>
          <Table component='table'>
            <TableHead>
              <HeaderRow
                headers={[
                  { label: '', verticalAlign: 'top' },
                  { label: 'Notes', verticalAlign: 'top' },
                  { label: 'Equipment(s)', verticalAlign: 'top' },
                  { label: 'Added By', verticalAlign: 'top' },
                  { label: 'Show on Job Report', verticalAlign: 'top' },
                  { label: 'Action', verticalAlign: 'top' }
                ]}
              />
            </TableHead>
            <TableBody>
              {isLoading ? (
                <BodyRow
                  isLoading={isLoading}
                  jobNotes={[dummyJobNote]}
                  updateJobNoteVisibility={updateJobNoteVisibility}
                  deleteIndividualJobNote={deleteIndividualJobNote}
                  handleSnackbar={handleSnackbar}
                  handleEditJobNote={handleEditJobNote}
                />
              ) : (
                <BodyRow
                  isLoading={isLoading}
                  jobNotes={jobNotes || []}
                  updateJobNoteVisibility={updateJobNoteVisibility}
                  deleteIndividualJobNote={deleteIndividualJobNote}
                  handleSnackbar={handleSnackbar}
                  handleEditJobNote={handleEditJobNote}
                />
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default TableNote;
