import axios from "axios";

const apiUrl = import.meta.env.VITE_BACKEND_URL;


export const axiosFetch = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});


export const axiosFetchFiles = axios.create({
  baseURL: apiUrl,
  
})