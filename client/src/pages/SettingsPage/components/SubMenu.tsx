import React, { FC, useContext } from 'react';
import clsx from 'clsx';
import { makeStyles, List, ListItem, ListItemText, Theme, Typography } from '@material-ui/core';
import SettingPageContents from '../../../typings/SettingPageContents';
import { getCurrentCustomerBooking } from 'selectors';
import { CurrentUserContext } from 'contexts/CurrentUserContext';

const useStyles = makeStyles((theme: Theme) => ({
  listItem: {
    minHeight: 40,
    margin: '4px 0',
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.palette.primary.main
    }
  },
  listItemActive: {
    background: theme.palette.primary.light,
    borderRadius: 10,
    minHeight: 40,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.main
    }
  },
  listItemTextActive: {
    color: theme.palette.primary.main,
    fontWeight: 500
  }
}));

interface Props {
  subMenuActive: SettingPageContents;
  selectedRenderContent: (page: SettingPageContents) => React.MouseEventHandler;
}

const SubMenu: FC<Props> = props => {
  const { selectedRenderContent, subMenuActive } = props;

  const classes = useStyles();

  const { currentUser } = useContext(CurrentUserContext);
  const isBookingEnabled = getCurrentCustomerBooking(currentUser);

  const subMenus = Object.values(SettingPageContents).filter(subMenu => {
    if (subMenu === SettingPageContents.CustomerBooking && !isBookingEnabled) {
      return false;
    }
    return true;
  });

  return (
    <List>
      {subMenus.map((subMenu, index) => (
        <ListItem
          className={clsx(classes.listItem, subMenuActive === subMenu && classes.listItemActive)}
          button
          disableRipple
          onClick={selectedRenderContent(subMenu)}
          key={index}
        >
          <ListItemText
            primary={
              <Typography variant='body1' className={clsx(subMenuActive === subMenu && classes.listItemTextActive)}>
                {subMenu}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default SubMenu;
