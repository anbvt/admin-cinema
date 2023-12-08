'use client'
import { fetchAPI } from "@hooks";
import { Title } from "@tremor/react";
import { errorNotification, successNotification } from "@util/Notification";
import { validateMessages } from "@util/ValidateMessages";
import type { TableColumnsType } from "antd";
import { Button, Card, Form, Input, Select, Space, Table } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AiFillEdit, AiOutlineUserDelete } from "react-icons/ai";
import { checkError } from "../../../util/Error";
import { ClearOutlined, FormOutlined, UserAddOutlined } from "@ant-design/icons";

interface DataType {
    key: React.Key;
    id: string;
    name: string;
}
const Staff = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const staffId = searchParams.get("id");
    const [formStaff] = Form.useForm();
    const [staff, setStaff] = useState<any>([]);
    const [branch, setBranch] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const init = async () => {
            setStaff((await fetchAPI.get("/staff")).data);
            setBranch((await fetchAPI.get("/branch")).data);
            if (searchParams.has("id")) {
                formStaff.setFieldsValue((await fetchAPI.get(`/staff/${staffId}`)).data)
            }
        }
        init()
    }, [staffId]);
    const columns: TableColumnsType<DataType> = [
        { title: "Mã nhân viên", dataIndex: "id", key: "id" },
        { title: "Tên nhân viên", dataIndex: "name", key: "name" },
        { title: "Mật khẩu", dataIndex: "password", key: "password", className: "truncate w-[100px] max-w-[100px]" },
        { title: "Email", dataIndex: "email", key: "email", className: "truncate w-[150px] max-w-[150px]" },
        { title: "Giới tính", dataIndex: "formatted_gender", key: "formatted_gender" },
        { title: "Ngày sinh", dataIndex: "formatted_birthday", key: "formatted_birthday" },
        { title: "Chi nhánh", dataIndex: "branchName", key: "branchName" },
        { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
        { title: "Vai trò", dataIndex: "formatted_role", key: "formatted_role" },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Link href={`/staff?id=${record.id}`}><AiFillEdit /></Link>
                    <a onClick={() => {
                        fetchAPI.post("/staff/updateStatus", record).then(rs => {
                            successNotification("Xoá thành công")
                        }).catch(e => {
                            errorNotification(checkError(e.response.data.message, e.response.data.param) || "Something went wrong")
                        })
                    }}><AiOutlineUserDelete /></a>
                </Space>
            ),
        }
    ];
    const data: DataType[] = staff.map((s: any) => { return { ...s, key: s?.id } });
    const onFinishStaff = (values: any) => {
        setLoading(true);
        fetchAPI.post(`/staff/insert`, values).then((response) => {
            setLoading(false);
            formStaff.resetFields();
            successNotification(response.data)
        }).catch(e => {
            setLoading(false);
            errorNotification(checkError(e.response.data.message, e.response.data.param) || "")
        })
    }
    return (
        <>
            <div className="container">
                <div className="my-3">
                    <Card>
                        <Title className="uppercase text-center pb-3">Danh sách nhân viên</Title>
                        <Table
                            columns={columns}
                            dataSource={data}
                            size="small"
                        />
                        <Card>
                            <Title className="uppercase text-center">Thông tin nhân viên</Title>
                            <Form
                                form={formStaff}
                                onFinish={onFinishStaff}
                                layout={"vertical"}
                                style={{
                                    maxWidth: 'none'
                                }}
                                validateMessages={validateMessages}
                                size="middle"
                            >
                                <Form.Item
                                    name="id"
                                    label="Mã nhân viên"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="name"
                                    label="Tên nhân viên"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    label="Mật khẩu"
                                    rules={[{ required: true }, { type: 'string', min: 8, max: 10 }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[{ required: true }, { type: 'email' }]}
                                >
                                    <Input type="email" />
                                </Form.Item>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[{ required: true }, { type: 'string', min: 10, max: 11 }]}
                                >
                                    <Input type="number" />
                                </Form.Item>
                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        placeholder="Chọn giới tính"
                                        options={[{ label: "Nam", value: true }, { label: "Nữ", value: false }]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="birthday"
                                    label="Ngày sinh"
                                    rules={[{ required: true }]}
                                >
                                    <Input type="date" />
                                </Form.Item>
                                <Form.Item
                                    name="branchId"
                                    label="Chi nhánh"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        placeholder="Chọn chi nhánh"
                                        options={branch?.map((s: any) => ({
                                            label: s.name,
                                            value: s.id
                                        }))}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="role"
                                    label="Vai trò"
                                    initialValue={1}
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        placeholder="Chọn vai trò"
                                        options={[{ label: "Nhân viên", value: 1 }, { label: "Quản lý", value: 2 }]}
                                    />
                                </Form.Item>
                                <hr className="pb-3" />
                                <Button className="mr-3" loading={loading} onClick={() => formStaff.submit()} size="large"><UserAddOutlined /></Button>
                                <Button className="mr-3" loading={loading} onClick={() => {
                                    const staff = formStaff.getFieldsValue();
                                    if (staff.id) {
                                        setLoading(true)
                                        fetchAPI.post("/staff/update", staff).then(rs => {
                                            successNotification("Cập nhật thành công")
                                            router.push('/staff')
                                            formStaff.resetFields()
                                            setLoading(false)
                                        }).catch(e => {
                                            errorNotification(checkError(e.response.data.message, e.response.data.param) || "Something went wrong")
                                        })
                                    }
                                }} size="large"><FormOutlined /></Button>
                                <Button className="mr-3" onClick={() => {
                                    router.push("/staff")
                                    formStaff.resetFields()
                                }} size="large"><ClearOutlined /></Button>
                            </Form >
                        </Card>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Staff;