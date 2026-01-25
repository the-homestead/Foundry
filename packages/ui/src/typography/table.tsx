type Align = "left" | "center" | "right";

interface TypographyTableProps {
    headers: React.ReactNode[];
    rows: React.ReactNode[][];
    align?: Align[]; // one per column
}

export function Table({ headers, rows, align = [] }: TypographyTableProps) {
    const baseCell = "border px-4 py-2 [[align=center]]:text-center [[align=right]]:text-right";
    const rowClass = "m-0 border-t p-0 even:bg-muted";

    const alignClass = (i: number) => {
        switch (align[i]) {
            case "center":
                return "text-center";
            case "right":
                return "text-right";
            default:
                return "text-left";
        }
    };

    return (
        <div className="my-6 w-full overflow-y-auto">
            <table className="w-full">
                <thead>
                    <tr className={rowClass}>
                        {headers.map((header, i) => {
                            const key = typeof header === "string" ? header : ((header as { key?: React.Key })?.key ?? `header-${i}`);
                            return (
                                <th className={`${baseCell} ${alignClass(i)} font-bold`} key={key}>
                                    {header}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, rIdx) => {
                        // Generate a stable key from the row contents
                        const rowKey = row.map((cell) => (typeof cell === "string" ? cell : ((cell as { key?: React.Key })?.key ?? ""))).join("|") || `row-${rIdx}`;
                        return (
                            <tr className={rowClass} key={rowKey}>
                                {row.map((cell, cIdx) => {
                                    const cellKey = typeof cell === "string" ? cell : ((cell as { key?: React.Key })?.key ?? `cell-${rIdx}-${cIdx}`);
                                    return (
                                        <td className={`${baseCell} ${alignClass(cIdx)}`} key={cellKey}>
                                            {cell}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
