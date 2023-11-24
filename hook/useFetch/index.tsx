import {useEffect, useState} from "react"
import axios from "axios"

export const fetchAPI = axios.create({
    // baseURL:"https://test.zuhot-api.id.vn/api",
    baseURL: "http://localhost:8080/api",
    headers: {
        "zuhot-key": "abc123456",
    }
})

export function useFetch(url?: any) {
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true)
                const response = await fetchAPI.get(url)
                setData(response.data)
            } catch (err: any) {
                setError(err)
            } finally {
                setLoading(false)
            }
        };
        init().then(r => "");

    }, [url])

    return {data, error, loading}

}

