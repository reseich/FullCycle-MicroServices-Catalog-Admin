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
import {FilterResetButton} from "../../Components/Table/FilterResetButton";
import {Creators} from "../../store/filter";
import useFilter from "../../hooks/useFIlter";

const debounceTimeValue = 300
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
    const {
        filterManager,
        filterState,
        dispatch,
        totalRecords,
        setTotalRecords,
        debouncedFilterState,
    } = useFilter({
        columns: columnsDefinitions,
        debounceTime: debounceTimeValue,
        rowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 50]
    })

    useEffect(() => {
        setLoading(true)
        categoryHttp.list<ListResponse<Category>>(
            {
                queryParams: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.name,
                    dir: filterState.order.direction
                }
            }
        ).then(({data}) => {
            filterManager.pushHistory()
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

    }, [debouncedFilterState.search,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        setTotalRecords,
        enqueueSnackbar])

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                debouncedTimeSearch={debounceTimeValue}
                loading={loading}
                columns={columnsDefinitions}
                data={data}
                reset={filterState.reset}
                title={''}
                options={{
                    sortOrder: filterState.order,
                    serverSide: true,
                    searchText: filterState.search,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    count: totalRecords,
                    customToolbar: () => (<FilterResetButton handleClick={() => dispatch(Creators.setReset())}/>),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (per_page) => filterManager.changeRowsPerPage(per_page),
                    onColumnSortChange: (changedColumn, direction) => filterManager.changeColumnSort(changedColumn, direction),
                }}>
            </DefaultTable>
        </MuiThemeProvider>
    );
};

export default Table