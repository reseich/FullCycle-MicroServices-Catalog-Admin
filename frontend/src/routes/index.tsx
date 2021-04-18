import {RouteProps} from 'react-router-dom';

import categoryList from "../pages/category/PageList";
import genreList from "../pages/genre/PageList";
import membersList from "../pages/member/PageList";
import categoryForm from "../pages/category/PageForm";
import genreForm from "../pages/genre/PageForm";
import membersForm from "../pages/member/PageForm";
import Dashboard from '../pages/Dashboard';

export interface MyRouteProps extends RouteProps {
    name: string
    label: string
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: 'Dashboard',
        path: '/',
        component: Dashboard,
        exact: true
    },
    {
        name: 'categories.list',
        label: 'List categories',
        path: '/categories',
        component: categoryList,
        exact: true
    },
    {
        name: 'categories.create',
        label: 'Create categories',
        path: '/categories/create',
        component: categoryForm,
        exact: true
    },
    {
        name: 'members.list',
        label: 'List Members',
        path: '/members',
        component: membersList,
        exact: true
    },
    {
        name: 'members.create',
        label: 'List Members',
        path: '/members/create',
        component: membersForm,
        exact: true
    },
    {
        name: 'genres.list',
        label: 'List Genres',
        path: '/genres',
        component: genreList,
        exact: true
    },
    {
        name: 'genres.create',
        label: 'List Genres',
        path: '/genres/create',
        component: genreForm,
        exact: true
    },
]

export default routes