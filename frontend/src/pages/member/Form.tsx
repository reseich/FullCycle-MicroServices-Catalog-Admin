// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, FormControlLabel, Radio, RadioGroup, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Controller, useForm} from "react-hook-form";
import memberHttp from "../../Utils/http/memberHttp";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}))

export const Form = () => {
    const classes = useStyles()
    const buttonProps: ButtonProps = {
        variant: 'contained',
        color: 'secondary',
        className: classes.submit
    }
    const {register, handleSubmit, getValues, control} = useForm()

    function onSubmit(formData: any, event: any) {
        formData.type = formData.type === undefined ? 1 : formData.type;
        memberHttp.create(formData).then((response) => {
            console.log(response.data.data)
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register('name')}
                name={'name'}
                label={'Name'}
                fullWidth
                variant={'outlined'}
                margin={'normal'}
            />
            <Controller
                name="type"
                control={control}
                render={({field: props}) => (
                    <RadioGroup
                        {...props}
                        value={props.value ? props.value : "1"}
                        defaultValue={"1"}
                        row
                        aria-label="tupe"
                        onChange={(e) =>
                            props.onChange(e.target.value)}
                    >
                        <FormControlLabel
                            value="1"
                            control={<Radio/>}
                            label="Director"
                        />
                        <FormControlLabel
                            value="2"
                            control={<Radio/>}
                            label="Actor"
                        />
                    </RadioGroup>
                )}
            />

            <Box dir={'rtl'}>
                <Button
                    {...buttonProps}
                    onClick={() => {
                        onSubmit(getValues(), null)
                    }}
                >Save</Button>
                <Button
                    type={"submit"}
                    {...buttonProps}
                >Save and continue editing</Button>
            </Box>
        </form>
    );
};