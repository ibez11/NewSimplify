import React, { FC, useState, useEffect, useContext } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { Grid } from '@material-ui/core';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import ActionSnackbar from 'components/ActionSnackbar';
import LeftContent from './components/LeftContent';
import RightContent from './components/RightContent';
import SettingCodes from 'typings/SettingCodes';
import { SETTING_BASE_URL } from 'constants/url';
import { CurrentUserContext } from 'contexts/CurrentUserContext';

const ProfileDetails: FC = () => {
  let cancelTokenSource: CancelTokenSource;
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);

  const [isLoading, setLoading] = useState<boolean>(false);

  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarVarient, setSnackbarVarient] = useState<'success' | 'error'>('success');
  const [messageSuccess, setMessageSuccess] = useState<string>('');
  const [messageError, setMessageError] = useState<string>('');

  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [unitNumber, setUnitNumber] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');

  const [logo, setLogo] = useState<string>('');
  const [logoView, setLogoView] = useState<string>('');
  const [logoError, setLogoError] = useState<string>('');
  const [uploadImage, setUploadImage] = useState<boolean>(false);

  const [paynowGst, setPaynowGst] = useState<string>('');
  const [, setPaynowGstView] = useState<string>('');
  const [, setPaynowGstError] = useState<string>('');
  const [uploadImageGst] = useState<boolean>(false);

  const [paynowNonGst, setPaynowNonGst] = useState<string>('');
  const [, setPaynowNonGstView] = useState<string>('');
  const [, setPaynowNonGstError] = useState<string>('');
  const [uploadImageNonGst] = useState<boolean>(false);

  const [nameError, setNameError] = useState<string>('');
  const [addressError, setAddressError] = useState<string>('');
  const [postalCodeError, setPostalCodeError] = useState<string>('');
  const [contactNumberError, setContactNumberError] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const getPersistedToken = () => {
    return localStorage.getItem('token');
  };

  const fetchSettings = async () => {
    const cancelTokenSource: CancelTokenSource = axios.CancelToken.source();

    try {
      const { data } = await axios.get(SETTING_BASE_URL, { cancelToken: cancelTokenSource.token });
      const companySetting = data.detailSetting.Setting.filter((setting: any) => setting.code === SettingCodes.COMPANY_SETTING);

      if (companySetting) {
        // eslint-disable-next-line array-callback-return
        companySetting.map((val: any) => {
          if (val.label === 'CompanyName') {
            setName(val.value);
          }

          if (val.label === 'CompanyAddress') {
            setAddress(val.value);
          }

          if (val.label === 'CompanyContactNumber') {
            setContactNumber(val.value);
          }

          if (val.label === 'CompanyUnitNumber') {
            setUnitNumber(val.value);
          }

          if (val.label === 'CompanyPostalCode') {
            setPostalCode(val.value);
          }

          if (val.label === 'CompanyImage') {
            setLogo(val.value);
            setLogoView(val.image);
          }

          if (val.label === 'PaynowGstImage') {
            setPaynowGst(val.value);
            setPaynowGstView(val.image);
          }

          if (val.label === 'PaynowNonGstImage') {
            setPaynowNonGst(val.value);
            setPaynowNonGstView(val.image);
          }
        });
      }
    } catch (err) {
      handleOpenMessageError('Error fetch setting data.');
    }
  };

  useEffect(() => {
    fetchSettings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFormErrors = () => {
    setNameError('');
    setContactNumberError('');
    setAddressError('');
    setPostalCodeError('');
    setLogoError('');
    setPaynowGstError('');
    setPaynowNonGstError('');
  };

  const validateForm = () => {
    let ret = true;
    clearFormErrors();

    if (!name || !name.trim()) {
      setNameError('Please enter company name');
      ret = false;
    }

    if (!address || !address.trim()) {
      setAddressError('Please enter company address');
      ret = false;
    }

    if (!postalCode || !postalCode.trim()) {
      setPostalCodeError('Please enter postal code');
      ret = false;
    }

    if (postalCode.length < 6) {
      setPostalCodeError('Please enter valid postal code');
      ret = false;
    }

    if (!contactNumber || !contactNumber.trim()) {
      setContactNumberError('Please enter contact number');
      ret = false;
    }

    if (contactNumber.length < 8) {
      setContactNumberError('Please enter valid contact number');
      ret = false;
    }

    if (!logoView || !logoView.trim()) {
      setLogoError('Please choose company logo');
      ret = false;
    }

    return ret;
  };

  const handleOpenMessageSuccess = (message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient('success');
    handleSetMessageSuccess(message);
  };

  const handleOpenMessageError = (message: string) => {
    setOpenSnackbar(true);
    setSnackbarVarient('error');
    handleSetMessageError(message);
  };

  const handleSetMessageSuccess = (message: string) => {
    setMessageSuccess(message);
  };

  const handleSetMessageError = (message: string) => {
    setMessageError(message);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    clearFormErrors();
    fetchSettings();
  };

  const handleOnSubmit: React.FormEventHandler = async event => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      cancelTokenSource = axios.CancelToken.source();
      const formData = new FormData();

      let response;
      const config = {
        cancelToken: cancelTokenSource.token
      };

      response = await axios.post(
        SETTING_BASE_URL,
        {
          code: SettingCodes.COMPANY_SETTING,
          label: 'CompanyName',
          value: name
        },
        config
      );
      setName(response.data.value);

      const currentUserData: CurrentUser = currentUser!;
      currentUserData.tenant = name;
      const token = getPersistedToken();

      if (token) {
        setCurrentUser(currentUserData, token);
      }

      response = await axios.post(
        SETTING_BASE_URL,
        {
          code: SettingCodes.COMPANY_SETTING,
          label: 'CompanyAddress',
          value: address
        },
        config
      );
      setAddress(response.data.value);

      response = await axios.post(
        SETTING_BASE_URL,
        {
          code: SettingCodes.COMPANY_SETTING,
          label: 'CompanyContactNumber',
          value: contactNumber
        },
        config
      );
      setContactNumber(response.data.value);

      response = await axios.post(
        SETTING_BASE_URL,
        {
          code: SettingCodes.COMPANY_SETTING,
          label: 'CompanyUnitNumber',
          value: unitNumber
        },
        config
      );
      setUnitNumber(response.data.value);

      response = await axios.post(
        SETTING_BASE_URL,
        {
          code: SettingCodes.COMPANY_SETTING,
          label: 'CompanyPostalCode',
          value: postalCode
        },
        config
      );
      setPostalCode(response.data.value);

      let checkExtension = true;
      if (uploadImage) {
        let newImageKey = '';
        let fileExtension = '';

        if (logo) {
          formData.append('logo', logo);
          // @ts-ignore
          const imageType = logo ? logo.type : '';
          fileExtension = imageType ? imageType.split('/').pop()! : '';
          newImageKey = `${Date.now()}.${fileExtension}`;

          checkExtension = true;
          response = await axios.post(
            SETTING_BASE_URL,
            {
              code: SettingCodes.COMPANY_SETTING,
              label: 'CompanyImage',
              value: newImageKey,
              image: newImageKey
            },
            config
          );

          if (response.data.image) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', `image/${fileExtension}`);

            const config = {
              method: 'PUT',
              headers: myHeaders,
              body: logo
            };

            await fetch(response.data.image, config);
            setLogo(newImageKey);
            setUploadImage(false);
          }
        }
      }

      if (uploadImageGst) {
        let newImageKey = '';
        let fileExtension = '';
        if (paynowGst) {
          formData.append('paynowGst', paynowGst);
          // @ts-ignore
          const imageType = paynowGst ? paynowGst.type : '';
          fileExtension = imageType ? imageType.split('/').pop()! : '';
          newImageKey = `${Date.now()}.${fileExtension}`;

          checkExtension = true;
          response = await axios.post(
            SETTING_BASE_URL,
            {
              code: SettingCodes.COMPANY_SETTING,
              label: 'PaynowGstImage',
              value: newImageKey,
              image: newImageKey
            },
            config
          );

          if (response.data.image) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', `image/${fileExtension}`);

            const config = {
              method: 'PUT',
              headers: myHeaders,
              body: paynowGst
            };

            await fetch(response.data.image, config);
            setPaynowGst(newImageKey);
            setUploadImage(false);
          }
        }
      }

      if (uploadImageNonGst) {
        let newImageKey = '';
        let fileExtension = '';
        if (paynowNonGst) {
          formData.append('paynowNonGst', paynowNonGst);
          // @ts-ignore
          const imageType = paynowNonGst ? paynowNonGst.type : '';
          fileExtension = imageType ? imageType.split('/').pop()! : '';
          newImageKey = `${Date.now()}.${fileExtension}`;

          checkExtension = true;
          response = await axios.post(
            SETTING_BASE_URL,
            {
              code: SettingCodes.COMPANY_SETTING,
              label: 'PaynowNonGstImage',
              value: newImageKey,
              image: newImageKey
            },
            config
          );

          if (response.data.image) {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', `image/${fileExtension}`);

            const config = {
              method: 'PUT',
              headers: myHeaders,
              body: paynowNonGst
            };

            await fetch(response.data.image, config);
            setPaynowNonGst(newImageKey);
            setUploadImage(false);
          }
        }
      }

      if (checkExtension) {
        handleOpenMessageSuccess('Successfully updated setting');
      } else {
        handleOpenMessageError('Please check your image file extension');
      }
    } catch (err) {
      handleOpenMessageError('Failed to update setting');
    }

    setLoading(false);
    setIsEdit(false);
  };

  return (
    <form noValidate onSubmit={handleOnSubmit}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <LeftContent
            isEdit={isEdit}
            setLogo={setLogo}
            logoView={logoView}
            setLogoView={setLogoView}
            logoError={logoError}
            setUploadImage={setUploadImage}
            isSubmitting={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <RightContent
            name={name}
            setName={setName}
            address={address}
            setAddress={setAddress}
            unitNumber={unitNumber}
            setUnitNumber={setUnitNumber}
            postalCode={postalCode}
            setPostalCode={setPostalCode}
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            nameError={nameError}
            addressError={addressError}
            postalCodeError={postalCodeError}
            contactNumberError={contactNumberError}
            isSubmitting={isLoading}
            handleCancel={handleCancelEdit}
            onSubmit={handleOnSubmit}
          />
        </Grid>
      </Grid>
      <ActionSnackbar
        variant={snackbarVarient}
        message={snackbarVarient === 'success' ? messageSuccess : messageError}
        open={openSnackbar}
        handleClose={handleCloseSnackbar}
        Icon={snackbarVarient === 'success' ? CheckCircleIcon : ErrorIcon}
      />
    </form>
  );
};

export default ProfileDetails;
