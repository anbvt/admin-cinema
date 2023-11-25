import {useEffect, useState} from "react"
import { fetchAPI } from "../fetchAPI"

export function useFetch(url?: any, param?: any) {
    let [data, setData]  = useState<any>();
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [params, setParam] = useState(param);
    const [uri, setUri] = useState(url);

    useEffect(() => {
        const init = async () => {
            try {
                let response = null;
                if(params != null){
                    response = (await fetchAPI.get(uri, {params: params})).data;
                    setData(response)
                }else{
                    if(uri != ''){
                        response = (await fetchAPI.get(uri)).data;
                        setData(response)
                    }
                }
            } catch (err: any) {
                setError(err)
            } finally {
                // setLoading(false)
            }
        };
        init().then(r => "");

    }, [uri,params])

    return {data, error, loading, setParam, setUri}

}

