import React, { FC, useEffect, useState } from 'react';
import { Grid, Typography, Card, CardHeader, CardContent } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { grey } from '@material-ui/core/colors';
import { ServiceBody } from 'typings/body/ServiceBody';
import theme from 'theme';
import MUIRichTextEditor from 'mui-rte';
import { convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { convertToHTML } from 'draft-convert';

interface Props {
  service: ServiceBody;
  setService: React.Dispatch<React.SetStateAction<ServiceBody>>;
}

const useStyles = makeStyles(() => ({
  card: {
    margin: 'auto',
    width: '100%'
  },
  termConditionGrid: {
    border: 'solid 1px',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 5,
    paddingBottom: '50px !important',
    paddingLeft: theme.spacing(2),
    overflow: 'auto',
    maxHeight: 580,
    height: 450
  }
}));

const TermConditionForm: FC<Props> = props => {
  const classes = useStyles();
  const { service, setService } = props;

  const [currentTermCondition, setCurrentTermCondition] = useState<string>('');
  let termConditionData = '';

  useEffect(() => {
    if (!service) {
      return;
    }

    const { termCondition } = service;
    const contentHTMLTermCondition = convertFromHTML(termCondition);

    // 2. Create the ContentState object
    const stateTermCondition = ContentState.createFromBlockArray(contentHTMLTermCondition.contentBlocks, contentHTMLTermCondition.entityMap);

    // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
    const contentTermCondition = JSON.stringify(convertToRaw(stateTermCondition));

    setCurrentTermCondition(contentTermCondition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  const handleChangeTermCondition = (event: any) => {
    termConditionData = JSON.stringify(convertToHTML(event.getCurrentContent()));
    termConditionData = termConditionData.replace(/"/g, '');
    termConditionData = termConditionData.replace(/<p><\/p>/g, '<div>&shy;</div>');
  };

  const handleBlurTermCondition = () => {
    if (termConditionData === '<div>&shy;</div>') {
      setService({ ...service, termCondition: '' });
    } else {
      setService({ ...service, termCondition: termConditionData });
    }
  };

  return (
    <Card variant='outlined' className={classes.card}>
      <CardHeader title={<Typography variant='subtitle2'>Term & Conditions</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
      <CardContent>
        <Grid container spacing={2} alignItems='flex-start'>
          <Grid item xs={12} md={4} style={{ marginTop: 16 }}>
            <Typography variant='h6'>Input Your Quotation Term & Condition</Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <MUIRichTextEditor
              label='Term & Condition'
              controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList']}
              defaultValue={currentTermCondition}
              onChange={handleChangeTermCondition}
              onBlur={handleBlurTermCondition}
              classes={{ container: `${classes.termConditionGrid}` }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TermConditionForm;
