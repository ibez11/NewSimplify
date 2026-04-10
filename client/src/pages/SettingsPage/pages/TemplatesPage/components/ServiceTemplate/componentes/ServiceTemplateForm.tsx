import { FC, useEffect, useState } from 'react';
import { Grid, TextField, Button, Theme, Typography, DialogActions } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { convertHtml } from 'utils';
import axios, { CancelTokenSource } from 'axios';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import MUIRichTextEditor from 'mui-rte';
import { convertToHTML } from 'draft-convert';
import { GET_EDIT_SERVICE_TEMPLATE_URL, SERVICE_TEMPLATE_BASE_URL } from 'constants/url';

interface Props {
  serviceTemplate: ServiceTemplatesModel;
  isEdit: boolean;
  handleClose(): void;
  addNewServiceTemplate(user: ServiceTemplatesModel): void;
  updateIndividualServiceTemplate: (updatedServiceTemplateProperties: Partial<ServiceTemplatesModel>) => void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
    width: '100%'
  },
  contentGrid: {
    padding: theme.spacing(2)
  },
  required: {
    color: 'red'
  },
  rteGrid: {
    border: 'solid 1px',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 5,
    paddingBottom: '50px !important',
    paddingLeft: theme.spacing(2),
    overflow: 'auto',
    maxHeight: 300,
    height: 200
  }
}));

const ServiceTemplateForm: FC<Props> = props => {
  const classes = useStyles();
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();
  const { serviceTemplate, isEdit, handleClose, addNewServiceTemplate, updateIndividualServiceTemplate, handleSnackbar } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [termCondition, setTermCondition] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [currentTermCondition, setCurrentTermCondition] = useState<string>('');
  let descriptionData = '';
  let termConditionData = '';
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!serviceTemplate) {
      return;
    }

    const { name, description, termCondition } = serviceTemplate;
    const currentDescription = convertHtml(description);
    const currentTermCondition = convertHtml(termCondition);

    setName(name);
    setDescription(description);
    setTermCondition(termCondition);
    setCurrentDescription(currentDescription);
    setCurrentTermCondition(currentTermCondition);
  }, [serviceTemplate]);

  const handleChangeDescription = (event: any) => {
    descriptionData = JSON.stringify(convertToHTML(event.getCurrentContent()));
    descriptionData = descriptionData.replace(/"/g, '');
    descriptionData = descriptionData.replace(/<p><\/p>/g, '<div>&shy;</div>');
  };

  const handleBlurDescription = () => {
    if (descriptionData === '<div>&shy;</div>') {
      setCurrentDescription('');
      setDescription('');
    } else {
      setCurrentDescription(convertHtml(descriptionData));
      setDescription(descriptionData);
    }
  };

  const handleChangeTermCondition = (event: any) => {
    termConditionData = JSON.stringify(convertToHTML(event.getCurrentContent()));
    termConditionData = termConditionData.replace(/"/g, '');
    termConditionData = termConditionData.replace(/<p><\/p>/g, '<div>&shy;</div>');
  };

  const handleBlurTermCondition = () => {
    if (termConditionData === '<div>&shy;</div>') {
      setTermCondition('');
      setTermCondition('');
    } else {
      setTermCondition(convertHtml(termConditionData));
      setTermCondition(termConditionData);
    }
  };

  const validateForm = () => {
    let ret = true;

    if (!name || !name.trim()) {
      setError('Please enter quotation name');
      ret = false;
    }
    return ret;
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      if (isEdit) {
        const response = await axios.put(
          `${GET_EDIT_SERVICE_TEMPLATE_URL(serviceTemplate.id)}`,
          {
            name,
            description,
            termCondition
          },
          { cancelToken: cancelTokenSource.token }
        );
        updateIndividualServiceTemplate(response.data);
        handleSnackbar('success', 'Successfully edit quotation template');
      } else {
        const response = await axios.post(
          `${SERVICE_TEMPLATE_BASE_URL}`,
          {
            name,
            description,
            termCondition
          },
          { cancelToken: cancelTokenSource.token }
        );
        addNewServiceTemplate(response.data);
        handleSnackbar('success', 'Successfully add new quotation template');
      }
      handleClose();
    } catch (err) {
      console.log(err);
      handleSnackbar('error', isEdit ? 'Failed to edit quotation template' : 'Failed to add new quotation template');
    }
  };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid} alignItems='center'>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>
            Quotation Name <span className={classes.required}>*</span>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            variant='outlined'
            margin='dense'
            required
            fullWidth
            id='name'
            label='Name'
            error={error !== ''}
            helperText={error}
            value={name}
            onChange={event => setName(event.target.value)}
            onBlur={event => {
              if (event.target.value) {
                setError('');
              } else {
                setError('Please enter quotation name');
              }
            }}
            autoComplete='off'
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Description</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <MUIRichTextEditor
            label='Decription'
            controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
            defaultValue={currentDescription}
            onChange={handleChangeDescription}
            onBlur={handleBlurDescription}
            classes={{ container: `${classes.rteGrid}` }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant='h6'>Term & Condition</Typography>
        </Grid>
        <Grid item xs={12} sm={8}>
          <MUIRichTextEditor
            label='Term & Condition'
            controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
            defaultValue={currentTermCondition}
            onChange={handleChangeTermCondition}
            onBlur={handleBlurTermCondition}
            classes={{ container: `${classes.rteGrid}` }}
          />
        </Grid>
      </Grid>
      <DialogActions>
        <Button variant='contained' disableElevation disabled={isLoading} onClick={handleClose}>
          Cancel
        </Button>
        <Button variant='contained' disableElevation color='primary' disabled={isLoading} onClick={handleSubmit}>
          Save
          {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
        </Button>
      </DialogActions>
    </>
  );
};

export default ServiceTemplateForm;
