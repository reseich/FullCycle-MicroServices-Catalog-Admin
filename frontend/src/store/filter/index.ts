import {createActions, createReducer} from 'reduxsauce'
import * as  Typings from "./types";
import {SetResetAction, UpdateExtraFilterAction} from "./types";

export const {Types, Creators} = createActions<{
    SET_SEARCH: string
    SET_PAGE: string
    SET_PER_PAGE: string
    SET_ORDER: string
    SET_RESET: string
    UPDATE_EXTRA_FILTER: string
}, {
    setSearch(payload: Typings.SetSearchAction['payload']): Typings.SetSearchAction
    setPage(payload: Typings.SetPageAction['payload']): Typings.SetPageAction
    setPerPage(payload: Typings.SetPerPageAction['payload']): Typings.SetPerPageAction
    setOrder(payload: Typings.SetOrderAction['payload']): Typings.SetOrderAction
    setReset(payload: Typings.SetResetAction['payload']): Typings.SetResetAction,
    updateExtraFilter(payload: Typings.UpdateExtraFilterAction['payload']): Typings.UpdateExtraFilterAction
}>({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
    setReset: ['payload'],
    updateExtraFilter: ['payload'],
})

export const INITIAL_STATE: Typings.State = {
    search: '',
    reset: false,
    pagination: {page: 1, per_page: 15},
    order: {direction: 'desc', name: ''}
}

const reducer = createReducer(INITIAL_STATE, {
    [Types.SET_SEARCH]: setSearch,
    [Types.SET_PAGE]: setPage,
    [Types.SET_PER_PAGE]: setPerPage,
    [Types.SET_ORDER]: setOrder,
    [Types.SET_RESET]: setReset,
    [Types.UPDATE_EXTRA_FILTER]: updateExtraFilter
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
        ...state,
        pagination: {...state.pagination, page: 1},
        order: {name: action.payload.order.name, direction: action.payload.order.direction},
        reset: false
    }
}

function updateExtraFilter(state = INITIAL_STATE, action: UpdateExtraFilterAction) {
    return {
        ...state,
        extraFilter: {
            ...state.extraFilter,
            ...action.payload // {type: 'Diretor'}
        }
    }
}

function setReset(state = INITIAL_STATE, action: SetResetAction) {
    return {...action.payload.state, reset: true};
}


export default reducer