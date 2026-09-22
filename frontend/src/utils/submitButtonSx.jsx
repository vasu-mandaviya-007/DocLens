

export const submitButtonSx = { 

    backgroundColor: 'var(--clerk-color-primary)',
    color : "var(--clerk-color-primary-foreground)",
    '&:hover': { 
        backgroundColor: "var(--accentHover) !important",
        boxShadow : `0px 0px 0px 1px var(--clerk-color-primary, #2F3037), 
            0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset, 
            0px 2px 3px 0px rgba(34, 42, 53, 0.20), 
            0px 1px 1px 0px rgba(0, 0, 0, 0.24)` 
    },
    boxShadow : `0px 0px 0px 1px var(--clerk-color-primary, #2F3037),   
        0px 1px 1px 0px rgba(255, 255, 255, 0.07) inset,  
        0px 2px 3px 0px rgba(34, 42, 53, 0.20),   
        0px 1px 1px 0px rgba(0, 0, 0, 0.24)`, 
    borderRadius: '10px', 
    paddingY: '8px',  
    // marginTop: '30px', 
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.8rem',

}