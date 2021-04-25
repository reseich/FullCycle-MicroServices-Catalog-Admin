// @flow
import * as React from 'react';
import {useEffect, useState} from 'react';
import {Checkbox, FormControlLabel, MenuItem, TextField} from "@material-ui/core";
import {Controller, useForm} from "react-hook-form";
import genreHttp from "../../Utils/http/genreHttp";
import categoryHttp from "../../Utils/http/categoryHttp";
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {Category, ListResponse} from "../../Utils/models";
import {SubmitActions} from "../../Components/SubmitActions";

export const Form = () => {
    const {id} = useParams() as any
    const {enqueueSnackbar} = useSnackbar();
    const [loading, setLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState([])
    const [categories, setCategories] = useState<Category[]>([])
    const history = useHistory();

    interface UseFormInputs {
        name: string,
        categories_id: string[],
        is_active: boolean
    }

    const validationSchema = yup.object().shape({
        name: yup
            .string()
            .label('Name')
            .required()
            .max(25)
            .label('Name'),
        categories_id: yup.array().required()
    })

    const {
        handleSubmit,
        getValues,
        control,
        reset,
        trigger,
        watch,
        setValue,
        formState: {errors}
    } = useForm<UseFormInputs>({
        defaultValues: {name: '', is_active: true, categories_id: []},
        resolver: yupResolver(validationSchema)
    })


    useEffect(() => {
        categoryHttp.list<ListResponse<Category>>().then(({data}) => {
            setCategories(data.data)
        }).catch(() => {
            history.push('/genres')
            enqueueSnackbar('Fail to retrieve list of categories', {variant: 'error'})
        })
    }, [enqueueSnackbar, history])

    useEffect(() => {
        if (!id) {
            return
        }
        setLoading(true)
        genreHttp.get(id).then(({data}) => {
            setLoading(false)
            let selCat = data.data.categories.map((element: any) => element.id)
            let filterData = {name: data.data.name, is_active: data.data.is_active, categories_id: selCat}
            setSelectedCategory(selCat)
            reset(filterData)

        }).catch((err) => {
            setLoading(false)
            history.push('/genres')
            enqueueSnackbar('Genre not found', {variant: 'error'})
        })
    }, [enqueueSnackbar, history, id, reset, setValue])

    function onSubmit(formData: any, event: any) {
        setLoading(true)
        const requestHttp = id ? genreHttp.update(id, formData) : genreHttp.create(formData)
        requestHttp.then(({data}) => {
            setLoading(false)
            enqueueSnackbar('Genre save successful', {variant: 'success'})
            event ? (
                    id ? history.replace(`/genres/${data.data.id}/edit`) : history.push(`/genres/${data.data.id}/edit`)
                ) :
                history.push('/genres')
        }).catch((error) => {
            setLoading(false)
            enqueueSnackbar(error.message, {variant: 'error'})
        })
    }

    const handleFieldChange = (event: any) => {
        event.persist();
        setSelectedCategory(event.target.value)
        setValue('categories_id', event.target.value)
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

            <Controller control={control} render={({field: props}) => (
                <TextField
                    {...props}
                    select
                    fullWidth
                    label={'Categories'}
                    variant="outlined"
                    SelectProps={{
                        defaultValue: [],
                        multiple: true,
                        value: selectedCategory,
                        onChange: handleFieldChange
                    }}
                >
                    <MenuItem value='first' disabled>
                        <em>Select Category</em>
                    </MenuItem>
                    {
                        categories.map((category: any, key) => {
                            return <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        })
                    }
                </TextField>
            )} name={'categories_id'}/>


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
                if (!errors.name && !errors.categories_id) {
                    onSubmit(getValues(), null)
                }
            }}/>
        </form>
    );
};