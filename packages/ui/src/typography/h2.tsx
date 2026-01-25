import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function H2(props: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) {
    return (
        <h2 className={`scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </h2>
    );
}
