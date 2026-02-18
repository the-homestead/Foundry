"use server";

import SidebarClient from "./sidebar.client";

// biome-ignore lint/suspicious/useAwait: <TBD>
export default async function SidebarServer() {
    return <SidebarClient />;
}
