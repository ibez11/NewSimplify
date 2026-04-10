import React, { FC, Fragment, useState, useEffect, useRef } from 'react';

import { Button, Chip, Grid, IconButton, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import SelectColumn from 'components/SelectColumn';

import FilterTable from 'components/FilterTable';
import SearchInput from 'components/SearchInput';
import DeleteIcon from '@material-ui/icons/Cancel';
import ViewColumn from '@material-ui/icons/ViewColumn';
import theme from 'theme';

interface Props {
  isProcessing: boolean;
  isExportingData: boolean;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  agents: Select[];
  columnFilter: ColumnFilter[];
  setColumnFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  csv: CSVClientModel[];
  handleCsvClick: () => void;
  columns: SelectedColumn[];
  setColumns: React.Dispatch<React.SetStateAction<SelectedColumn[]>>;
  tableSettingId: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    fontSize: 20
  },
  deleteIcon: {
    color: '#53A0BE'
  },
  filterChip: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  marginTop: {
    marginTop: theme.spacing(2)
  },
  calendarIcon: {
    fontSize: 20
  }
}));

const ToolBar: FC<Props> = props => {
  const classes = useStyles(props);

  const { agents } = props;

  const { query, setQuery } = props;
  const { columnFilter, setColumnFilter } = props;
  const { csv, columns, setColumns, tableSettingId } = props;
  const [csvData, setCsvData] = useState<CSVClientModel[]>(csv);
  const [csvDownload, setCsvDownload] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<Select[]>([]);
  const csvInstance = useRef<any | null>(null);
  const [openColumnPopper, setOpenColumnPopper] = useState(false);
  const [anchorElColumn, setAnchorElColumn] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!csvDownload || !csv || csv.length < 1) {
      return;
    }

    setCsvData(csv);
  }, [csv, csvDownload]);

  useEffect(() => {
    if (csvDownload && csvData.length > 0 && csvInstance.current && csvInstance.current.link) {
      setTimeout(() => {
        csvInstance.current.link.click();
        setCsvData([]);
        setCsvDownload(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvData]);

  const handleClearFilter = () => {
    setColumnFilter([]);
    setSelectedData([]);
  };

  const handleDelete = (index: number) => {
    const currentFilter = [...columnFilter];
    const currentSelectedData = [...selectedData];
    currentFilter.splice(index, 1);
    currentSelectedData.splice(index, 1);

    setColumnFilter(currentFilter);
    setSelectedData(currentSelectedData);
  };

  const handleShowHideColumnClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenColumnPopper(!openColumnPopper);
    setAnchorElColumn(event.currentTarget);
  };

  const renderLeftHeader = () => {
    return (
      <SearchInput
        withBorder
        withTransition={false}
        width={200}
        placeHolder='Search Name or Address'
        iconColor='#989898'
        tableSearchValue={query}
        setTableSearchValue={setQuery}
      />
    );
  };

  const renderRightHeader = () => {
    return (
      <Fragment>
        <FilterTable
          masterData={agents}
          selectedData={selectedData}
          setSelectedData={setSelectedData}
          columnFilter={columnFilter}
          setColumnFilter={setColumnFilter}
          label='Filter Agent'
        />
        <SelectColumn
          open={openColumnPopper}
          setOpen={setOpenColumnPopper}
          anchorEl={anchorElColumn}
          columns={columns}
          setColumns={setColumns}
          tableSettingId={tableSettingId}
        />
        <Tooltip title='Show/Hide Column' placement='top'>
          <IconButton onClick={event => handleShowHideColumnClick(event)}>
            <ViewColumn className={classes.icon} />
          </IconButton>
        </Tooltip>
      </Fragment>
    );
  };

  const renderFilterHeader = () => {
    if (columnFilter.length > 0) {
      return (
        <Grid container>
          <Grid item xs={1}>
            <Button color='primary' onClick={handleClearFilter}>
              <Typography variant='body1'>Clear Filter</Typography>
            </Button>
          </Grid>
          <Grid item xs={11}>
            {columnFilter.map((value, index) => (
              <Chip
                label={value.columnName}
                deleteIcon={
                  <Tooltip title='Delete'>
                    <DeleteIcon className={classes.deleteIcon} />
                  </Tooltip>
                }
                className={classes.filterChip}
                onDelete={() => handleDelete(index)}
              />
            ))}
          </Grid>
        </Grid>
      );
    }
  };

  return (
    <Grid container spacing={2} style={{ paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2) }}>
      <Grid item xs={6} container justify='flex-start' alignItems='center' className={classes.marginTop}>
        {renderLeftHeader()}
      </Grid>
      <Grid item xs={6} container direction='row' justify='flex-end' alignItems='center' className={classes.marginTop}>
        {renderRightHeader()}
      </Grid>
      <Grid item xs={12} container justify='flex-start' alignItems='center'>
        {renderFilterHeader()}
      </Grid>
    </Grid>
  );
};

export default ToolBar;
