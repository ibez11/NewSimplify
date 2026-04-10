import React, { FC, useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';

import axios, { CancelTokenSource } from 'axios';
import SettingCodes from 'typings/SettingCodes';
import { SETTING_BASE_URL, GET_SETTING_UPDATE_BASE_URL, GET_LAST_INVOICE_URL } from 'constants/url';

import EmailEditor from '../EmailEditor';
import EmailPreview from '../EmailPreview';
import ActionSnackbar from 'components/ActionSnackbar';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

const InvoiceEmailTemplate: FC = () => {
  const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

  const [dummyData, setDummyData] = useState<any>();
  const [settingId, setSettingId] = useState<number>(0);
  const [emailTemplate, setEmailTemplate] = useState<string>('');
  const [emailTemplateBody, setEmailTemplateBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [defaultValue, setDefaultValue] = useState<string>('');
  const [variableValues, setVariableValues] = useState<any[]>([
    { text: '{clientName}', tooltip: 'Click to copy' },
    { text: '{contactPerson}', tooltip: 'Click to copy' },
    { text: '{invoiceNumber}', tooltip: 'Click to copy' },
    { text: '{termEnd}', tooltip: 'Click to copy' },
    { text: '{invoiceAmount}', tooltip: 'Click to copy' },
    { text: '{quotationTitle}', tooltip: 'Click to copy' }
  ]);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    const loadSetting = async () => {
      try {
        const { data } = await axios.get(`${SETTING_BASE_URL}/${SettingCodes.INVOICEEMAILTEMPLATE}`, { cancelToken: cancelTokenSource.token });
        setSettingId(data.id);
        setEmailTemplate(data.value);
        setDefaultValue(data.value);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };

    const getLastService = async () => {
      try {
        const { data } = await axios.get(GET_LAST_INVOICE_URL, { cancelToken: cancelTokenSource.token });
        setDummyData(data);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };

    loadSetting();
    getLastService();

    setIsLoading(false);
    return () => {
      cancelTokenSource.cancel();
      setIsLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenSnackbar = (type: 'success' | 'error', message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient(type);
    setSnackbarMessage(message);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(`${GET_SETTING_UPDATE_BASE_URL(settingId)}`, { value: emailTemplate }, { cancelToken: cancelTokenSource.token });
      setIsLoading(false);
      handleOpenSnackbar('success', 'Successfully updated email template.');
    } catch (err) {
      setIsLoading(false);
      handleOpenSnackbar('error', 'Error update email template.');
    }
    setIsEdit(false);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <EmailEditor
          defaultValue={defaultValue}
          emailTemplate={emailTemplate}
          setEmailTemplate={setEmailTemplate}
          setEmailTemplateBody={setEmailTemplateBody}
          isLoading={isLoading}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          variableValues={variableValues}
          setVariableValues={setVariableValues}
          handleSubmit={handleOnSubmit}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <EmailPreview type='INVOICE' emailTemplateBody={emailTemplateBody} dummyData={dummyData} />
      </Grid>
      {openSnackbar && (
        <ActionSnackbar
          variant={snackbarVarient}
          message={snackbarMessage}
          open={openSnackbar}
          handleClose={handleCloseSnackbar}
          Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
        />
      )}
    </Grid>
  );
};

export default InvoiceEmailTemplate;
