import {useSnackbar} from "notistack";
import {useEffect} from "react";

const useSnackbarFormError = (submitCount: any, errors: any) => {
    const {enqueueSnackbar} = useSnackbar();
    useEffect(() => {
        const hasError = Object.keys(errors).length !== 0;
        if (submitCount > 0 && hasError) {
            enqueueSnackbar(
                'Invalid form. check the red fields.',
                {variant: 'error'}
            )
        }
    }, [submitCount, errors, enqueueSnackbar])
};

export default useSnackbarFormError;