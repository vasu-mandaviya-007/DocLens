import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

const OPTIONS = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
];

const ThemeToggle = () => {

    const { theme, setTheme } = useTheme(); 

    return (
        <div className="h-10 flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1">
            {OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                    key={value}
                    onClick={() => setTheme(value)}
                    aria-label={label}
                    title={label}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${theme === value
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        }`}
                >
                    <Icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}

export default ThemeToggle;

















// import { Sun, Moon, Monitor } from "lucide-react";
// import { useTheme } from "../context/ThemeContext.jsx";

// const OPTIONS = [
//     { value: "light", label: "Light", icon: Sun },
//     { value: "dark", label: "Dark", icon: Moon },
//     { value: "system", label: "System", icon: Monitor },
// ];

// const ThemeToggle = () => {
//     const { theme, setTheme } = useTheme();

//     return (
//         <div className="flex items-center gap-0.5 rounded-lg bg-surface-emphasized p-0.5">
//             {OPTIONS.map(({ value, label, icon: Icon }) => (
//                 <button
//                     key={value}
//                     type="button"
//                     onClick={() => setTheme(value)}
//                     aria-label={label}
//                     aria-pressed={theme === value}
//                     title={label}
//                     className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 ${theme === value
//                         ? "bg-surface-default text-content-default shadow-sm"
//                         : "text-content-deemphasized hover:text-content-default"
//                         }`}
//                 >
//                     <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
//                 </button>
//             ))}
//         </div>
//     );
// };

// export default ThemeToggle;