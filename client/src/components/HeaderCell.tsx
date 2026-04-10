import React, { FC } from 'react';
import { TableCell, TableSortLabel, Typography, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';

interface Props {
  id?: string;
  pL?: string;
  pR?: string;
  pT?: string;
  pB?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
  sort?: boolean;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  isCheckBox?: boolean;
  onRequestSort?: (event: React.MouseEvent<unknown>, property: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  headerCellText: {
    fontWeight: 500
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1
  },
  cellStyle: (props: Props) => ({
    paddingLeft: props.pL === '' || props.pL === null ? theme.spacing(0) : props.pL,
    paddingRight: props.pR === '' || props.pR === null ? theme.spacing(0) : props.pR,
    paddingTop: props.pT === '' || props.pT === null ? theme.spacing(0) : props.pT,
    paddingBottom: props.pB === '' || props.pB === null ? theme.spacing(0) : props.pB,
    verticalAlign: props.verticalAlign === undefined ? 'middle' : props.verticalAlign
  })
}));

const HeaderCell: FC<Props> = props => {
  const { id, pL, pR, pT, pB, isCheckBox, order, orderBy, sort, textAlign, onRequestSort } = props;
  const classes = useStyles(props);

  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort!(event, property);
  };

  return (
    <TableCell align={textAlign ? textAlign : 'left'} className={clsx({ [classes.cellStyle]: pL || pR || pT || pB })}>
      {sort && sort! ? (
        <TableSortLabel
          className={classes.headerCellText}
          active={orderBy === id}
          direction={orderBy === id ? order : 'asc'}
          onClick={createSortHandler(id ? id : '')}
        >
          <Typography variant='h6' className={classes.headerCellText}>
            {String(props.children!)}
            {orderBy === id ? <span className={classes.visuallyHidden}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</span> : null}
          </Typography>
        </TableSortLabel>
      ) : isCheckBox ? (
        props.children
      ) : (
        <Typography variant='h6' className={classes.headerCellText}>
          {props.children}
        </Typography>
      )}
    </TableCell>
  );
};

export default HeaderCell;
