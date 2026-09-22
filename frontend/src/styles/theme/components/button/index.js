import root from "./root";
import contained from "./contained";
import outlined from "./outlined";
import buttonText from "./text";

const button = {
    defaultProps: {
        disableRipple: false,  
    },
    styleOverrides: {
        root: { ...root }, 
    },
    variants: [
        ...contained,   // saare contained variants (base, small, large, primary, secondary, warning)
        ...outlined,    // saare outlined variants
        ...buttonText,  // saare text variants
    ],
};

export default button; 