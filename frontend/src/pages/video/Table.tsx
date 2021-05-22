import * as React from 'react';
import DefaultTable, {makeActionStyles, TableColumn} from '../../Components/Table'
import {useSnackbar} from "notistack";
import {useState} from "react";
import {MuiThemeProvider} from "@material-ui/core";

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

]

const debounceTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];
const Table = () => {
    const {enqueueSnackbar} = useSnackbar();
    const [data, setData] = useState([])
    const [loading, setLoading] = useState<boolean>(false)


    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinitions.length - 1)}>
            <DefaultTable
                title=""
                columns={columnsDefinitions}
                data={data}
                loading={loading}
                debouncedTimeSearch={debounceTime}
            />
        </MuiThemeProvider>
    );
};

export default Table;