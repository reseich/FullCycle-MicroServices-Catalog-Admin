// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, FormControlLabel, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Controller, useForm} from "react-hook-form";
import categoryHttp from "../../Utils/http/categoryHttp";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}))

export const Form = () => {
    const classes = useStyles()
    const buttonProps: ButtonProps = {
        variant: 'outlined',
        className: classes.submit
    }
    const {register, handleSubmit, getValues, control} = useForm()

    function onSubmit(formData: any, event: any) {
        formData.is_active = formData.is_active === undefined ? true : formData.is_active;
        categoryHttp.create(formData).then((response) => {
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
            <TextField
                {...register('description')}
                name={'description'}
                label={'Description'}
                variant={'outlined'}
                multiline
                fullWidth
                rows={4}
            />
            <Controller
                name="is_active"
                control={control}
                render={({field: props}) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...props}
                                defaultChecked={true}
                                onChange={(e) =>
                                    props.onChange(e.target.checked)}
                            />
                        }
                        label="Active?"
                    />
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