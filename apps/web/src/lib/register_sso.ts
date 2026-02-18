// import { authClient } from "./auth-client";

// await authClient.sso.register({
//     providerId: "keycloak",
//     issuer: "https://key.homestead.systems/realms/Foundry",
//     domain: "homestead.systems",
//     oidcConfig: {
//         clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "",
//         clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
//         authorizationEndpoint: "https://key.homestead.systems/realms/Foundry/protocol/openid-connect/auth",
//         tokenEndpoint: "https://key.homestead.systems/realms/Foundry/protocol/openid-connect/token",
//         jwksEndpoint: "https://key.homestead.systems/realms/Foundry/protocol/openid-connect/certs",
//         discoveryEndpoint: "https://key.homestead.systems/realms/Foundry/.well-known/openid-configuration",
//         scopes: ["openid", "email", "profile"],
//         pkce: true,
//         mapping: {
//             id: "sub",
//             email: "email",
//             emailVerified: "email_verified",
//             name: "preferred_username",
//             image: "picture",
//             extraFields: {
//                 roles: "realm_access.roles",
//             },
//         },
//     },
// });
