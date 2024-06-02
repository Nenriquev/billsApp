import axios from "axios";

export const axiosFetch = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});


export const axiosFetchFiles = axios.create({
  baseURL: "http://localhost:3000",
  
})