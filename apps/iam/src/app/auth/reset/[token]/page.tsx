// Server component wrapper to pass token into client form
import ResetClient from "./reset-client";

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <ResetClient token={token} />;
}
