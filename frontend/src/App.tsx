import {Box, CssBaseline, MuiThemeProvider} from '@material-ui/core';
import React from 'react';
import {Navbar} from "./Components/Navbar";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Breadcrumb from "./Components/Breadcrumb";
import theme from './theme';
import {SnackbarProvider} from "./Components/SnackbarProvider";
import {LoadingProvider} from "./Components/loading/LoadingProvider";
import Spinner from "./Components/Spinner";

const App: React.FC = () => {
    return (
        <React.Fragment>
            <LoadingProvider>
                <MuiThemeProvider theme={theme}>
                    <SnackbarProvider>
                        <CssBaseline/>
                        <BrowserRouter>
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
