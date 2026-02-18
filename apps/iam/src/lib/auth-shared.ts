import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client";
import { auth } from "@foundry/iam/lib/auth";
import { createAuthClient } from "better-auth/client";
export const serverClient = createAuthClient({
    plugins: [oauthProviderResourceClient(auth)], // auth optional
});
