import {Box} from '@material-ui/core';
import React from 'react';
import {Navbar} from "./Components/Navbar";
import {BrowserRouter} from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import Breadcrumb from "./Components/Breadcrumb";

const App: React.FC = () => {
    return (
        <React.Fragment>
            <BrowserRouter>
                <Navbar/>
                <Box paddingTop={'70px'}>
                    <Breadcrumb/>
                    <AppRouter/>
                </Box>
            </BrowserRouter>
        </React.Fragment>
    );
}
export default App;
