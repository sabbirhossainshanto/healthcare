import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined");
}

const axiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return instance;
};

export interface ApiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const httpGet = async (endPoint: string, options?: ApiRequestOptions) => {
  try {
    const response = await axiosInstance().get(endPoint, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Get request to ${endPoint} failed`, error);
  }
};

const httpPost = async (
  endPoint: string,
  data: unknown,
  options?: ApiRequestOptions,
) => {
  try {
    const response = await axiosInstance().post(endPoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Post request to ${endPoint} failed`, error);
  }
};

const httpPut = async (
  endPoint: string,
  data: unknown,
  options?: ApiRequestOptions,
) => {
  try {
    const response = await axiosInstance().put(endPoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Put request to ${endPoint} failed`, error);
  }
};

const httpDelete = async (endPoint: string, options?: ApiRequestOptions) => {
  try {
    const response = await axiosInstance().delete(endPoint, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Delete request to ${endPoint} failed`, error);
  }
};

const httpPatch = async (
  endPoint: string,
  data: unknown,
  options?: ApiRequestOptions,
) => {
  try {
    const response = await axiosInstance().patch(endPoint, data, {
      params: options?.params,
      headers: options?.headers,
    });

    return response.data;
  } catch (error) {
    console.error(`Patch request to ${endPoint} failed`, error);
  }
};

export const httpClient = {
  get: httpGet,
  post: httpPost,
  put: httpPut,
  delete: httpDelete,
  patch: httpPatch,
};
