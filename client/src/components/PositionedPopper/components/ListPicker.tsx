import React, { FC } from 'react';
import { ClickAwayListener, List, ListItem } from '@material-ui/core';
import { Option } from 'components/PositionedPopper';

interface Props {
  setOpenPopper: React.Dispatch<React.SetStateAction<boolean>>;
  options: Option[];
  isLoading?: boolean;
}

const ListPicker: FC<Props> = props => {
  const { setOpenPopper, options, isLoading } = props;

  const handleCloseMenuListPopper = () => {
    setOpenPopper(false);
  };

  const renderAction = () => {
    return options.map(option => {
      const onClickEvent = () => {
        if (option.action === 'view') {
          if (option.handleViewAction) {
            return option.handleViewAction();
          }
        } else if (option.action === 'delete') {
          if (option.handleDeleteAction) {
            return option.handleDeleteAction();
          }
        } else if (option.action === 'confirm') {
          if (option.handleConfirmAction) {
            return option.handleConfirmAction();
          }
        } else if (option.action === 'export') {
          if (option.handleExportAction) {
            return option.handleExportAction();
          }
        }
      };
      return (
        <ListItem
          button
          key={option.key}
          onClick={event => {
            return onClickEvent();
          }}
          disabled={isLoading}
        >
          {option.label}
        </ListItem>
      );
    });
  };

  return (
    <ClickAwayListener onClickAway={handleCloseMenuListPopper}>
      <List>{renderAction()}</List>
    </ClickAwayListener>
  );
};

export default ListPicker;
