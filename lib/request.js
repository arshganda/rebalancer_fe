import axios from "axios";

const API_HOST = process.env.BACKEND_URL;

const getUrl = endpoint => API_HOST + endpoint;

export const post = async (endpoint, data, cid) => {
  const headers = cid
    ? {
      headers: { 'Content-Type': 'application/json', 'x-custid': cid }
    }
    : { headers: { 'Content-Type': 'application/json' } }
  return axios.post(getUrl(endpoint), data, headers);
};

export const get = async (endpoint, cid) => {
  const headers = cid
    ? {
      headers: { 'x-custid': cid }
    }
    : null;
  return axios.get(getUrl(endpoint), headers);
};

export const put = async (endpoint, data, cid) => {
  const headers = cid
  ? {
    headers: { 'Content-Type': 'application/json', 'x-custid': cid }
  }
  : { headers: { 'Content-Type': 'application/json' } }
  return axios.put(getUrl(endpoint), data, headers);
}