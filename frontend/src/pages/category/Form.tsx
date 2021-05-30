// @flow
import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {Checkbox, FormControlLabel, TextField} from "@material-ui/core";
import {Controller, useForm} from "react-hook-form";
import categoryHttp from "../../util/http/categoryHttp";
import * as yup from 'yup';
import {yupResolver} from '@hookform/resolvers/yup'
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";
import {SubmitActions} from "../../Components/SubmitActions";
import {DefaultForm} from "../../Components/DefaultForm";
import LoadingContext from "../../Components/loading/LoadingContext";


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
    const {enqueueSnackbar} = useSnackbar();
    const loading = useContext(LoadingContext);
    const history = useHistory();

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
        trigger,
        formState: {errors}
    } = useForm<UseFormInputs>({
        defaultValues: {name: '', description: '', is_active: true},
        resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        if (!id) {
            return
        }
        categoryHttp.get(id).then(({data}) => {
            reset(data.data)
        }).catch(() => {
            history.push('/categories')
            enqueueSnackbar('Category not found', {variant: 'error'})
        })
    }, [id, reset, enqueueSnackbar, history])

    function onSubmit(formData: any, event: any) {
        const requestHttp = id ? categoryHttp.update(id, formData) : categoryHttp.create(formData)
        requestHttp.then(({data}) => {
            enqueueSnackbar('Category save successful', {variant: 'success'})
            event ? (
                    id ? history.replace(`/categories/${data.data.id}/edit`) : history.push(`/categories/${data.data.id}/edit`)
                ) :
                history.push('/categories')
        }).catch((error) => {
            enqueueSnackbar(error.message, {variant: 'success'})
        })
    }

    return (
        <DefaultForm GridItemProps={{xs: 12, md: 6}} onSubmit={handleSubmit(onSubmit)}>
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
                    value={props.value || ''}
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
            <SubmitActions disabledButtons={loading} handleSave={async () => {
                await trigger();
                if (!errors.name) {
                    onSubmit(getValues(), null)
                }
            }}/>
        </DefaultForm>
    );
};