"use client";

import {
    CodeBlock,
    CodeBlockBody,
    CodeBlockContent,
    CodeBlockCopyButton,
    CodeBlockFilename,
    CodeBlockFiles,
    CodeBlockHeader,
    CodeBlockItem,
    CodeBlockSelect,
    CodeBlockSelectContent,
    CodeBlockSelectItem,
    CodeBlockSelectTrigger,
    CodeBlockSelectValue,
    Compare,
    Timeline,
} from "@foundry/ui/components";
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
import { EncryptedText } from "@foundry/ui/primitives/encrypted-text";
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
import { Spotlight as SpotlightEffect } from "@foundry/ui/primitives/spotlight";
import { Spotlight as SpotlightTwo } from "@foundry/ui/primitives/spotlight-two";
import { Switch } from "@foundry/ui/primitives/switch";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@foundry/ui/primitives/table";
import { Textarea } from "@foundry/ui/primitives/textarea";
import { Toggle } from "@foundry/ui/primitives/toggle";
import { ToggleGroup, ToggleGroupItem } from "@foundry/ui/primitives/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@foundry/ui/primitives/tooltip";
import { Tooltip as TooltipCard } from "@foundry/ui/primitives/tooltip-card";
import { Vortex } from "@foundry/ui/primitives/vortex";
import { Fragment, type ReactNode } from "react";
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

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

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
            <SectionHeader description="Core inputs, feedback, and surface components." title="Foundations" tooltip="Grouped to keep the overview readable." />
            <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
                <Card>
                    <CardHeader className="items-center text-center">
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

                        <Separator />

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
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Separator className="xl:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Feedback</CardTitle>
                        <CardDescription>Inline alerts, progress, and avatars.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                </Card>
            </div>

            <SectionHeader description="Layout and structural primitives in side-by-side composition." title="Structure" />
            <Card>
                <CardHeader className="items-center text-center">
                    <CardTitle className="text-base">Structure</CardTitle>
                    <CardDescription>Accordion and card compositions.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-6">
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
                </CardContent>
            </Card>

            <SectionHeader description="Menus, popovers, and navigation surfaces." title="Menus & Navigation" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
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

                        <Separator />

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

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
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

            <SectionHeader description="Grouped inputs, fields, and form layouts." title="Forms" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
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
                    </CardContent>
                </Card>

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
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
                    </CardContent>
                </Card>
            </div>

            <SectionHeader description="Data tables, charts, pagination, and layout helpers." title="Data & Layout" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Data Display</CardTitle>
                        <CardDescription>Tables, charts, and pagination.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm">Chart preview</Label>
                            <ChartContainer className="max-h-64" config={chartConfig}>
                                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">Chart preview</div>
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

                        <Separator />

                        <div className="space-y-2">
                            <Label className="text-sm">Scroll area</Label>

                            <ScrollArea className="h-72 w-48 rounded-md border">
                                <div className="p-4">
                                    <h4 className="mb-4 font-medium text-sm leading-none">Tags</h4>
                                    {tags.map((tag) => (
                                        <Fragment key={tag}>
                                            <div className="text-sm">{tag}</div>
                                            <Separator className="my-2" />
                                        </Fragment>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
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

                        <div className="space-y-2 pl-50">
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

                        <Separator />

                        <div className="space-y-2">
                            <Label className="text-sm">Keyboard hints</Label>
                            <div className="flex h-5 flex-wrap items-center gap-3">
                                <Separator orientation="vertical" />
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
                                <Separator orientation="vertical" />
                                <Kbd>TAB</Kbd>
                                <Kbd>Q</Kbd>
                                <Kbd>W</Kbd>
                                <Kbd>R</Kbd>
                                <Kbd>T</Kbd>
                                <Kbd>Y</Kbd>
                                <Separator orientation="vertical" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <SectionHeader description="Commands, dialogs, sheets, and overlay patterns." title="Overlays" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
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

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
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

            <SectionHeader description="Calendar and empty state patterns." title="States" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Calendar</CardTitle>
                        <CardDescription>Single-date picker preview.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar initialFocus={false} mode="single" />
                    </CardContent>
                </Card>

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Empty State</CardTitle>
                        <CardDescription>Primary empty state layout.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
            </div>

            <SectionHeader description="Collapsible panels and helper controls." title="Toggles & Helpers" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Collapsible</CardTitle>
                        <CardDescription>Reveal secondary content.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Helpers</CardTitle>
                        <CardDescription>Grouped buttons and guidance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
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
                        <p className="text-muted-foreground text-xs">Toast host is mounted at the app layout.</p>{" "}
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
                    </CardContent>
                </Card>
            </div>

            <SectionHeader description="Motion-focused components, interactive visuals, and layout compositions." title="Motion & Visuals" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Vortex Background</CardTitle>
                        <CardDescription>Particle-driven motion canvas with content overlay.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Vortex className="flex h-full items-center justify-center" containerClassName="h-64 overflow-hidden rounded-md border">
                            <div className="space-y-1 text-center">
                                <p className="text-white/70 text-xs uppercase tracking-widest">Ambient</p>
                                <p className="font-semibold text-white text-xl">Vortex Motion</p>
                            </div>
                        </Vortex>
                    </CardContent>
                </Card>

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Spotlight Sweep</CardTitle>
                        <CardDescription>Layered spotlight gradients with motion.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-64 overflow-hidden rounded-md border bg-neutral-950">
                            <SpotlightEffect className="-top-20 left-0" fill="white" />
                            <SpotlightTwo />
                            <div className="relative z-10 flex h-full items-center justify-center">
                                <div className="text-center">
                                    <p className="text-white/70 text-xs uppercase tracking-widest">Focus</p>
                                    <p className="font-semibold text-white text-xl">Spotlight Layers</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Compare Slider</CardTitle>
                        <CardDescription>Drag or hover to reveal before and after.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Compare
                            autoplay
                            autoplayDuration={4500}
                            className="h-64 w-full max-w-lg"
                            firstImage="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop"
                            secondImage="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200&auto=format&fit=crop"
                        />
                    </CardContent>
                </Card>

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Code Block</CardTitle>
                        <CardDescription>Syntax highlighted code with copy affordances.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CodeBlock data={codeBlockData} defaultValue="tsx">
                            <CodeBlockHeader>
                                <CodeBlockFiles>
                                    {(item) => (
                                        <CodeBlockFilename key={item.filename} value={item.language}>
                                            {item.filename}
                                        </CodeBlockFilename>
                                    )}
                                </CodeBlockFiles>
                                <div className="ml-auto flex items-center gap-1">
                                    <CodeBlockSelect>
                                        <CodeBlockSelectTrigger>
                                            <CodeBlockSelectValue placeholder="Language" />
                                        </CodeBlockSelectTrigger>
                                        <CodeBlockSelectContent>
                                            {(item) => (
                                                <CodeBlockSelectItem key={item.language} value={item.language}>
                                                    {item.language.toUpperCase()}
                                                </CodeBlockSelectItem>
                                            )}
                                        </CodeBlockSelectContent>
                                    </CodeBlockSelect>
                                    <CodeBlockCopyButton />
                                </div>
                            </CodeBlockHeader>
                            <CodeBlockBody>
                                {(item) => (
                                    <CodeBlockItem key={item.language} value={item.language}>
                                        <CodeBlockContent language={item.language}>{item.code}</CodeBlockContent>
                                    </CodeBlockItem>
                                )}
                            </CodeBlockBody>
                        </CodeBlock>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Bento Grid</CardTitle>
                        <CardDescription>Composed layout tiles for feature storytelling.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BentoGrid className="grid-cols-1 md:auto-rows-[12rem] md:grid-cols-3">
                            <BentoGridItem
                                description="Streamline reviews with smart comparisons."
                                header={<div className="h-20 rounded-md bg-muted" />}
                                icon={<Badge variant="outline">Flow</Badge>}
                                title="Diff Insights"
                            />
                            <BentoGridItem
                                description="Encrypted display for cinematic headlines."
                                header={<div className="h-20 rounded-md bg-muted" />}
                                icon={<Badge variant="outline">Motion</Badge>}
                                title="Encrypted Text"
                            />
                            <BentoGridItem
                                description="Glowing spotlight layers to frame hero content."
                                header={<div className="h-20 rounded-md bg-muted" />}
                                icon={<Badge variant="outline">Focus</Badge>}
                                title="Spotlight"
                            />
                        </BentoGrid>
                    </CardContent>
                </Card>

                <Separator className="lg:hidden" />

                <Card>
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Encrypted Text + Tooltip</CardTitle>
                        <CardDescription>Reveal-on-view text with hover hints.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <EncryptedText className="font-semibold text-lg" encryptedClassName="text-muted-foreground" revealedClassName="text-foreground" text="Secure by design." />
                        <br />
                        <TooltipCard
                            content={
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">Tooltip Card</p>
                                    <p className="text-muted-foreground text-xs">Custom tooltip content with layout-aware positioning.</p>
                                </div>
                            }
                        >
                            <Button variant="outline">Hover me</Button>
                        </TooltipCard>
                    </CardContent>
                </Card>
            </div>

            <SectionHeader description="Narrative layouts and global visuals." title="Storytelling" />
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="lg:col-span-2">
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-base">Timeline</CardTitle>
                        <CardDescription>Chronological storytelling for changelogs.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Timeline data={timelineEntries} />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
