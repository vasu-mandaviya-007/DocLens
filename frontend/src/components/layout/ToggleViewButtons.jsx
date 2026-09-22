import { styled } from '@mui/material/styles';

import AutoAwesomeMosaicIcon from '@mui/icons-material/AutoAwesomeMosaic';
import ReorderIcon from '@mui/icons-material/Reorder';

import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup, { 
    toggleButtonGroupClasses,
} from '@mui/material/ToggleButtonGroup';

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
        margin: theme.spacing(0.5),
        border: 0,
        color: theme.palette.mode === "light" ? "#222 !important" : "var(--color-content-default)",
        // borderRadius: theme.shape.borderRadius,

        borderRadius: "9999px",
        [`&.${toggleButtonGroupClasses.disabled}`]: {
            border: 0,
        },
    },
    [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    {
        // marginLeft: -1,
        marginLeft: 0.5,
        borderLeft: '1px solid transparent',
    },
}));

export default function ToggleViewButtons({ view, onChange }) {

    const handleViewChange = (event, newAlignment) => {
        onChange(newAlignment);
    };

    return (
        <div >
            <Paper
                elevation={0}
                sx={(theme) => ({
                    display: 'flex',
                    border: `1px solid ${theme.palette.divider}`,
                    flexWrap: 'wrap',
                    borderRadius: "9999px",
                })}
            >
                <StyledToggleButtonGroup
                    size="small"
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="text alignment"
                >
                    <ToggleButton sx={{fontSize : "15px"}} value={"grid"} >
                        <AutoAwesomeMosaicIcon fontSize='inherit' />
                    </ToggleButton>
                    <ToggleButton sx={{fontSize : "15px"}} value={"list"} >
                        <ReorderIcon fontSize='inherit' /> 
                    </ToggleButton>
                </StyledToggleButtonGroup>

                {/* <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} /> */}

            </Paper>
        </div>
    );
    
}
