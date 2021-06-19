import * as React from 'react';
import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import videoHttp from "../../util/http/videosHttp";
import {ListResponse, Video} from "../../util/models";
import DefaultTable, {makeActionStyles, TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";
import {IconButton, MuiThemeProvider} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import useFilter from "../../hooks/useFilter";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import DeleteDialog from "../../components/DeleteDialog";
import LoadingContext from "../../components/loading/LoadingContext";

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        width: '30%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: "title",
        label: "Title",
        width: '20%',
        options: {
            filter: false
        }
    },
    {
        name: "genres",
        label: "Genres",
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map((value: any) => value.name).join(', ');
            }
        }
    },
    {
        name: "categories",
        label: "Categories",
        width: '12%',
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta, updateValue) => {
                return value.map((value: any) => value.name).join(', ');
            }
        }
    },
    {
        name: "created_at",
        label: "Created at",
        width: '10%',
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: "actions",
        label: "Actions",
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender: (value, tableMeta) => {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/videos/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                )
            }
        }
    }
];

const debounceTime = 300;
const debouncedSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];
const Table = () => {
    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();
//property, funcao - changePage changeRowsPerPage
    const {
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        cleanSearchText,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
    });

    const getData = useCallback(async () => {
        try {
            const {data} = await videoHttp.list<ListResponse<Video>>({
                queryParams: {
                    search: cleanSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.name,
                    dir: debouncedFilterState.order.direction,
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
                if (openDeleteDialog) {
                    setOpenDeleteDialog(false);
                }
            }
        } catch (error) {
            console.error(error);
            if (videoHttp.isCancelRequest(error)) {
                return;
            }
            snackbar.enqueueSnackbar(
                'Cannot loading informations',
                {variant: 'error',}
            )
        }
    }, [cleanSearchText,
        debouncedFilterState.order.direction,
        debouncedFilterState.order.name,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.search,
        openDeleteDialog,
        setOpenDeleteDialog,
        setTotalRecords,
        snackbar])

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

    function deleteRows(confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete
            .data
            .map(value => data[value.index].id)
            .join(',');
        videoHttp
            .deleteCollection({ids})
            .then((response: any) => {
                snackbar.enqueueSnackbar(
                    'Registries removed',
                    {variant: 'success'}
                );
                if (
                    rowsToDelete.data.length === filterState.pagination.per_page
                    && filterState.pagination.page > 1
                ) {
                    const page = filterState.pagination.page - 2;
                    filterManager.changePage(page);
                } else {
                    getData();
                }
            })
            .catch((error: any) => {
                console.error(error);
                snackbar.enqueueSnackbar(
                    'Cannot remove registries',
                    {variant: 'error',}
                )
            })
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows}/>
            <DefaultTable
                title=""
                columns={columnsDefinition}
                data={data}
                reset={filterState.reset}
                loading={loading}
                debouncedTimeSearch={debouncedSearchTime}
                options={{
                    serverSide: true,
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => filterManager.resetFilter()}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: 'asc' | 'desc') =>
                        filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted, newTableData) => {
                        setRowsToDelete(rowsDeleted as any)
                        return false
                    },
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;