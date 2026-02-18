import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import { auth } from "@foundry/iam/lib/auth";

export const GET = oauthProviderAuthServerMetadata(auth);
