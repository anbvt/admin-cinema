"use client"
import {Inter} from 'next/font/google'
import './../globals.css'
import {SessionProvider} from 'next-auth/react'
import {ConfigProvider} from 'antd'
import vi_VN from "antd/lib/locale/vi_VN";
import {Menu} from "@components";

const inter = Inter({subsets: ['latin']})
// moment.locale("vi");
export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <ConfigProvider locale={vi_VN}>
            <SessionProvider>
                <div className='flex flex-row'>
                    <Menu/>
                    <div className='mx-2' style={{width: "85%"}}>
                        {children}
                    </div>
                </div>
            </SessionProvider>
        </ConfigProvider>
        </body>
        </html>
    )
}
