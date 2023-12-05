'use client'
import { fetchAPI } from "@hooks";
import { Title } from "@tremor/react";
import type { TableColumnsType } from "antd";
import { Button, Card, Form, Input, Select, Space, Table } from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'
import { errorNotification, successNotification } from "../../../util/Notification";
import { checkError } from "../../../util/Error";

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
                    <Link href={`/staff?id=${record.id}`}>Edit</Link>
                    <a onClick={() => {
                        fetchAPI.post("/staff/updateStatus", record).then(rs => {
                            successNotification("Xoá thành công")
                        }).catch(e => {
                            errorNotification(checkError(e.response.data.message, e.response.data.param) || "Something went wrong")
                        })
                    }}>Remove</a>
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
                                size="middle"
                            >
                                <Form.Item
                                    name="id"
                                    label="Mã nhân viên"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="name"
                                    label="Tên nhân viên"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="password"
                                    label="Mật khẩu"
                                >
                                    <Input type="password" />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                >
                                    <Select
                                        placeholder="Chọn giới tính"
                                        options={[{ label: "Nam", value: true }, { label: "Nữ", value: false }]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="birthday"
                                    label="Ngày sinh"
                                >
                                    <Input type="date" />
                                </Form.Item>
                                <Form.Item
                                    name="branchId"
                                    label="Chi nhánh"
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
                                >
                                    <Select
                                        placeholder="Chọn vai trò"
                                        options={[{ label: "Nhân viên", value: 1 }, { label: "Quản lý", value: 2 }]}
                                    />
                                </Form.Item>
                                <hr className="pb-3" />
                                <Button className="mr-3" loading={loading} onClick={() => formStaff.submit()} size="middle">Tạo</Button>
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
                                }}>Cập nhật</Button>
                                <Button className="mr-3" onClick={() => {
                                    router.push("/staff")
                                    formStaff.resetFields()
                                }}>Mới</Button>
                            </Form >
                        </Card>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Staff;