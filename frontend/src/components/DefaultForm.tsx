// @flow
import * as React from 'react';
import {Grid, GridProps} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

interface DefaultFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    GridContainerProps?: GridProps
    GridItemProps?: GridProps
}

const useStyles = makeStyles(theme => ({
        gridItem: {
            padding: theme.spacing(1, 0)
        }
    }
))

export const DefaultForm: React.FC<DefaultFormProps> = (props) => {
    const classes = useStyles()
    const {GridContainerProps, GridItemProps, ...other} = props
    return (
        <form{...other}>
            <Grid container {...GridContainerProps}>
                <Grid item {...GridItemProps} className={classes.gridItem}>
                    {props.children}
                </Grid>
            </Grid>
        </form>
    )
};