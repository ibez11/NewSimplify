import { FC, useState, Fragment, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  Theme,
  Grid,
  Typography,
  List,
  ListItem,
  Card,
  ListItemText,
  Collapse,
  ListItemIcon,
  CardContent,
  CardHeader,
  Avatar,
  RadioGroup,
  Radio,
  FormControlLabel,
  DialogActions,
  Box
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ViewIcon from '@material-ui/icons/VisibilityOutlined';
import ResetIcon from '@material-ui/icons/Refresh';
import { grey } from '@material-ui/core/colors';
import React from 'react';
import LoadingButtonIndicator from 'components/LoadingButtonIndicator';
import axios, { CancelTokenSource } from 'axios';
import { GET_PDF_LAYOUT_BY_FILE_NAME_URL } from 'constants/url';
import PreviewForm from './PreviewForm';
import theme from 'theme';
import { StandardConfirmationDialog } from 'components/AppDialog';

interface Props {
  type: string;
  sections: any;
  dummyOptions: any;
  handleClose(): void;
  handleSnackbar: (variant: 'success' | 'error', message: string) => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  contentGrid: {
    padding: theme.spacing(1),
    paddingBottom: '8vh',
    background: '#F5F8FA'
  },
  paper: {
    margin: 'auto',
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  rounded: {
    color: '#000',
    background: 'transparent',
    border: '0.1px solid gray'
  },
  nested: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  },
  leftContent: {
    flex: 1, // Allow this to grow and take available space
    overflow: 'auto',
    maxHeight: '80vh' // Adjust as needed
  },
  rightContent: {
    flex: 1, // Allow this to grow and take available space
    overflow: 'auto',
    maxHeight: '100vh' // Adjust as needed
  },
  dialogActions: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.background.paper, // Optional: to match the dialog background
    padding: theme.spacing(1), // Optional: add some padding
    zIndex: 1000 // Ensure it floats above other content
  },
  section: {
    padding: theme.spacing(2),
    transition: 'background-color 0.3s ease'
  },
  active: {
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderColor: theme.palette.primary.main
  },
  disabled: {
    backgroundColor: '#EAEAEA',
    color: '#999'
  }
}));

