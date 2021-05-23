// @flow
import * as React from 'react';
import AsyncAutocomplete from "../../../Components/AsyncAutoComplete";
import GridSelected from "../../../Components/GridSelected";
import GridSelectedItem from "../../../Components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, makeStyles, Theme, Typography} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import useCollectionManager from "../../../hooks/useCollectionManager";
import categoryHttp from "../../../util/http/categoryHttp";
import {getGenresFromCategory} from "../../../util/model-filters";
import {grey} from "@material-ui/core/colors";

const useStyles = makeStyles((theme: Theme) => ({
    genresSubtitle: {
        color: grey["800"],
        fontSize: '0.8rem'
    }
}));

interface CategoryFieldProps {
    categories: any[],
    setCategories: (categories: any) => void
    genres: any
    error: any
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

const CategoryField: React.FC<CategoryFieldProps> = (props) => {
    const {categories, setCategories, genres, error, disabled} = props;
    const classes = useStyles();
    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(categories, setCategories);

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

    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
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
};

export default CategoryField;