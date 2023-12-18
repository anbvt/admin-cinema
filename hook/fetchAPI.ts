import axios from "axios"

export const fetchAPI = axios.create({
    // baseURL:"https://test.zuhot-api.id.vn/api",
    baseURL: "http://localhost:8080/api",
    headers: {
        "zuhot-key": "abc123456",
    }
})
