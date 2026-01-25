import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function Small(props: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
    return (
        <small className={`font-medium leading-none text-sm${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </small>
    );
}
