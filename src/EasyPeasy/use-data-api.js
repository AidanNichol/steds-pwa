// import { useState, useEffect, useReducer } from "react";
// import axios from 'axios';
import _ from 'lodash';
import Logit from 'logit';
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
export const postData = postRequest('bookings/', 'patches');
export const postBookings = postRequest('bookings/');
export const postAuth = postRequest('auth/');
// const dataFetchReducer = (state, action) => {
//   switch (action.type) {
//     case "FETCH_INIT":
//       return { ...state, isLoading: true, isError: false };
//     case "FETCH_SUCCESS":
//       return {
//         ...state,
//         isLoading: false,
//         isError: false,
//         data: action.payload,
//       };
//     case "FETCH_FAILURE":
//       return {
//         ...state,
//         isLoading: false,
//         isError: true,
//       };
//     default:
//       throw new Error();
//   }
// };

// export const useDataApi = (initialUrl, initialData) => {
//   const [url, setUrl] = useState(initialUrl);

//   const [state, dispatch] = useReducer(dataFetchReducer, {
//     isLoading: false,
//     isError: false,
//     data: initialData,
//   });

//   useEffect(() => {
//     let didCancel = false;

//     const fetchData = async () => {
//       dispatch({ type: 'FETCH_INIT' });

//       try {
//         const result = await fetch(dbName + url);
//         const body = await result.json();

//         if (!didCancel) {
//           dispatch({ type: 'FETCH_SUCCESS', payload: body.data });
//         }
//       } catch (error) {
//         if (!didCancel) {
//           dispatch({ type: 'FETCH_FAILURE' });
//         }
//       }
//     };

//     fetchData();

//     return () => {
//       didCancel = true;
//     };
//   }, [url]);

//   return [state, setUrl];
// };

// export default useDataApi;
