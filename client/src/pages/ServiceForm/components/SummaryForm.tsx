import { FC, useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Chip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { getNumberWithOrdinal } from 'utils';
import { grey } from '@material-ui/core/colors';
import { ServiceBody } from 'typings/body/ServiceBody';
import MUIRichTextEditor from 'mui-rte';
import { convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { format } from 'date-fns';
import HeaderRow from 'components/HeaderRow';
import theme from 'theme';
import NumberFormat from 'react-number-format';

interface Props {
  service: ServiceBody;
  jobGenerate: JobGenerateModel[];
}

const useStyles = makeStyles(() => ({
  card: {
    margin: 'auto',
    width: '100%'
  },
  divider: { margin: '16px 0px' },
  gridMargin: { marginTop: theme.spacing(2) },
  termConditionGrid: {
    border: 'solid 1px',
    borderColor: 'rgba(0, 0, 0, 0.23)',
    borderRadius: 5,
    paddingBottom: '50px !important',
    paddingLeft: theme.spacing(2),
    overflow: 'auto',
    maxHeight: 300,
    height: 200
  },
  cellAlignTop: {
    verticalAlign: 'top'
  },
  itemRemarks: {
    paddingLeft: theme.spacing(4),
    fontSize: '12px'
  },
  disabledLabel: {
    '&.MuiFormControlLabel-label.Mui-disabled': {
      color: '#000000'
    }
  },
  noneBorder: {
    borderStyle: 'none'
  }
}));

const SummaryForm: FC<Props> = props => {
  const classes = useStyles();
  const { service, jobGenerate } = props;

  const {
    serviceType,
    serviceTitle,
    issueDate,
    expiryDate,
    termStart,
    termEnd,
    entityName,
    contractAmount,
    discountAmount,
    needGST,
    gstTax,
    gstAmount,
    totalAmount,
    serviceAddress,
    salesPerson,
    skills,
    JobLabels,
    Checklists,
    CustomFields,
    ContactPersons
  } = service;

  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [currentTermCondition, setCurrentTermCondition] = useState<string>('');

  useEffect(() => {
    if (!service) {
      return;
    }

    const { termCondition, description } = service;

    if (description) {
      const contentHTMLDescription = convertFromHTML(description);

      // 2. Create the ContentState object
      const stateDescription = ContentState.createFromBlockArray(contentHTMLDescription.contentBlocks, contentHTMLDescription.entityMap);

      // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
      const contentDescription = JSON.stringify(convertToRaw(stateDescription));

      setCurrentDescription(contentDescription);
    }

    if (termCondition) {
      const contentHTMLTermCondition = convertFromHTML(termCondition);

      // 2. Create the ContentState object
      const stateTermCondition = ContentState.createFromBlockArray(contentHTMLTermCondition.contentBlocks, contentHTMLTermCondition.entityMap);

      // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
      const contentTermCondition = JSON.stringify(convertToRaw(stateTermCondition));

      setCurrentTermCondition(contentTermCondition);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  const renderGeneralInformation = (title: string, value?: any, field?: string) => {
    return (
      <>
        <Grid item xs={12} md={2}>
          <Typography variant='body1' gutterBottom>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} md={10}>
          {value ? (
            field === 'description' || field === 'termCondition' ? (
              <MUIRichTextEditor controls={[]} readOnly defaultValue={value} />
            ) : field === 'term' ? (
              <Typography variant='body1' gutterBottom>
                {format(new Date(termStart), 'dd MMM yyyy')} - {format(new Date(termEnd), 'dd MMM yyyy')}
              </Typography>
            ) : field === 'duration' ? (
              <Typography variant='body1' gutterBottom>
                {format(new Date(issueDate), 'dd MMM yyyy')} - {format(new Date(expiryDate), 'dd MMM yyyy')}
              </Typography>
            ) : (
              <Typography variant='body1' gutterBottom>
                {value}
              </Typography>
            )
          ) : (
            '-'
          )}
        </Grid>
      </>
    );
  };

  const renderChecklist = () => {
    return (
      <Card variant='outlined' className={classes.card}>
        <CardContent style={{ padding: 0 }}>
          <Table component='table'>
            <TableHead>
              <HeaderRow
                headers={[
                  { label: 'No', verticalAlign: 'top' },
                  { label: 'Title & Description', verticalAlign: 'top' },
                  { label: 'Item', verticalAlign: 'top' }
                ]}
              />
            </TableHead>
            <TableBody>
              {Checklists && Checklists.length > 0 ? (
                Checklists.map((value, index) => {
                  return (
                    <TableRow key={`${value.id}-${value.name}`}>
                      <TableCell width={'5%'} className={classes.cellAlignTop}>
                        <Typography variant='body1'>{index + 1}</Typography>
                      </TableCell>
                      <TableCell width={'15%'} className={classes.cellAlignTop}>
                        <Typography variant='body1'>{value.name}</Typography>
                        <Typography variant='body1' color='textSecondary'>
                          {value.description}
                        </Typography>
                      </TableCell>
                      <TableCell width={'25%'} className={classes.cellAlignTop}>
                        {value.ChecklistItems && value.ChecklistItems.length > 0 ? (
                          value.ChecklistItems.map(item => {
                            return (
                              <div key={`${item.id}-${item.name}`}>
                                <FormControlLabel
                                  control={<Checkbox checked={item.status!} name='checkedE' disabled />}
                                  label={item.name}
                                  style={{ width: '100%' }}
                                  classes={{ label: classes.disabledLabel }}
                                />
                                <Typography color='textSecondary' className={classes.itemRemarks}>
                                  {item.remarks ? 'Remarks : ' : item.remarks}
                                </Typography>
                                <Typography color='textSecondary' className={classes.itemRemarks} style={{ whiteSpace: 'pre-line' }}>
                                  {item.remarks ? item.remarks : item.remarks}
                                </Typography>
                              </div>
                            );
                          })
                        ) : (
                          <Typography variant='body1'>No Item</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell align='center' colSpan={5} className={classes.noneBorder}>
                    <Typography variant='body1' id='form-subtitle' color='textSecondary'>
                      No Job Checklist
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const renderSchedule = () => {
    const renderFooterSummary = (title: string, value: any) => {
      return (
        <>
          <Grid item container justify='flex-end' xs={11}>
            <Typography variant='body1'>{title}</Typography>
          </Grid>
          <Grid item container justify='flex-end' xs={1}>
            <Typography variant='body1'>
              <NumberFormat value={value || 0} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2} fixedDecimalScale={true} />
            </Typography>
          </Grid>
        </>
      );
    };

    return (
      <Card variant='outlined' className={classes.card}>
        <CardContent style={{ padding: 0 }}>
          <Table component='table'>
            <TableHead>
              <HeaderRow
                headers={[
                  { label: 'Schedule', verticalAlign: 'top' },
                  { label: 'Job Occurrences', verticalAlign: 'top' },
                  { label: 'Start Date & Time', verticalAlign: 'top' },
                  { label: 'Duration', verticalAlign: 'top' },
                  { label: 'Item & Description', verticalAlign: 'top' },
                  { label: 'Qty', verticalAlign: 'top' },
                  { label: 'Unit Price', verticalAlign: 'top' },
                  { label: 'Amount', verticalAlign: 'top' }
                ]}
              />
            </TableHead>
            <TableBody>
              {jobGenerate.length > 0 ? (
                jobGenerate.map(job =>
                  job.ServiceItems.map((item, itemIndex) => (
                    <TableRow>
                      {itemIndex === 0 && (
                        <>
                          <TableCell width={'5%'} rowSpan={job.ServiceItems.length}>
                            <Chip
                              label={`#${item.scheduleIndex! + 1}`}
                              style={{ color: theme.palette.secondary.main, background: theme.palette.secondary.light }}
                            />
                          </TableCell>
                          <TableCell width={'5%'} rowSpan={job.ServiceItems.length}>
                            <Typography variant='body2'>{getNumberWithOrdinal(job.occurance || 1)}</Typography>
                          </TableCell>
                          <TableCell width={'15%'} rowSpan={job.ServiceItems.length}>
                            <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                              {format(new Date(job.startDateTime), `EEE, dd MMM yyyy'\n'hh:mm a`)}
                            </Typography>
                          </TableCell>
                          <TableCell width={'10%'} rowSpan={job.ServiceItems.length}>
                            <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                              {(job.duration || 60) / 60 || 1} Hrs
                            </Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell width={'20%'}>
                        <Typography variant='body2'>{item.name}</Typography>
                        <Typography variant='caption' color='textSecondary' style={{ whiteSpace: 'pre-line' }}>
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell width={'10%'}>
                        <Typography variant='body2'>{item.quantity}</Typography>
                      </TableCell>
                      <TableCell width={'10%'}>
                        <Typography variant='body2'>
                          <NumberFormat
                            value={item.unitPrice}
                            displayType={'text'}
                            thousandSeparator={true}
                            prefix={'$'}
                            decimalScale={2}
                            fixedDecimalScale={true}
                          />
                        </Typography>
                      </TableCell>
                      <TableCell width={'10%'}>
                        <Typography variant='body2' align='right'>
                          <NumberFormat
                            value={item.totalPrice}
                            displayType={'text'}
                            thousandSeparator={true}
                            prefix={'$'}
                            decimalScale={2}
                            fixedDecimalScale={true}
                          />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align='center'>
                    <Typography variant='body1' color='textSecondary'>
                      No Scheduling Summary
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={8} className={classes.noneBorder}>
                  <Grid container spacing={1}>
                    {renderFooterSummary('Quotation Amount', contractAmount)}
                    {renderFooterSummary('Discount Amount', discountAmount)}
                    {renderFooterSummary('Total Amount', contractAmount - discountAmount)}
                    {renderFooterSummary(`GST ${gstTax}%`, gstAmount)}
                    {renderFooterSummary('Grand Total', totalAmount)}
                  </Grid>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card variant='outlined' className={classes.card}>
      <CardHeader title={<Typography variant='subtitle2'>Quotation Summary</Typography>} style={{ backgroundColor: grey[200], height: 35 }} />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='subtitle2'>General Information</Typography>
            <Divider className={classes.divider} />
          </Grid>
          {renderGeneralInformation('Quotation Type', serviceType.includes('CONTRACT') ? 'Service Contract' : 'Ad-hoc Service')}
          {renderGeneralInformation('Quotation Title', serviceTitle)}
          {renderGeneralInformation('Quotation Description', currentDescription, 'description')}
          {renderGeneralInformation('Quotation Issue & Expiry Date', termStart, 'duration')}
          {renderGeneralInformation('Quotation Term', termStart, 'term')}
          {renderGeneralInformation('Entity', entityName)}
          {renderGeneralInformation('GST', `${needGST ? 'Yes' : 'No'} (${gstTax}%)`)}
          {renderGeneralInformation('Contact Persons', ContactPersons ? ContactPersons.map(value => value.name).join(', ') : '-')}
          {renderGeneralInformation('Service Address', serviceAddress)}
          {renderGeneralInformation('Sales Person', salesPerson)}
          {renderGeneralInformation('Skills Required', skills ? skills.map(value => value.name).join(', ') : '-')}
          {renderGeneralInformation('Job labels', JobLabels ? JobLabels.map(value => value.name).join(', ') : '-')}
          {CustomFields && CustomFields.length > 0
            ? CustomFields.map(field => {
                if (field.label !== '') {
                  return renderGeneralInformation(field.label, field.value);
                }
                return <></>;
              })
            : ''}
          <Grid item xs={12} className={classes.gridMargin}>
            <Typography variant='subtitle2'>Job Summary</Typography>
            <Typography variant='caption' color='textSecondary'>
              Total Job(s): {jobGenerate.length}
            </Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs={12}>
            {renderSchedule()}
          </Grid>
          <Grid item xs={12} className={classes.gridMargin}>
            <Typography variant='subtitle2'>Checklist Summary</Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs={12}>
            {renderChecklist()}
          </Grid>
          <Grid item xs={12} className={classes.gridMargin}>
            <Typography variant='subtitle2'>Term & Conditions</Typography>
            <Divider className={classes.divider} />
          </Grid>
          <Grid item xs={12}>
            <MUIRichTextEditor controls={[]} readOnly defaultValue={currentTermCondition} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SummaryForm;
