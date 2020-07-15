// import { useState, useEffect, useReducer } from "react";
// import axios from 'axios';
import _ from 'lodash';
import Logit from '../logit';
import { createUseFetch } from './fetch-suspense';
import { useQuery, usePaginatedQuery } from 'react-query';
var logit = Logit('store/useDataApi');
let local = process.env.NODE_ENV === 'development';
// local = false;
// const proto = local ? "http" : "https";
const host = local ? 'localhost' : 'aidan.a2hosted.com';
// export const wsUrl = `wss://${host}/testkoa`;
export const wsUrl = `wss://${host}:42424`;
export const dbName = `/testkoa/bookings/`;
// export const dbName = `${proto}://${host}/testkoa/bookings/`;
export const db = `/testkoa/`;
// export const db = `${proto}://${host}/testkoa/`;

const getData = _.curry(async (block, url, setState) => {
  try {
    logit(`fetchData`, url);
    const res = await fetch(db + block + url, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
    });
    let body = await res.json();
    logit(`fetchData ${url} returned:`, body);
    if (setState) setState(body.data);
    return body;
  } catch (error) {
    console.log(error);
  }
});
export const getAuth = getData('auth/');
export const getBookings = getData('bookings/');

export const fetchData = async (url, setState) => {
  try {
    logit(`fetchData`, url);
    const res = await fetch(dbName + url, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
    });
    let body = await res.json();
    logit(`fetchData ${url} returned:`, body);
    // console.log(`fetchData ${url} post:`, body);
    if (setState) setState(body.data);
    return body;
  } catch (error) {
    console.log(error);
  }
};
export const postRequest = _.curry(async (block, url, data) => {
  try {
    logit(`postRequest`, data);
    const res = await fetch(db + block + url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    let body = await res.json();
    logit(`postRequest ${url} returned:`, body);
    // console.log(`fetchData ${url} post:`, body);
    return body;
  } catch (error) {
    console.log(error);
  }
});
// eslint-disable-next-line no-unused-vars
function sleeper(ms) {
  return function (x) {
    return new Promise((resolve) => setTimeout(() => resolve(x), ms));
  };
}
const myFetch = (url, ...rest) => {
  logit(`myFetchData`, url);
  return fetch(dbName + url).then((resp) => {
    logit(`myFetchData ${url} returned:`, resp);
    return resp;
  });
  // .then(sleeper(1000));
};
const myFetch2 = async (...queryKey) => {
  const url = typeof queryKey === 'string' ? queryKey : queryKey.join('');
  logit(`myFetchData`, url, queryKey);
  return fetch(dbName + url)
    .then((resp) => {
      return resp.json();
    })
    .then((resp) => {
      logit(`myFetchData ${url} returned:`, resp);
      return resp;
    })
    .then(sleeper(1000))
    .then((body) => body.data);
};
export const postData = postRequest('bookings/', 'patches');
export const postBookings = postRequest('bookings/');
export const postAuth = postRequest('auth/');
export const useFetchData = createUseFetch(myFetch);
export const useBookingQuery = (queryKey) => useQuery(queryKey, myFetch2);
export const usePaginatedBookingQuery = (queryKey) =>
  usePaginatedQuery(queryKey, myFetch2);
