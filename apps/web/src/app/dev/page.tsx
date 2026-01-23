"use client";

import { getIconList } from "@foundry/ui/icons";
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@foundry/ui/primitives/breadcrumb";
import { Button } from "@foundry/ui/primitives/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@foundry/ui/primitives/button-group";
import { Calendar } from "@foundry/ui/primitives/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@foundry/ui/primitives/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@foundry/ui/primitives/carousel";
import { type ChartConfig, ChartContainer } from "@foundry/ui/primitives/chart";
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
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
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@foundry/ui/primitives/menubar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@foundry/ui/primitives/navigation-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@foundry/ui/primitives/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "@foundry/ui/primitives/popover";
import { Progress } from "@foundry/ui/primitives/progress";
import { RadioGroup, RadioGroupItem } from "@foundry/ui/primitives/radio-group";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@foundry/ui/primitives/resizable";
import { ScrollArea } from "@foundry/ui/primitives/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@foundry/ui/primitives/select";
import { Separator } from "@foundry/ui/primitives/separator";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@foundry/ui/primitives/sheet";
import { Skeleton } from "@foundry/ui/primitives/skeleton";
import { Slider } from "@foundry/ui/primitives/slider";
import { Spinner } from "@foundry/ui/primitives/spinner";
import { Switch } from "@foundry/ui/primitives/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundry/ui/primitives/tabs";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { Toggle } from "@foundry/ui/primitives/toggle";
import { ToggleGroup, ToggleGroupItem } from "@foundry/ui/primitives/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@foundry/ui/primitives/tooltip";
import { useMemo, useState } from "react";

type IconGroup = Record<string, ReturnType<typeof getIconList>>;

const primitiveGroups: { title: string; description: string; items: string[] }[] = [
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
            "label",
            "field",
            "item",
            "kbd",
        ],
    },
    {
        title: "Feedback",
        description: "Alerts, progress, skeletons, spinners, empty states, badges, and avatars.",
        items: ["alert", "progress", "badge", "avatar", "skeleton", "spinner", "empty", "sonner"],
    },
    {
        title: "Structure & Navigation",
        description: "Accordions, tabs, menus, overlays, and layout primitives.",
        items: [
            "accordion",
            "card",
            "tabs",
            "breadcrumb",
            "navigation-menu",
            "menubar",
            "context-menu",
            "dropdown-menu",
            "popover",
            "tooltip",
            "dialog",
            "sheet",
            "drawer",
            "separator",
            "scroll-area",
            "resizable",
            "carousel",
            "aspect-ratio",
        ],
    },
    {
        title: "Data Display",
        description: "Tables, charts, pagination, calendars, commands, and selection.",
        items: ["table", "chart", "pagination", "calendar", "command", "radio-group", "select"],
    },
];

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

const carouselSlides = ["Slide 1", "Slide 2", "Slide 3"];

function groupIcons(icons: ReturnType<typeof getIconList>): IconGroup {
    return icons.reduce<IconGroup>((acc, icon) => {
        const category = (icon.keywords?.[0] ?? "general").replace(/-/g, " ");
        const bucket = acc[category] ?? [];
        bucket.push(icon);
        acc[category] = bucket;
        return acc;
    }, {});
}

