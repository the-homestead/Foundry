import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function H1(props: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
    return (
        <h1 className={`scroll-m-20 text-balance text-center font-extrabold text-4xl tracking-tight${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </h1>
    );
}
