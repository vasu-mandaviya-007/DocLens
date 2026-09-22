import useRipple from "../../hooks/useRipple.js";


export const MenuItem = ({ item, onDone }) => {

    const { ripples, bind } = useRipple((e) => {
        e.stopPropagation();
        item.action();
        onDone(); 
    }); 

    return (
        <li
            {...bind}
            onClick={(e) => e.stopPropagation()}
            className="relative overflow-hidden select-none w-full px-3 rounded-md hover:bg-dropdown-item-hover text-sm font-medium cursor-pointer"
        >
            <div className="relative z-10 flex items-center gap-3 min-h-12">
                {item.icon}
                <p className="antialiased">{item.label}</p>
            </div>

            {ripples.map((r) => (
                <span
                    key={r.id}
                    className="absolute rounded-full bg-current/40 pointer-events-none"
                    style={{
                        left: r.x,
                        top: r.y,
                        width: r.size,
                        height: r.size,
                        marginLeft: -r.size / 2,
                        marginTop: -r.size / 2,
                        transform: `scale(${r.active ? 1 : 0})`,
                        opacity: r.fading ? 0 : 0.25,
                        transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-out",
                    }}
                />
            ))}
        </li>
    );
}