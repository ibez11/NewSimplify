import { FC, Fragment, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import Skeleton from 'react-loading-skeleton';
import {
  Box,
  Chip,
  Collapse,
  Grid,
  IconButton,
  makeStyles,
  TableRow,
  TableCell,
  Theme,
  Typography,
  Tooltip,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import NumberFormat from 'react-number-format';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { green } from '@material-ui/core/colors';

interface Props {
  isLoading?: boolean;
  index: number;
  item: ServiceItemModel;
  isAdditional?: boolean;
  actionButton?: boolean;
  handleEditAction?: (index: number) => void;
  handleDeleteAction?: (index: number) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    '& > *': {
      borderBottom: 'unset'
    }
  },
  chip: {
    borderRadius: 50,
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.secondary.main,
    background: theme.palette.secondary.light
  },
  newIcon: {
    color: green[500],
    marginLeft: theme.spacing(1),
    fontWeight: 'bold'
  },
  equipmentRow: { paddingTop: 0, paddingBottom: 0 }
}));

const BodyRow: FC<Props> = props => {
  const classes = useStyles();
  const { isLoading, index, item, isAdditional, actionButton, handleEditAction, handleDeleteAction } = props;
  const { name, description, unitPrice, quantity, totalPrice, Equipments, isNew } = item;

  const [open, setOpen] = useState<boolean>(false);

  return (
    <Fragment key={index}>
      <TableRow key={index} className={classes.root}>
        <TableCell width={'5%'}>
          {isLoading ? (
            <Skeleton width={'50%'} />
          ) : (
            <Tooltip title={open ? 'Hide Equipment' : 'Show Equipment'}>
              <IconButton aria-label='expand row' onClick={() => setOpen(!open)}>
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
        <TableCell width={'40%'}>
          {isLoading ? (
            <Skeleton width={'50%'} />
          ) : (
            <>
              <Typography variant='body2'>
                {name}
                {isAdditional && <Chip label='Separate Ad-hoc' className={classes.chip} size='small' />}
                {isNew && <span className={classes.newIcon}>NEW</span>}
              </Typography>
              <Typography variant='caption' color='textSecondary' style={{ whiteSpace: 'pre-line' }}>
                {description}
              </Typography>
            </>
          )}
        </TableCell>
        <TableCell width={'10%'}>{isLoading ? <Skeleton width={'50%'} /> : <Typography variant='body2'>{quantity}</Typography>}</TableCell>
        <TableCell width={'10%'}>
          {isLoading ? (
            <Skeleton width={'50%'} />
          ) : (
            <Typography variant='body2'>
              <NumberFormat value={unitPrice} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
            </Typography>
          )}
        </TableCell>
        <TableCell width={'10%'}>
          {isLoading ? (
            <Skeleton width={'50%'} />
          ) : (
            <Typography variant='body2' align='right'>
              <NumberFormat value={totalPrice} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
            </Typography>
          )}
        </TableCell>
        {actionButton && (
          <TableCell align='center' width={'15%'}>
            <Tooltip title='Edit Item'>
              <IconButton onClick={() => handleEditAction!(index)}>
                <EditIcon color='primary' />
              </IconButton>
            </Tooltip>
            {isNew && (
              <Tooltip title='Delete Item'>
                <IconButton onClick={() => handleDeleteAction!(index)}>
                  <DeleteIcon color='error' />
                </IconButton>
              </Tooltip>
            )}
          </TableCell>
        )}
      </TableRow>
      <TableRow key={`equipment-row-${index}`}>
        <TableCell className={classes.equipmentRow} colSpan={7}>
          <Collapse in={!isLoading && open} timeout='auto' unmountOnExit>
            <Box margin={1}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant='h5' gutterBottom component='div'>
                    Equipments
                  </Typography>
                  <Grid container spacing={1}>
                    {Equipments && Equipments.length > 0 ? (
                      <Grid item xs={12} key={`grid-equipment-${index}`}>
                        <List dense key={`equipment-list-${index}`}>
                          {Equipments.map(equipment => (
                            <ListItem key={`equipment-item-${equipment.id}`}>
                              <ListItemText
                                key={`equipment-${equipment.serialNumber}`}
                                primary={`\u25CF ${equipment.brand} ${equipment.model} - ${equipment.serialNumber} (${
                                  equipment.location ? equipment.location : '-'
                                })`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    ) : (
                      <Grid item>
                        <Typography variant='body2' color='textSecondary'>
                          No Equipment
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};

export default BodyRow;
