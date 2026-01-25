import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function InlineCode(props: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
    return (
        <code className={`relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </code>
    );
}
