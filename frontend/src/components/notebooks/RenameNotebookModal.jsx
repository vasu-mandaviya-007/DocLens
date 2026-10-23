import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import { dialogSx, GrowTransition } from "../../utils/dialogSx.jsx"; 

export const RenameNotebookModal = ({ open, onClose, notebook, onSave }) => {

    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        setTitle(notebook?.title || "");
        setError("");
        setSaving(false);
    }, [notebook]);

    if (!notebook) return null;

    const handleSave = async (e) => {
        e.preventDefault();

        if (saving) return;

        const trimmed = title.trim();
        if (!trimmed) {
            setError("Title can't be empty.");
            return;
        }
        setSaving(true);
        try {
            await onSave(trimmed);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = (...args) => {
        if (saving) return;
        onClose(...args);
    };

    return (

        <Dialog
            open={open}
            keepMounted
            fullWidth
            autoFocus
            slots={{ transition: GrowTransition }}
            onClose={handleClose}
            sx={dialogSx}
        >

            <DialogTitle>

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-content-default">
                        Edit notebook
                    </h3>
                    <IconButton disabled={saving} onClick={handleClose}>
                        <X size={20} />
                    </IconButton>
                </div>

            </DialogTitle>

            <DialogContent sx={{ px: 5, py: 4 }} dividers >

                <form onSubmit={handleSave} id="notebook-create-form">

                    <TextField
                        id="outlined-basic"
                        disabled={saving}
                        label="Notebook title"
                        autoFocus
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setError("");
                        }}
                        variant="outlined"
                        error={!!error}
                        helperText={error}
                        fullWidth
                    />

                </form>

            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClose}
                    disabled={saving}
                    sx={{ borderRadius: "9999px" }}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    form="notebook-create-form"
                    loading={saving}
                    disabled={saving}
                    variant="contained"
                    color="primary"
                    sx={{ borderRadius: "9999px" }}
                >
                    Save
                </Button>

            </DialogActions>

        </Dialog>
    );
}

export default RenameNotebookModal;
