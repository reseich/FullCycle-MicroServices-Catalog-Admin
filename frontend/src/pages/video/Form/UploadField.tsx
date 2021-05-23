import * as React from 'react';
import {Button, FormControl, FormControlLabel, FormHelperText, FormLabel, RadioGroup} from "@material-ui/core";
import {FormControlProps} from "@material-ui/core/FormControl";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import InputFile, {InputFileComponent} from "../../../Components/InputFile";
import {MutableRefObject, useRef} from "react";

interface UploadFieldProps {
    accept: string,
    label: string;
    setValue: (value: any) => void
    error?: any;
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

const UploadField: React.FC<UploadFieldProps> = (props) => {
    const fileRef = useRef() as MutableRefObject<InputFileComponent>;
    const {
        accept,
        label,
        setValue,
        error,
        disabled
    } = props;
    return (
        <FormControl
            error={error !== undefined}
            disabled={disabled === true}
            fullWidth
            margin={"normal"}
            {...props.FormControlProps}
        >
            <InputFile
                ref={fileRef}
                TextFieldProps={{
                    label: label,
                    InputLabelProps: {shrink: true},
                    style: {backgroundColor: '#ffffff'}
                }}
                InputFileProps={{
                    accept,
                    onChange(event) {
                        const files = event.target.files as any;
                        files.length && setValue(files[0])
                    }
                }}
                ButtonFile={
                    <Button
                        endIcon={<CloudUploadIcon/>}
                        variant={"contained"}
                        color={"primary"}
                        onClick={() => fileRef.current.openWindow()}
                    >
                        Add
                    </Button>
                }
            />
        </FormControl>
    );
};

export default UploadField;