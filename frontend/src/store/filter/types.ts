import {MUISortOptions} from "mui-datatables";
import {AnyAction} from "redux";

export interface State {
    search: string
    reset: boolean
    pagination: Pagination,
    order: MUISortOptions
}

export interface Pagination {
    page: number,
    per_page: number
}

export interface SetSearchAction extends AnyAction {
    payload: {
        search: string
    }
}

export interface SetPageAction extends AnyAction {
    payload: {
        page: number
    }
}

export interface SetPerPageAction extends AnyAction {
    payload: {
        per_page: number
    }
}

export interface SetOrderAction extends AnyAction {
    payload: {
        order: MUISortOptions
    }
}

export type Actions = SetSearchAction | SetPageAction | SetPerPageAction | SetOrderAction