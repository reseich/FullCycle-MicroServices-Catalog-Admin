// @flow
import * as React from 'react';
import {Page} from "../../Components/Page/Page";
import {Form} from "./Form";

export const PageForm = () => {
    return (
        <Page title={'Create Member'}>
            <Form/>
        </Page>
    );
};

export default PageForm;