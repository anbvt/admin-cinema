export { default } from "next-auth/middleware"

export const config = {matcher: ['/', '/((?!login|api|static|favicon.ico).*)']}