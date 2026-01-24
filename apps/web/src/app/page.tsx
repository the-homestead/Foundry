import { Separator } from "@foundry/ui/primitives/separator";
import { SidebarTrigger } from "@foundry/ui/primitives/sidebar";
import { SparklesCore } from "@foundry/ui/primitives/sparkles";
import { Breadcrumbs } from "@foundry/web/components/nav/breadcrumbs";

export default function Home() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
                    <Breadcrumbs rootLabel="Foundry" />
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex h-[40rem] w-full flex-col items-center justify-center overflow-hidden rounded-xlg bg-sidebar">
                    <h1 className="relative z-20 text-center font-bold text-3xl text-text md:text-7xl lg:text-9xl">Foundry</h1>
                    <div className="relative h-40 w-[40rem]">
                        {/* Gradients */}
                        <div className="absolute inset-x-20 top-0 h-[2px] w-3/4 bg-gradient-to-r from-transparent via-ctp-mauve-300 to-transparent blur-sm" />
                        <div className="absolute inset-x-20 top-0 h-px w-3/4 bg-gradient-to-r from-transparent via-ctp-mauve-300 to-transparent" />
                        <div className="absolute inset-x-60 top-0 h-[5px] w-1/4 bg-gradient-to-r from-transparent via-ctp-teal-500 to-transparent blur-sm" />
                        <div className="absolute inset-x-60 top-0 h-px w-1/4 bg-gradient-to-r from-transparent via-ctp-teal-500 to-transparent" />

                        {/* Core component */}
                        <SparklesCore background="transparent" className="h-full w-full" maxSize={3} minSize={0.6} particleColor="#cdd6f4" particleDensity={1200} />

                        {/* Radial Gradient to prevent sharp edges */}
                        <div className="absolute inset-0 h-full w-full bg-sidebar [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,#cba6f7)]" />
                    </div>
                </div>
            </div>
        </>
    );
}
