import React, { FC } from 'react';
import { Avatar, ListItem, ListItemAvatar, ListItemText, SvgIcon, Tooltip } from '@material-ui/core';

import useRouter from 'hooks/useRouter';
import theme from 'theme';

interface Props {
  Icon: any;
  path: string;
  label: string;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const DrawerItem: FC<Props> = props => {
  const { history } = useRouter();
  const { Icon, path, label, selected, setSelected } = props;

  const onClickHandler: React.MouseEventHandler = event => {
    event.preventDefault();
    setSelected(path);
    history.push(path);
  };

  return (
    <Tooltip title={label} placement='right'>
      <ListItem button style={{ height: 50 }} onClick={onClickHandler}>
        {selected.includes(path) ? (
          <ListItemAvatar>
            <Avatar
              variant='square'
              style={{
                backgroundColor: theme.palette.primary.light,
                borderRadius: 10,
                width: theme.spacing(6),
                height: theme.spacing(6)
              }}
            >
              <SvgIcon component={Icon} color='primary' viewBox='20 5 20 42' style={{ fontSize: 35, width: '100%' }} />
            </Avatar>
          </ListItemAvatar>
        ) : (
          <ListItemAvatar>
            <Avatar
              variant='square'
              style={{
                backgroundColor: 'inherit',
                color: 'inherit',
                borderRadius: 10,
                width: theme.spacing(6),
                height: theme.spacing(6)
              }}
            >
              <SvgIcon component={Icon} viewBox='20 5 20 42' style={{ fontSize: 35, width: '100%' }} />
            </Avatar>
          </ListItemAvatar>
        )}
        <ListItemText primary={label} color={selected.includes(path) ? 'primary' : 'inherit'} style={{ marginLeft: theme.spacing(1) }} />
      </ListItem>
    </Tooltip>
  );
};

export default DrawerItem;
