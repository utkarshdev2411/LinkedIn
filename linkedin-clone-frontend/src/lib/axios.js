import axios from "axios"

export const axiosInstance  = axios.create({
    baseURL: "https://linkedin-backend-qrwu.onrender.com/",
    withCredentials: true
})
