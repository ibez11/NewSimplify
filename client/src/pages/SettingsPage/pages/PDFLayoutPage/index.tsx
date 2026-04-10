import { FC, useState } from 'react';
import { Avatar, Button, Grid, makeStyles, Theme, Typography } from '@material-ui/core';

import useCurrentPageTitleUpdater from 'hooks/useCurrentPageTitleUpdater';
import QuotationIcon from 'images/SettingIcon/quotation.png';
import InvoiceIcon from 'images/SettingIcon/invoice.png';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import SideBarContent from 'components/SideBarContent';
import LayoutForm from './components/LayoutForm';
import { invoiceSectionOption, quotationSectionOption } from 'constants/pdfLayoutOption';
import { dummyInvoiceOption, dummyQuotationOption } from 'constants/dummy';
import ActionSnackbar from 'components/ActionSnackbar';

const useStyles = makeStyles((theme: Theme) => ({
  gridContainer: {
    padding: theme.spacing(4),
    textAlign: 'left'
  }
}));

const PDFLayoutPage: FC = () => {
  useCurrentPageTitleUpdater('PDF Layout');
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(false);
  const [type, setType] = useState<string>('quotation');

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleCloseForm = () => {
    setOpen(false);
  };

  const handleSnackbar = (variant: 'success' | 'error', snackbarMessage: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(variant);
    setSnackbarMessage(snackbarMessage);
  };

  return (
    <>
      <Grid container spacing={2} justify='space-between'>
        <Grid item xs>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => {
              setOpen(true);
              setType('quotation');
            }}
          >
            <Grid container alignItems='center' className={classes.gridContainer}>
              <Grid item xs={2}>
                <Avatar variant='square' src={QuotationIcon} />
              </Grid>
              <Grid item xs={10}>
                <Typography variant='h4'>Quotation PDF</Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                  Streamline Your Quoting Process with a Custom Template
                </Typography>
              </Grid>
            </Grid>
          </Button>
        </Grid>
        <Grid item xs>
          <Button
            variant='outlined'
            fullWidth
            onClick={() => {
              setOpen(true);
              setType('invoice');
            }}
          >
            <Grid container alignItems='center' className={classes.gridContainer}>
              <Grid item xs={2}>
                <Avatar variant='square' src={InvoiceIcon} />
              </Grid>
              <Grid item xs={10}>
                <Typography variant='h4'>Invoice PDF</Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                  Custom Invoice Template for Your Business
                </Typography>
              </Grid>
            </Grid>
          </Button>
        </Grid>
      </Grid>
      <SideBarContent title={type.includes('quotation') ? 'Quotation PDF' : 'Invoice PDF'} open={open} onClickDrawer={handleCloseForm} width='100%'>
        <LayoutForm
          type={type}
          sections={type.includes('quotation') ? quotationSectionOption : invoiceSectionOption}
          dummyOptions={type.includes('quotation') ? dummyQuotationOption : dummyInvoiceOption}
          handleClose={handleCloseForm}
          handleSnackbar={handleSnackbar}
        />
      </SideBarContent>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarMessage}
        open={openSnackbar}
        handleClose={() => setOpenSnackbar(false)}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </>
  );
};

export default PDFLayoutPage;
