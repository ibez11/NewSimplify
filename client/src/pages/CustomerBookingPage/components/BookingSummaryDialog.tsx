import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControlLabel, Typography, Box } from '@material-ui/core';
import { format } from 'date-fns';
import theme from 'theme';

type Job = {
  id: number;
  label: string;
  selectedDateTime: Date;
  isConfirmed: boolean;
};

interface BookingSummaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  acceptTerms: boolean;
  setAcceptTerms: React.Dispatch<React.SetStateAction<boolean>>;
  jobs: Job[];
  isSaving?: boolean;
}

const BookingSummaryDialog: React.FC<BookingSummaryDialogProps> = ({
  open,
  onClose,
  onSave,
  acceptTerms,
  setAcceptTerms,
  jobs,
  isSaving = false
}) => {
  const confirmedJobs = jobs.filter(job => job.isConfirmed);

  const format12HourRange = (timeStr: string): string => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const start = new Date();
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start);
    end.setMinutes(start.getMinutes() + 30);
    return `${format(start, 'h:mm')} - ${format(end, 'h:mm a')}`;
  };

  const getTimeString = (date: Date) => {
    const hour = date
      .getHours()
      .toString()
      .padStart(2, '0');
    const minute = date
      .getMinutes()
      .toString()
      .padStart(2, '0');
    return `${hour}:${minute}`;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='xs'>
      <DialogTitle>
        <Typography variant='h5'>Confirm Your Booking</Typography>
      </DialogTitle>
      <DialogContent dividers>
        {confirmedJobs.length === 0 ? (
          <Typography>No jobs have been scheduled yet.</Typography>
        ) : (
          <Box component='ul' style={{ paddingLeft: 20, marginTop: 0 }}>
            {confirmedJobs.map(job => {
              const timeRange = format12HourRange(getTimeString(new Date(job.selectedDateTime)));
              return (
                <li key={job.id} style={{ marginBottom: 12 }}>
                  <Typography variant='subtitle1'>{job.label}</Typography>
                  <Typography variant='body2'>Job Date: {format(job.selectedDateTime, 'EEE, dd MMM yyyy')}</Typography>
                  <Typography variant='body2'>Estimated Arrival Time: {timeRange}</Typography>
                </li>
              );
            })}
          </Box>
        )}

        <Typography variant='body2' gutterBottom style={{ marginTop: theme.spacing(3) }}>
          Please review your booking details, check the box below, and then click <strong>"Save"</strong> to confirm.
        </Typography>

        <FormControlLabel
          control={<Checkbox checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} color='primary' />}
          label="I've checked and confirm my booking."
        />
      </DialogContent>
      <DialogActions>
        <Button fullWidth onClick={onClose} variant='contained' disableElevation disabled={isSaving}>
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={onSave}
          color='primary'
          variant='contained'
          disableElevation
          disabled={!acceptTerms || confirmedJobs.length === 0 || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingSummaryDialog;
