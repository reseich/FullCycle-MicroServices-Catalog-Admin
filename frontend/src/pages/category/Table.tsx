import * as React from 'react';
import {useEffect, useState} from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import format from 'date-fns/format'
import parseIso from 'date-fns/parseISO'
import categoryHttp from "../../Utils/http/categoryHttp";
import {BadgeNo, BadgeYes} from "../../Components/Badge";
import {Category, ListResponse} from "../../Utils/models";

const columnsDefinitions: MUIDataTableColumn[] = [
    {
        name: 'id',
        label: 'Id'
    },
    {
        name: 'name',
        label: 'Name'
    },
    {
        name: 'description',
        label: 'Description'
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
    const [data, setData] = useState<Category[]>([])

    useEffect(() => {
        categoryHttp.list<ListResponse<Category>>().then(({data}) => {
            setData(data.data)
        })
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