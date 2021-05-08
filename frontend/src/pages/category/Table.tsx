import * as React from 'react';
import {useEffect, useReducer, useState} from 'react';
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
import {FilterResetButton} from "../../Components/Table/FilterResetButton";
import reducer, {INITIAL_STATE, Creators} from "../../store/search";

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
    const {enqueueSnackbar} = useSnackbar();
    const [data, setData] = useState<Category[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [searchState, dispatch] = useReducer(reducer, INITIAL_STATE)
    const [totalRecords, setTotalRecords] = useState<number>(0)

    useEffect(() => {
        setLoading(true)
        categoryHttp.list<ListResponse<Category>>(
            {
                queryParams: {
                    search: cleanSearchText(searchState.search),
                    page: searchState.pagination.page,
                    per_page: searchState.pagination.per_page,
                    sort: searchState.order.name,
                    dir: searchState.order.direction
                }
            }
        ).then(({data}) => {
            setTotalRecords(data.meta.total)
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

    function cleanSearchText(text: any) {
        let newText = text
        if (text && text.value !== undefined) {
            newText = text.value
        }
        return newText
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                debouncedTimeSearch={500}
                loading={loading}
                columns={columnsDefinitions}
                data={data}
                title={''}
                options={{
                    sortOrder: searchState.order,
                    serverSide: true,
                    searchText: searchState.search as string,
                    page: searchState.pagination.page - 1,
                    rowsPerPage: searchState.pagination.per_page,
                    count: totalRecords,
                    customToolbar: () => (<FilterResetButton handleClick={() => dispatch(Creators.setReset())}/>),
                    onSearchChange: (value) => dispatch(Creators.setSearch({search: value || ''})),
                    onChangePage: (page) => dispatch(Creators.setPage({page: page + 1})),
                    onChangeRowsPerPage: (per_page) => dispatch(Creators.setPerPage({per_page: per_page})),
                    onColumnSortChange: (changedColumn, direction) => dispatch(Creators.setOrder({
                        order: {
                            name: changedColumn,
                            direction: direction
                        }
                    })),
                }}>
            </DefaultTable>
        </MuiThemeProvider>
    );
};

export default Table