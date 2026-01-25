import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function H3(props: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
    return (
        <h3 className={`scroll-m-20 font-semibold text-2xl tracking-tight${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </h3>
    );
}
