// import { headers } from "next/headers";
// import { redirect } from "next/navigation";
// import type { UserDbType } from "./auth-types";

// export const getCurrentUser = async (): Promise<null | UserDbType> => {
//     const session = await auth.api.getSession({
//         headers: await headers(),
//     });
//     if (!session) {
//         return null;
//     }
//     return session.user as UserDbType;
// };

// export const getCurrentUserOrRedirect = async (forbiddenUrl = "/auth/sign-in", okUrl = "", ignoreForbidden = false): Promise<null | UserDbType> => {
//     const user = await getCurrentUser();

//     // if no user is found
//     if (!user) {
//         // redirect to forbidden url unless explicitly ignored
//         if (!ignoreForbidden) {
//             redirect(forbiddenUrl);
//         }
//         // if ignoring forbidden, return the null user immediately
//         // (don't proceed to okUrl check)
//         return user; // user is null here
//     }

//     // if user is found and an okUrl is provided, redirect there
//     if (okUrl) {
//         redirect(okUrl);
//     }

//     // if user is found and no okUrl is provided, return the user
//     return user; // user is UserDbType here
// };
