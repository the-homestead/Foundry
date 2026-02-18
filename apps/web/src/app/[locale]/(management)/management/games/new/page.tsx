import { GameForm } from "@foundry/web/components/admin/games/game-form";

export default function NewGamePage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-2xl tracking-tight">Add New Game</h1>
                    <p className="text-muted-foreground">Add a new game to the platform.</p>
                </div>
            </div>
            <GameForm />
        </div>
    );
}
