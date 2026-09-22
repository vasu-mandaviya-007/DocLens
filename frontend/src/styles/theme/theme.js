


// import { createTheme } from "@mui/material/styles";
// import button from "./assets/theme/components/button/index";
// import colors from "./assets/theme/base/colors";
// import darkColor from "./assets/theme-dark/base/colors";

// const getTheme = (mode) => {
//     const themeColor = mode === "dark" ? darkColor : colors;

//     return createTheme({
//         palette: {
//             mode,
//             // ...themeColor
//         },
//         typography: {
//             fontFamily: "inherit",
//             button: { textTransform: "none", fontWeight: 600 },
//         },
//         components: {
//             MuiButton: {
//                 defaultProps: { ...button.defaultProps },
//                 styleOverrides: {
//                     root: {
//                         ...button.styleOverrides.root,
//                         borderRadius: 6,
//                     },
//                 },
//                 variants: [
//                     ...button.variants,
//                     {
//                         // custom boxShadow sirf contained variants pe
//                         props: { variant: "contained" },
//                         style: {
//                             boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
//                             "&:hover": {
//                                 boxShadow: "0 4px 10px rgba(15, 23, 42, 0.12)",
//                             },
//                         },
//                     },
//                 ],
//             },
//         },
//     });
// };

// export default getTheme;








import { createTheme } from "@mui/material/styles";
import button from "./components/button/index.js"
import colors from "./base/colors.js";
import tooltip from "./components/tooltip.js" 
// import darkColor from "../../assets/theme-dark/base/colors.js";


const getTheme = (mode) => {
    // const themeColor = mode === "dark" ? darkColor : colors;
    const themeColor = colors;

    return createTheme({
        palette: {
            mode,
            // ...themeColor
        },
        typography: {
            fontFamily: "inherit",
            button: { textTransform: "none", fontWeight: 600 },
        },
        components: { 
            MuiButton: {
                defaultProps: { ...button.defaultProps },
                styleOverrides: {
                    root: {
                        ...button.styleOverrides.root,
                        borderRadius: 6,
                    },
                },
                variants: [
                    ...button.variants,
                    {
                        // custom boxShadow sirf contained variants pe
                        props: { variant: "contained" },
                        style: {
                            boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                            "&:hover": {
                                boxShadow: "0 4px 10px rgba(15, 23, 42, 0.12)", 
                            },
                        },
                    },

                    // ---- NAYA: Light button (contained) ----
                    {
                        props: { variant: "contained", color: "light" },
                        style: {
                            backgroundColor: themeColor.white.main,
                            color: themeColor.black.main, 
                            "&:hover": {
                                backgroundColor: themeColor.white.focus,  
                            },
                        },
                    },
                    // ---- NAYA: Light button (outlined) ----
                    {
                        props: { variant: "outlined", color: "light" },    
                        style: {
                            borderColor: themeColor.white.light,    
                            color: themeColor.white.text,
                            "&:hover": {
                                borderColor: themeColor.white.focus,
                                backgroundColor: "rgba(0, 0, 0, 0.03)", 
                            },
                        },
                    },

                    // ---- NAYA: Dark button (contained) ----
                    {
                        props: { variant: "contained", color: "dark" }, 
                        style: {
                            backgroundColor: themeColor.black.main, 
                            color: themeColor.white.main, 
                            "&:hover": {
                                opacity : 0.8
                                // backgroundColor: themeColor.dark.focus,   
                            },
                        },
                    },
                    // ---- NAYA: Dark button (outlined) ----
                    {
                        props: { variant: "outlined", color: "dark" }, 
                        style: {
                            borderColor: themeColor.black.light,
                            color: themeColor.black.text,
                            "&:hover": {
                                // borderColor: themeColor.dark.focus,
                                backgroundColor: "rgba(0, 0, 0, 0.03)",
                            },
                        },
                    },
                ],
            },
            MuiTooltip: { ...tooltip },
        },
    });
};

export default getTheme;