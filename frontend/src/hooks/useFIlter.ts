import {Dispatch, Reducer, useReducer, useState} from "react";
import reducer, {Creators, INITIAL_STATE} from "../store/filter";
import {Actions as FilterActions, State as FilterState} from "../store/filter/types";
import {MUIDataTableColumn} from "mui-datatables";
import {useDebounce} from 'use-debounce'
import {useHistory} from "react-router";
import {History} from 'history'
import {isEqual} from 'lodash'

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
}

interface UseFilterOptions extends Omit<FilterManagerOptions, 'history'> {

}

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory()
    const filterManager = new FilterManager({...options, history})
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE)
    const [debouncedFilterState] = useDebounce(filterState, options.debounceTime)
    const [totalRecords, setTotalRecords] = useState<number>(0)
    filterManager.state = filterState;
    filterManager.dispatch = dispatch

    return {
        filterManager, filterState, dispatch, totalRecords, setTotalRecords, debouncedFilterState
    }
}

export class FilterManager {
    state: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;

    constructor(options: FilterManagerOptions) {
        const {columns, debounceTime, rowsPerPage, rowsPerPageOptions, history} = options
        this.columns = columns
        this.debounceTime = debounceTime
        this.rowsPerPage = rowsPerPage
        this.rowsPerPageOptions = rowsPerPageOptions
        this.history = history
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

    cleanSearchText(text: any) {
        let newText = text
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText
    }

    pushHistory() {
        const newLocation = {
            pathname: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams()),
            state: {
                ...this.state, search: this.cleanSearchText(this.state.search)
            }
        }
        const oldState = this.history.location.state
        const nextStage = this.state
        if (isEqual(oldState, nextStage)) {
            return
        }
        this.history.push(newLocation)
    }

    private formatSearchParams() {
        const search = this.cleanSearchText(this.state.search)
        return {
            ...(search && search !== '' && {search: search}),
            ...(this.state.pagination.page !== 1 && {page: this.state.pagination.page}),
            ...(this.state.order.name && {sort: this.state.order.name, dir: this.state.order.direction})
        }
    }

}