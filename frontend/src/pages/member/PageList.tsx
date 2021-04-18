import * as React from 'react';
import {Page} from "../../Components/Page/Page";
import {Box, Fab} from "@material-ui/core";
import {Link} from "react-router-dom";
import AddIcon from '@material-ui/icons/Add'
import Table from "./Table";

const PageList = () => {
    return (
        <Page title={'List CastMembers'}>
            <Box dir={'rtl'}>
                <Fab
                    title={'Add Cast Member'}
                    size={'small'}
                    component={Link}
                    to={'members/create'}
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