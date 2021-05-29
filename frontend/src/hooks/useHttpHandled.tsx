import {useSnackbar} from "notistack";
import axios from 'axios';

const useHttpHandled = () => {
    const snackbar = useSnackbar();
    return async (request: Promise<any>) => {
        try {
            const {data} = await request;
            return data;
        } catch (e) {
            console.error(e);
            if (!axios.isCancel(e)) {
                snackbar.enqueueSnackbar(
                    'Cannot load information',
                    {variant: 'error',}
                );
            }
            throw e;
        }
    }
};

export default useHttpHandled;