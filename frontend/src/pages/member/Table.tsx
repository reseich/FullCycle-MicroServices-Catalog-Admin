import * as React from 'react';
import {useEffect, useState} from 'react';
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'
import {CastMember, ListResponse} from "../../Utils/models";
import memberHttp from "../../Utils/http/memberHttp";
import DefaultTable, {makeActionStyles, TableColumn} from '../../Components/Table'
import {useSnackbar} from "notistack";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";

const types = ['Director', 'Actor']
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
        width: '40%'
    },
    {
        name: 'type',
        label: 'Type',
        width: '7%',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return types[value - 1]
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
                        to={'/members/' + tableMeta.rowData[0] + '/edit'}
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
    const [data, setData] = useState<CastMember[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLoading(true)
        memberHttp.list<ListResponse<CastMember>>().then(({data}) => {
            setLoading(false)
            setData(data.data)
        }).catch(() => {
            setLoading(false)
            enqueueSnackbar('Cannot retrieve information', {variant: 'error'})
        })
    }, [enqueueSnackbar])
    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                loading={loading}
                columns={columnsDefinitions}
                data={data}
                title={''}>
            </DefaultTable>
        </MuiThemeProvider>
    );
};

export default Table