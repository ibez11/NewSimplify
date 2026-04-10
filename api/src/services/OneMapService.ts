// OneMapService.ts
import axios, { AxiosResponse } from 'axios';
import * as ParameterStoreService from '../services/ParameterStoreService';

interface OneMapAuthResponse {
  access_token: string;
  // OneMap returns this almost certainly in SECONDS since epoch
  expiry_timestamp: number;
}

interface OneMapSearchResponse {
  found: number;
  totalNumPages: number;
  pageNum: number;
  results: Array<{
    SEARCHVAL: string;
    CATEGORY: string;
    X: string;
    Y: string;
    LATITUDE: string;
    LONGITUDE: string;
    POSTAL: string;
    BUILDING: string;
    ADDRESS: string;
    ROAD_NAME: string;
    BLK_NO: string;
  }>;
}

interface Select {
  id: number;
  name: string;
  value?: string;
  tempValue?: string;
}

const BASE_URL = 'https://www.onemap.gov.sg/api';
const AUTH_ENDPOINT = '/auth/post/getToken';
const SEARCH_ENDPOINT = '/common/elastic/search';

let accessToken: string | null = null;
// Always keep tokenExpiry in **milliseconds**
let tokenExpiry: number | null = null;

// prevent concurrent / duplicate auth storms
let authInFlight: Promise<string> | null = null;

const { ONEMAP_EMAIL, ONEMAP_PASSWORD, ENV } = process.env;

const ACCESS_TOKEN_KEY = ENV === 'development' ? '/simplify/dev/backend/onemap/ACCESS_TOKEN' : '/simplify/prd/backend/onemap/ACCESS_TOKEN';

const TOKEN_EXPIRY_KEY = ENV === 'development' ? '/simplify/dev/backend/onemap/TOKEN_EXPIRY' : '/simplify/prd/backend/onemap/TOKEN_EXPIRY';

const FIVE_MIN = 5 * 60 * 1000;

export const isTokenExpired = (): boolean => {
  if (!tokenExpiry) return true;
  return Date.now() + FIVE_MIN >= tokenExpiry;
};

export const authenticate = async (): Promise<string> => {
  if (authInFlight) return authInFlight; // share the same in-flight promise

  authInFlight = (async () => {
    const email = ONEMAP_EMAIL;
    const password = ONEMAP_PASSWORD;
    if (!email || !password) {
      throw new Error('OneMap credentials not configured');
    }

    const response: AxiosResponse<OneMapAuthResponse> = await axios.post(
      `${BASE_URL}${AUTH_ENDPOINT}`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Normalize expiry to **milliseconds**
    const newToken = response.data.access_token;
    const expirySeconds = response.data.expiry_timestamp;
    const newExpiryMs = expirySeconds * 1000;

    accessToken = newToken;
    tokenExpiry = newExpiryMs;

    // Read existing SSM values first; only write if changed
    const [storedToken, storedExpiryStr] = await Promise.all([
      ParameterStoreService.getParameter(ACCESS_TOKEN_KEY),
      ParameterStoreService.getParameter(TOKEN_EXPIRY_KEY)
    ]);

    const storedExpiry = storedExpiryStr ? parseInt(storedExpiryStr, 10) : null;

    const tokenChanged = !storedToken || storedToken !== newToken;
    const expiryChanged = !storedExpiry || storedExpiry !== newExpiryMs;

    if (tokenChanged) {
      await ParameterStoreService.setParameter(ACCESS_TOKEN_KEY, newToken);
    }
    if (expiryChanged) {
      await ParameterStoreService.setParameter(TOKEN_EXPIRY_KEY, String(newExpiryMs));
    }

    return newToken;
  })();

  try {
    return await authInFlight;
  } finally {
    authInFlight = null;
  }
};

export const getValidToken = async (): Promise<string> => {
  // Warm from SSM if this process has no cache yet
  if (!accessToken || !tokenExpiry) {
    const [storedToken, storedExpiryStr] = await Promise.all([
      ParameterStoreService.getParameter(ACCESS_TOKEN_KEY),
      ParameterStoreService.getParameter(TOKEN_EXPIRY_KEY)
    ]);

    if (storedToken) accessToken = storedToken;

    if (storedExpiryStr) {
      let ms = parseInt(storedExpiryStr, 10);
      // Heuristic: if stored value looks like seconds, convert to ms once
      if (ms && ms < 2_000_000_000) {
        ms = ms * 1000;
      }
      tokenExpiry = ms || null;
    }
  }

  if (!accessToken || isTokenExpired()) {
    return await authenticate();
  }

  return accessToken;
};

export const searchAddress = async (postalCode: string): Promise<Select[]> => {
  try {
    const token = await getValidToken();

    const params = new URLSearchParams();
    params.append('searchVal', postalCode);
    params.append('returnGeom', 'Y');
    params.append('getAddrDetails', 'Y');

    const response: AxiosResponse<OneMapSearchResponse> = await axios.get(`${BASE_URL}${SEARCH_ENDPOINT}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.data.results || response.data.results.length === 0) {
      return [];
    }

    return response.data.results.map(result => {
      const buildingIsNil = (result.BUILDING || '').toUpperCase().includes('NIL');
      const name = buildingIsNil
        ? `${result.BLK_NO} ${result.ROAD_NAME}, ${result.POSTAL}`
        : `${result.BUILDING}, ${result.BLK_NO} ${result.ROAD_NAME}, ${result.POSTAL}`;
      const value = buildingIsNil ? `${result.BLK_NO} ${result.ROAD_NAME}` : `${result.BUILDING}, ${result.BLK_NO} ${result.ROAD_NAME}`;

      return {
        id: Number(result.POSTAL),
        name,
        value,
        tempValue: result.POSTAL
      };
    });
  } catch (error) {
    console.error('OneMap search failed:', error);
    throw new Error('Failed to search addresses');
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getTokenInfo = async () => {
  const token = await getValidToken();
  return {
    token,
    expiry: tokenExpiry,
    isExpired: isTokenExpired()
  };
};
