import React, { FC, Fragment, useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Link,
  TableRow,
  makeStyles,
  Theme,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  TableCell,
  Collapse,
  Box
} from '@material-ui/core';
import NumberFormat from 'react-number-format';
import { green } from '@material-ui/core/colors';
import MenuIcon from '@material-ui/icons/MoreVert';
import NewIcon from '@material-ui/icons/FiberNew';
import CloseIcon from '@material-ui/icons/Close';
import MarkerIcon from '@material-ui/icons/LocationOn';
import Skeleton from 'react-loading-skeleton';

import BodyCell from 'components/BodyCell';
import { hasAccessPermission, ucWords } from 'utils';
import theme from 'theme';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';

interface Props {
  isLoadingData: boolean;
  clients: ClientModel;
  onViewClient: React.MouseEventHandler;
  onViewContract: React.MouseEventHandler;
  onViewJob: React.MouseEventHandler;
  onViewEquipment: React.MouseEventHandler;
  onDeleteClient: React.MouseEventHandler;
  column: SelectedColumn[];
  currentRoleGrants: RoleGrantModel[];
}

const useStyles = makeStyles((theme: Theme) => ({
  tableRow: {
    height: 64,
    '& > *': {
      borderBottom: 'unset'
    }
  },
  tableCellInner: {
    display: 'flex',
    alignItems: 'center'
  },
  tableCellInnerOther: {
    alignItems: 'center'
  },
  nameTextCell: {
    marginRight: theme.spacing(1)
  },
  menuAvatar: {
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    fontSize: '14px',
    fontWeight: 500,
    height: '36px',
    width: '36px',
    color: '#707070'
  },
  menuList: {
    minHeight: 40,
    minWidth: 150
  },
  otherTextCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  otherTextCellAddress: {
    display: 'flex',
    flexDirection: 'column'
  },
  newIcon: {
    color: green[500],
    display: 'flex',
    alignItems: 'center'
  },
  chip: {
    borderRadius: 50
  },
  buttonMore: {
    fontSize: 10,
    width: '15%',
    marginTop: 10
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  remarksRow: {
    paddingTop: 0,
    paddingBottom: 0
  }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoadingData, clients, onViewClient, onViewContract, onViewJob, onViewEquipment, onDeleteClient, column, currentRoleGrants } = props;
  const { name, clientType, activeContract, totalAmount, agentName, ContactPersons, ServiceAddresses, new: isNew, remarks } = clients;
  const isDeleteActive = hasAccessPermission('CLIENTS', 'DELETE', currentRoleGrants);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(remarks ? true : false);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleViewMap = (postalCode: string) => {
    window.open(`https://maps.google.com/maps?q=Singapore ${postalCode}`, '_blank');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderColumn = () => {
    if (column.length > 0) {
      // eslint-disable-next-line array-callback-return
      return column.map(value => {
        if (value.isVisible) {
          if (value.field === 'clientName') {
            return (
              <BodyCell cellWidth='15%' pR='5px'>
                <div className={classes.tableCellInner}>
                  <div className={classes.nameTextCell}>
                    {isLoadingData ? (
                      <Skeleton width={100} />
                    ) : (
                      <Tooltip title='View Client Details'>
                        <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={onViewClient}>
                          <Typography variant='body2'>{name}</Typography>
                        </Link>
                      </Tooltip>
                    )}
                  </div>
                  {isNew && (
                    <div>
                      <NewIcon fontSize='large' className={classes.newIcon} />
                    </div>
                  )}
                </div>
              </BodyCell>
            );
          } else if (value.field === 'clientType') {
            return (
              <BodyCell cellWidth='8%' pR='5px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <div className={classes.tableCellInnerOther}>
                    <div className={classes.otherTextCell}>
                      <Chip
                        label={ucWords(clientType)}
                        className={classes.chip}
                        size='small'
                        style={{
                          color: clientType === 'COMMERCIAL' ? theme.palette.secondary.main : 'inherit',
                          backgroundColor: clientType === 'COMMERCIAL' ? theme.palette.secondary.light : theme.palette.grey[200]
                        }}
                      />
                    </div>
                  </div>
                )}
              </BodyCell>
            );
          } else if (value.field === 'serviceAddress') {
            return (
              <BodyCell cellWidth='25%' pR='5px'>
                <div className={classes.tableCellInnerOther}>
                  {ServiceAddresses && (
                    <div className={classes.otherTextCellAddress}>
                      {isLoadingData ? (
                        <Skeleton width={'80%'} />
                      ) : (
                        <Tooltip title='View on Map'>
                          <Link
                            component='button'
                            color='primary'
                            style={{ textAlign: 'left' }}
                            onClick={() => handleViewMap(ServiceAddresses[0].postalCode)}
                          >
                            <Typography variant='body2'>
                              {ServiceAddresses[0].address}, {ServiceAddresses[0].country}
                            </Typography>
                          </Link>
                        </Tooltip>
                      )}
                      {ServiceAddresses.length > 1 && (
                        <Button color='primary' variant='outlined' size='small' className={classes.buttonMore} onClick={() => setOpenModal(true)}>
                          {ServiceAddresses.length - 1} more
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </BodyCell>
            );
          } else if (value.field === 'contactPerson') {
            return (
              <BodyCell cellWidth='10%' pR='5px'>
                <div className={classes.tableCellInnerOther}>
                  {ContactPersons && (
                    <div className={classes.otherTextCell}>
                      {isLoadingData ? (
                        <Skeleton width={'100%'} />
                      ) : (
                        <Typography variant='body2' gutterBottom>
                          {ContactPersons[0].contactPerson}
                        </Typography>
                      )}
                      {isLoadingData ? (
                        <Skeleton width={'80%'} />
                      ) : (
                        <Typography variant='body2' color='textSecondary' gutterBottom>
                          {
                            <NumberFormat
                              displayType='text'
                              value={`${ContactPersons[0].countryCode} ${ContactPersons[0].contactNumber}`}
                              format='+################'
                            />
                          }
                        </Typography>
                      )}
                      {isLoadingData ? (
                        <Skeleton width={'50%'} />
                      ) : (
                        <Typography variant='body2' color='textSecondary'>
                          {ContactPersons[0].contactEmail}
                        </Typography>
                      )}
                    </div>
                  )}
                </div>
              </BodyCell>
            );
          } else if (value.field === 'agent') {
            return (
              <BodyCell cellWidth='5%'>
                <div className={classes.tableCellInnerOther}>
                  <div className={classes.otherTextCell}>
                    {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{agentName ? agentName : '-'}</Typography>}
                  </div>
                </div>
              </BodyCell>
            );
          } else if (value.field === 'activeContract') {
            return (
              <BodyCell cellWidth='5%' pR='5px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <NumberFormat
                    value={activeContract ? activeContract : 0}
                    displayType={'text'}
                    thousandSeparator={true}
                    fixedDecimalScale={true}
                    style={{ textAlign: 'center' }}
                  />
                )}
              </BodyCell>
            );
          } else if (value.field === 'totalContractAmount') {
            return (
              <BodyCell cellWidth='10%' pR='5px'>
                {isLoadingData ? (
                  <Skeleton width={'80%'} />
                ) : (
                  <NumberFormat
                    value={totalAmount ? totalAmount : '0'}
                    displayType={'text'}
                    thousandSeparator={true}
                    prefix={'$'}
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                )}
              </BodyCell>
            );
          }
        }
      });
    }
  };

  return (
    <>
      <TableRow className={classes.tableRow}>
        <Fragment>
          <BodyCell cellWidth='1%' pL='10px' pR='10px'>
            {!isLoadingData && (
              <Tooltip title={open ? 'Hide Remarks' : 'Show Remakrs'}>
                <IconButton aria-label='expand row' onClick={() => setOpen(!open)}>
                  {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Tooltip>
            )}
          </BodyCell>
          {renderColumn()}
          <BodyCell cellWidth='10%' pR='5px'>
            {isLoadingData ? (
              <Skeleton width={'30%'} />
            ) : (
              <React.Fragment>
                <IconButton size='small' color='inherit' onClick={handleClick}>
                  <Avatar className={classes.menuAvatar}>
                    <MenuIcon />
                  </Avatar>
                </IconButton>
                <Menu
                  id='list-menu'
                  anchorEl={anchorEl}
                  keepMounted
                  elevation={1}
                  getContentAnchorEl={null}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                  }}
                >
                  <MenuItem className={classes.menuList} onClick={onViewClient}>
                    View Profile
                  </MenuItem>
                  <MenuItem className={classes.menuList} onClick={onViewContract}>
                    View Quotation
                  </MenuItem>
                  <MenuItem className={classes.menuList} onClick={onViewJob}>
                    View Job
                  </MenuItem>
                  <MenuItem className={classes.menuList} onClick={onViewEquipment}>
                    View Equipment
                  </MenuItem>
                  {isDeleteActive && (
                    <MenuItem
                      className={classes.menuList}
                      onClick={event => {
                        onDeleteClient(event);
                        handleClose();
                      }}
                    >
                      <Typography color='error'>Delete Client</Typography>
                    </MenuItem>
                  )}
                </Menu>
              </React.Fragment>
            )}
          </BodyCell>
        </Fragment>
        <Dialog open={openModal} scroll='body' fullWidth maxWidth='sm'>
          <DialogTitle>
            <Typography variant='h5' id='modal-title'>
              Service Address List
            </Typography>
            <IconButton size='small' className={classes.closeButton} onClick={() => setOpenModal(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={1} alignItems='center'>
              {ServiceAddresses &&
                ServiceAddresses.map((address, index) => (
                  <>
                    <Grid item md={2} style={{ marginBottom: theme.spacing(1) }}>
                      <Typography variant='subtitle2' color='textSecondary'>
                        Address {index + 1} :
                      </Typography>
                    </Grid>
                    <Grid item md={9} style={{ marginBottom: theme.spacing(1) }}>
                      <Typography variant='body1'>
                        {address.address}, {address.country}
                      </Typography>
                    </Grid>
                    <Grid item md={1} style={{ marginBottom: theme.spacing(1) }}>
                      <Tooltip title='Open Map'>
                        <IconButton color='primary' href={'https://maps.google.com/maps?q=Singapore ' + address.postalCode} target={'_blank'} size='small'>
                          <MarkerIcon color='primary' />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </>
                ))}
            </Grid>
          </DialogContent>
        </Dialog>
      </TableRow>
      <TableRow className={classes.remarksRow}>
        <TableCell className={classes.remarksRow} colSpan={9}>
          <Collapse in={!isLoadingData && open} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Typography variant='h5' gutterBottom component='div' style={{ marginBottom: theme.spacing(2) }}>
                Client Remarks
              </Typography>
              {remarks && (
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant='body2' gutterBottom component='div' style={{ marginBottom: theme.spacing(2), whiteSpace: 'pre-line' }}>
                      {remarks}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default BodyRow;
