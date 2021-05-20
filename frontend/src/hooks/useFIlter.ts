import {Dispatch, Reducer, useEffect, useReducer, useState} from "react";
import reducer, {Creators} from "../store/filter";
import {Actions as FilterActions, State as FilterState} from "../store/filter/types";
import {MUIDataTableColumn} from "mui-datatables";
import {useDebounce} from 'use-debounce'
import {useHistory} from "react-router";
import {History} from 'history'
import {isEqual} from 'lodash'
import * as yup from "yup";

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
    extraFilter?: ExtraFilter;
}

interface ExtraFilter {
    getStateFromURL: (queryParams: URLSearchParams) => any,
    formatSearchParams: (debouncedState: FilterState) => any,
    createValidationSchema: () => any,
}

interface UseFilterOptions extends Omit<FilterManagerOptions, 'history'> {

}

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory()
    const filterManager = new FilterManager({...options, history})
    const INITIAL_STATE = filterManager.getStateFromUrl()
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE)
    const [debouncedFilterState] = useDebounce(filterState, options.debounceTime)
    const [totalRecords, setTotalRecords] = useState<number>(0)
    filterManager.state = filterState;
    filterManager.dispatch = dispatch

    filterManager.debouncedState = debouncedFilterState;

    useEffect(() => {
        filterManager.replaceHistory()
    }, [])

    return {
        filterManager, filterState, dispatch, totalRecords, setTotalRecords, debouncedFilterState
    }
}

export class FilterManager {
    schema: any;
    debouncedState: FilterState = null as any;
    state: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
    extraFilter?: ExtraFilter;

    constructor(options: FilterManagerOptions) {
        const {columns, debounceTime, rowsPerPage, rowsPerPageOptions, history, extraFilter} = options
        this.columns = columns
        this.debounceTime = debounceTime
        this.rowsPerPage = rowsPerPage
        this.rowsPerPageOptions = rowsPerPageOptions
        this.history = history
        this.createValidationSchema()
    }


    getStateFromUrl() {
        const queryParams = new URLSearchParams(this.history.location.search.substring(1))
        return this.schema.cast({
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
                this.extraFilter && {
                    extraFilter: this.extraFilter.getStateFromURL(queryParams)
                }
            )

        })
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
            state: INITIAL_STATE
        }));
    }


    cleanSearchText(text: any) {
        let newText = text
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText
    }

    replaceHistory() {
        this.history.replace({
            pathname: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams()),
            state: this.debouncedState
        })
    }

    pushHistory() {
        const newLocation = {
            pathname: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams()),
            state: {
                ...this.debouncedState, search: this.cleanSearchText(this.debouncedState.search)
            }
        }
        const oldState = this.history.location.state
        const nextStage = this.debouncedState
        if (isEqual(oldState, nextStage)) {
            return
        }
        this.history.push(newLocation)
    }

    private formatSearchParams() {
        const search = this.cleanSearchText(this.debouncedState.search)
        return {
            ...(search && search !== '' && {search: search}),
            ...(this.debouncedState.pagination.page !== 1 && {page: this.debouncedState.pagination.page}),
            ...(this.debouncedState.pagination.per_page !== 15 && {per_page: this.debouncedState.pagination.per_page}),
            ...(this.debouncedState.order.name && {
                sort: this.state.order.name,
                dir: this.debouncedState.order.direction
            }),
            ...(this.extraFilter && this.extraFilter.formatSearchParams(this.debouncedState))
        }
    }

    private createValidationSchema() {
        this.schema = yup.object().shape({
            search: yup.string()
                .transform(value => !value ? undefined : value)
                .default(''),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .oneOf(this.rowsPerPageOptions)
                    .transform(value =>
                        isNaN(value) || !this.rowsPerPageOptions.includes(parseInt(value)) ? undefined : value
                    )
                    .default(this.rowsPerPage)
            }),
            order: yup.object().shape({
                name: yup.string()
                    .nullable()
                    .transform(value => {
                        const columnsName = this.columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name)
                        return columnsName.includes(value) ? value : undefined
                    })
                    .default(null),
                dir: yup.string()
                    .nullable()
                    .transform(value => !value || !['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default(null)
            }),
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.createValidationSchema()
                }
            )
        })

    }

}