export default function DevShowcasePage() {
    const [iconQuery, setIconQuery] = useState("");

    const icons = useMemo(() => getIconList(), []);
    const filteredIcons = useMemo(() => {
        if (!iconQuery.trim()) {
            return icons;
        }

        const term = iconQuery.toLowerCase();
        return icons.filter((icon) => icon.name.toLowerCase().includes(term) || icon.keywords.some((keyword) => keyword.toLowerCase().includes(term)));
    }, [iconQuery, icons]);

    const groupedIcons = useMemo(() => groupIcons(filteredIcons), [filteredIcons]);

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">UI Development</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Tabs className="flex flex-1 flex-col gap-4" defaultValue="primitives">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <TabsList className="bg-muted">
                            <TabsTrigger value="primitives">Primitives</TabsTrigger>
                            <TabsTrigger value="icons">Icons</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Badge variant="outline">Primitives: {primitiveGroups.reduce((sum, group) => sum + group.items.length, 0)}</Badge>
                            <Badge variant="outline">Icons: {icons.length}</Badge>
                        </div>
                    </div>

                    <TabsContent className="space-y-6" value="primitives">
                        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Form Controls</CardTitle>
                                    <CardDescription>Quick tour of common inputs and states.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <div className="space-y-2">
                                        <Label className="font-medium text-sm">Text inputs</Label>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <Input placeholder="Default input" />
                                            <Input disabled placeholder="Disabled" />
                                            <Input defaultValue="Hello world" placeholder="With value" />
                                            <Textarea placeholder="Textarea" rows={3} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-medium text-sm">Choices</Label>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2">
                                                <Checkbox defaultChecked id="chk-1" />
                                                <Label className="text-sm" htmlFor="chk-1">
                                                    Checkbox
                                                </Label>
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
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Feedback</CardTitle>
                                    <CardDescription>Inline alerts, progress, and avatars.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <AlertTitle>Heads up</AlertTitle>
                                        <AlertDescription>This is a neutral alert using the shared styles.</AlertDescription>
                                    </Alert>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between font-medium text-sm">
                                            <span>Progress</span>
                                            <span className="text-muted-foreground">42%</span>
                                        </div>
                                        <Progress value={42} />
                                    </div>
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
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-32" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                        <Spinner className="text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Structure</CardTitle>
                                <CardDescription>Accordion and card compositions.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
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

                                <Card className="border-dashed">
                                    <CardHeader>
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
                            </CardContent>
                        </Card>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Menus & Triggers</CardTitle>
                                    <CardDescription>Menus, popovers, and hover content.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                                        Profile
                                                        <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        Settings
                                                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuCheckboxItem checked>Show labels</DropdownMenuCheckboxItem>
                                                <DropdownMenuRadioGroup value="grid">
                                                    <DropdownMenuRadioItem value="grid">Grid</DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="list">List</DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>More tools</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem>Automations</DropdownMenuItem>
                                                        <DropdownMenuItem>Shortcuts</DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
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
                                                Delete
                                                <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                                            </ContextMenuItem>
                                        </ContextMenuContent>
                                    </ContextMenu>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Menus & Navigation</CardTitle>
                                    <CardDescription>Menubar and navigation menu samples.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Menubar>
                                        <MenubarMenu>
                                            <MenubarTrigger>File</MenubarTrigger>
                                            <MenubarContent>
                                                <MenubarItem>
                                                    New tab
                                                    <MenubarShortcut>⌘N</MenubarShortcut>
                                                </MenubarItem>
                                                <MenubarItem>Duplicate</MenubarItem>
                                                <MenubarSeparator />
                                                <MenubarCheckboxItem checked>Auto-save</MenubarCheckboxItem>
                                                <MenubarSeparator />
                                                <MenubarRadioGroup value="personal">
                                                    <MenubarRadioItem value="personal">Personal</MenubarRadioItem>
                                                    <MenubarRadioItem value="team">Team</MenubarRadioItem>
                                                </MenubarRadioGroup>
                                            </MenubarContent>
                                        </MenubarMenu>
                                        <MenubarMenu>
                                            <MenubarTrigger>View</MenubarTrigger>
                                            <MenubarContent>
                                                <MenubarItem>Zoom in</MenubarItem>
                                                <MenubarItem>Zoom out</MenubarItem>
                                            </MenubarContent>
                                        </MenubarMenu>
                                    </Menubar>

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
                                            <NavigationMenuItem>
                                                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                                                <NavigationMenuContent>
                                                    <div className="grid gap-2 p-3 sm:w-[260px]">
                                                        <NavigationMenuLink>Docs</NavigationMenuLink>
                                                        <NavigationMenuLink>Guides</NavigationMenuLink>
                                                        <NavigationMenuLink>Support</NavigationMenuLink>
                                                    </div>
                                                </NavigationMenuContent>
                                            </NavigationMenuItem>
                                        </NavigationMenuList>
                                    </NavigationMenu>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Advanced Inputs</CardTitle>
                                    <CardDescription>Grouped inputs, selects, and toggles.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Field & Item Layouts</CardTitle>
                                    <CardDescription>Structured form fields and item lists.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Data Display</CardTitle>
                                    <CardDescription>Tables, charts, and pagination.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Chart preview</Label>
                                        <ChartContainer className="max-h-64" config={chartConfig}>
                                            <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
                                                Chart preview
                                            </div>
                                        </ChartContainer>
                                    </div>

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
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Layout & Utilities</CardTitle>
                                    <CardDescription>Containers, scroll, and helpers.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-sm">Aspect ratio</Label>
                                        <AspectRatio className="overflow-hidden rounded-md border" ratio={16 / 9}>
                                            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-sm">16:9 Aspect Ratio</div>
                                        </AspectRatio>
                                    </div>

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

                                    <div className="space-y-2">
                                        <Label className="text-sm">Carousel</Label>
                                        <Carousel className="max-w-xs">
                                            <CarouselContent>
                                                {carouselSlides.map((label) => (
                                                    <CarouselItem key={label}>
                                                        <Card className="border-dashed">
                                                            <CardContent className="flex h-28 items-center justify-center">{label}</CardContent>
                                                        </Card>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Scroll area</Label>
                                        <ScrollArea className="h-28 rounded-md border p-3">
                                            <div className="space-y-2 text-sm">
                                                <p>Scrollable content preview.</p>
                                                <p>Use ScrollArea to constrain long text.</p>
                                                <p>Maintain consistent spacing.</p>
                                                <p>Keep key actions visible.</p>
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Keyboard hints</Label>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <KbdGroup>
                                                <Kbd>⌘</Kbd>
                                                <Kbd>K</Kbd>
                                            </KbdGroup>
                                            <Separator className="h-4" orientation="vertical" />
                                            <Kbd>Shift</Kbd>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Command Palette</CardTitle>
                                    <CardDescription>Command menu composition.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Command className="rounded-md border">
                                        <Label className="sr-only" htmlFor="command-search">
                                            Command search
                                        </Label>
                                        <CommandInput id="command-search" placeholder="Search commands" />
                                        <CommandList>
                                            <CommandEmpty>No results found.</CommandEmpty>
                                            <CommandGroup heading="Suggestions">
                                                <CommandItem>
                                                    Calendar
                                                    <CommandShortcut>⌘C</CommandShortcut>
                                                </CommandItem>
                                                <CommandItem>
                                                    Settings
                                                    <CommandShortcut>⌘S</CommandShortcut>
                                                </CommandItem>
                                            </CommandGroup>
                                            <CommandSeparator />
                                            <CommandGroup heading="Actions">
                                                <CommandItem>Invite team</CommandItem>
                                                <CommandItem>New project</CommandItem>
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Overlays</CardTitle>
                                    <CardDescription>Dialogs, sheets, drawers, and alerts.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-3">
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
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Calendar & Empty States</CardTitle>
                                <CardDescription>Dates and empty state layout.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-[auto_1fr]">
                                <Calendar mode="single" />
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Toggles & Helpers</CardTitle>
                                <CardDescription>Collapsible sections and helper UI.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
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
                                    <p className="text-muted-foreground text-xs">Toast host is mounted at the app layout.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent className="space-y-4" value="icons">
                        <Card>
                            <CardHeader className="space-y-3">
                                <CardTitle className="text-base">Icon Library</CardTitle>
                                <CardDescription>Search and browse every animated icon exposed by @foundry/ui.</CardDescription>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="w-full md:max-w-sm">
                                        <Label className="sr-only" htmlFor="icon-search">
                                            Search icons
                                        </Label>
                                        <Input
                                            className="w-full"
                                            id="icon-search"
                                            onChange={(event) => setIconQuery(event.target.value)}
                                            placeholder="Search by name or keyword"
                                            value={iconQuery}
                                        />
                                    </div>
                                    <Badge variant="secondary">Showing {filteredIcons.length}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[70vh] pr-4">
                                    <div className="space-y-8">
                                        {Object.entries(groupedIcons)
                                            .sort(([a], [b]) => a.localeCompare(b))
                                            .map(([category, iconsInGroup]) => (
                                                <div className="space-y-3" key={category}>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-sm capitalize">{category}</h3>
                                                        <Separator className="flex-1" />
                                                        <Badge variant="outline">{iconsInGroup.length}</Badge>
                                                    </div>
                                                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                                        {iconsInGroup.map((icon) => {
                                                            const IconComponent = icon.icon;
                                                            return (
                                                                <Card className="border-dashed" key={icon.name}>
                                                                    <CardContent className="flex items-center justify-between gap-3 py-4">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="font-medium text-sm capitalize">{icon.name.replace(/-/g, " ")}</span>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {icon.keywords.slice(0, 2).map((keyword) => (
                                                                                    <Badge className="text-[11px] capitalize" key={keyword} variant="outline">
                                                                                        {keyword.replace(/-/g, " ")}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
                                                                            <IconComponent size={32} />
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
