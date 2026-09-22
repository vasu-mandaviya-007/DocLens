// Material Dashboard 2 React Base Styles
import colors from "styles/theme/base/colors";
import typography from "styles/theme/base/typography";
import pxToRem from "styles/theme/functions/pxToRem";

const { info, secondary, transparent } = colors;
const { size } = typography;

const buttonText = [

    {
        props: { variant: "text" },
        style: {
            backgroundColor: transparent.main,
            minHeight: pxToRem(40),
            boxShadow: "none",
            padding: `${pxToRem(10)} ${pxToRem(24)}`,

            "&:hover": {
                backgroundColor: transparent.main,
                boxShadow: "none",
            },

            "&:focus": {
                boxShadow: "none",
            },

            "&:active, &:active:focus, &:active:hover": {
                opacity: 0.85,
                boxShadow: "none",
            },

            "&:disabled": {
                boxShadow: "none",
            },

            "& .material-icon, .material-icons-round, svg": {
                fontSize: `${pxToRem(16)} !important`,
            },
        },
    },
    {
        props: { variant: "text", size: "small" },
        style: {
            minHeight: pxToRem(32),
            padding: `${pxToRem(6)} ${pxToRem(16)}`,
            fontSize: size.xs,

            "& .material-icon, .material-icons-round, svg": {
                fontSize: `${pxToRem(12)} !important`,
            },
        },
    },
    {
        props: { variant: "text", size: "large" },
        style: {
            minHeight: pxToRem(47),
            padding: `${pxToRem(12)} ${pxToRem(28)}`,
            fontSize: size.sm,

            "& .material-icon, .material-icons-round, svg": {
                fontSize: `${pxToRem(22)} !important`,
            },
        },
    },
    {
        props: { variant: "text", color: "primary" },
        style: {
            color: info.main,

            "&:hover": {
                color: info.main,
            },

            "&:focus:not(:hover)": {
                color: info.focus,
                boxShadow: "none",
            },
        },
    },
    {
        props: { variant: "text", color: "secondary" },
        style: {
            color: secondary.main,

            "&:hover": {
                color: secondary.main,
            },

            "&:focus:not(:hover)": {
                color: secondary.focus,
            },
        },
    },
    
];

export default buttonText;