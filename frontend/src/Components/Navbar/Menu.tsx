// @flow
import * as React from 'react';
import {useState} from 'react';
import {IconButton, Menu as MuiMenu, MenuItem} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import routes, {MyRouteProps} from "../../routes";
import {Link} from "react-router-dom";
const listRoutes = ['dashboard', 'categories.list','genres.list', 'members.list']
const menuRoutes = routes.filter((route) => listRoutes.includes(route.name))

export const Menu = () => {
    const [anchorEl, setAnchorEl] = useState(null)
    const handleOpen = (event: any) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    return (
        <React.Fragment>
            <IconButton
                edge={'start'}
                color={'inherit'}
                aria-label={'Open drawer'}
                aria-controls={'menu-appbar'}
                aria-haspopup={true}
                onClick={handleOpen}
            >
                <MenuIcon/>
            </IconButton>
            <MuiMenu
                open={!!anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                transformOrigin={{vertical: "top", horizontal: "center"}}
                onClose={handleClose}
                anchorEl={anchorEl}
                id={'menu-appbar'}
            >
                {listRoutes.map((routeName, key) => {
                    const route = menuRoutes.find(route => route.name === routeName) as MyRouteProps
                    return (<MenuItem key={key} component={Link} to={route.path as string} onClick={handleClose}>
                        {route.label}
                    </MenuItem>)
                })}
            </MuiMenu>
        </React.Fragment>
    );
};