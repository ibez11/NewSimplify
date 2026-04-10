import React, { FC, MouseEventHandler } from 'react';
import { makeStyles, withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { IconButton, Tab, Tabs, Tooltip } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

interface TabParams {
  id: number;
  name: string;
  module?: string;
}

interface Props {
  tabs: TabParams[];
  selectedTabId: number;
  showCloseButton?: boolean;
  handleCloseClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onSelect: (tabId: number) => void;
}

const AntTabs = withStyles({
  indicator: {
    backgroundColor: 'inherit'
  }
})(Tabs);

const AntTab: any = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      color: 'textSecondary',
      minWidth: 50,
      minHeight: 40,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(1),
      '&:hover': {
        color: '#53A0BE',
        opacity: 1
      },
      '&$selected': {
        color: '#53A0BE',
        background: theme.palette.primary.light,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: 10,
        fontWeight: theme.typography.fontWeightMedium
      },
      '&:focus': {
        color: '#53A0BE'
      }
    },
    selected: {}
  })
)(props => <Tab disableRipple {...props} wrapped />);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  padding: {
    padding: theme.spacing(4)
  },
  closeButton: {
    marginLeft: 70
  },
  closeIcon: {
    fontSize: 14
  }
}));

const CustomizedTabs: FC<Props> = props => {
  const { tabs, showCloseButton, onSelect, selectedTabId, handleCloseClick } = props;
  const classes = useStyles();
  const [value, setValue] = React.useState(selectedTabId);

  const handleChange = (tabId: number): MouseEventHandler => event => {
    onSelect(tabId);
    setValue(tabId);
  };

  const renderIcon = () => {
    return (
      <Tooltip title={'Delete'}>
        <IconButton className={classes.closeButton} onClick={handleCloseClick}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <div className={classes.root}>
      <AntTabs value={value} aria-label='ant' variant='scrollable'>
        {tabs.map(tab => (
          <AntTab key={tab.id} value={tab.id} label={tab.name} onClick={handleChange(tab.id)} icon={showCloseButton ? renderIcon() : ''} />
        ))}
      </AntTabs>
    </div>
  );
};

export default CustomizedTabs;
