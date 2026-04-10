import React from 'react';
import { Button, makeStyles, TableRow, TextField, Theme } from '@material-ui/core';

import BodyCell from 'components/BodyCell';
import clsx from 'clsx';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';

interface Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  nameError: string;
  setNameError: React.Dispatch<React.SetStateAction<string>>;
  isSubmitting: boolean;
  onSubmit: React.FormEventHandler;
  onCancel: React.MouseEventHandler;
  primaryButtonLabel: string;
  customBackground?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  brandTemplateForm: {
    height: 64
  },
  textFieldRoot: (props: Props) => ({
    backgroundColor: props.customBackground
  }),
  textFieldFont: {
    fontSize: '13px',
    height: 18
  },
  buttonContainer: {
    display: 'flex'
  },
  cancelButton: {
    marginRight: theme.spacing(2),
    width: 100
  },
  addButton: {
    width: 100
  }
}));

const CreateEditBrandTemplateForm: React.FC<Props> = props => {
  const classes = useStyles(props);

  const { name, setName, nameError, setNameError } = props;

  const { onSubmit, onCancel } = props;
  const { isSubmitting } = props;

  const { primaryButtonLabel, customBackground } = props;

  const handleBlur = (value: string) => {
    let ret = true;

    if (!name || !name.trim()) {
      setNameError('Please enter brand name');
      ret = false;
    } else {
      setNameError('');
      ret = true;
    }

    return ret;
  };

  return (
    <TableRow className={classes.brandTemplateForm}>
      <BodyCell cellWidth='80%' isComponent={true}>
        <TextField
          margin='dense'
          required
          fullWidth
          className={clsx({ [classes.textFieldRoot]: customBackground })}
          id='name'
          label='Name'
          error={nameError !== ''}
          helperText={nameError}
          value={name}
          onChange={event => setName(event.target.value)}
          onBlur={event => handleBlur(event.target.value)}
          variant='outlined'
          autoComplete='off'
          InputProps={{
            classes: {
              input: classes.textFieldFont
            }
          }}
          InputLabelProps={{
            className: classes.textFieldFont
          }}
        />
      </BodyCell>
      <BodyCell cellWidth='20%' isComponent={true}>
        <div className={classes.buttonContainer}>
          <Button variant='contained' disableElevation className={classes.cancelButton} onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} variant='contained' disableElevation color='primary' className={classes.addButton} disabled={isSubmitting}>
            {primaryButtonLabel}
            <LoadingButtonIndicator isLoading={isSubmitting} />
          </Button>
        </div>
      </BodyCell>
    </TableRow>
  );
};

export default CreateEditBrandTemplateForm;
