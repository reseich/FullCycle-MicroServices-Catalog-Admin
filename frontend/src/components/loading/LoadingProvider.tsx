// @flow
import * as React from 'react';
import LoadingContext from "./LoadingContext";
import {useEffect, useMemo, useState} from "react";
import {
    addGlobalRequestInterceptor,
    addGlobalResponseInterceptor,
    removeGlobalRequestInterceptor, removeGlobalResponseInterceptor
} from "../../util/http";

export const LoadingProvider = (props:any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [countRequest, setCountRequest] = useState(0);

    //useMemo vs useCallback
    useMemo(() => {
        let isSubscribed = true;
        //axios.interceptors.request.use();
        const requestIds = addGlobalRequestInterceptor((config:any) => {
            if (isSubscribed && !config.headers.hasOwnProperty('x-ignore-loading')) {
                setLoading(true);
                setCountRequest((prevCountRequest) => prevCountRequest + 1);
            }
            return config;
        });
        //axios.interceptors.response.use();
        const responseIds = addGlobalResponseInterceptor(
            (response:any) => {
                if (isSubscribed && !response.headers.hasOwnProperty('x-ignore-loading')) {
                    decrementCountRequest();
                }
                return response;
            },
            (error:any) => {
                console.log(error)
                if (isSubscribed && !error?.headers?.hasOwnProperty('x-ignore-loading')) {
                    decrementCountRequest();
                }
                return Promise.reject(error);
            }
        );
        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptor(requestIds);
            removeGlobalResponseInterceptor(responseIds);
        }
    }, []);

    useEffect(() => {
        if (!countRequest) {
            setLoading(false);
        }
    }, [countRequest]);

    function decrementCountRequest() {
        setCountRequest((prevCountRequest) => prevCountRequest - 1);
    }

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};