const QuotationForm: FC<Props> = props => {
  const classes = useStyles();
  const { type, sections, dummyOptions, handleClose, handleSnackbar } = props;
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openItemIndex, setOpenItemIndex] = useState<number>(0);
  const [selectedSection, setSelectedSection] = useState<string>('headerOptionId');
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(dummyOptions);
  const [openPreview, setOpenPreview] = useState<boolean>(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightContentRef = useRef<HTMLDivElement | null>(null); // Ref for right content container

  useEffect(() => {
    setIsLoading(true);
    const getLayoutOption = async () => {
      const { data } = await axios.get(`${GET_PDF_LAYOUT_BY_FILE_NAME_URL(type)}`, { cancelToken: cancelTokenSource.token });
      const stringifiedData = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, `${value}`]));
      setSelectedOptions(stringifiedData);
    };

    getLayoutOption();

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const container = rightContentRef.current;
    const section = sectionRefs.current[selectedSection];

    if (container && section) {
      const containerOffset = container.getBoundingClientRect().top;
      const sectionOffset = section.getBoundingClientRect().top;
      const offset = sectionOffset - containerOffset + container.scrollTop;

      container.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSection]);

  const handleClick = (index: number, section: string) => {
    setOpenItemIndex(index);
    setSelectedSection(section);
  };

  const handleChange = (section: string, value: string) => {
    setSelectedOptions(prevState => ({
      ...prevState,
      [section]: value
    }));
  };

  const handlePreview = () => {
    setOpenPreview(true);
  };

  const handleResetToDefault = () => {
    setSelectedOptions(prevState => ({
      ...prevState,
      ...dummyOptions
    }));
    setOpenConfirmation(false);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      await axios.put(`${GET_PDF_LAYOUT_BY_FILE_NAME_URL(type)}`, { ...selectedOptions });
      setIsLoading(false);
      handleSnackbar('success', 'Successfully saved layout options');
      handleClose();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      handleSnackbar('error', 'Failed to save layout options');
    }
  };

  // const renderTextFields = (indexOption: number, selectedOption: string) => {
  //   const isDisabled = Number(selectedOption) !== indexOption;
  //   if (indexOption === 1) {
  //     return (
  //       <TextField
  //         fullWidth
  //         margin='dense'
  //         variant='outlined'
  //         label='Prepared By'
  //         disabled={isDisabled}
  //         className={isDisabled ? classes.disabled : ''}
  //         value={preparedBy}
  //         onChange={e => setPreparedBy(e.target.value)}
  //       />
  //     );
  //   } else if (indexOption === 2) {
  //     return (
  //       <>
  //         <TextField
  //           fullWidth
  //           margin='dense'
  //           variant='outlined'
  //           label='Prepared By'
  //           disabled={isDisabled}
  //           className={isDisabled ? classes.disabled : ''}
  //           value={preparedBy}
  //           onChange={e => setPreparedBy(e.target.value)}
  //         />
  //         <TextField
  //           fullWidth
  //           margin='dense'
  //           variant='outlined'
  //           label='Approved By'
  //           disabled={isDisabled}
  //           className={isDisabled ? classes.disabled : ''}
  //           value={approvedBy}
  //           onChange={e => setApprovedBy(e.target.value)}
  //         />
  //       </>
  //     );
  //   }
  // };

  return (
    <>
      <Grid container spacing={2} className={classes.contentGrid}>
        <Grid item xs={3}>
          <Card variant='outlined' className={classes.paper}>
            <List component='nav'>
              {sections.map((value: any, index: number) => (
                <Fragment key={value.id}>
                  <ListItem button selected={selectedSection === value.section} onClick={() => handleClick(index, value.section)}>
                    <ListItemIcon>
                      <Avatar variant='rounded' className={classes.rounded}>
                        {React.createElement(value.icon)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant='h5'>{value.title}</Typography>} secondary={value.description} />
                    {openItemIndex === value.id ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={openItemIndex === value.id} timeout='auto' unmountOnExit>
                    <RadioGroup value={selectedOptions[value.section] || ''} onChange={event => handleChange(value.section, event.target.value)}>
                      <List component='div'>
                        {value.options.map((option: any, indexOption: number) => (
                          <>
                            <ListItem className={classes.nested}>
                              <FormControlLabel
                                value={option.id.toString()}
                                control={<Radio color='primary' />}
                                label={
                                  <ListItemText
                                    primary={
                                      <Typography variant='h5'>
                                        Option {indexOption + 1} {indexOption === 0 ? '(Default)' : ''}
                                      </Typography>
                                    }
                                    secondary={option.description}
                                  />
                                }
                              />
                            </ListItem>
                            {/* {value.section === 'signature' && (
                              <Grid container className={classes.nested}>
                                {renderTextFields(indexOption, selectedOptions[value.section])}
                              </Grid>
                            )} */}
                          </>
                        ))}
                      </List>
                    </RadioGroup>
                  </Collapse>
                </Fragment>
              ))}
            </List>
          </Card>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button variant='outlined' color='primary' fullWidth startIcon={<ViewIcon />} onClick={handlePreview}>
                Full PDF Preview
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='outlined'
                color='secondary'
                fullWidth
                startIcon={<ResetIcon />}
                style={{ color: theme.palette.error.main, border: '1px solid red' }}
                onClick={() => setOpenConfirmation(true)}
              >
                Reset to Default
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={9}>
          <div ref={rightContentRef} className={classes.rightContent}>
            <Card variant='outlined' className={classes.paper}>
              <CardHeader
                title={<Typography variant='subtitle2'>PDF Preview (This is sample data)</Typography>}
                style={{ backgroundColor: grey[200], height: 35 }}
              />
              <CardContent>
                {sections.map((value: any) => {
                  const selectedOption = value.options.find((option: any) => option.id === Number(selectedOptions[value.section]));
                  return (
                    <div key={value.id} ref={el => (sectionRefs.current[value.section] = el)}>
                      <Box
                        className={`${classes.section} ${selectedSection === value.section ? classes.active : classes.disabled}`}
                        dangerouslySetInnerHTML={{
                          __html: selectedOption?.value || ''
                        }}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>
      <Grid container spacing={2} justify='flex-end' className={classes.dialogActions}>
        <DialogActions>
          <Button variant='contained' disableElevation onClick={handleClose}>
            Cancel
          </Button>
          <Button variant='contained' disableElevation color='primary' onClick={handleSubmit}>
            Save
            {isLoading && <LoadingButtonIndicator isLoading={isLoading} />}
          </Button>
        </DialogActions>
      </Grid>
      {openPreview && (
        <PreviewForm
          open={openPreview}
          type={type}
          selectedOptions={selectedOptions}
          handleClose={() => setOpenPreview(false)}
          handleSnackbar={handleSnackbar}
        />
      )}
      {openConfirmation && (
        <StandardConfirmationDialog
          variant={'warning'}
          title=''
          message={`Are you sure you want to reset to the default layout?`}
          okLabel='OK'
          cancelLabel='cancel'
          open={openConfirmation}
          handleClose={() => setOpenConfirmation(false)}
          onConfirm={handleResetToDefault}
        />
      )}
    </>
  );
};

export default QuotationForm;
