// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps} from "mui-datatables";
import {cloneDeep, merge, omit} from 'lodash'
import {MuiThemeProvider, useTheme} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";
import DebouncedTableSearch from "./DebouncedTableSearch";

const defaultOptions = (debounceSearchTime?:number): MUIDataTableOptions => ({
    print: false,
    download: false,
    responsive: 'standard',
    textLabels: {
        body: {}
    },
    customSearchRender: (
        searchText: any,
        handleSearch: (text: string) => void,
        hideSearch: () => void,
        options: any
    ) => {
        return <DebouncedTableSearch
            searchText={searchText}
            onSearch={handleSearch}
            onHide={hideSearch}
            options={options}
            debounceTime={debounceSearchTime}
        />
    }
})

export interface TableColumn extends MUIDataTableColumn {
    width?: string
}

interface TableProps extends MUIDataTableProps {
    columns: TableColumn[],
    loading?: boolean,
    debouncedTimeSearch?: number
}

const Table: React.FC<TableProps> = (props) => {
    function extractMuiDataTableColumns(columns: TableColumn[]) {
        setColumnsWidth(columns)
        return columns.map(column => omit(column, 'width'))
    }

    function setColumnsWidth(columns: TableColumn[]) {
        columns.forEach((column, key) => {
            if (column.width) {
                const overrides = theme.overrides as any;
                overrides.MUIDataTableHeadCell.fixedHeader['&:nth-child(' + (key + 2) + ')'] = {
                    width: column.width
                }
            }
        })
    }

    function applyLoading() {
        let textLabels = newProps.options?.textLabels?.body as any
        textLabels.noMatch = newProps.loading === true ? 'Loading...' : newProps.options?.textLabels?.body?.noMatch
    }

    function handleOriginalMuiDataTableProps() {
        return omit(newProps, 'isLoading')
    }

    const theme = cloneDeep<Theme>(useTheme());
    const newProps = merge({options: cloneDeep(defaultOptions(props.debouncedTimeSearch))}, props, {columns: extractMuiDataTableColumns(props.columns)})
    applyLoading()
    const originalProps = handleOriginalMuiDataTableProps()

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable {...originalProps}/>
        </MuiThemeProvider>
    );
}

export default Table

export function makeActionStyles(column: any) {
    return (theme: Theme) => {
        const copyTheme = cloneDeep(theme);
        const selector = `&[data-testid^="MuiDataTableBodyCell-${column}"]`;
        (copyTheme.overrides as any).MUIDataTableBodyCell.root[selector] = {
            paddingTop: '0px',
            paddingBottom: '0px'
        }
        return copyTheme
    }

}