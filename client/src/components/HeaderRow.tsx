import React, { FC } from 'react';
import { TableRow, Checkbox } from '@material-ui/core';
import HeaderCell from './HeaderCell';
import { makeStyles } from '@material-ui/styles';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxOutlinedUncompletedIcon from '@material-ui/icons/IndeterminateCheckBox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

interface Props {
  headers: HeaderTable[];
  isListPage?: boolean;
  order?: 'asc' | 'desc';
  orderBy?: string;
  onRequestSort?: (event: React.MouseEvent<unknown>, property: string) => void;
  height?: number;
}

const useStyles = makeStyles(() => ({
  tableRow: (props: Props) => ({
    height: props.height || 64,
    background: '#FAFAFA',
    verticalAlign: 'top'
  }),
  checkBox: {
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  },
  checkBoxSize: {
    fontSize: '16px'
  }
}));

const HeaderRow: FC<Props> = props => {
  const classes = useStyles(props);
  const { headers, isListPage, orderBy, order, onRequestSort } = props;

  const renderHeader = (header: HeaderTable) => {
    const countChecked = header.checked && header.checked.length;
    const totalShouldBeChecked = header.rowsPerPage && header.rowsPerPage;
    const renderCheckBoxIcon = () => {
      if (countChecked !== 0) {
        if (countChecked !== totalShouldBeChecked) {
          return <CheckBoxOutlinedUncompletedIcon className={classes.checkBoxSize} />;
        } else {
          return <CheckBoxIcon className={classes.checkBoxSize} />;
        }
      }
    };

    return (
      <HeaderCell
        key={header.label}
        id={header.id}
        pL={header.pL}
        pR={header.pR}
        pT={header.pT}
        pB={header.pB}
        orderBy={orderBy}
        order={order}
        sort={header.sort}
        verticalAlign={header.verticalAlign}
        textAlign={header.textAlign}
        isCheckBox={header.isCheckBox}
        onRequestSort={onRequestSort!}
      >
        {header.isCheckBox ? (
          <Checkbox
            key={header.label}
            icon={<CheckBoxOutlineBlankIcon className={classes.checkBoxSize} />}
            checkedIcon={renderCheckBoxIcon()}
            edge='start'
            color='primary'
            className={classes.checkBox}
            checked={countChecked !== 0 ? true : false}
            tabIndex={-1}
            disableRipple
            onChange={header.handleCheckAll}
          />
        ) : (
          header.label
        )}
      </HeaderCell>
    );
  };
  const renderContent = () => {
    // eslint-disable-next-line array-callback-return
    return headers.map(header => {
      if (isListPage) {
        if (header.isVisible) {
          return renderHeader(header);
        }
      } else {
        return renderHeader(header);
      }
    });
  };
  return <TableRow className={classes.tableRow}>{renderContent()}</TableRow>;
};

export default HeaderRow;
