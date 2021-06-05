// @flow
import * as React from 'react';
import {IconButton, Tooltip} from "@material-ui/core";
import {ClearAll} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";

let useStyles = makeStyles(theme => ({
    iconButton: (theme as any).overrides.MUIDataTableToolbar.icon
}))

interface FilterResetButtonProps {
    handleClick: () => void
}

export const FilterResetButton: React.FC<FilterResetButtonProps> = (props) => {
    const classes = useStyles()
    return (
        <Tooltip title={'Clean search'}>
            <IconButton className={classes.iconButton} onClick={props.handleClick}>
                <ClearAll/>
            </IconButton>
        </Tooltip>
    );
};