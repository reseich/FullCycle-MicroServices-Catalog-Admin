import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'
import {CastMember, CastMemberTypeMap, ListResponse} from "../../util/models";
import memberHttp from "../../util/http/memberHttp";
import DefaultTable, {makeActionStyles, TableColumn} from '../../Components/Table'
import {useSnackbar} from "notistack";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import useFilter from "../../hooks/useFIlter";
import * as yup from "yup";
import {invert} from 'lodash';
import {FilterResetButton} from "../../Components/Table/FilterResetButton";

const castMemberNames = Object.values(CastMemberTypeMap);
const columnsDefinitions: TableColumn[] = [
    {
        name: 'id',
        label: 'Id',
        width: '30%',
        options: {
            sort: false,
            filter: false
        }
    },
    {
        name: 'name',
        label: 'Name',
        width: '40%',
        options: {
            filter: false,
        }
    },
    {
        name: 'type',
        label: 'Type',
        width: '7%',
        options: {
            filterOptions: {
                names: castMemberNames
            },
            customBodyRender: (value: "1" | "2", tableMeta, updateValue) => {
                return CastMemberTypeMap[value];

            },
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
                        to={'/members/' + tableMeta.rowData[0] + '/edit'}
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
    const [data, setData] = useState<CastMember[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const subscribed = useRef(true);

    const {
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinitions,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        extraFilter: {
            createValidationSchema: () => {
                return yup.object().shape({
                    type: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !castMemberNames.includes(value) ? undefined : value;
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter
                    ? {
                        ...(
                            debouncedState.extraFilter.type &&
                            {type: debouncedState.extraFilter.type}
                        ),
                    }
                    : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    type: queryParams.get('type')
                }
            }
        }
    });
    //?type=Diretor
    const indexColumnType = columnsDefinitions.findIndex(c => c.name === 'type');
    const columnType = columnsDefinitions[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    const serverSideFilterList = columnsDefinitions.map(column => []);
    if (typeFilterValue) {
        serverSideFilterList[indexColumnType] = [typeFilterValue];
    }

    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        }
    }, [
        filterManager.cleanSearchText(debouncedFilterState.search),
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        JSON.stringify(debouncedFilterState.extraFilter)
    ]);

    async function getData() {
        setLoading(true);
        try {
            const {data} = await memberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search: filterManager.cleanSearchText(debouncedFilterState.search),
                    page: debouncedFilterState.pagination.page,
                    per_page: debouncedFilterState.pagination.per_page,
                    sort: debouncedFilterState.order.name,
                    dir: debouncedFilterState.order.direction,
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.type &&
                        {type: invert(CastMemberTypeMap)[debouncedFilterState.extraFilter.type]}
                    )
                }
            });
            if (subscribed.current) {
                setData(data.data);
                setTotalRecords(data.meta.total);
            }
        } catch (error) {
            console.error(error);
            if (memberHttp.isCancelRequest(error)) {
                return;
            }
            enqueueSnackbar(
                'Cannot retrieve information',
                {variant: 'error',}
            )
        } finally {
            setLoading(false);
        }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                title=""
                columns={columnsDefinitions}
                data={data}
                loading={loading}
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
                        //[ [], [], ['Diretor'], [], []  ]
                        filterManager.changeExtraFilter({
                            [column as any]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => filterManager.resetFilter()}
                        />
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn: string, direction: string) =>
                        filterManager.changeColumnSort(changedColumn, direction as any)
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;