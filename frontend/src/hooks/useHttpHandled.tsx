import {useSnackbar} from "notistack";
import axios from 'axios';
import {useCallback} from "react";

const useHttpHandled = () => {
    const {enqueueSnackbar} = useSnackbar();
    return useCallback(async (request: Promise<any>) => {
        try {
            const {data} = await request;
            return data;
        } catch (e) {
            console.error(e);
            if (!axios.isCancel(e)) {
                enqueueSnackbar(
                    'Cannot load information',
                    {variant: 'error',}
                );
            }
            throw e;
        }
    }, [enqueueSnackbar])
};

export default useHttpHandled;