import axios from "axios"

export const axiosInstance  = axios.create({
    baseURL: "https://linkedin-ztac.onrender.com",
    withCredentials: true
})