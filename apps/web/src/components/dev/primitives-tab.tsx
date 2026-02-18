"use client";

import { Compare, Timeline } from "@foundry/ui/components";
import { GitHubStarsButton } from "@foundry/ui/components/github-stars";
import { BugAntIcon } from "@foundry/ui/components/icons/bug-ant";
import { CodeBlock, CodeCompare, CodeTabs, InlineCode, TerminalBlock } from "@foundry/ui/components/joly-ui/code-block";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@foundry/ui/primitives/accordion";
import { Alert, AlertDescription, AlertTitle } from "@foundry/ui/primitives/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@foundry/ui/primitives/alert-dialog";
import { AspectRatio } from "@foundry/ui/primitives/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@foundry/ui/primitives/avatar";
import { Badge } from "@foundry/ui/primitives/badge";
import { BentoGrid, BentoGridItem } from "@foundry/ui/primitives/bento-grid";
import { Button } from "@foundry/ui/primitives/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@foundry/ui/primitives/button-group";
import { Calendar } from "@foundry/ui/primitives/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { type ChartConfig, ChartContainer, ChartTooltipContent } from "@foundry/ui/primitives/chart";
import { Checkbox } from "@foundry/ui/primitives/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@foundry/ui/primitives/collapsible";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@foundry/ui/primitives/command";
import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@foundry/ui/primitives/context-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@foundry/ui/primitives/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@foundry/ui/primitives/drawer";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@foundry/ui/primitives/dropdown-menu";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@foundry/ui/primitives/empty";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@foundry/ui/primitives/field";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@foundry/ui/primitives/hover-card";
import { Input } from "@foundry/ui/primitives/input";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@foundry/ui/primitives/input-group";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@foundry/ui/primitives/input-otp";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle } from "@foundry/ui/primitives/item";
import { Kbd, KbdGroup } from "@foundry/ui/primitives/kbd";
import { Label } from "@foundry/ui/primitives/label";
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@foundry/ui/primitives/menubar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@foundry/ui/primitives/navigation-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@foundry/ui/primitives/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@foundry/ui/primitives/popover";
import { Progress } from "@foundry/ui/primitives/progress";
import { RadioGroup, RadioGroupItem } from "@foundry/ui/primitives/radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@foundry/ui/primitives/resizable";
// ScrollArea moved out of this layout (kept in primitives demo sections)
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Separator } from "@foundry/ui/primitives/separator";
import { ShareButton } from "@foundry/ui/primitives/share-button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@foundry/ui/primitives/sheet";
import { Skeleton } from "@foundry/ui/primitives/skeleton";
import { Slider } from "@foundry/ui/primitives/slider";
import { Spinner } from "@foundry/ui/primitives/spinner";
import { Spotlight as SpotlightEffect } from "@foundry/ui/primitives/spotlight";
import { Spotlight as SpotlightTwo } from "@foundry/ui/primitives/spotlight-two";
import { Switch } from "@foundry/ui/primitives/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { Toggle } from "@foundry/ui/primitives/toggle";
import { ToggleGroup, ToggleGroupItem } from "@foundry/ui/primitives/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@foundry/ui/primitives/tooltip";
// TooltipCard not used in the new BentoGrid layout
import { Vortex } from "@foundry/ui/primitives/vortex";
import type { ReactNode } from "react";
import { Area, AreaChart, CartesianGrid, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import type { BundledLanguage } from "shiki";
import { toast } from "sonner";
import { SectionHeader } from "./section-header";

export const primitiveGroups: { title: string; description: string; items: string[] }[] = [
    {
        title: "Form Controls",
        description: "Inputs, toggles, selects, radios, and sliders.",
        items: [
            "input",
            "textarea",
            "checkbox",
            "radio-group",
            "switch",
            "slider",
            "select",
            "button",
            "button-group",
            "input-group",
            "input-otp",
            "toggle",
            "toggle-group",
            "label",
            "field",
            "item",
            "kbd",
        ],
    },
    {
        title: "Feedback & Status",
        description: "Alerts, progress, skeletons, spinners, empty states, badges, and stats.",
        items: ["alert", "alert-dialog", "progress", "badge", "avatar", "skeleton", "spinner", "empty", "sonner", "stat"],
    },
    {
        title: "Navigation & Menus",
        description: "Accordions, tabs, menus, tooltips, and overlays.",
        items: [
            "accordion",
            "tabs",
            "breadcrumb",
            "navigation-menu",
            "menubar",
            "context-menu",
            "dropdown-menu",
            "popover",
            "tooltip",
            "tooltip-card",
            "hover-card",
            "dialog",
            "sheet",
            "drawer",
        ],
    },
    {
        title: "Data Display",
        description: "Tables, charts, pagination, calendars, and commands.",
        items: ["table", "chart", "pagination", "calendar", "command"],
    },
    {
        title: "Layout & Utilities",
        description: "Cards, separators, scroll, resizing, and layout helpers.",
        items: ["card", "separator", "scroll-area", "resizable", "carousel", "aspect-ratio", "bento-grid", "footer", "sidebar", "share-button", "mode-toggle"],
    },
    {
        title: "Motion & Visuals",
        description: "Motion-driven visuals, animated text, and spotlight effects.",
        items: ["encrypted-text", "sliding-number", "sparkles", "spotlight", "spotlight-two", "vortex", "particles"],
    },
];

const formatPrimitiveName = (name: string) => name.replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig;

const sampleChartData = [
    { name: "Mon", desktop: 420, mobile: 240 },
    { name: "Tue", desktop: 380, mobile: 200 },
    { name: "Wed", desktop: 430, mobile: 260 },
    { name: "Thu", desktop: 500, mobile: 300 },
    { name: "Fri", desktop: 470, mobile: 280 },
    { name: "Sat", desktop: 520, mobile: 320 },
    { name: "Sun", desktop: 480, mobile: 300 },
];

// Carousel removed from this layout (kept in primitives package); don't import here

const codeSample = `import { EncryptedText } from "@foundry/ui/primitives/encrypted-text";

export function HeroTitle() {
  return (
    <EncryptedText
      text="Built for motion-driven UI."
      className="text-2xl font-semibold"
    />
  );
}`;

const codeBlockData: { language: BundledLanguage; filename: string; code: string }[] = [
    {
        language: "tsx",
        filename: "hero-title.tsx",
        code: codeSample,
    },
];

// tags and small demo arrays removed — layout uses dynamic, content-sized rows now

const timelineEntries: { title: string; content: ReactNode }[] = [
    {
        title: "2023",
        content: (
            <div className="space-y-2 text-neutral-600 text-sm dark:text-neutral-300">
                <p>Set the first design tokens and component foundations.</p>
                <p>Introduced motion primitives for spotlight and tooltip effects.</p>
            </div>
        ),
    },
    {
        title: "2024",
        content: (
            <div className="space-y-2 text-neutral-600 text-sm dark:text-neutral-300">
                <p>Expanded the library with bento layouts and code presentation.</p>
                <p>Shipped the compare slider and encrypted text effects.</p>
            </div>
        ),
    },
    {
        title: "2025",
        content: (
            <div className="space-y-2 text-neutral-600 text-sm dark:text-neutral-300">
                <p>Added immersive motion backgrounds and global visualization.</p>
                <p>Timeline patterns now support richer storytelling.</p>
            </div>
        ),
    },
];

export function PrimitivesTab() {
    return (
        <>
            <SectionHeader
                description="Grouped, tile-first layout for quick scanning — use the grid to find what you need faster."
                title="Components"
                tooltip="Main content is laid out with a BentoGrid."
            />

            <BentoGrid className="mt-4 auto-rows-min gap-6 md:auto-rows-min">
                <BentoGridItem
                    className="md:col-span-2"
                    description={
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="font-medium text-sm">Text inputs</Label>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Input placeholder="Default input" />
                                    <Input disabled placeholder="Disabled" />
                                    <Input defaultValue="Hello world" placeholder="With value" />
                                    <Textarea placeholder="Textarea" rows={3} />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="font-medium text-sm">Choices</Label>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2">
                                        <Checkbox defaultChecked id="chk-1" label="Checkbox (Default) (Small)" size="sm" />
                                        <Checkbox defaultChecked id="chk-2" label="Checkbox (Destructive) (Default)" size="default" variant="destructive" />
                                        <Checkbox defaultChecked id="chk-3" label="Checkbox (Success) (Large)" size="lg" variant="success" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch defaultChecked id="swt-1" />
                                        <Label className="text-sm" htmlFor="swt-1">
                                            Switch
                                        </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label className="text-sm" htmlFor="sld-1">
                                            Slider
                                        </Label>
                                        <Slider className="w-48" defaultValue={[40]} id="sld-1" />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="font-medium text-sm">Buttons</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm">Default</Button>
                                    <Button size="sm" variant="secondary">
                                        Secondary
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        Outline
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                        Ghost
                                    </Button>
                                    <Button size="sm" variant="destructive">
                                        Destructive
                                    </Button>
                                    <Button size="sm" variant="link">
                                        Link
                                    </Button>
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                    <Button focusableWhenDisabled isLoading size="sm">
                                        <Spinner className="mr-2" />
                                        Saving
                                    </Button>
                                    <Button disabled size="sm">
                                        Saving (disabled)
                                    </Button>
                                </div>
                                <Separator />
                                <div className="flex h-10 flex-wrap gap-2">
                                    <GitHubStarsButton repo="animate-ui" username="imskyleen" />
                                    <Separator orientation="vertical" />
                                    <ShareButton data-urls={JSON.stringify({ facebook: "https://facebook.com", twitter: "https://twitter.com", linkedin: "https://linkedin.com" })}>
                                        Share
                                    </ShareButton>
                                </div>
                            </div>
                        </div>
                    }
                    title="Form Controls"
                />

                <BentoGridItem
                    description={
                        <div className="space-y-4">
                            <Alert>
                                <AlertTitle>Heads up</AlertTitle>
                                <AlertDescription>This is a neutral alert using the shared styles.</AlertDescription>
                            </Alert>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between font-medium text-sm">
                                    <span>Progress</span>
                                    <span className="text-muted-foreground">42%</span>
                                </div>
                                <Progress value={42} />
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarImage alt="Sample avatar" src="https://github.com/shadcn.png" />
                                    <AvatarFallback>SC</AvatarFallback>
                                </Avatar>
                                <Avatar>
                                    <AvatarFallback>AB</AvatarFallback>
                                </Avatar>
                                <Badge variant="secondary">Badge</Badge>
                            </div>

                            <Separator />

                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Spinner className="text-muted-foreground" />
                            </div>
                        </div>
                    }
                    title="Feedback"
                />

                <BentoGridItem
                    className="md:col-span-1"
                    description={
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <Accordion className="w-full" collapsible defaultValue="item-1" type="single">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>What’s inside?</AccordionTrigger>
                                        <AccordionContent>Accordion uses Radix primitives with our tokens and motion.</AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger>Reusable styles</AccordionTrigger>
                                        <AccordionContent>Slots and class merging keep things consistent.</AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>

                            <Separator orientation="vertical" />

                            <div className="flex-1">
                                <Card className="border-dashed">
                                    <CardHeader className="items-center text-center">
                                        <CardTitle className="text-base">Nested Card</CardTitle>
                                        <CardDescription>Cards compose padding, border, and typography.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-muted-foreground text-sm">This is a simple content block inside a card. Use it to test spacing and typography.</p>
                                        <div className="flex gap-2">
                                            <Button size="sm">Action</Button>
                                            <Button size="sm" variant="outline">
                                                Secondary
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    }
                    title="Structure"
                />

                <BentoGridItem
                    className="md:col-span-1"
                    description={
                        <div className="flex flex-wrap gap-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        Dropdown menu
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56">
                                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem>
                                            Profile<DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            Settings<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked>Show labels</DropdownMenuCheckboxItem>
                                    <DropdownMenuRadioGroup value="grid">
                                        <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        Popover
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="space-y-2">
                                    <p className="font-medium text-sm">Quick actions</p>
                                    <p className="text-muted-foreground text-xs">Popover content preview.</p>
                                </PopoverContent>
                            </Popover>

                            <HoverCard>
                                <HoverCardTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        Hover card
                                    </Button>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    <div className="space-y-1">
                                        <p className="font-medium text-sm">Hovered content</p>
                                        <p className="text-muted-foreground text-xs">Short profile preview.</p>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="sm" variant="outline">
                                        Tooltip
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Tooltip content</TooltipContent>
                            </Tooltip>
                        </div>
                    }
                    title="Inline menus"
                />

                <BentoGridItem
                    className="md:col-span-1"
                    description={
                        <div className="space-y-3">
                            <ContextMenu>
                                <ContextMenuTrigger className="flex h-12 items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
                                    Right-click here
                                </ContextMenuTrigger>
                                <ContextMenuContent className="w-56">
                                    <ContextMenuLabel>Context actions</ContextMenuLabel>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem>Duplicate</ContextMenuItem>
                                    <ContextMenuCheckboxItem checked>Pin to sidebar</ContextMenuCheckboxItem>
                                    <ContextMenuRadioGroup value="primary">
                                        <ContextMenuRadioItem value="primary">Primary</ContextMenuRadioItem>
                                        <ContextMenuRadioItem value="secondary">Secondary</ContextMenuRadioItem>
                                    </ContextMenuRadioGroup>
                                    <ContextMenuSeparator />
                                    <ContextMenuItem variant="destructive">
                                        Delete<ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>

                            <Separator />

                            <Menubar>
                                <MenubarMenu>
                                    <MenubarTrigger>File</MenubarTrigger>
                                    <MenubarContent>
                                        <MenubarItem>
                                            New tab<MenubarShortcut>⌘N</MenubarShortcut>
                                        </MenubarItem>
                                        <MenubarItem>Duplicate</MenubarItem>
                                        <MenubarSeparator />
                                        <MenubarCheckboxItem checked>Auto-save</MenubarCheckboxItem>
                                    </MenubarContent>
                                </MenubarMenu>
                            </Menubar>

                            <Separator />

                            <NavigationMenu>
                                <NavigationMenuList>
                                    <NavigationMenuItem>
                                        <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                                        <NavigationMenuContent>
                                            <div className="grid gap-2 p-3 sm:w-[260px]">
                                                <NavigationMenuLink>Design systems</NavigationMenuLink>
                                                <NavigationMenuLink>UI kits</NavigationMenuLink>
                                                <NavigationMenuLink>Templates</NavigationMenuLink>
                                            </div>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    }
                    title="Context & app nav"
                />

                <BentoGridItem
                    description={
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm" htmlFor="username">
                                    Username
                                </Label>
                                <InputGroup>
                                    <InputGroupAddon align="inline-start">
                                        <InputGroupText>@</InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupInput id="username" placeholder="username" />
                                </InputGroup>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="text-sm">One-time passcode</Label>
                                <InputOTP maxLength={6}>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Separator />

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm" htmlFor="region-select">
                                        Region
                                    </Label>
                                    <Select defaultValue="north">
                                        <SelectTrigger id="region-select">
                                            <SelectValue placeholder="Select region" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Region</SelectLabel>
                                                <SelectItem value="north">North America</SelectItem>
                                                <SelectItem value="europe">Europe</SelectItem>
                                                <SelectItem value="asia">Asia</SelectItem>
                                            </SelectGroup>
                                            <SelectSeparator />
                                            <SelectItem value="remote">Remote</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <RadioGroup defaultValue="option-1">
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem id="r-1" value="option-1" />
                                        <Label htmlFor="r-1">Option one</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RadioGroupItem id="r-2" value="option-2" />
                                        <Label htmlFor="r-2">Option two</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <Separator />

                            <div className="flex flex-wrap items-center gap-3">
                                <Toggle aria-label="Toggle italic" variant="outline">
                                    Italic
                                </Toggle>
                                <ToggleGroup defaultValue="left" type="single" variant="outline">
                                    <ToggleGroupItem value="left">Left</ToggleGroupItem>
                                    <ToggleGroupItem value="center">Center</ToggleGroupItem>
                                    <ToggleGroupItem value="right">Right</ToggleGroupItem>
                                </ToggleGroup>
                                <ButtonGroup>
                                    <Button size="sm" variant="outline">
                                        Draft
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        Publish
                                    </Button>
                                    <ButtonGroupSeparator orientation="vertical" />
                                    <ButtonGroupText>v1.4</ButtonGroupText>
                                </ButtonGroup>
                            </div>
                        </div>
                    }
                    title="Advanced Inputs"
                />

                <BentoGridItem
                    description={
                        <div className="space-y-6">
                            <FieldSet>
                                <FieldLegend>Profile settings</FieldLegend>
                                <FieldGroup>
                                    <Field orientation="responsive">
                                        <FieldLabel htmlFor="full-name">Full name</FieldLabel>
                                        <FieldContent>
                                            <Input id="full-name" placeholder="Jane Doe" />
                                            <FieldDescription>Shown on your public profile.</FieldDescription>
                                        </FieldContent>
                                    </Field>
                                    <Field orientation="responsive">
                                        <FieldTitle>Notifications</FieldTitle>
                                        <FieldContent>
                                            <Switch defaultChecked id="noti" />
                                            <FieldDescription>Send me weekly updates.</FieldDescription>
                                        </FieldContent>
                                    </Field>
                                </FieldGroup>
                            </FieldSet>

                            <Separator />

                            <ItemGroup>
                                <Item variant="outline">
                                    <ItemHeader>
                                        <ItemTitle>Active projects</ItemTitle>
                                        <Badge variant="outline">3</Badge>
                                    </ItemHeader>
                                    <ItemMedia variant="icon">PX</ItemMedia>
                                    <ItemContent>
                                        <ItemDescription>Keep track of active initiatives.</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </ItemActions>
                                </Item>
                                <ItemSeparator />
                                <Item>
                                    <ItemMedia variant="icon">QA</ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>Quality checks</ItemTitle>
                                        <ItemDescription>Run nightly build validations.</ItemDescription>
                                    </ItemContent>
                                </Item>
                            </ItemGroup>
                        </div>
                    }
                    title="Field & Item Layouts"
                />

                <BentoGridItem
                    description={
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm">Chart preview</Label>
                                <ChartContainer className="max-h-64" config={chartConfig}>
                                    <AreaChart data={sampleChartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip content={<ChartTooltipContent />} />
                                        <Area dataKey="desktop" fill="rgba(56,189,248,0.08)" stroke="var(--color-desktop)" type="monotone" />
                                        <Area dataKey="mobile" fill="rgba(99,102,241,0.06)" stroke="var(--color-mobile)" type="monotone" />
                                    </AreaChart>
                                </ChartContainer>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="text-sm">Table</Label>
                                <Table>
                                    <TableCaption>Recent deployments</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Owner</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Web</TableCell>
                                            <TableCell>Live</TableCell>
                                            <TableCell>Avery</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>API</TableCell>
                                            <TableCell>Queued</TableCell>
                                            <TableCell>Jules</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="text-sm">Pagination</Label>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious href="#" />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink href="#" isActive>
                                                1
                                            </PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationLink href="#">2</PaginationLink>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext href="#" />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </div>
                    }
                    title="Data Display"
                />

                <BentoGridItem
                    description={
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm">Aspect ratio</Label>
                                <AspectRatio className="overflow-hidden rounded-md border" ratio={16 / 9}>
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">16:9 Aspect Ratio</div>
                                </AspectRatio>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="text-sm">Resizable panels</Label>
                                <div className="h-24 overflow-hidden rounded-md border">
                                    <ResizablePanelGroup className="h-full">
                                        <ResizablePanel className="min-h-0" defaultSize={50}>
                                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Panel A</div>
                                        </ResizablePanel>
                                        <ResizableHandle withHandle />
                                        <ResizablePanel className="min-h-0" defaultSize={50}>
                                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Panel B</div>
                                        </ResizablePanel>
                                    </ResizablePanelGroup>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <Label className="text-sm">Keyboard hints</Label>
                                <div className="mt-2 flex h-5 flex-wrap items-center gap-3">
                                    <KbdGroup>
                                        <Kbd>⌘</Kbd>
                                        <span>+</span>
                                        <Kbd>K</Kbd>
                                    </KbdGroup>
                                    <Separator orientation="vertical" />
                                    <KbdGroup>
                                        <Kbd>⌘</Kbd>
                                        <Kbd>⇧</Kbd>
                                        <Kbd>⌥</Kbd>
                                        <Kbd>⌃</Kbd>
                                    </KbdGroup>
                                </div>
                            </div>
                        </div>
                    }
                    title="Layout & Utilities"
                />

                <BentoGridItem
                    description={
                        <Command className="rounded-md border">
                            <Label className="sr-only" htmlFor="command-search">
                                Command search
                            </Label>
                            <CommandInput id="command-search" placeholder="Search commands" />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    <CommandItem>
                                        Calendar<CommandShortcut>⌘C</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem>
                                        Settings<CommandShortcut>⌘S</CommandShortcut>
                                    </CommandItem>
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup heading="Actions">
                                    <CommandItem>Invite team</CommandItem>
                                    <CommandItem>New project</CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    }
                    title="Command Palette"
                />

                <BentoGridItem
                    description={
                        <div className="flex flex-wrap gap-3">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Dialog</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Dialog title</DialogTitle>
                                        <DialogDescription>Dialog body text goes here.</DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline">Cancel</Button>
                                        <Button>Continue</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline">Alert dialog</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm action</AlertDialogTitle>
                                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction>Confirm</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline">Sheet</Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Sheet title</SheetTitle>
                                        <SheetDescription>Quick context panel.</SheetDescription>
                                    </SheetHeader>
                                    <SheetFooter>
                                        <SheetClose asChild>
                                            <Button variant="outline">Close</Button>
                                        </SheetClose>
                                    </SheetFooter>
                                </SheetContent>
                            </Sheet>
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Button variant="outline">Drawer</Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                    <DrawerHeader>
                                        <DrawerTitle>Drawer title</DrawerTitle>
                                        <DrawerDescription>Additional details live here.</DrawerDescription>
                                    </DrawerHeader>
                                    <DrawerFooter>
                                        <DrawerClose asChild>
                                            <Button variant="outline">Close</Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>
                        </div>
                    }
                    title="Overlays"
                />

                {/* States: Calendar + Empty */}
                <BentoGridItem
                    description={
                        <div className="flex justify-center">
                            <Calendar initialFocus={false} mode="single" />
                        </div>
                    }
                    title="Calendar"
                />

                <BentoGridItem
                    description={
                        <div>
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">✦</EmptyMedia>
                                    <EmptyTitle>No projects yet</EmptyTitle>
                                    <EmptyDescription>Start by creating your first workspace.</EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button>New project</Button>
                                    <Button variant="outline">Import</Button>
                                </EmptyContent>
                            </Empty>
                        </div>
                    }
                    title="Empty State"
                />

                {/* Toggles & Helpers */}
                <BentoGridItem
                    className="md:col-span-1"
                    description={
                        <div>
                            <div className="text-muted-foreground text-sm">Reveal secondary content.</div>
                            <div className="mt-3">
                                <Collapsible defaultOpen>
                                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                        <span className="text-sm">Collapsible content</span>
                                        <CollapsibleTrigger asChild>
                                            <Button size="sm" variant="ghost">
                                                Toggle
                                            </Button>
                                        </CollapsibleTrigger>
                                    </div>
                                    <CollapsibleContent className="mt-2 rounded-md border border-dashed p-3 text-muted-foreground text-sm">
                                        This content is revealed when expanded.
                                    </CollapsibleContent>
                                </Collapsible>
                            </div>
                        </div>
                    }
                    title="Collapsible"
                />

                <BentoGridItem
                    className="md:col-span-1"
                    description={
                        <div className="space-y-3">
                            <ButtonGroup>
                                <Button size="sm" variant="outline">
                                    Today
                                </Button>
                                <Button size="sm" variant="outline">
                                    Week
                                </Button>
                                <Button size="sm" variant="outline">
                                    Month
                                </Button>
                            </ButtonGroup>
                            <Separator />
                            <p className="text-muted-foreground text-xs">Toast host is mounted at the app layout.</p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    className="w-fit"
                                    onClick={() =>
                                        toast("Event has been created", {
                                            description: "Monday, January 3rd at 6:00pm",
                                        })
                                    }
                                    variant="outline"
                                >
                                    Show Toast W/ Description
                                </Button>
                                <Button onClick={() => toast("Event has been created")} variant="outline">
                                    Default
                                </Button>
                                <Button onClick={() => toast.success("Event has been created")} variant="outline">
                                    Success
                                </Button>
                                <Button onClick={() => toast.info("Be at the area 10 minutes before the event time")} variant="outline">
                                    Info
                                </Button>
                                <Button onClick={() => toast.warning("Event start time cannot be earlier than 8am")} variant="outline">
                                    Warning
                                </Button>
                                <Button onClick={() => toast.error("Event has not been created")} variant="outline">
                                    Error
                                </Button>
                                <Button
                                    onClick={() =>
                                        toast("Debug: unexpected value encountered", {
                                            className: "debug",
                                            // show a longer duration so the progress bar is visible
                                            duration: 8000,
                                            action: {
                                                label: "Details",
                                                onClick: () => toast.info("Opened debug details"),
                                            },
                                            icon: <BugAntIcon size={18} />,
                                        })
                                    }
                                    variant="outline"
                                >
                                    Debug
                                </Button>
                                <Button
                                    onClick={() =>
                                        toast("Saved — you can undo this action", {
                                            action: {
                                                label: "Undo",
                                                onClick: () => toast("Undone", { icon: <BugAntIcon size={14} /> }),
                                            },
                                        })
                                    }
                                    variant="outline"
                                >
                                    With action
                                </Button>
                                <Button
                                    onClick={() =>
                                        toast("This message shows a duration bar", {
                                            duration: 10_000,
                                        })
                                    }
                                    variant="outline"
                                >
                                    With duration (10s)
                                </Button>
                                <Button onClick={() => toast("Solid theme", { className: "variant-solid" })} variant="outline">
                                    Theme — Solid
                                </Button>
                                <Button onClick={() => toast("Outline theme", { className: "variant-outline" })} variant="outline">
                                    Theme — Outline
                                </Button>
                                <Button onClick={() => toast("Subtle theme", { className: "variant-subtle" })} variant="outline">
                                    Theme — Subtle
                                </Button>
                                <Button
                                    onClick={() => {
                                        toast.promise<{ name: string }>(() => new Promise((resolve) => setTimeout(() => resolve({ name: "Event" }), 2000)), {
                                            loading: "Loading...",
                                            success: (data) => `${data.name} has been created`,
                                            error: "Error",
                                        });
                                    }}
                                    variant="outline"
                                >
                                    Promise
                                </Button>
                            </div>
                        </div>
                    }
                    title="Helpers"
                />

                {/* Motion & Media */}
                <BentoGridItem
                    className="md:col-span-2"
                    description={
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div>
                                <Label className="text-sm">Vortex Background</Label>
                                <Vortex className="flex h-full items-center justify-center" containerClassName="h-40 overflow-hidden rounded-md border mt-2">
                                    <div className="space-y-1 text-center">
                                        <p className="text-white/70 text-xs uppercase tracking-widest">Ambient</p>
                                        <p className="font-semibold text-white text-xl">Vortex Motion</p>
                                    </div>
                                </Vortex>

                                <div className="mt-6">
                                    <Label className="text-sm">Spotlight Sweep</Label>
                                    <div className="relative mt-2 h-40 overflow-hidden rounded-md border bg-neutral-950">
                                        <SpotlightEffect className="-top-20 left-0" fill="white" />
                                        <SpotlightTwo />
                                        <div className="relative z-10 flex h-full items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-white/70 text-xs uppercase tracking-widest">Focus</p>
                                                <p className="font-semibold text-white text-xl">Spotlight Layers</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm">Media & Code</Label>
                                <div className="mt-3">
                                    <Compare
                                        autoplay
                                        autoplayDuration={4500}
                                        className="h-40 w-full max-w-lg"
                                        firstImage="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                                        secondImage="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop"
                                    />
                                </div>

                                <div className="mt-6">
                                    <BentoGrid className="grid-cols-1 md:auto-rows-min md:grid-cols-3">
                                        <BentoGridItem
                                            description="Streamline reviews with smart comparisons."
                                            header={<div className="h-12 rounded-md bg-muted" />}
                                            icon={<Badge variant="outline">Flow</Badge>}
                                            title="Diff Insights"
                                        />
                                        <BentoGridItem
                                            description="Encrypted display for cinematic headlines."
                                            header={<div className="h-12 rounded-md bg-muted" />}
                                            icon={<Badge variant="outline">Motion</Badge>}
                                            title="Encrypted Text"
                                        />
                                        <BentoGridItem
                                            description="Glowing spotlight layers to frame hero content."
                                            header={<div className="h-12 rounded-md bg-muted" />}
                                            icon={<Badge variant="outline">Focus</Badge>}
                                            title="Spotlight"
                                        />
                                    </BentoGrid>
                                </div>
                            </div>
                        </div>
                    }
                    title="Motion & Media"
                />

                <BentoGridItem
                    className="md:col-span-3"
                    description={
                        <div className="flex flex-col items-start justify-center gap-4 rounded-md border p-4">
                            <section className="grid-row-2 grid">
                                <div className="mb-4 space-y-2">
                                    <h2>Simple TypeScript (copyable + downloadable)</h2>
                                    <CodeBlock
                                        caption="Basic TypeScript React component"
                                        code={"export default function Hello() {\n  return <div>Hello, world!</div>\n}\n"}
                                        copyable
                                        downloadable
                                        downloadFileName="ExampleComponent.tsx"
                                        language="tsx"
                                        showLineNumbers
                                        startingLineNumber={1}
                                        title="ExampleComponent.tsx"
                                    />
                                </div>
                                <div>
                                    <h2>Tabs (multiple files)</h2>
                                    <CodeTabs
                                        tabs={[
                                            { label: "app.tsx", language: "tsx", code: "export default function App(){\n  return <h1>App</h1>\n}" },
                                            { label: "styles.css", language: "css", code: "body {\n  margin: 0;\n  font-family: Inter, system-ui;\n}" },
                                            { label: "start.sh", language: "bash", code: "pnpm install\npm run dev" },
                                        ]}
                                    />
                                </div>
                            </section>

                            <section>
                                <h2>Line highlights & added/removed lines</h2>
                                <CodeCompare
                                    after={"function sum(a, b) {\n  // fix: use addition\n  return a + b;\n}\n"}
                                    afterTitle="After (fixed)"
                                    before={"function sum(a, b) {\n  return a - b;\n}\n"}
                                    beforeTitle="Before"
                                    language="javascript"
                                    showDiff
                                />
                            </section>

                            <section>
                                <h2>Typewriter animation + theme variants</h2>
                                <CodeBlock animation="typewriter" code={"const answer = 42;\nconsole.log(answer);"} language="javascript" theme="palenight" />
                            </section>

                            <section />

                            <section>
                                <h2>Terminal / Command demo</h2>
                                <TerminalBlock
                                    commands={[
                                        { command: "pnpm install", output: "packages installed" },
                                        { command: "pnpm dev", output: "local server running at http://localhost:3000" },
                                    ]}
                                    title="Shell"
                                />
                            </section>

                            <section>
                                <h2>Inline code</h2>
                                <p>
                                    Use <InlineCode>const x = 1;</InlineCode> inline for short snippets. You can also show different variants:{" "}
                                    <InlineCode variant="success">OK</InlineCode>, <InlineCode variant="warning">TODO</InlineCode>.
                                </p>
                            </section>

                            <section>
                                <h2>Advanced: wrap, collapsible, variants</h2>
                                <CodeBlock
                                    caption="Wrap + collapsible + gradient variant"
                                    code={
                                        "// long single line to demonstrate wrapping behavior and scroll behavior\nconst longLine = 'This is a very long line that should wrap when wrapLongLines is enabled — it contains lots of characters and should overflow the container to demonstrate the UI. We love tacos and cats out here, and are on a adventure of the life time to explore the universe.';"
                                    }
                                    collapsible
                                    defaultCollapsed={false}
                                    language="javascript"
                                    maxHeight="160px"
                                    showLineNumbers
                                    variant="gradient"
                                    wrapLongLines
                                />
                            </section>
                        </div>
                    }
                    title="Code sample"
                />

                {/* Storytelling / Timeline - full width */}
                <BentoGridItem
                    className="md:col-span-3"
                    description={
                        <div>
                            <div className="text-muted-foreground text-sm">Chronological storytelling for changelogs.</div>
                            <div className="mt-2 p-0">
                                <Timeline data={timelineEntries} />
                            </div>
                        </div>
                    }
                    title="Timeline"
                />
            </BentoGrid>
        </>
    );
}
