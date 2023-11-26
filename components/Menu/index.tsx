"use client"

import {AppstoreOutlined, DesktopOutlined, SettingOutlined} from "@ant-design/icons";
import {Menu, MenuProps} from "antd";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {useEffect, useState} from "react";

type MenuItem = Required<MenuProps>['items'][number];



const MenuComponent = () => {
    const {data: session} = useSession();
    console.log(session?.user)

    useEffect(()=>{

    },[session]);

    function getItem(
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
        type?: 'group',
        hidden?: boolean
    ): MenuItem {

        return !hidden ? {
            key,
            icon,
            children,
            label,
            type,
        } : {} as MenuItem;
    }
    
    // const items: MenuItem[] = [
    //     getItem(<Link href={"/"}>Trang chủ</Link>, 'home'),
    //     getItem('Quản lí phim', 'sub1', <DesktopOutlined />, [
    //         getItem(<Link href={"/movie/config"}>Cấu hình</Link>, '1'),
    //         getItem(<Link href={"/dashboard_ticket"}>Thống kê vé</Link>, '2'),
    //         getItem('Option 3', '3'),
    //         getItem('Option 4', '4'),
    //     ]),
    //     getItem('Navigation Two', 'sub2', <AppstoreOutlined />, [
    //         getItem('Option 5', '5'),
    //         getItem('Option 6', '6'),
    //         getItem('Submenu', 'sub3', null, [getItem('Option 7', '7'), getItem('Option 8', '8')]),
    //     ]),
    //     getItem(`${session?.user?.name}`, 'account', <></>,
    //     [
    //         getItem('Thông tin tài khoản', 'information'),
    //         getItem('Đổi mật khẩu', 'change-password'),
    //         getItem(<button onClick={()=>signOut()}>Đăng xuất</button>, 'logout'),
    //     ]),
    // ];
    
    // submenu keys of first level
    const rootSubmenuKeys = ['home', 'phim', 'sub2', 'account'];
    
    const [openKeys, setOpenKeys] = useState(['sub1']);

    const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
        const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
        if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    };

    return (
        <Menu
            mode="inline"
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            style={{ width: "15%" }}
            // items={items}
        >
            <Menu.Item key={'home'}>
                <Link href={"/"}>Trang chủ</Link>
            </Menu.Item>
            <Menu.ItemGroup key={'phim'} title="Quản lí phim">
                {session?.user.role == 2 && <Menu.Item key={'1'}>
                    <Link href={"/movie/config"}>Cấu hình</Link>
                </Menu.Item>}
                <Menu.Item key={'2'}>
                    <Link href={"/dashboard_ticket"}>Thống kê vé</Link>
                </Menu.Item>
            </Menu.ItemGroup>
            <Menu.ItemGroup key={'account'} title="Thông tin tài khoản">
                <Menu.Item key={'information'}>
                    <Link href={"/movie/config"}>Trang cá nhân</Link>
                </Menu.Item>
                <Menu.Item key={'change-password'}>
                    <Link href={"/"}>Đổi mật khẩu</Link>
                </Menu.Item>
                <Menu.Item key={'logout'}>
                    <button onClick={()=>signOut()}>Đăng xuất</button>
                </Menu.Item>
            </Menu.ItemGroup>
        </Menu>
    );
}
export default MenuComponent; 