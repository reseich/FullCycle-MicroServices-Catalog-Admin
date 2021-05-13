import {createActions, createReducer} from 'reduxsauce'
import * as  Typings from "./types";

export const {Types, Creators} = createActions<{
    SET_SEARCH: string
    SET_PAGE: string
    SET_PER_PAGE: string
    SET_ORDER: string
    SET_RESET: string
}, {
    setSearch(payload: Typings.SetSearchAction['payload']): Typings.SetSearchAction
    setPage(payload: Typings.SetPageAction['payload']): Typings.SetPageAction
    setPerPage(payload: Typings.SetPerPageAction['payload']): Typings.SetPerPageAction
    setOrder(payload: Typings.SetOrderAction['payload']): Typings.SetOrderAction
    setReset(): any
}>({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
    setReset: []
})

export const INITIAL_STATE: Typings.State = {
    search: '',
    reset: false,
    pagination: {page: 1, per_page: 10},
    order: {direction: 'desc', name: ''}
}

const reducer = createReducer(INITIAL_STATE, {
    [Types.SET_SEARCH]: setSearch,
    [Types.SET_PAGE]: setPage,
    [Types.SET_PER_PAGE]: setPerPage,
    [Types.SET_ORDER]: setOrder,
    [Types.SET_RESET]: setReset
})

function setSearch(state = INITIAL_STATE, action: Typings.SetSearchAction): Typings.State {
    return {
        ...state, search: action.payload.search, pagination: {...state.pagination, page: 1}, reset: false
    }
}

function setPage(state = INITIAL_STATE, action: Typings.SetPageAction): Typings.State {
    return {
        ...state, pagination: {...state.pagination, page: action.payload.page}, reset: false
    }
}

function setPerPage(state = INITIAL_STATE, action: Typings.SetPerPageAction): Typings.State {
    return {
        ...state, pagination: {...state.pagination, per_page: action.payload.per_page}, reset: false
    }
}

function setOrder(state = INITIAL_STATE, action: Typings.SetOrderAction): Typings.State {
    return {
        ...state, order: {name: action.payload.order.name, direction: action.payload.order.direction}, reset: false
    }
}

function setReset(): Typings.State {
    return {
        ...INITIAL_STATE, search: '', reset: true
    }
}

export default reducer