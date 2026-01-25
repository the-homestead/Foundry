import type { HTMLAttributes, LiHTMLAttributes } from "react";

export function List(props: HTMLAttributes<HTMLUListElement> | HTMLAttributes<HTMLOListElement>) {
    // ReactMarkdown will call this for both ul and ol, so infer from 'props' which tag to use
    function isOlProps(p: unknown): p is React.OlHTMLAttributes<HTMLOListElement> {
        return typeof p === "object" && p !== null && ("type" in p || "reversed" in p || "start" in p);
    }
    const isOrdered = isOlProps(props);
    const Tag = isOrdered ? "ol" : "ul";
    const baseClass = "my-6 ml-6 [&>li]:mt-2";
    const listStyle = isOrdered ? "list-decimal" : "list-disc";
    const { className, children, ...rest } = props;
    return (
        <Tag className={`${baseClass} ${listStyle}${className ? ` ${className}` : ""}`} {...rest}>
            {children}
        </Tag>
    );
}
List.Item = function ListItem(props: LiHTMLAttributes<HTMLLIElement>) {
    return <li {...props}>{props.children}</li>;
};
