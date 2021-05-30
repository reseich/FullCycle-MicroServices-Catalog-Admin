import {useSnackbar} from "notistack";
import {useEffect} from "react";

const useSnackbarFormError = (submitCount:any, errors:any) => {
    const snackbar = useSnackbar();
    useEffect(() => {
        const hasError = Object.keys(errors).length !== 0;
        if(submitCount > 0 && hasError){
            snackbar.enqueueSnackbar(
                'Invalid form. check the red fields.',
                {variant: 'error'}
            )
        }
    }, [submitCount])
};

export default useSnackbarFormError;