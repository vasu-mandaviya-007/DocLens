// import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
// import React, { useState } from 'react'
// import { dialogSx, GrowTransition } from './shared/dialogSx.jsx';
// import { X } from 'lucide-react';

// const ConfirmDialog = ({ open, onClose, onConfirm }) => {

//     const [loading, setLoading] = useState(false)

//     const handleDelte = async () => {



//     } 

//     return (
//         <Dialog
//             open={open}
//             keepMounted
//             fullWidth
//             slots={{ transition: GrowTransition }}
//             // maxWidth="xs" 
//             onClose={onClose}
//             sx={dialogSx}
//         >

//             <DialogTitle>

//                 <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-semibold text-content-default">
//                         Edit notebook
//                     </h3>
//                     <IconButton onClick={onClose} ><X size={20} /></IconButton>
//                 </div>

//             </DialogTitle>

//             <DialogContent sx={{ px: 5, py: 4 }} dividers >




//             </DialogContent>

//             <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>

//                 <Button
//                     variant="outlined"
//                     color="secondary"
//                     onClick={onClose}
//                     disabled={loading}
//                     sx={{
//                         borderRadius: "9999px", 
//                     }}
//                 >
//                     Cancel
//                 </Button>

//                 <Button
//                     type="submit"
//                     form="notebook-create-form"
//                     loading={loading}
//                     variant="contained"
//                     color="primary"
//                     // onClick={handleCreate}
//                     sx={{
//                         borderRadius: "9999px",
//                     }}
//                 >
//                     Save
//                 </Button>

//             </DialogActions>

//         </Dialog>
//     )

// }

// export default ConfirmDialog;









import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton } from "@mui/material";
import { X } from "lucide-react";
import { dialogSx, GrowTransition } from "../../utils/dialogSx.jsx";

/**
 * Generic reusable confirm dialog.
 *
 * Usage:
 *   <ConfirmDialog
 *     open={!!notebookToDelete}
 *     title="Delete notebook?"
 *     message={`"${notebookToDelete?.title}" will be permanently deleted. This can't be undone.`}
 *     confirmText="Delete"
 *     danger
 *     loading={deleting}
 *     onConfirm={handleConfirmDelete}
 *     onClose={() => setNotebookToDelete(null)}
 *   />
 */
export default function ConfirmDialog({
    open,
    title = "Are you sure?",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm, 
    onClose,
    loading = false,
    danger = false,
}) {

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
                        color : "var(--color-content-default)",
                        borderRadius: "9999px", 
                    }}
                // sx={{
                //     textTransform: "none",
                //     borderRadius: "10px",
                //     fontWeight: 600,
                //     fontSize: "0.8rem",
                //     borderColor: "#d2d6da", 
                //     color: "#131316",
                // }}
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
                // sx={{
                //     textTransform: "none",
                //     borderRadius: "10px",
                //     fontWeight: 600,
                //     fontSize: "0.8rem",
                //     ...(!danger && {
                //         backgroundColor: "#2F3037",
                //         "&:hover": { backgroundColor: "#131316" },
                //     }),
                // }}
                >
                    {loading ? "Please wait..." : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}