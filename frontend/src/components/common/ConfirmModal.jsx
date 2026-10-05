import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { dialogSx, GrowTransition } from "../../utils/dialogSx.jsx"; 


export default function ConfirmDialog({ open, title = "Are you sure?", message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onClose, loading = false, danger = false, }) {

    return (

        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            // maxWidth="xs"
            slots={{ transition: GrowTransition }}
            sx={dialogSx}
            fullWidth
        >

            <DialogTitle>

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-content-default">
                        {title}
                    </h3>
                    <IconButton onClick={loading ? undefined : onClose} disabled={loading} ><X size={20} /></IconButton>
                </div>

            </DialogTitle>

            <DialogContent sx={{ px: 5, py: 5, borderBottom: "none" }} dividers >

                <DialogContentText sx={{ fontSize: "0.875rem" }}>{message}</DialogContentText>

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>

                <Button
                    onClick={onClose}
                    disabled={loading}
                    variant="outlined"
                    color="secondary"
                    disableElevation
                    sx={{
                        color: "var(--color-content-default)",
                        borderRadius: "9999px",
                    }}
                >
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    disableElevation
                    color={danger ? "error" : "primary"}
                    sx={{
                        borderRadius: "9999px",
                    }}
                >
                    {loading ? "Please wait..." : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}