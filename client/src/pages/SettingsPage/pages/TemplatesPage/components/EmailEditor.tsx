import React, { FC, useState, useEffect } from 'react';
import { Button, createStyles, Grid, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core';
import MUIRichTextEditor from 'mui-rte';
import { convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import LoadingButton from 'components/LoadingButton';
import theme from 'theme';
import EditIcon from '@material-ui/icons/Edit';

interface Props {
  defaultValue: string;
  emailTemplate: string;
  setEmailTemplate: React.Dispatch<React.SetStateAction<string>>;
  setEmailTemplateBody: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  variableValues: any[];
  setVariableValues: React.Dispatch<React.SetStateAction<any[]>>;
  handleSubmit: React.FormEventHandler;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rightPaper: {
      padding: theme.spacing(2),
      textAlign: 'justify'
    },
    editorGrid: {
      border: 'solid 1px grey',
      borderRadius: 5,
      marginBottom: theme.spacing(2),
      paddingBottom: '100px !important',
      overflow: 'auto',
      maxHeight: 500,
      height: 500
    },
    inputRoot: {
      lineHeight: '20px'
    }
  })
);

const EmailEditor: FC<Props> = props => {
  const classes = useStyles();
  const {
    defaultValue,
    emailTemplate,
    setEmailTemplate,
    setEmailTemplateBody,
    isLoading,
    isEdit,
    setIsEdit,
    variableValues,
    setVariableValues,
    handleSubmit
  } = props;
  const [currentValue, setCurrentValue] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>();

  useEffect(() => {
    if (!emailTemplate) {
      return;
    }
    const contentHTMLEmailTemplate = convertFromHTML(emailTemplate);

    // 2. Create the ContentState object
    const stateEmailTemplate = ContentState.createFromBlockArray(contentHTMLEmailTemplate.contentBlocks, contentHTMLEmailTemplate.entityMap);

    // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
    const contentEmailTemplate = JSON.stringify(convertToRaw(stateEmailTemplate));

    setCurrentValue(contentEmailTemplate);
  }, [emailTemplate]);

  const handleChangeData = (event: any) => {
    let data = JSON.stringify(convertToHTML(event.getCurrentContent()));
    data = data.replace(/"/g, '');
    data = data.replace(/<p><\/p>/g, '<div>&shy;</div>');
    setValue(data);
    setEmailTemplateBody(data);
  };

  const handleBlur = () => {
    setEmailTemplate(value);
  };

  const handleCancel = () => {
    setEmailTemplate(defaultValue);
    setIsEdit(false);
  };

  const handleCopy = (value: string, index: number) => {
    const currentValue = variableValues;
    navigator.clipboard.writeText(value);

    setVariableValues(currentValue);
    setSelectedIndex(index);
  };

  const variableDecorator = (props: any) => {
    return (
      <span
        style={{
          color: theme.palette.secondary.main
        }}
      >
        {props.children}
      </span>
    );
  };

  return (
    <span className={classes.rightPaper}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant='h5' display='block' gutterBottom>
            Template Editor
          </Typography>
          <Typography color='textSecondary' variant='body1' display='block' gutterBottom>
            You can edit the email body here. In the following fields, you can copy and paste these email-tags onto the email template editor below:
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {variableValues.map((value, index) => (
            <Tooltip title={index === selectedIndex ? 'Copied to clipboard' : value.tooltip}>
              <Button
                variant='outlined'
                size='small'
                color={index === selectedIndex ? 'secondary' : 'primary'}
                onClick={() => handleCopy(value.text, index)}
                style={{ margin: 8 }}
              >
                {value.text}
              </Button>
            </Tooltip>
          ))}
        </Grid>
      </Grid>
      <form noValidate onSubmit={handleSubmit}>
        <Grid container spacing={1} style={{ marginTop: 16 }}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} className={classes.editorGrid}>
            <MUIRichTextEditor
              label='Email Body'
              controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
              defaultValue={currentValue}
              onChange={handleChangeData}
              onBlur={handleBlur}
              readOnly={!isEdit}
              classes={{ editor: classes.inputRoot }}
              decorators={[
                {
                  component: variableDecorator,
                  regex: /{([^}]+)}/g
                }
              ]}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1} style={{ marginTop: 8 }}>
          <Grid item xs={12}>
            {isEdit ? (
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Button fullWidth variant='contained' disableElevation disabled={isLoading} onClick={handleCancel}>
                    Cancel
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <LoadingButton delay={0} isLoading={isLoading} disableElevation type='submit' fullWidth variant='contained' color='primary'>
                    Save
                  </LoadingButton>
                </Grid>
              </Grid>
            ) : (
              <Button fullWidth variant='contained' disableElevation color='primary' startIcon={<EditIcon />} onClick={() => setIsEdit(!isEdit)}>
                Edit
              </Button>
            )}
          </Grid>
        </Grid>
      </form>
    </span>
  );
};

export default EmailEditor;
