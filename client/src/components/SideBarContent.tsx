import { Divider, IconButton, styled, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import NativeDrawer from 'components/NativeDrawer';
import { FC } from 'react';

interface SideBarProps {
  title: string;
  open: boolean;
  width?: string;
  onClickDrawer: () => void;
  children: JSX.Element;
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  paddingLeft: '1rem',
  paddingRight: '1rem',
  justifyContent: 'space-between',
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}));

const SideBarContent: FC<SideBarProps> = props => {
  const { open, title, width, onClickDrawer, children } = props;
  return (
    <NativeDrawer anchor='right' open={open} onToggleDrawer={onClickDrawer} PaperProps={{ style: { width: width } }}>
      <div style={{ minWidth: '400px', overflowX: 'hidden', height: '100%' }}>
        <DrawerHeader>
          <Typography variant='h5'>{title}</Typography>
          <IconButton onClick={onClickDrawer}>
            <CloseIcon />
          </IconButton>
        </DrawerHeader>
        <Divider style={{ marginBottom: 8 }} />
        {children}
      </div>
    </NativeDrawer>
  );
};

export default SideBarContent;
