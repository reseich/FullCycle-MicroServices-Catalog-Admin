import * as React from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, Genre, ListResponse} from "../../util/models";
import genreHttp from "../../util/http/genreHttp";
import DefaultTable, {makeActionStyles, TableColumn} from '../../components/Table'
import {useSnackbar} from "notistack";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import useFilter from "../../hooks/useFilter";
import * as yup from "yup";
import categoryHttp from "../../util/http/categoryHttp";
import {FilterResetButton} from "../../components/Table/FilterResetButton";

const columnsDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'Id',
        width: '30%',
        options: {
            filter: false,
            sort: false
        }
    },
    {
        name: 'name',
        label: 'Name',
        width: '20%',
        options: {
            filter: false
        }
    },
    {
        name: 'categories',
        label: 'categories',
        options: {
            filterType: 'multiselect',
            filterOptions: {
                names: []
            },
            customBodyRender(value, tableMeta, updateValue) {
                let result: string[] = []
                value.forEach((category: any) => {
                    result.push(category.name)
                })
                return (<span>{result.join(', ')}</span>)
            }
        }
    },
    {
        name: 'is_active',
        label: 'Active?',
        width: '4%',
        options: {
            filterOptions: {
                names: ['Yes', 'No']
            },
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
            filter: false,
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
            filter: false,
            sort: false,
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={'/genres/' + tableMeta.rowData[0] + '/edit'}
                    >
                        <EditIcon fontSize={'inherit'}/>
                    </IconButton>
                )
            }
        }
    },
]

const debounceTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];
const Table = () => {
    const {enqueueSnackbar} = useSnackbar();
    const [data, setData] = useState<Genre[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const subscribed = useRef(true);
    const extraFilter = useMemo(() => ({
        createValidationSchema: () => {
            return yup.object().shape({
                categories: yup.mixed()
                    .nullable()
                    .transform(value => {
                        return !value || value === '' ? undefined : value.split(',');
                    })
                    .default(null),
            })
        },
        formatSearchParams: (debouncedState: any) => {
            return debouncedState.extraFilter ? {
                ...(
                    debouncedState.extraFilter.categories &&
                    {categories: debouncedState.extraFilter.categories.join(',')}
                )
            } : undefined
        },
        getStateFromURL: (queryParams: any) => {
            return {
                categories: queryParams.get('categories')
            }
        }
    }), [])
    const {
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        cleanSearchText,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinitions,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        extraFilter: extraFilter
    });

    const indexColumnCategories = columnsDefinitions.findIndex(c => c.name === 'categories');
    const columnCategories = columnsDefinitions[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories;
    (columnCategories.options as any).filterList = categoriesFilterValue ? categoriesFilterValue : [];
    const serverSideFilterList = columnsDefinitions.map(column => []);
    if (categoriesFilterValue) {
        serverSideFilterList[indexColumnCategories] = categoriesFilterValue;
    }

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const {data} = await categoryHttp.list({queryParams: {all: ''}});
                if (isSubscribed) {
                    (columnCategories.options as any).filterOptions.names = data.data.map((category: Category) => category.name)
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar(
                    'Cannot retrieve information',
                    {variant: 'error',}
                )
            }
        })();

        return () => {
            isSubscribed = false;
        }
    }, [columnCategories.options, enqueueSnackbar]);

    const getData = useCallback(async () => {
        setLoading(true);
        try {
            const {data} = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search: cleanSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.name,
                    dir: debouncedFilterState.order.direction,
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.categories &&
                        {categories: debouncedFilterState.extraFilter.categories.join(',')}
                    )
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {
            console.error(error);
            if (genreHttp.isCancelRequest(error)) {
                return;
            }
            enqueueSnackbar(
                'Cannot retrieve information',
                {variant: 'error',}
            )
        } finally {
            setLoading(false);
        }
    }, [cleanSearchText,
        debouncedFilterState.extraFilter,
        debouncedFilterState.order.direction,
        debouncedFilterState.order.name,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.search,
        enqueueSnackbar,
        setTotalRecords])

    useEffect(() => {
        subscribed.current = true;
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        getData]);


    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                title=""
                columns={columnsDefinitions}
                data={data}
                loading={loading}
                reset={filterState.reset}
                debouncedTimeSearch={debounceTime}
                options={{
                    sortOrder: filterState.order,
                    serverSide: true,
                    searchText: filterState.search,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    onFilterChange: (column, filterList, type) => {
                        const columnIndex = columnsDefinitions.findIndex(c => c.name === column);
                        filterManager.changeExtraFilter({
                            [column as any]: filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    },
                    customToolbar: () => (<FilterResetButton handleClick={() => filterManager.resetFilter()}/>),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (per_page) => filterManager.changeRowsPerPage(per_page),
                    onColumnSortChange: (changedColumn, direction) => filterManager.changeColumnSort(changedColumn, direction),
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table