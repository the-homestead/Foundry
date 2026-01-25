import { Badge } from "@foundry/ui/primitives/badge";
import { Separator } from "@foundry/ui/primitives/separator";
import { SidebarTrigger } from "@foundry/ui/primitives/sidebar";
import { Breadcrumbs } from "@foundry/web/components/nav/breadcrumbs";
import { ProjectHeader } from "./project-header";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectTabs } from "./project-tabs";

// Mock project data (replace with Project type later)
const project = {
    title: "ReLUX (Lighting Redux - Accurate Lighting - AIO)",
    game: "Cyberpunk 2077",
    summary:
        "Lighting redux! Bringing back the lighting that should have been with accurate emission from each source, removed fake GI bounces and random sources to bring a more grounded look to Night City. Yes, it removes artistic vision.",
    version: "2.1.1",
    updated: "April 28, 2025",
    downloads: "2,112,346",
    views: "982,130",
    rating: "4.8",
    compatibility: {
        status: "Playable",
        notes: "Tested on Steam build with F4SE 0.7.0. Supports ultrawide and controller layouts.",
        matrix: [
            { label: "Windows", value: 0.92 },
            { label: "Steam Deck", value: 0.81 },
            { label: "Linux (Proton)", value: 0.73 },
        ],
    },
    description: {
        content: `
:dog: :+1:
:badge[New]
:badge-a
:badge-v
:badge-v
:badge[Success]{style="color: black; background-color: #aaf233"}

:::image-a{href="https://github.com/lin-stephanie/remark-directive-sugar"}
![](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

:::image-div
![](https://i.imgur.com/BlfRJLP.png)
:::
![](https://i.imgur.com/OdEXGzJ.png)
![](https://i.imgur.com/u6fW3Sy.png)
ReLUX redefines level design lighting with a focus on realism and immersion, removes fake lights and baked global illumination, replacing them with carefully placed light sources that enhance the natural feel of the environment. Emissive lights have been added to all fast travel points in the game, ensuring they are properly illuminated and visually distinct. This project will continue to evolve, with future updates planned to expand emissive lighting to additional locations. ReLUX complements Nova City 2.0 by elevating the visual experience through thoughtful and handcrafted lighting design.
![](https://i.imgur.com/U7L7r1i.png)
![](https://i.imgur.com/ZjRSK9n.png)
![](https://i.imgur.com/v7CwOo2.png)
Path Tracing Accessibility: This mod was designed specifically with path tracing in mind, harnessing its capabilities to create visuals that are immersive and true to life. I understand that not everyone has access to the hardware required to fully experience path tracing, and that's perfectly okay. While ReLUX may still function in RT or raster modes, these are not its primary focus, and any issues arising in those modes won’t be addressed simply due to time restrictions. It is what it is, but I hope that regardless of your setup, you’ll still find enjoyment in the creativity and enhancements this mod offers.
UPDATES:
Changes will be provided as modular downloads before I update the AIO and mostly on a per-mission basis, aside from global tweaks like fast travel points:
![](https://i.imgur.com/vnP7yDO.png)
Click image below to see video comparison: 
![](https://i.imgur.com/IpY7k4t.jpeg)
---------
Huge thank you to Wheeze for World Builder and psiberx for RedHotTools!
`,
    },
    files: [
        {
            name: "ReLUX",
            version: "2.1.1",
            size: "120 KB",
            uploaded: "April 28, 2025",
            downloads: "1,234,567",
            uniqueDownloads: "856,789",
            channel: "main",
            lastDownloaded: "Jan 05, 2026",
            bannerURL: "https://i.imgur.com/JzaLsXC.png",
            dependencies: [
                {
                    url: "https://www.nexusmods.com/cyberpunk2077/mods/25845",
                    name: "ReImagined",
                    version: "1.3.0",
                    gameVersion: "2.31",
                },
            ],
        },
        {
            name: "ReLUX - Afterlife",
            version: "2.0.1a",
            size: "20 KB",
            uploaded: "April 28, 2025",
            downloads: "234,567",
            uniqueDownloads: "56,789",
            channel: "opt",
            lastDownloaded: "Jan 05, 2026",
            bannerURL: "https://i.imgur.com/iaYv7cL.png",
        },
    ],
};
const fileTree = [
    {
        id: "root",
        name: "relux-2.1.1.zip",
        children: [
            {
                id: "data",
                name: "Data/",
                children: [
                    { id: "plugin", name: "ReLUX.esl" },
                    { id: "textures", name: "Textures/", children: [{ id: "hud", name: "hud_overlay.dds" }] },
                ],
            },
            { id: "readme", name: "README.md" },
        ],
    },
];
// Mock Gantt data
const ganttFeatures = [
    {
        id: "1",
        name: "HUD bugfix",
        startAt: new Date("2026-01-10"),
        endAt: new Date("2026-01-20"),
        status: { id: "open", name: "Open", color: "hsl(var(--chart-1))" },
        lane: "Issues",
    },
    {
        id: "2",
        name: "UI polish",
        startAt: new Date("2026-01-15"),
        endAt: new Date("2026-01-25"),
        status: { id: "in-progress", name: "In Progress", color: "hsl(var(--chart-2))" },
        lane: "Issues",
    },
    {
        id: "3",
        name: "Release prep",
        startAt: new Date("2026-01-22"),
        endAt: new Date("2026-01-28"),
        status: { id: "closed", name: "Closed", color: "hsl(var(--chart-3))" },
        lane: "Issues",
    },
];
const ganttMarkers = [
    { id: "m1", label: "Beta", date: new Date("2026-01-12") },
    { id: "m2", label: "Release", date: new Date("2026-01-28") },
];

