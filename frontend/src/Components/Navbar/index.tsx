import * as React from 'react';
import {AppBar, Button, makeStyles, Theme, Toolbar, Typography} from "@material-ui/core";
import logo from '../../assets/images/logo.png'
import {Menu} from "./Menu";

const useStyles = makeStyles((theme: Theme) => ({
    toolbar: {
        backgroundColor: 'black'
    }
    ,
    title: {
        flexGrow: 1,
        textAlign: 'center'
    }
    ,
    logo: {
        width: 100,
        [theme.breakpoints.up('sm')]: {
            width: 170
        }
    }
}));

export const Navbar: React.FC = () => {
    const classes = useStyles();
    return (
        <AppBar>
            <Toolbar className={classes.toolbar}>
                <Menu/>
                <Typography className={classes.title}>
                    <img
                        alt={'Codeflix'}
                        src={logo}
                        className={classes.logo}/>
                </Typography>
                <Button color={'inherit'}> Login </Button>
            </Toolbar>
        </AppBar>
    );
};