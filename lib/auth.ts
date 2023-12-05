import {fetchAPI} from './../hook/fetchAPI';
import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authconfig: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 3 * 24 * 60 * 60,
    },
    providers: [
        CredentialsProvider({
            credentials: {
                email: {label: "Email", type: "text"},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials) {
                try {
                    const {data: cus} = await fetchAPI.post("/staff/login", {email: credentials?.email, password: credentials?.password})
                    if (cus) {
                        return {
                            id: cus.id,
                            name: cus.name,
                            email: cus.email,
                            role: cus.role,
                            branchId: cus.branchId
                        };
                    }
                } catch (error: any) {
                    throw new Error(error.response.data.message)
                }
                return null

            }
        })
    ],
    pages: {
        signIn: '/login',
        signOut: '/signout',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({user, token, session, trigger}) {
<<<<<<< HEAD
            // if (trigger === "update") {
            //     token.seat = session.seat
            //     token.topping = session.topping
            //     token.showtime_management = session.showtime_management
            // }
=======

>>>>>>> 41eecf453bda6b0c6f9fba958f3c03726a6b9507
            return {...token, ...user};
        },
        async session({session, token}) {
            session.user = {
                ...session.user,
                id: String(token.id),
                role: token.role,
                branchId: token.branchId
            };
            return session;
        },
    },

}
