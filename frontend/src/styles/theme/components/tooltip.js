

import colors from "../base/colors";
import typography from "../base/typography";
import borders from "../base/borders";


import pxToRem from "../functions/pxToRem";

const { black, light } = colors;
const { size, fontWeightRegular } = typography;
const { borderRadius } = borders;

const tooltip = {

  defaultProps: {
    arrow: true,
  },

  styleOverrides: {

    tooltip: ({ theme }) => {
      const isDarkMode = theme.palette.mode === "dark";

      return {
        maxWidth: pxToRem(200),
        backgroundColor: isDarkMode ? light.main : black.main,
        color: isDarkMode ? black.main : light.main,
        fontSize: size.xs,
        backfaceVisibility: "hidden",
        willChange: "transform",
        textAlign: "center",
        borderRadius: borderRadius.md,
        opacity: 1,
        padding: `${pxToRem(5)} ${pxToRem(8)} ${pxToRem(4)}`,
        boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.4)" : "none",
      };
    },

    arrow: ({ theme }) => ({
      color: theme.palette.mode === "dark" ? light.main : black.main,
    }),

  },

};

export default tooltip;