import * as React from 'react';
import {Autocomplete, AutocompleteProps, UseAutocompleteProps} from "@material-ui/lab";
import {TextFieldProps} from "@material-ui/core/TextField";
import {CircularProgress, TextField} from "@material-ui/core";
import {useState, useEffect, useImperativeHandle} from "react";
import {useDebounce} from "use-debounce";
import {RefAttributes} from 'react';

interface AsyncAutocompleteProps extends RefAttributes<AsyncAutocompleteComponent> {
    fetchOptions: (searchText: string) => Promise<any>;
    debounceTime?: number;
    TextFieldProps?: TextFieldProps;
    AutocompleteProps?: Omit<AutocompleteProps<any, any, any, any>, 'renderInput'> & UseAutocompleteProps<any, any, any, any>;
}

export interface AsyncAutocompleteComponent {
    clear: () => void;
}

const AsyncAutocomplete = React.forwardRef<AsyncAutocompleteComponent, AsyncAutocompleteProps>((props, ref) => {

    const {AutocompleteProps, debounceTime = 300, fetchOptions} = props;
    const {freeSolo = false, onOpen, onClose, onInputChange} = AutocompleteProps as any;
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText] = useDebounce(searchText, debounceTime);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {shrink: true},
        ...(props.TextFieldProps && {...props.TextFieldProps})
    };

    const autocompleteProps: AutocompleteProps<any, any, any, any> = {
        loadingText: 'Loading...',
        noOptionsText: 'No items found',
        ...(AutocompleteProps && {...AutocompleteProps}),
        open,
        options,
        loading: loading,
        inputValue: searchText,
        onOpen() {
            setOpen(true);
            onOpen && onOpen();
        },
        onClose() {
            setOpen(false);
            onClose && onClose();
        },
        onInputChange(event: any, value: any) {
            setSearchText(value);
            onInputChange && onInputChange();
        },
        renderInput: (params: any) => {
            return <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading && <CircularProgress color={"inherit"} size={20}/>}
                            {params.InputProps.endAdornment}
                        </>
                    )
                }}
            />
        }
    };

    useImperativeHandle(ref, () => ({
        clear: () => {
            setSearchText("");
            setOptions([]);
        }
    }));

    useEffect(() => {
        if (!open && !freeSolo) {
            setOptions([]);
        }
    }, [open, freeSolo]);

    useEffect(() => {
        if ((!open || debouncedSearchText === "") && freeSolo) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchOptions(debouncedSearchText);
                if (isSubscribed) {
                    setOptions(data);
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            isSubscribed = false;
        }
    }, [freeSolo, debouncedSearchText, open, fetchOptions]);

    return (
        <Autocomplete {...autocompleteProps}/>
    );
});

export default AsyncAutocomplete;

