// @flow
import * as React from 'react';
import {Page} from "../../Components/Page";
import {Form} from "./Form";
import {useParams} from 'react-router'

const PageForm = () => {
    const {id} = useParams() as any
    return (
        <Page title={id ? 'Edit Category' : 'Create Category'}>
            <Form/>
        </Page>
    );
};

export default PageForm;