import {Box, CssBaseline, MuiThemeProvider} from '@material-ui/core';
import React from 'react';
import {Navbar} from "./components/Navbar";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Breadcrumb from "./components/Breadcrumb";
import theme from './theme';
import {SnackbarProvider} from "./components/SnackbarProvider";
import {LoadingProvider} from "./components/loading/LoadingProvider";
import Spinner from "./components/Spinner";

const App: React.FC = () => {
    return (
        <React.Fragment>
            <LoadingProvider>
                <MuiThemeProvider theme={theme}>
                    <SnackbarProvider>
                        <CssBaseline/>
                        <BrowserRouter basename={'/admin'}>
                            <Spinner/>
                            <Navbar/>
                            <Box paddingTop={'70px'}>
                                <Breadcrumb/>
                                <AppRouter/>
                            </Box>
                        </BrowserRouter>
                    </SnackbarProvider>
                </MuiThemeProvider>
            </LoadingProvider>
        </React.Fragment>
    );
}
export default App;
