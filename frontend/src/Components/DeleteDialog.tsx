import * as React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";

interface DeleteDialogProps {
    open: boolean;
    handleClose: (confirmed: boolean) => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = (props) => {

    const {open, handleClose} = props;

    return (
        <Dialog
            open={open}
            onClose={() => handleClose(false)}
        >
            <DialogTitle>
                Delete register
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                   Do you really want to remove this registry(s)?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => handleClose(true)} color="primary" autoFocus>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteDialog;