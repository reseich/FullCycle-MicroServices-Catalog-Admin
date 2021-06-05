// @flow
import * as React from 'react';
import AsyncAutocomplete, {AsyncAutocompleteComponent} from "../../../components/AsyncAutoComplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, makeStyles, Theme, Typography, useTheme} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import useCollectionManager from "../../../hooks/useCollectionManager";
import categoryHttp from "../../../util/http/categoryHttp";
import {getGenresFromCategory} from "../../../util/model-filters";
import {grey} from "@material-ui/core/colors";
import {RefAttributes} from "react";
import {useImperativeHandle} from "react";
import {useRef} from "react";
import {MutableRefObject} from "react";

const useStyles = makeStyles((theme: Theme) => ({
    genresSubtitle: {
        color: grey["800"],
        fontSize: '0.8rem'
    }
}));

interface CategoryFieldProps extends RefAttributes<CategoryFieldComponent> {
    categories: any[],
    setCategories: (categories: any) => void
    genres: any
    error: any
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

export interface CategoryFieldComponent {
    clear: () => void
}

const CategoryField = React.forwardRef<CategoryFieldComponent, CategoryFieldProps>((props, ref) => {
    const {categories, setCategories, genres, error, disabled} = props;
    const classes = useStyles();
    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(categories, setCategories);
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;
    const theme = useTheme();

    function fetchOptions(searchText: string) {
        // @ts-ignore
        return autocompleteHttp(
            categoryHttp
                .list({
                    queryParams: {
                        // @ts-ignore
                        genres: genres.map(genre => genre.id).join(','),
                        all: ""
                    }
                })
        ).then(data => data.data)
    }

    useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }));


    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                ref={autocompleteRef}
                AutocompleteProps={{
                    // @ts-ignore
                    autoSelect: true,
                    options: [],
                    clearOnEscape: true,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled: disabled === true || !genres.length
                }}
                TextFieldProps={{
                    label: 'Categories',
                    error: error !== undefined
                }}
            />
            <FormHelperText style={{height: theme.spacing(3)}}>
                Choose at lease one category of each genre
            </FormHelperText>
            <FormControl
                margin={"normal"}
                fullWidth
                error={error !== undefined}
                disabled={disabled === true}
                {...props.FormControlProps}
            >
                <GridSelected>
                    {
                        categories.map((category, key) => {
                            const genresFromCategory = getGenresFromCategory(genres, category)
                                .map(genre => genre.name)
                                .join(',');
                            return (
                                <GridSelectedItem
                                    key={key}
                                    onDelete={() => removeItem(category)} xs={12}
                                >
                                    <Typography noWrap={true}>
                                        {category.name}
                                    </Typography>
                                    <Typography noWrap={true} className={classes.genresSubtitle}>
                                        Genres: {genresFromCategory}
                                    </Typography>
                                </GridSelectedItem>
                            )
                        })
                    }
                </GridSelected>
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }
            </FormControl>
        </>
    );
});

export default CategoryField;