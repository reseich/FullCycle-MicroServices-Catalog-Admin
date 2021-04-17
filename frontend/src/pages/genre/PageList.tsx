import * as React from 'react';
import {Page} from "../../Components/Page/Page";
import {Box, Fab} from "@material-ui/core";
import {Link} from "react-router-dom";
import AddIcon from '@material-ui/icons/Add'
import Table from "./Table";

const PageList = () => {
    return (
        <Page title={'List Genres'}>
            <Box dir={'rtl'}>
                <Fab
                    title={'Add Genre'}
                    size={'small'}
                    component={Link}
                    to={'genres/create'}
                ><AddIcon/>
                </Fab>
            </Box>
            <Box>
                <Table/>
            </Box>
        </Page>
    );
};

export default PageList;