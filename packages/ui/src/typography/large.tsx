import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function Large(props: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div className={`font-semibold text-lg${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </div>
    );
}
