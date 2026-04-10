import React, { useState, useEffect } from 'react';
import { Button, makeStyles, Popper, TableRow, TextField, Theme, Tooltip } from '@material-ui/core';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/lib/css/styles.css';

import BodyCell from 'components/BodyCell';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';

interface Props {
  jobLabelTemplate?: JobLabelTemplateModel;

  setName: React.Dispatch<React.SetStateAction<string>>;
  nameError: string;
  setNameError: React.Dispatch<React.SetStateAction<string>>;

  setDescription: React.Dispatch<React.SetStateAction<string>>;

  setColor: React.Dispatch<React.SetStateAction<string>>;
  colorError: string;

  isSubmitting: boolean;
  onSubmit: React.FormEventHandler;
  onCancel: React.MouseEventHandler;

  primaryButtonLabel: string;
  customBackground?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  jobNoteTemplateForm: {
    height: 64
  },
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

const CreateEditJobLabelTemplateForm: React.FC<Props> = props => {
  const classes = useStyles(props);

  const { jobLabelTemplate, setName, nameError, setNameError, setDescription, setColor } = props;

  const [label, setLabel] = useState<string>('');
  const [descriptionLabel, setDescriptionLabel] = useState<string>('');
  const [colorPicker, setColorPicker] = useColor('hex', jobLabelTemplate ? jobLabelTemplate.color : '#53A0BE');

  const [openPopover, setPopover] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { onSubmit, onCancel } = props;
  const { isSubmitting } = props;

  const { primaryButtonLabel } = props;

  useEffect(() => {
    if (!jobLabelTemplate) {
      return;
    }

    const { name, description } = jobLabelTemplate;
    setLabel(name);
    setDescriptionLabel(description);
  }, [jobLabelTemplate]);

  const handleOpenPopover = (event: any) => {
    setPopover(!openPopover);
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleLabelChange = (value: string) => {
    setLabel(value);
    setName(value);
  };

  const handleLabelDescriptionChange = (value: string) => {
    setDescriptionLabel(value);
    setDescription(value);
  };

  const handleColorPicker = (event: any) => {
    setColorPicker(event);
    setColor(event.hex);
  };

  const handleBlurLabel = (value: string) => {
    let ret = true;

    if (!label || !label.trim()) {
      setNameError('Please enter label name');
      ret = false;
    } else {
      setNameError('');
      ret = true;
    }

    return ret;
  };

  return (
    <TableRow className={classes.jobNoteTemplateForm}>
      <BodyCell cellWidth='40%' isComponent={true}>
        <TextField
          margin='dense'
          required
          fullWidth
          id='name'
          label='Label Name'
          error={nameError !== ''}
          helperText={nameError}
          value={label}
          onChange={event => handleLabelChange(event.target.value)}
          onBlur={event => handleBlurLabel(event.target.value)}
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
      <BodyCell cellWidth='50%' isComponent={true}>
        <TextField
          margin='dense'
          fullWidth
          id='description'
          label='Description'
          value={descriptionLabel}
          onChange={event => handleLabelDescriptionChange(event.target.value)}
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
      <BodyCell cellWidth='40%' isComponent={true}>
        <div className={classes.buttonContainer}>
          <Tooltip title='Select label color'>
            <Button
              variant='contained'
              disableElevation
              color='primary'
              style={{ color: colorPicker.hex, backgroundColor: `${colorPicker.hex}40` }}
              onClick={event => handleOpenPopover(event)}
            >
              {colorPicker.hex}
            </Button>
          </Tooltip>
          <Popper open={openPopover} anchorEl={anchorEl}>
            <ColorPicker width={250} height={100} color={colorPicker} onChange={handleColorPicker} hideHSV hideRGB />;
          </Popper>
        </div>
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

export default CreateEditJobLabelTemplateForm;
