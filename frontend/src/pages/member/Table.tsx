import * as React from 'react';
import {useEffect, useState} from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {httpVideo} from "../../Utils/http";
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'

const types = ['Director', 'Actor']
const columnsDefinitions: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Name'
    },
    {
        name: 'type',
        label: 'Type',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return types[value - 1]
            }
        }
    },
    {
        name: 'created_at',
        label: 'Created at',
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseIso(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
]

const Table = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        httpVideo.get('cast_members').then((response) => setData(response.data.data))
    }, [])
    return (
        <div>
            <MUIDataTable
                columns={columnsDefinitions}
                data={data}
                title={''}>
            </MUIDataTable>
        </div>
    );
};

export default Table