import React from 'react';
import { Button, Grid, IconButton, Modal, Typography, Theme, Paper, withStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { orange } from '@material-ui/core/colors';
import useRouter from 'hooks/useRouter';
import axios, { CancelTokenSource } from 'axios';
import { GET_CONFIRM_SERVICE_URL } from 'constants/url';
import CloseIcon from '@material-ui/icons/Close';
import { grey } from '@material-ui/core/colors';

interface Props {
  open: boolean;
  contractId: number;
  contractNumber: string;
  handleOk(): void;
  fetchData(): void;
  setOpenSuccessConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewContractButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(orange[500]),
    backgroundColor: '#EF965A',
    '&:hover': {
      backgroundColor: orange[700]
    }
  }
}))(Button);

const useStyles = makeStyles((theme: Theme) => ({
  text: {
    lineHeight: 1,
    marginTop: theme.spacing(2),
    fontWeight: 'bold'
  },
  gridButton: {
    textAlign: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  okButton: {
    width: 200,
    marginRight: theme.spacing(2)
  },
  viewButton: {
    width: 200,
    color: '#FFFFFF'
  },
  paper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2),
    outline: 'none',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: 4,
    maxWidth: 500
  },
  closeButton: {
    marginRight: theme.spacing(-1)
  },
  icon: {
    fontSize: 20
  },
  secondText: {
    color: grey[500]
  }
}));

const ContractSuccessfullForm: React.FC<Props> = props => {
  const classes = useStyles();
  const { history } = useRouter();

  const { open, contractId, contractNumber, handleOk, fetchData, setOpenSuccessConfirmModal } = props;

  const handleViewActionClick = () => {
    history.push({ pathname: `/quotations/${contractId}`, state: { selectedTab: 1 } });
  };

  const handleConfirmContract = async (selectedId: number) => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
    await axios.put(`${GET_CONFIRM_SERVICE_URL(selectedId)}`, { cancelToken: cancelTokenSource.token });
    setOpenSuccessConfirmModal(true);
    fetchData();
    handleOk();
  };

  return (
    <Modal aria-labelledby='modal-title' open={open} disableBackdropClick={true}>
      <Paper className={classes.paper}>
        <Grid container justify='flex-end'>
          <IconButton size='small' onClick={handleOk} className={classes.closeButton}>
            <CloseIcon className={classes.icon} />
          </IconButton>
        </Grid>
        <Typography align='center'>
          <img src='/checked.png' alt='logo' style={{ width: '20%', height: '20%' }} />
        </Typography>
        <Typography align='center' variant='h4' className={classes.text} gutterBottom>
          Add New Quotation Successful!
        </Typography>
        <Grid container item justify='center' xs={12} sm={12} md={12} lg={12} xl={12}>
          <Grid xs={12} sm={12} md={12} lg={12} xl={12} className={classes.gridButton}>
            <Typography align='center' variant='body1' className={classes.secondText} gutterBottom>
              Quotation ID #{contractNumber}
            </Typography>
          </Grid>
          <Grid xs={12} sm={12} md={12} lg={12} xl={12} className={classes.gridButton}>
            <Button variant='contained' className={classes.okButton} onClick={handleViewActionClick}>
              Done & View Details
            </Button>
            <ViewContractButton variant='contained' className={classes.viewButton} onClick={() => handleConfirmContract(contractId)}>
              Approve Quotation
            </ViewContractButton>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default ContractSuccessfullForm;
