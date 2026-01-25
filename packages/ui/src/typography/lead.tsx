import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function Lead(props: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
    return (
        <p className={`text-muted-foreground text-xl${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </p>
    );
}
