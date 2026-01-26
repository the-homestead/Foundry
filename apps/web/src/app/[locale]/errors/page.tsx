import { H1, P } from "@foundry/ui/typography/index";

const COMMON = [400, 401, 403, 404, 408, 429, 500, 501, 502, 503, 504];

export default function ErrorsIndex() {
    return (
        <div className="p-8">
            <H1 className="mb-4">Error pages</H1>
            <P className="mb-4 text-neutral-500">Browse example error pages used for testing and debugging.</P>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {COMMON.map((code) => (
                    <li key={code}>
                        <a className="block rounded-md border px-3 py-2 text-center hover:bg-neutral-50" href={`/errors/${code}`}>
                            {code}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
