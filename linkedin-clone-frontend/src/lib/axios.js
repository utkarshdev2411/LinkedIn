import axios from "axios"

export const axiosInstance  = axios.create({
    baseURL: "https://linkedin-1-5nsp.onrender.com/",
    withCredentials: true
})
