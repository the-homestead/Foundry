import type { HTMLAttributes, PropsWithChildren } from "react";
//
export function P(props: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) {
    return (
        <p className={`leading-7 not-first:mt-6${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </p>
    );
}
