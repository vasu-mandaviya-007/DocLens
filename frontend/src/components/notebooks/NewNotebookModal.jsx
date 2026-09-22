
import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import FileUploadBox from "./FileUploadBox.jsx";
import { dialogSx, GrowTransition } from "../../utils/dialogSx.jsx";


export default function NewNotebookModal({ open, onClose, onCreate }) {

    const [titleInput, setTitleInput] = useState("");
    const [error, setError] = useState("");

    const handleCreate = (e) => {
        e.preventDefault();
        const val = titleInput.trim();
        if (!val) {
            setError("Enter a title first.");
            return;
        }
        onCreate(val);
    };


    return (

        <Dialog
            open={open}
            keepMounted
            fullWidth
            slots={{ transition: GrowTransition }}
            // maxWidth="xs" 
            onClose={onClose}
            sx={dialogSx}
        >

            <DialogTitle>

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-content-default">
                        New notebook
                    </h3>
                    <IconButton onClick={onClose} ><X size={20} /></IconButton>
                </div>

            </DialogTitle>

            <DialogContent sx={{ px: 5, py: 4 }} dividers >

                <p className="text-sm text-content-deemphasized mb-5">
                    Upload a PDF to create a notebook you can chat with.
                </p>

                <form onSubmit={handleCreate} id="notebook-create-form">

                    <FileUploadBox />

                    <TextField
                        id="outlined-basic"
                        label="Notebook title"
                        value={titleInput}
                        onChange={(e) => {
                            setTitleInput(e.target.value);
                            setError("");
                        }}
                        variant="outlined"
                        sx={{
                            marginTop: 4,
                        }}
                        error={error}
                        helperText={error}
                        fullWidth
                    />

                </form>


            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onClose}
                    sx={{
                        borderRadius: "9999px",
                    }}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    form="notebook-create-form"
                    variant="contained"
                    color="primary"
                    // onClick={handleCreate}
                    sx={{
                        borderRadius: "9999px",
                    }}
                >
                    Create Notebook
                </Button>

            </DialogActions>

        </Dialog>


        // </div>
    );
}