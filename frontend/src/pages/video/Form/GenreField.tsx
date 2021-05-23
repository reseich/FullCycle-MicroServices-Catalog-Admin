// @flow
import * as React from 'react';
import AsyncAutocomplete from "../../../Components/AsyncAutoComplete";
import GridSelected from "../../../Components/GridSelected";
import GridSelectedItem from "../../../Components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, Typography} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import genreHttp from "../../../util/http/genreHttp";
import useCollectionManager from "../../../hooks/useCollectionManager";
import {getGenresFromCategory} from "../../../util/model-filters";

interface GenreFieldProps {
    genres: any[],
    setGenres: (genres: any) => void
    categories: any[],
    setCategories: (categories: any) => void
    error: any
    disabled?: boolean;
    FormControlProps?: FormControlProps
}

const GenreField: React.FC<GenreFieldProps> = (props) => {
    const {
        genres,
        setGenres,
        categories,
        setCategories,
        error,
        disabled
    } = props;
    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(genres, setGenres);
    const {removeItem: removeCategory} = useCollectionManager(categories, setCategories);

    function fetchOptions(searchText: string) {
        return autocompleteHttp(
            genreHttp
                .list({
                    queryParams: {
                        search: searchText, all: ""
                    }
                })
        ).then(data => data.data)
    }

    return (
        <>
            <AsyncAutocomplete
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    //autoSelect: true,
                    options: [],
                    clearOnEscape: true,
                    freeSolo: true,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                    disabled
                }}
                TextFieldProps={{
                    label: 'Genres',
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
                        genres.map((genre, key) => (
                            <GridSelectedItem
                                key={key}
                                onDelete={() => {
                                    const categoriesWithOneGenre = categories
                                        .filter(category => {
                                            const genresFromCategory = getGenresFromCategory(genres, category);
                                            return genresFromCategory.length === 1 && genres[0].id == genre.id
                                        });
                                    categoriesWithOneGenre.forEach(cat => removeCategory(cat));
                                    removeItem(genre)
                                }}
                                xs={12}>
                                <Typography noWrap={true}>
                                    {genre.name}
                                </Typography>
                            </GridSelectedItem>
                        ))
                    }
                </GridSelected>
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }
            </FormControl>
        </>
    );
};

export default GenreField;