import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function H4(props: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
    return (
        <h4 className={`scroll-m-20 font-semibold text-xl tracking-tight${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </h4>
    );
}
