"use client";

import { Button } from "@foundry/ui/primitives/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getProjectLikeData, toggleProjectLike } from "./actions";

interface ProjectLikesProps {
    projectSlug: string;
}

export function ProjectLikes({ projectSlug }: ProjectLikesProps) {
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [userLike, setUserLike] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            const result = await getProjectLikeData(projectSlug);
            if (result.success) {
                setLikes(result.counts.likes);
                setDislikes(result.counts.dislikes);
                setUserLike(result.userLike);
            }
        }
        loadData();
    }, [projectSlug]);

    const handleLike = async () => {
        if (loading) {
            return;
        }

        setLoading(true);
        const action = userLike === 1 ? "remove" : "like";
        const result = await toggleProjectLike(projectSlug, action);

        if (result.success && result.counts) {
            setLikes(result.counts.likes);
            setDislikes(result.counts.dislikes);
            setUserLike(action === "remove" ? null : 1);
        } else if (result.error) {
            // Show error toast or notification
            console.error(result.error);
        }

        setLoading(false);
    };

    const handleDislike = async () => {
        if (loading) {
            return;
        }

        setLoading(true);
        const action = userLike === -1 ? "remove" : "dislike";
        const result = await toggleProjectLike(projectSlug, action);

        if (result.success && result.counts) {
            setLikes(result.counts.likes);
            setDislikes(result.counts.dislikes);
            setUserLike(action === "remove" ? null : -1);
        } else if (result.error) {
            // Show error toast or notification
            console.error(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Button className="flex items-center gap-1.5" disabled={loading} onClick={handleLike} size="sm" variant={userLike === 1 ? "default" : "outline"}>
                <ThumbsUp className="h-4 w-4" />
                <span>{likes}</span>
            </Button>
            <Button className="flex items-center gap-1.5" disabled={loading} onClick={handleDislike} size="sm" variant={userLike === -1 ? "default" : "outline"}>
                <ThumbsDown className="h-4 w-4" />
                <span>{dislikes}</span>
            </Button>
        </div>
    );
}
