import {Dispatch, Reducer, useCallback, useEffect, useMemo, useReducer, useState,} from "react";
import reducer, {Creators} from "../store/filter";
import {Actions as FilterActions, State as FilterState,} from "../store/filter/types";
import {MUIDataTableColumn} from "mui-datatables";
import {useDebounce} from "use-debounce";
import {useHistory, useLocation} from "react-router";
import {isEqual} from "lodash";
import * as yup from "yup";
import {ObjectSchema} from "yup";

interface FilterManagerOptions {
    schema: ObjectSchema<any>;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    dispatch: Dispatch<FilterActions>;
    state: FilterState;
}

interface ExtraFilter {
    getStateFromURL: (queryParams: URLSearchParams) => any;
    formatSearchParams: (debouncedState: FilterState) => any;
    createValidationSchema: () => any;
}

interface UseFilterOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    extraFilter?: ExtraFilter;
}

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory();
    const location = useLocation();
    const {
        search: locationSearch,
        pathname: locationPathname,
        state: locationState,
    } = location;
    const {rowsPerPage, rowsPerPageOptions, extraFilter, columns} = options;

    const schema = useMemo(() => {
        return yup.object().shape({
            search: yup
                .string()
                .transform((value) => (!value ? undefined : value))
                .default(""),
            pagination: yup.object().shape({
                page: yup
                    .number()
                    .transform((value) =>
                        isNaN(value) || parseInt(value) < 1 ? undefined : value
                    )
                    .default(1),
                per_page: yup
                    .number()
                    .transform((value) =>
                        isNaN(value) || !rowsPerPageOptions.includes(parseInt(value))
                            ? undefined
                            : value
                    )
                    .default(rowsPerPage),
            }),
            order: yup.object().shape({
                sort: yup
                    .string()
                    .nullable()
                    .transform((value) => {
                        const columnsName = columns
                            .filter(
                                (column) => !column.options || column.options.sort !== false
                            )
                            .map((column) => column.name);
                        return columnsName.includes(value) ? value : undefined;
                    })
                    .default(null),
                dir: yup
                    .string()
                    .nullable()
                    .transform((value) =>
                        !value || !["asc", "desc"].includes(value.toLowerCase())
                            ? undefined
                            : value
                    )
                    .default(null),
            }),
            ...(extraFilter && {
                extraFilter: extraFilter.createValidationSchema(),
            }),
        });
    }, [rowsPerPageOptions, rowsPerPage, columns, extraFilter]);

    const stateFromUrl = useMemo(() => {
        const queryParams = new URLSearchParams(location.search.substring(1))
        return schema.cast({
            search: queryParams.get('search'),
            pagination: {
                page: queryParams.get('page'),
                per_page: queryParams.get('per_page')
            },
            order: {
                name: queryParams.get('sort'),
                direction: queryParams.get('dir')
            },
            ...(
                extraFilter && {
                    extraFilter: extraFilter.getStateFromURL(queryParams)
                }
            )
        })
    }, [location.search, extraFilter, schema])

    const cleanSearchText = useCallback((text) => {
        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value;
        }
        return newText;
    }, []);

    const formatSearchParams = useCallback(
        (state, extraFilter) => {
            const search = cleanSearchText(state.search);
            return {
                ...(search && search !== "" && {search: search}),
                ...(state.pagination.page !== 1 && {page: state.pagination.page}),
                ...(state.pagination.per_page !== 15 && {
                    per_page: state.pagination.per_page,
                }),
                ...(state.order.name && {
                    sort: state.order.name,
                    dir: state.order.direction,
                }),
                ...(extraFilter && extraFilter.formatSearchParams(state)),
            };
        },
        [cleanSearchText]
    );

    const INITIAL_STATE = stateFromUrl;
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE as any);
    const filterManager = new FilterManager({...options, state: filterState, dispatch, schema});
    const [debouncedFilterState] = useDebounce(filterState, options.debounceTime);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    useEffect(() => {
        history.replace({
            pathname: locationPathname,
            search:
                "?" +
                new URLSearchParams(formatSearchParams(stateFromUrl, extraFilter)),
            state: stateFromUrl,
        });
    }, [
        history,
        locationPathname,
        formatSearchParams,
        stateFromUrl,
        extraFilter,
    ]);

    useEffect(() => {
        const newLocation = {
            pathname: locationPathname,
            search:
                "?" +
                new URLSearchParams(
                    formatSearchParams(debouncedFilterState, extraFilter)
                ),
            state: {
                ...debouncedFilterState,
                search: cleanSearchText(debouncedFilterState.search),
            },
        };

        const oldState = locationState;
        const nextState = debouncedFilterState;

        if (isEqual(oldState, nextState)) {
            return;
        }
        history.push(newLocation);
    }, [
        history,
        locationPathname,
        locationSearch,
        formatSearchParams,
        locationState,
        cleanSearchText,
        debouncedFilterState,
        extraFilter,
    ]);

    filterManager.state = filterState;

    filterManager.applyOrderInColumns();

    return {
        columns: filterManager.columns,
        cleanSearchText,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords,
    };
}

export class FilterManager {
    schema;
    state: FilterState;
    dispatch: Dispatch<FilterActions>;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;

    constructor(options: FilterManagerOptions) {
        const {
            schema,
            columns,
            rowsPerPage,
            dispatch,
            state
        } = options;
        this.schema = schema;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.dispatch = dispatch;
        this.state = state;
    }


    changeSearch(value: string | null) {
        this.dispatch(Creators.setSearch({search: value || ''}))
    }

    changePage(page: number) {
        this.dispatch(Creators.setPage({page: page + 1}))
    }

    changeRowsPerPage(per_page: number) {
        this.dispatch(Creators.setPerPage({per_page: per_page}))
    }

    changeColumnSort(changedColumn: string, direction: 'asc' | 'desc') {
        this.dispatch(Creators.setOrder({
            order: {
                name: changedColumn,
                direction: direction
            }
        }))
    }

    changeExtraFilter(data: any) { //{type: 'Diretor'}
        this.dispatch(Creators.updateExtraFilter(data));
    }

    resetFilter() {
        const INITIAL_STATE = {
            ...this.schema.cast({}),
            search: ''
        };
        this.dispatch(Creators.setReset({
            state: INITIAL_STATE as any
        }));
    }

    applyOrderInColumns() {
        this.columns = this.columns.map((column) => {
            return column.name === this.state.order.name
                ? {
                    ...column,
                    options: {
                        ...column.options,
                        sortDirection: this.state.order.direction as any,
                    },
                }
                : column;
        });
    }
}