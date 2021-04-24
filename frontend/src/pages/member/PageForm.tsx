// @flow
import * as React from 'react';
import {Page} from "../../Components/Page";
import {Form} from "./Form";
import {useParams} from "react-router";

export const PageForm = () => {
    const {id} = useParams() as any
    return (
        <Page title={id ? 'Edit Member' : 'Create Member'}>
            <Form/>
        </Page>
    );
};

export default PageForm;