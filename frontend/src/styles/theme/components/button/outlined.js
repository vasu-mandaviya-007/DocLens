// Material Dashboard 2 React Base Styles
import colors from "styles/theme/base/colors";
import typography from "styles/theme/base/typography";
import pxToRem from "styles/theme/functions/pxToRem";

const { transparent, info, secondary } = colors;
const { size } = typography;

const outlined = [
    {
        props: { variant: "outlined" },
        style: {
            minHeight: pxToRem(40),
            padding: `${pxToRem(10)} ${pxToRem(24)}`,

            "& .material-icon, .material-icons-round, svg": {
                fontSize: `${pxToRem(16)} !important`,
            },
        },
    },
    {
        props: { variant: "outlined", size: "small" },
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
        props: { variant: "outlined", size: "large" },
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
        props: { variant: "outlined", color: "primary" },
        style: {
            backgroundColor: transparent.main,
            borderColor: info.main,
            color: info.main,

            "&:hover": {
                backgroundColor: transparent.main,
            },
        },
    },
    {
        props: { variant: "outlined", color: "secondary" },
        style: {
            backgroundColor: transparent.main,
            borderColor: secondary.main,
            color: secondary.main,

            "&:hover": {
                backgroundColor: transparent.main,
            },
        },
    },
];

export default outlined;