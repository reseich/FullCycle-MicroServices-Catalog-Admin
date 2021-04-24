// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
import {Box, Button, ButtonProps, Checkbox, FormControlLabel, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Controller, useForm} from "react-hook-form";
import categoryHttp from "../../Utils/http/categoryHttp";
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}))

const validationSchema = yup.object().shape({
    name: yup
        .string()
        .label('Name')
        .required()
        .max(25)
        .label('Name')
})

export const Form = () => {
    const {id} = useParams() as any
    const classes = useStyles()
    const {enqueueSnackbar} = useSnackbar();
    const [loading, setLoading] = useState(false)
    const history = useHistory();
    const buttonProps: ButtonProps = {
        variant: 'contained',
        color: 'secondary',
        disabled: loading,
        className: classes.submit
    }

    interface UseFormInputs {
        name: string,
        description: string,
        is_active: boolean
    }

    const {
        handleSubmit,
        getValues,
        control,
        reset,
        watch,
        setValue,
        formState: {errors}
    } = useForm<UseFormInputs>({defaultValues: {name: '', is_active: true}, resolver: yupResolver(validationSchema)})

    useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true)
        categoryHttp.get('asdasd').then(({data}) => {
            setLoading(false)
            reset(data.data)
        }).catch((error) => {
            setLoading(false)
            history.push('/categories')
            enqueueSnackbar('Category not found', {variant: 'error'})
        })
    }, [id, reset, enqueueSnackbar, history])

    function onSubmit(formData: any, event: any) {
        setLoading(true)
        const requestHttp = id ? categoryHttp.update(id, formData) : categoryHttp.create(formData)
        requestHttp.then(({data}) => {
            setLoading(false)
            enqueueSnackbar('Category save successful', {variant: 'success'})
            event ? (
                    id ? history.replace(`/categories/${data.data.id}/edit`) : history.push(`/categories/${data.data.id}/edit`)
                ) :
                history.push('/categories')
        }).catch((error) => {
            setLoading(false)
            enqueueSnackbar(error.message, {variant:'success'})
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller control={control} render={({field: props}) => (
                <TextField
                    {...props}
                    type={'text'}
                    label={'Name'}
                    fullWidth
                    variant={'outlined'}
                    margin={'normal'}
                    disabled={loading}
                    error={!!errors.name}
                    helperText={errors.name && errors.name.message}
                    InputLabelProps={{shrink: true}}
                />
            )} name={'name'}/>

            <Controller control={control} render={({field: props}) => (
                <TextField
                    {...props}
                    name={'description'}
                    label={'Description'}
                    variant={'outlined'}
                    disabled={loading}
                    multiline
                    fullWidth
                    rows={4}
                    InputLabelProps={{shrink: true}}
                />
            )} name={'description'}/>

            <Controller
                name="is_active"
                control={control}
                render={({field: props}) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...props}
                                checked={watch('is_active')}
                                disabled={loading}
                                onChange={(e) => {
                                    setValue('is_active', !getValues()['is_active'])
                                }
                                }
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