import { fetchAPI } from './../hook/fetchAPI';
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
                    const {data:cus} = await fetchAPI.post("/customer/login",{email: credentials?.email, password: credentials?.password})
                    if (cus) {
                        return {
                            id: cus.id,
                            name: cus.name,
                            email: cus.email
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
        signIn: '/login'
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({user, token, session, trigger}) {
            // if (trigger === "update") {
            //     token.seat = session.seat
            //     token.topping = session.topping
            //     token.showtime = session.showtime
            // }
            return {...token, ...user};
        },
        async session({session, token}) {
            session.user = {
                ...session.user,
                id: String(token.sub)
            };
            return session;
        },
    },

}
