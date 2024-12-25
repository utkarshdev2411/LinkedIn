import axios from "axios"

export const axiosInstance  = axios.create({
    baseURL: "https://linkedin-backend-ivjp.onrender.com",
    withCredentials: true
})
