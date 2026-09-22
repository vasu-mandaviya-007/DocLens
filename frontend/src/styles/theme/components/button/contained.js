// Material Dashboard 2 React Base Styles
import colors from "styles/theme/base/colors";
import typography from "styles/theme/base/typography";
import pxToRem from "styles/theme/functions/pxToRem";

const { white, primary, secondary, warning } = colors;
const { size } = typography;

// Har entry ab { props, style } ke format me hai
const contained = [
    {
        props: { variant: "contained" },
        style: {
            minHeight: pxToRem(40),
            color: white.main,
            padding: `${pxToRem(10)} ${pxToRem(24)}`,

            "&:hover": {
                opacity: 0.9,
            },

            "& .material-icon, .material-icons-round, svg": {
                fontSize: `${pxToRem(16)} !important`,
            },
        },
    },
    {
        props: { variant: "contained", size: "small" },
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
        props: { variant: "contained", size: "large" },
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
        props: { variant: "contained", color: "primary" },
        style: {
            backgroundColor: primary.main,
            color: white.main,

            "&:hover": {
                backgroundColor: `${primary.main}`,
            },
        },
    },
    {
        props: { variant: "contained", color: "secondary" },
        style: {
            backgroundColor: secondary.main,
            color: white.main,

            "&:hover": {
                backgroundColor: secondary.focus,
            },

            "&:focus:not(:hover)": {
                backgroundColor: secondary.focus,
            },
        },
    },
    {
        props: { variant: "contained", color: "warning" },
        style: {
            backgroundColor: warning.main,
            color: white.main,

            "&:hover": {
                backgroundColor: warning.focus,
            },

            "&:focus:not(:hover)": {
                backgroundColor: warning.focus,
            },
        },
    },
];

export default contained;