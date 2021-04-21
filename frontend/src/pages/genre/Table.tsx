import * as React from 'react';
import {useEffect, useState} from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {httpVideo} from "../../Utils/http";
import {Chip} from '@material-ui/core';
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'
import {BadgeNo, BadgeYes} from "../../Components/Badge/Badge";

const columnsDefinitions: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Name'
    },
    {
        name: 'categories',
        label: 'categories',
        options: {
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
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes/> : <BadgeNo/>
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
        httpVideo.get('genres').then((response) => setData(response.data.data))
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