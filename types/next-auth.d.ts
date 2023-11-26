import {DefaultUser} from "next-auth"
declare module "next-auth" {

    interface Session {
        user: {
            id: string | number,
            role: number,
            branchid: string
        } & DefaultSession["user"]
    }
}
