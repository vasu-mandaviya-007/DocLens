// Material Dashboard 2 React Base Styles
import typography from "styles/theme/base/typography";
import borders from "styles/theme/base/borders";

// Material Dashboard 2 React Helper Functions
import pxToRem from "styles/theme/functions/pxToRem";

const { fontWeightBold, size } = typography;
const { borderRadius } = borders;

const root = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center", 
    fontSize: size.sm,
    fontWeight: fontWeightBold,
    borderRadius: borderRadius.lg,
    padding: `${pxToRem(6.302)} ${pxToRem(16.604)}`,
    lineHeight: 1.4,
    textAlign: "center",
    textTransform: "none",
    userSelect: "none",
    backgroundSize: "150% !important",
    backgroundPositionX: "25% !important",
    transition: "all 150ms ease-in",

    "&:disabled": {
        pointerEvents: "none", // fixed: was "pointerEvent" (invalid CSS property)
        opacity: 0.65,
    },

    "& .material-icons": {
        fontSize: pxToRem(15),
        marginTop: pxToRem(-2),
    },
};

export default root;