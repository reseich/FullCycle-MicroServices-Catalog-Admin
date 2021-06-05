// @flow
import * as React from 'react';
import {Page} from "../../components/Page";
import {Form} from "./Form";
import {useParams} from "react-router";


const PageForm = () => {
    const {id} = useParams() as any
    return (
        <Page title={id ? 'Edit Genre' : 'Create Genre'}>
            <Form/>
        </Page>
    );
};

export default PageForm;