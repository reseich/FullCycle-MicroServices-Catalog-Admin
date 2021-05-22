import {RouteProps} from 'react-router-dom';

import categoryList from "../pages/category/PageList";
import genreList from "../pages/genre/PageList";
import membersList from "../pages/member/PageList";
import videoList from "../pages/video/PageList";
import categoryForm from "../pages/category/PageForm";
import genreForm from "../pages/genre/PageForm";
import videoForm from "../pages/video/PageForm";
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
        name: 'categories.edit',
        label: 'Edit categories',
        path: '/categories/:id/edit',
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
        name: 'members.edit',
        label: 'Edit Members',
        path: '/members/:id/edit',
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
    {
        name: 'genres.edit',
        label: 'Edit Genres',
        path: '/genres/:id/edit',
        component: genreForm,
        exact: true
    },
    {
        name: 'videos.list',
        label: 'List Videos',
        path: '/videos',
        component: videoList,
        exact: true
    },
    {
        name: 'videos.create',
        label: 'List Videos',
        path: '/videos/create',
        component: videoForm,
        exact: true
    },
    {
        name: 'videos.edit',
        label: 'Edit Videos',
        path: '/videos/:id/edit',
        component: videoForm,
        exact: true
    },
]

export default routes