// Mock Kanban data
const kanbanColumns = [
    { id: "open", name: "Open" },
    { id: "in-progress", name: "In Progress" },
    { id: "closed", name: "Closed" },
];
const kanbanCards = [
    { id: "k1", name: "HUD overlap on 4:3", column: "open" },
    { id: "k2", name: "F4SE toggle not persisting", column: "in-progress" },
    { id: "k3", name: "Polish icons", column: "closed" },
];
// Mock files and file tree
const files = [
    {
        name: "vault-tec-hud-0.9.3-beta.zip",
        version: "0.9.3-beta",
        size: "42.1 MB",
        uploaded: "Jan 12, 2026",
        downloads: "24,182",
        channel: "Latest",
    },
    {
        name: "vault-tec-hud-0.9.2.zip",
        version: "0.9.2",
        size: "39.4 MB",
        uploaded: "Dec 28, 2025",
        downloads: "58,944",
        channel: "Stable",
    },
    {
        name: "vault-tec-hud-legacy-0.8.6.zip",
        version: "0.8.6",
        size: "34.7 MB",
        uploaded: "Oct 03, 2025",
        downloads: "45,294",
        channel: "Legacy",
    },
];

const gallery = [
    { title: "Radiant Night", tone: "from-ctp-mauve-400 to-ctp-blue-400", aspect: 16 / 9 },
    { title: "Scanner Overlay", tone: "from-ctp-sapphire-400 to-ctp-sky-300", aspect: 4 / 3 },
    { title: "Minimal HUD", tone: "from-ctp-green-400 to-ctp-teal-400", aspect: 21 / 9 },
    { title: "Power Armor", tone: "from-ctp-yellow-400 to-ctp-rosewater-400", aspect: 16 / 9 },
];

const posts = [
    {
        title: "Beta 0.9.3: new visor layers",
        date: "Jan 12, 2026",
        excerpt: "Introduced layered visor stack, improved colorblind presets, and stabilized animation timings.",
        comments: 38,
    },
    {
        title: "Holiday patch and roadmap",
        date: "Dec 18, 2025",
        excerpt: "Performance gains for ultrawide users plus a Q1 roadmap for co-op telemetry overlays.",
        comments: 22,
    },
];

const issueTemplates = [
    { title: "Bug report", description: "Steps, expected vs actual, logs, load order." },
    { title: "Compatibility", description: "Game build, platform, mod list, reproduction clip." },
];

// Timeline activity
const activity = [
    { title: "Release 0.9.3-beta", detail: "Pushed new animation set and Steam Deck profile.", time: "Today", metric: "+1,420 downloads" },
    { title: "Page updated", detail: "Refined markdown guide and added co-op preview section.", time: "Yesterday", metric: "12 edits" },
    { title: "New gallery upload", detail: "Added Power Armor preview shots.", time: "Jan 15", metric: "4 assets" },
    { title: "Milestone", detail: "Crossed 125k total downloads.", time: "Jan 10", metric: "125,000 total" },
];

// Timeline entries
const timelineEntries = activity.map((item) => ({
    title: item.title,
    content: (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Badge variant="outline">{item.time}</Badge>
                <span className="font-semibold">{item.title}</span>
            </div>
            <p className="text-muted-foreground text-sm">{item.detail}</p>
            <span className="text-muted-foreground text-sm">{item.metric}</span>
        </div>
    ),
}));
const links = [
    { label: "Homepage", href: "#" },
    { label: "Discord", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Documentation", href: "#" },
];

const creators = [
    { name: "Nova", role: "Lead", avatar: "https://i.pravatar.cc/80?img=8" },
    { name: "Kiln", role: "UI Motion", avatar: "https://i.pravatar.cc/80?img=12" },
    { name: "Rhea", role: "QA", avatar: "https://i.pravatar.cc/80?img=16" },
];

export default function ProjectPage() {
    // Stub functions for demo

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator className="mr-2 data-[orientation=vertical]:h-4" orientation="vertical" />
                    <Breadcrumbs labelMap={{ project: "Project" }} rootLabel="Projects" />
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_360px]">
                    <div className="space-y-4">
                        <ProjectHeader project={project} />
                        <ProjectTabs
                            files={files}
                            fileTree={fileTree}
                            gallery={gallery}
                            ganttFeatures={ganttFeatures}
                            ganttMarkers={ganttMarkers}
                            issueTemplates={issueTemplates}
                            kanbanCards={kanbanCards}
                            kanbanColumns={kanbanColumns}
                            posts={posts}
                            project={project}
                            timelineEntries={timelineEntries}
                        />
                    </div>
                    <ProjectSidebar creators={creators} links={links} project={project} />
                </div>
            </div>
        </>
    );
}
