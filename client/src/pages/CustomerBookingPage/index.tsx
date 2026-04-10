import { useEffect, useState } from 'react';
import BookingLandingPage from './components/BookingLandingPage';
import BookingFormPage from './components/BookingFormPage'; // to be built for date/time
import { dummyBookingSetting } from 'constants/dummy';
import axios from 'axios';
import { GET_BOOKING_SETTING_WEBHOOKS_URL, GET_TENANT_WEBHOOK_URL, VERIFY_BOOKING_URL } from 'constants/url';
import { Backdrop, CircularProgress } from '@material-ui/core';
import NotFoundPage from 'pages/NotFoundPage';

const BookingPage = () => {
  const [quotationCode, setQuotationCode] = useState<string | null>(null);
  const [bookingSetting, setBookingSetting] = useState<any>(dummyBookingSetting);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [tenant, setTenant] = useState<string | null>(null);
  const [isTenantInvalid, setIsTenantInvalid] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('quotation_id');
    const token = params.get('t');

    const resolveFromToken = async (jwtToken: string) => {
      setIsLoading(true);
      try {
        // Server verifies token & returns payload safely
        const { data } = await axios.post(VERIFY_BOOKING_URL, { token: jwtToken });
        // Expect: { tenantKey, jobId, customerId }
        if (!data?.tenantKey || !data?.jobId) {
          setIsTenantInvalid(true);
          return;
        }
        console.log('✅ Booking link verified:', data);
        setTenant(String(data.tenantKey));
        setQuotationCode(String(data.jobId));
        // if (data.customerId !== undefined) setCustomerId(data.customerId);
      } catch (err) {
        console.error('❌ Invalid or expired link', err);
        setIsTenantInvalid(true);
      } finally {
        setIsLoading(false);
      }
    };

    const resolveTenant = async () => {
      try {
        const res = await axios.get(GET_TENANT_WEBHOOK_URL(hostname));

        if (!res.data) {
          setIsTenantInvalid(true); // ⚠️ Domain not registered
        } else {
          setTenant(res.data);
          if (code) {
            setQuotationCode(code);
          }
        }
      } catch (error) {
        console.error('❌ Failed to resolve tenant:', error);
        setIsTenantInvalid(true); // ⚠️ Treat all errors as "not found"
      }
    };

    if (token) {
      // Preferred path: trust server verification
      resolveFromToken(token);
    } else {
      // Legacy path: query ?quotationCode=... and domain mapping
      resolveTenant();
    }
  }, []);

  useEffect(() => {
    if (!tenant) return;

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(GET_BOOKING_SETTING_WEBHOOKS_URL(tenant!));
        const data = res.data;

        const updatedSettings = {
          ...data,
          TimeSlots: data.TimeSlots?.split(',') ?? []
        };

        setBookingSetting(updatedSettings);
      } catch (error) {
        console.error('❌ Failed to load settings:', error);
        alert('Failed to load');
        setBookingSetting(dummyBookingSetting);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();

    return () => {};
  }, [tenant]);

  return (
    <>
      {isTenantInvalid ? (
        <NotFoundPage hideBackButton={true} />
      ) : quotationCode ? (
        <BookingFormPage quotationCode={quotationCode} tenant={tenant!} bookingSetting={bookingSetting} onBack={() => setQuotationCode(null)} />
      ) : (
        <BookingLandingPage bookingSetting={bookingSetting} onSubmitQuotation={setQuotationCode} />
      )}

      <Backdrop open={isLoading} style={{ zIndex: 1300, color: '#fff' }}>
        <CircularProgress color='inherit' />
      </Backdrop>
    </>
  );
};

export default BookingPage;
