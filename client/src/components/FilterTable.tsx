import { FC, Fragment } from 'react';
import { Checkbox, Chip, makeStyles, TextField, Theme, Typography } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { getUnique } from 'utils';

interface Props {
  masterData: Select[];
  selectedData: Select[];
  setSelectedData: React.Dispatch<React.SetStateAction<Select[]>>;
  columnFilter: ColumnFilter[];
  setColumnFilter: React.Dispatch<React.SetStateAction<ColumnFilter[]>>;
  label: string;
  fullwidth?: boolean;
  isShowValue?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  textField: (props: Props) => ({
    width: props.fullwidth ? '100%' : 180,
    marginRight: theme.spacing(1)
  }),
  checkBoxIcon: {
    fontSize: '16px'
  },
  checkBox: {
    marginLeft: theme.spacing(-2),
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  },
  inputRoot: {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#53a0be'
    },
    '& .MuiIconButton-root': {
      color: '#53a0be'
    }
  }
}));

const FilterTable: FC<Props> = props => {
  const classes = useStyles(props);
  const { masterData, selectedData, setSelectedData, columnFilter, setColumnFilter, label, isShowValue } = props;

  const icon = <CheckBoxOutlineBlankIcon className={classes.checkBoxIcon} />;
  const checkedIcon = <CheckBoxIcon className={classes.checkBoxIcon} />;

  const handleSetSelectedData = (data: Select[]) => {
    const selectedData: ColumnFilter[] = [];
    if (data) {
      const clearData = getUnique(data, 'id');
      clearData.map(value => {
        return selectedData.push({ filterKey: value.name, columnName: value.name, columnValue: value.id });
      });
      setSelectedData(clearData);
    }
    setColumnFilter(selectedData);
  };

  return (
    <Autocomplete
      multiple
      id={label}
      disableCloseOnSelect
      options={masterData}
      getOptionLabel={option => option.name}
      value={selectedData}
      getOptionSelected={(option, value) => (value.name === option.name ? true : false)}
      onChange={(_, value) => handleSetSelectedData(value)}
      classes={{ inputRoot: columnFilter.length > 0 ? classes.inputRoot : '' }}
      renderTags={(value, getTagProps) => {
        return (
          <div style={{ minHeight: '24px' }}>
            {isShowValue ? (
              value.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} />)
            ) : (
              <Typography variant='body1' color='primary' style={{ paddingLeft: 8 }}>
                {value.length} Selected
              </Typography>
            )}
          </div>
        );
      }}
      renderOption={(option, { selected }) => (
        <Fragment>
          <Checkbox icon={icon} checkedIcon={checkedIcon} color='primary' disableRipple checked={selected} />
          {option.name}
        </Fragment>
      )}
      renderInput={params => (
        <TextField
          {...params}
          fullWidth
          placeholder={selectedData.length < 1 ? label : ''}
          variant='outlined'
          autoComplete='off'
          margin='dense'
          className={classes.textField}
          InputLabelProps={{
            style: { color: columnFilter.length > 0 ? '#53a0be' : '' }
          }}
        />
      )}
    />
  );
};

export default FilterTable;
