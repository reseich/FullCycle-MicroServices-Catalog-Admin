// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, FormControlLabel, MenuItem, Select, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {Controller, useForm} from "react-hook-form";
import genreHttp from "../../Utils/http/genreHttp";
import categoryHttp from "../../Utils/http/categoryHttp";
import {useEffect, useState} from "react";

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
    const [categories, setCategories] = useState([])
    const [selectedCategories, setSelectedCategories] = React.useState<any[]>([]);

    function onSubmit(formData: any, event: any) {
        console.log(formData)
        formData.is_active = formData.is_active === undefined ? true : formData.is_active;
        genreHttp.create(formData).then((response) => {
            console.log(response.data.data)
        })
    }

    const handleFieldChange = (event: any) => {
        event.persist();
        setSelectedCategories(event.target.value)
    };

    useEffect(() => {
        categoryHttp.list().then(({data}) => {
            setCategories(data.data)
        })
    }, [])

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
                select
                fullWidth
                {...register('categories_id')}
                name="categories_id"
                variant="outlined"
                SelectProps={{
                    multiple: true,
                    value: selectedCategories,
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