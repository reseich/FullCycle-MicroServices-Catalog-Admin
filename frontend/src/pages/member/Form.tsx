// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
import {FormControlLabel, Radio, RadioGroup, TextField} from "@material-ui/core";
import {Controller, useForm} from "react-hook-form";
import memberHttp from "../../Utils/http/memberHttp";
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {SubmitActions} from "../../Components/SubmitActions";

export const Form = () => {
    const {id} = useParams() as any
    const {enqueueSnackbar} = useSnackbar();
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState("1")
    const history = useHistory();

    interface UseFormInputs {
        name: string,
        type: number
    }

    const validationSchema = yup.object().shape({
        name: yup
            .string()
            .label('Name')
            .required()
            .max(25)
            .label('Name'),
    })


    const {
        handleSubmit,
        getValues,
        control,
        trigger,
        reset,
        setValue,
        formState: {errors}

    } = useForm<UseFormInputs>({
        defaultValues: {name: '', type: 1},
        resolver: yupResolver(validationSchema)
    })

    useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true)
        memberHttp.get(id).then(({data}) => {
            setLoading(false)
            let filterData = {name: data.data.name, type: data.data.type}
            setType(filterData.type.toString())
            reset(filterData)
        }).catch((err) => {
            setLoading(false)
            history.push('/genres')
            enqueueSnackbar('Genre not found', {variant: 'error'})
        })
    }, [enqueueSnackbar, history, id, reset, setValue])

    function onSubmit(formData: any, event: any) {
        setLoading(true)
        const requestHttp = id ? memberHttp.update(id, formData) : memberHttp.create(formData)
        requestHttp.then(({data}) => {
            setLoading(false)
            enqueueSnackbar('Member save successful', {variant: 'success'})
            event ? (
                    id ? history.replace(`/members/${data.data.id}/edit`) : history.push(`/members/${data.data.id}/edit`)
                ) :
                history.push('/members')
        }).catch((error) => {
            setLoading(false)
            enqueueSnackbar(error.message, {variant: 'error'})
        })
    }

    const handleFieldChange = (event: any) => {
        event.persist();
        setValue('type', event.target.value)
        setType(event.target.value as any)
    };

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
            <Controller
                name="type"
                control={control}
                render={({field: props}) => (
                    <RadioGroup
                        {...props}
                        value={type.toString()}
                        defaultValue={type.toString()}
                        row
                        aria-label="type"
                        onChange={handleFieldChange}
                    >
                        <FormControlLabel
                            value={"1"}
                            disabled={loading}
                            control={<Radio/>}
                            label="Director"
                        />
                        <FormControlLabel
                            value={"2"}
                            disabled={loading}
                            control={<Radio/>}
                            label="Actor"
                        />
                    </RadioGroup>
                )}
            />

            <SubmitActions disabledButtons={loading} handleSave={async () => {
                await trigger();
                if (!errors.name) {
                    onSubmit(getValues(), null)
                }
            }}/>
        </form>
    );
};