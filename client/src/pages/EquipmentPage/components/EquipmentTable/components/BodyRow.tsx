import React, { FC, useEffect, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { format } from 'date-fns';
import {
  Avatar,
  createStyles,
  TableRow,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
  Typography,
  IconButton,
  FormControlLabel,
  withStyles,
  Tooltip,
  TableCell,
  Collapse,
  Box,
  Table,
  TableHead,
  TableBody,
  Link
} from '@material-ui/core';

import NewIcon from '@material-ui/icons/FiberNewOutlined';
import MenuIcon from '@material-ui/icons/MoreVert';
import Skeleton from 'react-loading-skeleton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { green } from '@material-ui/core/colors';

import axios from 'axios';
import BodyCell from 'components/BodyCell';
import { GET_EDIT_STATUS_EQUIPMENT_URL } from 'constants/url';
import Switch, { SwitchClassKey, SwitchProps } from '@material-ui/core/Switch';
import theme from 'theme';

interface PageProps {
  index: number;
  isLoadingData: boolean;
  equipment: EquipmentModel;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  setSelectedSubEquipmentIndex: React.Dispatch<React.SetStateAction<number>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsForm: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddSub: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMain: React.Dispatch<React.SetStateAction<boolean>>;
  updatedIndividualEquipment: (updatedEquipmentProperties: Partial<EquipmentModel>) => void;
  column: SelectedColumn[];
}

interface Styles extends Partial<Record<SwitchClassKey, string>> {
  focusVisible?: string;
}

interface Props extends SwitchProps {
  classes: Styles;
}

const IOSSwitch = withStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 42,
      height: 26,
      padding: 0,
      margin: theme.spacing(1)
    },
    switchBase: {
      padding: 1,
      '&$checked': {
        transform: 'translateX(16px)',
        color: theme.palette.common.white,
        '& + $track': {
          backgroundColor: '#53A0BE',
          opacity: 1,
          border: 'none'
        }
      },
      '&$focusVisible $thumb': {
        color: '#53A0BE',
        border: '6px solid #fff'
      }
    },
    thumb: {
      width: 24,
      height: 24
    },
    track: {
      borderRadius: 26 / 2,
      border: `1px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[50],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border'])
    },
    checked: {},
    focusVisible: {}
  })
)(({ classes, ...props }: Props) => {
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked
      }}
      {...props}
    />
  );
});

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
  menuAvatar: {
    backgroundColor: '#ffffff',
    display: 'inline-flex',
    fontSize: '14px',
    fontWeight: 500,
    height: '36px',
    width: '36px',
    color: '#707070'
  },
  nameTextCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  otherTextCell: {
    display: 'flex',
    flexDirection: 'column'
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  actionIcon: {
    fontSize: 20
  },
  newIcon: {
    color: green[500]
  },
  menuList: {
    minHeight: 40,
    minWidth: 150
  },
  subEquipmentRow: {
    paddingTop: 0,
    paddingBottom: 0
  }
}));

const BodyRow: FC<PageProps> = props => {
  const classes = useStyles();
  const {
    index,
    isLoadingData,
    equipment,
    handleSnackbar,
    setSelectedIndex,
    setSelectedSubEquipmentIndex,
    setOpen,
    setIsForm,
    setIsAddSub,
    setIsEdit,
    setIsMain,
    updatedIndividualEquipment,
    column
  } = props;

  const {
    id,
    description,
    clientId,
    clientName,
    brand,
    model,
    serialNumber,
    address,
    location,
    dateWorkDone,
    createdAt,
    warrantyStartDate,
    warrantyEndDate,
    isActive,
    isNew,
    SubEquipments
  } = equipment;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElSubEquipment, setAnchorElSubEquipment] = useState<null | HTMLElement>(null);
  const [openSubEquipmentRow, setOpenSubEquipmentRow] = useState<boolean>(false);

  useEffect(() => {
    if (Array.isArray(SubEquipments) && SubEquipments.length > 0) {
      setOpenSubEquipmentRow(true);
    }
  }, [SubEquipments]);

  const handleViewClient = () => {
    window.open(`/clients/${clientId}`, '_blank');
    handleClose();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickSubEquipment = (event: React.MouseEvent<HTMLButtonElement>, selectedIndex: number) => {
    setAnchorElSubEquipment(event.currentTarget);
    setSelectedSubEquipmentIndex(selectedIndex);
  };

  const handleCloseSubEquipment = () => {
    setAnchorElSubEquipment(null);
    setSelectedSubEquipmentIndex(0);
  };

  const actionWrapper = async (action: () => Promise<void>, actionStatus: string, isSubEquipment: boolean) => {
    try {
      await action();
      handleSnackbar('success', `Successfully ${actionStatus} a ${isSubEquipment ? 'sub-equipment' : 'equipment'}`);
    } catch (err) {
      handleSnackbar('error', `Failed ${actionStatus} a ${isSubEquipment ? 'sub-equipment' : 'equipment'}`);
    }
  };

  const deactivateEquipment: React.ChangeEventHandler<HTMLInputElement> = async event => {
    await actionWrapper(
      async () => {
        await axios.put(GET_EDIT_STATUS_EQUIPMENT_URL(id), { isActive: false });
      },
      'updated',
      false
    );
    updatedIndividualEquipment({ isActive: false });
  };

  const activateEquipment: React.ChangeEventHandler<HTMLInputElement> = async event => {
    await actionWrapper(
      async () => {
        await axios.put(GET_EDIT_STATUS_EQUIPMENT_URL(id), { isActive: true });
      },
      'updated',
      false
    );
    updatedIndividualEquipment({ isActive: true });
  };

  const deactivateSubEquipment = async (subequipmentId: number, subEquipmentIndex: number) => {
    const currentSubEquipment = SubEquipments!;
    currentSubEquipment[subEquipmentIndex].isActive = false;
    await actionWrapper(
      async () => {
        await axios.put(GET_EDIT_STATUS_EQUIPMENT_URL(subequipmentId), { isActive: false });
      },
      'updated',
      true
    );
    updatedIndividualEquipment({ SubEquipments: currentSubEquipment });
  };

  const activateSubEquipment = async (subequipmentId: number, subEquipmentIndex: number) => {
    const currentSubEquipment = SubEquipments!;
    currentSubEquipment[subEquipmentIndex].isActive = true;
    await actionWrapper(
      async () => {
        await axios.put(GET_EDIT_STATUS_EQUIPMENT_URL(subequipmentId), { isActive: true });
      },
      'updated',
      true
    );
    updatedIndividualEquipment({ SubEquipments: currentSubEquipment });
  };

  const handleEditButton = (isMain: boolean) => {
    setSelectedIndex(index);
    setOpen(true);
    setIsEdit(true);
    setIsMain(isMain);
    setIsForm(true);
    setAnchorEl(null);
    setAnchorElSubEquipment(null);
  };

  const handleViewButton = (isMain: boolean) => {
    setSelectedIndex(index);
    setOpen(true);
    setIsForm(false);
    setIsMain(isMain);
    setAnchorEl(null);
    setAnchorElSubEquipment(null);
  };

  const handleAddSubEquipment = () => {
    setSelectedIndex(index);
    setIsForm(true);
    setOpen(true);
    setIsAddSub(true);
    setAnchorEl(null);
  };

  const renderSubEquipment = () => {
    return (
      <TableRow className={classes.subEquipmentRow}>
        <TableCell className={classes.subEquipmentRow} colSpan={13}>
          <Collapse in={!isLoadingData && openSubEquipmentRow} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Typography variant='h5' gutterBottom component='div' style={{ marginBottom: theme.spacing(2) }}>
                Sub Equipment List
              </Typography>
              <Table aria-label='sub-equipment'>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name/Description</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Last Date Work Done</TableCell>
                    <TableCell>Warranty Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {SubEquipments ? (
                    SubEquipments.map((value, index) => (
                      <TableRow key={index}>
                        <BodyCell cellWidth='5%' pL='10px' pR='10px'>
                          {isLoadingData ? <Skeleton width={'80%'} /> : `#${value.id}`}
                        </BodyCell>
                        <BodyCell cellWidth='7%' pL='10px' pR='10px'>
                          {isLoadingData ? (
                            <Skeleton width={'80%'} />
                          ) : (
                            <div className={classes.tableCellInner}>
                              <div className={classes.nameTextCell}>
                                <Typography variant='body2'>{value.description || '-'}</Typography>
                              </div>
                              {isNew && (
                                <div>
                                  <NewIcon className={classes.newIcon} />
                                </div>
                              )}
                            </div>
                          )}
                        </BodyCell>
                        <BodyCell cellWidth='7%' pL='10px' pR='10px'>
                          {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{value.location || '-'}</Typography>}
                        </BodyCell>
                        <BodyCell cellWidth='12%' pL='10px' pR='10px'>
                          {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{value.brand || '-'}</Typography>}
                        </BodyCell>
                        <BodyCell cellWidth='7%' pL='10px' pR='10px'>
                          {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{value.model}</Typography>}
                        </BodyCell>
                        <BodyCell cellWidth='7%' pL='10px' pR='10px'>
                          {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{value.serialNumber}</Typography>}
                        </BodyCell>
                        <BodyCell cellWidth='10%' pL='10px' pR='10px'>
                          {isLoadingData ? (
                            <Skeleton width={'80%'} />
                          ) : value.dateWorkDone ? (
                            format(new Date(value.dateWorkDone), 'dd MMM yyyy')
                          ) : (
                            '-'
                          )}
                        </BodyCell>
                        <BodyCell cellWidth='8%' pL='10px' pR='10px'>
                          {isLoadingData ? (
                            <Skeleton width='80%' />
                          ) : value.warrantyStartDate && value.warrantyEndDate ? (
                            `${format(new Date(value.warrantyStartDate), 'dd MMM yyyy')} - ${format(new Date(value.warrantyEndDate), 'dd MMM yyyy')}`
                          ) : value.warrantyStartDate ? (
                            `Start: ${format(new Date(value.warrantyStartDate), 'dd MMM yyyy')}`
                          ) : value.warrantyEndDate ? (
                            `End: ${format(new Date(value.warrantyEndDate), 'dd MMM yyyy')}`
                          ) : (
                            '-'
                          )}
                        </BodyCell>
                        <BodyCell cellWidth='10%' pL='10px' pR='10px' textAlign='center'>
                          {isLoadingData ? (
                            <Skeleton width={100} />
                          ) : (
                            <FormControlLabel
                              control={
                                <IOSSwitch
                                  checked={value.isActive}
                                  onChange={() => (value.isActive ? deactivateSubEquipment(value.id, index) : activateSubEquipment(value.id, index))}
                                  name='status'
                                />
                              }
                              labelPlacement='end'
                              label={value.isActive ? 'Active' : 'Inactive'}
                            />
                          )}
                        </BodyCell>
                        <BodyCell cellWidth='5%' pL='10px' isComponent={true} textAlign='center'>
                          {isLoadingData ? (
                            <Skeleton width={'80%'} />
                          ) : (
                            <>
                              <IconButton size='small' color='inherit' onClick={event => handleClickSubEquipment(event, index)}>
                                <Avatar className={classes.menuAvatar}>
                                  <MenuIcon />
                                </Avatar>
                              </IconButton>
                              {/*TODO UPDATE FUNCTION*/}
                              <Menu
                                id='list-menu'
                                anchorEl={anchorElSubEquipment}
                                keepMounted
                                elevation={1}
                                getContentAnchorEl={null}
                                open={Boolean(anchorElSubEquipment)}
                                onClose={handleCloseSubEquipment}
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'center'
                                }}
                                transformOrigin={{
                                  vertical: 'top',
                                  horizontal: 'center'
                                }}
                              >
                                <MenuItem className={classes.menuList} onClick={() => handleViewButton(false)}>
                                  See Work History
                                </MenuItem>
                                <MenuItem className={classes.menuList} onClick={() => handleEditButton(false)}>
                                  Edit Sub Equipment
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </BodyCell>
                      </TableRow>
                    ))
                  ) : (
                    <BodyCell colSpan={10}>
                      <Typography variant='body2' style={{ textAlign: 'center' }}>
                        No Sub Equipment
                      </Typography>
                    </BodyCell>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    );
  };

  const renderColumns = () => {
    // eslint-disable-next-line array-callback-return
    return column.map((col, idx) => {
      if (col.isVisible) {
        if (col.field === 'id') {
          return (
            <BodyCell key={idx} cellWidth='4%' pL='10px' pR='10px'>
              {isLoadingData ? <Skeleton width={'80%'} /> : `#${id}`}
            </BodyCell>
          );
        } else if (col.field === 'name') {
          return (
            <BodyCell key={idx} cellWidth='4%' pL='10px' pR='10px'>
              {isLoadingData ? (
                <Skeleton width={'80%'} />
              ) : (
                <div className={classes.tableCellInner}>
                  <div className={classes.nameTextCell}>
                    <Typography variant='body2'>{description || '-'}</Typography>
                  </div>
                  {isNew && (
                    <div>
                      <NewIcon className={classes.newIcon} />
                    </div>
                  )}
                </div>
              )}
            </BodyCell>
          );
        } else if (col.field === 'clientName') {
          return (
            <BodyCell key={idx} cellWidth='17%' pL='10px' pR='10px'>
              {isLoadingData ? (
                <Skeleton width={'80%'} />
              ) : (
                <>
                  <Tooltip title='View Client Detail'>
                    <Link component='button' color='primary' style={{ textAlign: 'left' }} onClick={handleViewClient}>
                      <Typography variant='body2' gutterBottom>
                        {clientName}
                      </Typography>
                    </Link>
                  </Tooltip>
                  <Typography variant='body2' color='textSecondary'>
                    {address}
                  </Typography>
                </>
              )}
            </BodyCell>
          );
        } else if (col.field === 'location') {
          return (
            <BodyCell key={idx} cellWidth='7%' pL='10px' pR='10px'>
              {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{location ? location : '-'}</Typography>}
            </BodyCell>
          );
        } else if (col.field === 'brand') {
          return (
            <BodyCell key={idx} cellWidth='7%' pL='10px' pR='10px'>
              {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{brand}</Typography>}
            </BodyCell>
          );
        } else if (col.field === 'model') {
          return (
            <BodyCell key={idx} cellWidth='7%' pL='10px' pR='10px'>
              {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{model}</Typography>}
            </BodyCell>
          );
        } else if (col.field === 'serialNumber') {
          return (
            <BodyCell key={idx} cellWidth='7%' pL='10px' pR='10px'>
              {isLoadingData ? <Skeleton width={'80%'} /> : <Typography variant='body2'>{serialNumber}</Typography>}
            </BodyCell>
          );
        } else if (col.field === 'workDate') {
          return (
            <BodyCell key={idx} cellWidth='8%' pL='10px' pR='10px'>
              {isLoadingData ? <Skeleton width={'80%'} /> : dateWorkDone ? format(new Date(dateWorkDone), 'dd MMM yyyy') : '-'}
            </BodyCell>
          );
        } else if (col.field === 'createdDate') {
          return (
            <BodyCell key={idx} cellWidth='8%' pL='10px' pR='10px'>
              {isLoadingData ? <Skeleton width={'80%'} /> : createdAt ? format(new Date(createdAt), 'dd MMM yyyy') : '-'}
            </BodyCell>
          );
        } else if (col.field === 'warrantyDate') {
          return (
            <BodyCell key={idx} cellWidth='8%' pL='10px' pR='10px'>
              {isLoadingData ? (
                <Skeleton width='80%' />
              ) : warrantyStartDate && warrantyEndDate ? (
                `${format(new Date(warrantyStartDate), 'dd MMM yyyy')} - ${format(new Date(warrantyEndDate), 'dd MMM yyyy')}`
              ) : warrantyStartDate ? (
                `Start: ${format(new Date(warrantyStartDate), 'dd MMM yyyy')}`
              ) : warrantyEndDate ? (
                `End: ${format(new Date(warrantyEndDate), 'dd MMM yyyy')}`
              ) : (
                '-'
              )}
            </BodyCell>
          );
        } else if (col.field === 'status') {
          return (
            <BodyCell key={idx} cellWidth='10%' pL='10px' pR='10px' textAlign='center'>
              {isLoadingData ? (
                <Skeleton width={100} />
              ) : (
                <FormControlLabel
                  control={<IOSSwitch checked={isActive} onChange={isActive ? deactivateEquipment : activateEquipment} name='status' />}
                  labelPlacement='end'
                  label={isActive ? 'Active' : 'Inactive'}
                />
              )}
            </BodyCell>
          );
        }
      }
    });
  };

  return (
    <>
      <TableRow className={classes.tableRow}>
        <BodyCell cellWidth='1%' pL='10px' pR='10px'>
          {!isLoadingData && (
            <Tooltip title={openSubEquipmentRow ? 'Hide Sub Equipment' : 'Show Sub Equipment'}>
              <IconButton aria-label='expand row' onClick={() => setOpenSubEquipmentRow(!openSubEquipmentRow)}>
                {openSubEquipmentRow ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          )}
        </BodyCell>
        {renderColumns()}
        <BodyCell cellWidth='5%' pL='10px' isComponent={true} textAlign='center'>
          {isLoadingData ? (
            <Skeleton width={'80%'} />
          ) : (
            <>
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
                <MenuItem className={classes.menuList} onClick={() => handleViewButton(true)}>
                  See Work History
                </MenuItem>
                <MenuItem className={classes.menuList} onClick={() => handleEditButton(true)}>
                  Edit Main Equipment
                </MenuItem>
                <MenuItem className={classes.menuList} onClick={handleAddSubEquipment}>
                  Add Sub Equipment
                </MenuItem>
              </Menu>
            </>
          )}
        </BodyCell>
      </TableRow>
      {renderSubEquipment()}
    </>
  );
};

export default BodyRow;
