"use client";

import { Badge } from "@foundry/ui/primitives/badge";
import { Button } from "@foundry/ui/primitives/button";
import { Input } from "@foundry/ui/primitives/input";
import { X } from "lucide-react";
import { type KeyboardEvent, useMemo, useState } from "react";

interface TagsInputProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    description?: string;
}

export function TagsInput({ value = "", onChange, placeholder }: TagsInputProps) {
    const [inputValue, setInputValue] = useState("");

    // Split comma-separated string into array, cleanup whitespace
    const tags = useMemo(() => {
        return value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }, [value]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === "," || e.key === "Tab") && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (!tags.includes(newTag)) {
                const newTags = [...tags, newTag];
                onChange?.(newTags.join(", "));
            }
            setInputValue("");
        } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
            const newTags = tags.slice(0, -1);
            onChange?.(newTags.join(", "));
        }
    };

    const removeTag = (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        onChange?.(newTags.join(", "));
    };

    return (
        <div className="flex flex-wrap gap-2 rounded-md border bg-background p-2 ring-offset-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
            {tags.map((tag) => (
                <Badge className="flex items-center gap-1 pr-1" key={tag} variant="secondary">
                    {tag}
                    <Button className="h-3 w-3 p-0 hover:bg-transparent" onClick={() => removeTag(tag)} size="icon" type="button" variant="ghost">
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag}</span>
                    </Button>
                </Badge>
            ))}
            <Input
                className="h-6 w-auto min-w-[80px] flex-1 border-0 bg-transparent p-0 shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? placeholder : ""}
                type="text"
                value={inputValue}
            />
        </div>
    );
}
