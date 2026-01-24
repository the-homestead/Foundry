import { dotenvLoad } from "dotenv-mono";

dotenvLoad({
    path: "../../.env",
});

await import("./server.js");
