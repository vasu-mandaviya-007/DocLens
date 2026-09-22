// import React from "react";
// import { Grow, Zoom } from "@mui/material";


// export const dialogSx = {
//     '@keyframes toastifyBounceIn': {
//         '0%': { transform: 'scale3d(0.3, 0.3, 0.3)' },
//         '20%': { transform: 'scale3d(1.05, 1.05, 1.05)' },
//         '40%': { transform: 'scale3d(0.95, 0.95, 0.95)' },
//         '60%': { transform: 'scale3d(1.05, 1.05, 1.05)' },
//         '80%': { transform: 'scale3d(0.99, 0.99, 0.99)' },
//         '100%': { transform: 'scale3d(1, 1, 1)' },
//     },
//     '@keyframes fadeSlideDown': {
//         '0%': {
//             opacity: 0,
//             transform: 'translateY(-20px)'
//         },
//         '100%': {
//             opacity: 1,
//             transform: 'translateY(0)'
//         },
//     },
//     '@keyframes crispFadeScale': {
//         '0%': {
//             opacity: 0,
//             transform: 'scale(0.96) translateY(4px)'
//         },
//         '100%': {
//             opacity: 1,
//             transform: 'scale(1) translateY(0)'
//         },
//     },
//     '& .MuiDialog-paper': {
//         borderRadius: '15px',
//         backgroundImage: 'linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.06))',
//     },
//     '& .MuiBackdrop-root': {
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//         backdropFilter: 'blur(6px)',
//         transition: 'all 0.15s ease-out !important',
//     }
// };


// export const ZoomTransition = React.forwardRef((props, ref) => <Zoom ref={ref} {...props} />);


// export const GrowTransition = React.forwardRef(function Transition(props, ref) {
//     return <Grow style={{ transformOrigin: '0 0 0 0' }}
//         {...({ timeout: 1000 })} ref={ref} {...props} />;
// });

// export const CustomPopTransition = React.forwardRef(function Transition(props, ref) {
//     return (
//         <Zoom
//             ref={ref}
//             {...props}
//             timeout={{ enter: 400, exit: 250 }}
//             style={{
//                 transitionTimingFunction: 'cubic-bezier(0.34, 1.4, 0.64, 1)'
//             }}
//         />
//     );
// });


// /* ── Helpers ── */
// export const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// export const inputCls = 'w-full px-3 py-2.5 rounded-md border border-base-300 dark:border-base-700 bg-white dark:bg-base-800 text-[13px] text-base-900 dark:text-base-50 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/10 transition-all placeholder-base-400 dark:placeholder-base-400';

// export const labelCls = 'text-[11px] font-bold uppercase tracking-widest text-base-500 dark:text-base-500 mb-1.5 block';















import React from "react";
import { Grow, Zoom } from "@mui/material";

export const dialogSx = {
    '@keyframes toastifyBounceIn': {
        '0%': { transform: 'scale3d(0.3, 0.3, 0.3)' },
        '20%': { transform: 'scale3d(1.05, 1.05, 1.05)' },
        '40%': { transform: 'scale3d(0.95, 0.95, 0.95)' },
        '60%': { transform: 'scale3d(1.05, 1.05, 1.05)' },
        '80%': { transform: 'scale3d(0.99, 0.99, 0.99)' },
        '100%': { transform: 'scale3d(1, 1, 1)' },
    },
    '@keyframes fadeSlideDown': {
        '0%': { opacity: 0, transform: 'translateY(-20px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes crispFadeScale': {
        '0%': { opacity: 0, transform: 'scale(0.96) translateY(4px)' },
        '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
    },
    '& .MuiDialog-paper': {
        borderRadius: '18px',
        boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25)',
    },
    '& .MuiBackdrop-root': {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(6px)',
        transition: 'all 0.15s ease-out !important',
    }
};

export const ZoomTransition = React.forwardRef((props, ref) => <Zoom ref={ref} {...props} />);

// timeout 1000ms -> 220ms: modals ab instant/Apple-smooth khulte hain, sluggish nahi
export const GrowTransition = React.forwardRef(function Transition(props, ref) {
    return (
        <Grow
            style={{ transformOrigin: '0 0 0 0' }}
            timeout={220}
            ref={ref}
            {...props}
        />
    );
});

export const CustomPopTransition = React.forwardRef(function Transition(props, ref) {
    return (
        <Zoom
            ref={ref}
            {...props}
            timeout={{ enter: 220, exit: 150 }}
            style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.4, 0.64, 1)' }}
        />
    );
});

/* ── Helpers ── */
export const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

// NOTE: inputCls/labelCls neeche "base-*"/"accent-*" tokens use karte hain jo is
// app ke index.css @theme mein defined hi nahi hain (yahan surface-*/content-*/
// primary hain) — inka koi existing caller na mile toh in do lines ko update
// kar dena apne actual tokens ke hisaab se.
export const inputCls = 'w-full px-3 py-2.5 rounded-md border border-base-300 dark:border-base-700 bg-white dark:bg-base-800 text-[13px] text-base-900 dark:text-base-50 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/10 transition-all placeholder-base-400 dark:placeholder-base-400';

export const labelCls = 'text-[11px] font-bold uppercase tracking-widest text-base-500 dark:text-base-500 mb-1.5 block';