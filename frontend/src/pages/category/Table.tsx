import * as React from 'react';
import {useEffect, useState} from 'react';
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'
import categoryHttp from "../../Utils/http/categoryHttp";
import {BadgeNo, BadgeYes} from "../../Components/Badge";
import {Category, ListResponse} from "../../Utils/models";
import DefaultTable, {makeActionStyles, TableColumn} from '../../Components/Table'
import {useSnackbar} from "notistack";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {Link} from "react-router-dom";
import {MUISortOptions} from "mui-datatables";
import {FilterResetButton} from "../../Components/Table/FilterResetButton";

interface SearchState {
    search: string,
    pagination: Pagination,
    order: MUISortOptions
}

interface Pagination {
    page: number,
    total: number,
    per_page: number
}

const columnsDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'Id',
        width: '30%',
        options: {
            sort: false
        }
    },
    {
        name: 'name',
        label: 'Name',
        width: '43%'
    },
    {
        name: 'is_active',
        label: 'Active?',
        width: '4%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        }
    },
    {
        name: 'created_at',
        label: 'Created at',
        width: '10%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseIso(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: 'actions',
        label: 'Actions',
        width: '13%',
        options: {
            sort: false,
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={'/categories/' + tableMeta.rowData[0] + '/edit'}
                    >
                        <EditIcon fontSize={'inherit'}/>
                    </IconButton>
                )
            }
        }
    },
]

const Table = () => {
    const initialState: SearchState = {
        search: null,
        pagination: {page: 1, total: 0, per_page: 10},
        order: {direction: 'desc', name: ''}
    }

    const {enqueueSnackbar} = useSnackbar();
    const [data, setData] = useState<Category[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [searchState, setSearchState] = useState<SearchState>(initialState)

    useEffect(() => {
        setLoading(true)
        categoryHttp.list<ListResponse<Category>>(
            {
                queryParams: {
                    search: searchState.search,
                    page: searchState.pagination.page,
                    per_page: searchState.pagination.per_page,
                    sort: searchState.order.name,
                    dir: searchState.order.direction
                }
            }
        ).then(({data}) => {
            setSearchState(prevState => ({...prevState, pagination: {...prevState.pagination, total: data.meta.total}}))
            setLoading(false)
            setData(data.data)

        }).catch((error) => {
            if (categoryHttp.isCancelRequest(error)) {
                return
            }
            setLoading(false)
            enqueueSnackbar('Cannot retrieve information', {variant: 'error'})
        })

    }, [searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order,
        enqueueSnackbar])

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                loading={loading}
                columns={columnsDefinitions}
                data={data}
                title={''}
                options={{
                    sortOrder: searchState.order,
                    serverSide: true,
                    searchText: searchState.search,
                    page: searchState.pagination.page - 1,
                    rowsPerPage: searchState.pagination.per_page,
                    count: searchState.pagination.total,
                    customToolbar: () => (<FilterResetButton handleClick={() => (setSearchState(initialState))}/>),
                    onSearchChange: (value) => setSearchState((prevState => ({
                        ...prevState, search: value || '', pagination: {...prevState.pagination, page: 1}
                    }))),
                    onChangePage: (value) => setSearchState((prevState => ({
                        ...prevState, pagination: {...prevState.pagination, page: value + 1}
                    }))),
                    onChangeRowsPerPage: (value) => setSearchState((prevState => ({
                        ...prevState, pagination: {...prevState.pagination, per_page: value}
                    }))),
                    onColumnSortChange: (changedColumn, direction) => setSearchState((prevState => ({
                        ...prevState, order: {name: changedColumn, direction: direction}
                    }))),
                }}>
            </DefaultTable>
        </MuiThemeProvider>
    );
};

export default Table