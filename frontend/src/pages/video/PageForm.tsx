// @flow
import * as React from 'react';
import {Page} from "../../components/Page";
import {Index} from "./Form";
import {useParams} from "react-router";

export const PageForm = () => {
    const {id} = useParams() as any
    return (
        <Page title={id ? 'Edit Video' : 'Create Video'}>
            <Index/>
        </Page>
    );
};

export default PageForm;