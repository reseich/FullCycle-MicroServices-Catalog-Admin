import {Box, CssBaseline, MuiThemeProvider} from '@material-ui/core';
import React from 'react';
import {Navbar} from "./Components/Navbar";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Breadcrumb from "./Components/Breadcrumb";
import theme from './theme';
import {SnackbarProvider} from "./Components/SnackbarProvider";

const App: React.FC = () => {
    return (
        <React.Fragment>
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                <SnackbarProvider>
                    <BrowserRouter>
                        <Navbar/>
                        <Box paddingTop={'70px'}>
                            <Breadcrumb/>
                            <AppRouter/>
                        </Box>
                    </BrowserRouter>
                </SnackbarProvider>
            </MuiThemeProvider>
        </React.Fragment>
    );
}
export default App;
