import {MUISortOptions} from "mui-datatables";
import {AnyAction} from "redux";

export interface State {
    search: string | { value: string | null, [key: string]: any } | null
    pagination: Pagination,
    order: MUISortOptions
}

export interface Pagination {
    page: number,
    per_page: number
}

export interface SetSearchAction extends AnyAction {
    payload: {
        search: string | { value: string | null, [key: string]: any } | null
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