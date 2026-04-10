import { Drawer, DrawerProps } from '@material-ui/core';
import React from 'react';

interface NativeDrawerProps extends DrawerProps {
  open: boolean;
  children: JSX.Element;
  onToggleDrawer: (open: boolean) => void;
}

function NativeDrawer({ open, anchor, onToggleDrawer, children, ...props }: NativeDrawerProps) {
  return (
    <React.Fragment key={anchor}>
      <Drawer anchor={anchor} open={open} onClose={() => onToggleDrawer(false)} {...props}>
        {children}
      </Drawer>
    </React.Fragment>
  );
}

export default NativeDrawer;
