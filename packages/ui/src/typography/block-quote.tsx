import type { BlockquoteHTMLAttributes, PropsWithChildren } from "react";
//
export function BlockQuote(props: PropsWithChildren<BlockquoteHTMLAttributes<HTMLQuoteElement>>) {
    return (
        <blockquote className={`mt-6 border-l-2 italic pl-6${props.className ? ` ${props.className}` : ""}`} {...props}>
            {props.children}
        </blockquote>
    );
}
