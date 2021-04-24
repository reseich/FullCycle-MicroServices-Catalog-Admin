// @flow
import {Chip, createMuiTheme, MuiThemeProvider} from '@material-ui/core';
import * as React from 'react';
import theme from "../theme";

const badgeTheme = createMuiTheme({
    palette: {
        primary: theme.palette.success,
        secondary: theme.palette.error
    }
})

export const BadgeYes = () => {
    return (
        <MuiThemeProvider theme={badgeTheme}>
            <Chip label={'Yes'} color={"primary"}/>
        </MuiThemeProvider>
    );
};

export const BadgeNo = () => {
    return (
        <MuiThemeProvider theme={badgeTheme}>
            <Chip label={'No'} color={"secondary"}/>
        </MuiThemeProvider>
    );
};