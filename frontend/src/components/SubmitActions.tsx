// @flow
import * as React from 'react';
import {Box, Button, ButtonProps} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}))

interface SubmitActionsProps {
    disabledButtons?: boolean;
    handleSave: () => void;
}

export const SubmitActions: React.FC<SubmitActionsProps> = (props) => {
        const classes = useStyles()
        const buttonProps: ButtonProps = {
            variant: 'contained',
            color: 'secondary',
            disabled: !!props.disabledButtons,
            className: classes.submit
        }
        return (
            <Box dir={'ltf'}>
                <Button
                    {...buttonProps}
                    onClick={props.handleSave}
                >Save</Button>
                <Button
                    type={"submit"}
                    {...buttonProps}
                >Save and continue editing</Button>
            </Box>
        );
    }
;