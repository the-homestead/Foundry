import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function Muted(props: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
    return (
        <p className={`text-sm text-muted-foreground${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </p>
    );
}
