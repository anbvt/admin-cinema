'use client'
import React, { useEffect, useState } from "react";
import type { TableColumnsType } from "antd";
import { Button, Modal, Space, Table, DatePicker, Form, notification } from "antd";
import { fetchAPI, useFetch } from "@hooks";
import moment from 'moment';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import "./index.css";

interface DataType {
    key: React.Key;
    id: string;
    name: string;
}

interface ExpandedDataType {
    id: string;
    movieId: string;
    branchId: string;
    startDate: string;
    endDate: string;
    createDate: string;
    updateDate: string;
}
const TableComponent = () => {
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataMovie, setdDataMovie] = useState<any>([]);
    const [status, setStatus] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState<ExpandedDataType | null>(null);
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();

    const { RangePicker } = DatePicker;


    useEffect(() => {
        fetchAPI.post("/movieConfig/findAll")
            .then(response => {
                setdDataMovie(response.data);
            })
            .catch(error => {
            });
    }, [status]);

    const Context = React.createContext({ name: 'Default' });

    const openNotification = (placement: NotificationPlacement, status: any, message: any) => {
        status({
            message: `${message}`,
            description: <Context.Consumer>{({ name }) => `Cập nhật của bạn ${message} !`}</Context.Consumer>,
            placement,
        });
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            const formattedValues = {
                ...values,
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
                endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
                createDate: values.createDate ? values.createDate.format('YYYY-MM-DD') : null,
                updateDate: values.updateDate ? values.updateDate.format('YYYY-MM-DD') : null,
            };
            const postData = {
                ...formattedValues,
                movieId: selectedRowData?.movieId,
                branchId: selectedRowData?.branchId
            };

            fetchAPI.post("/movieConfig/update", postData)
                .then(response => {
                    openNotification('topRight', api.success, 'Thành công');
                    setStatus(!status);
                })
                .catch(error => {
                    openNotification('topRight', api.error, 'Thất bại');
                });
        });
    };
    const handleShowModal = (rowData: any) => {

        setSelectedRowData(rowData);

        form.setFieldsValue({
            startDate: moment(rowData.startDate),
            endDate: moment(rowData.endDate),
            createDate: moment(rowData.createDate),
            updateDate: moment(rowData.updateDate),

        });
        // form.resetFields();
        showModal();

    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        handleSave();
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const expandedRowRender = (record: any) => {
        const columns: TableColumnsType<ExpandedDataType> = [
            { title: "Chi nhánh", dataIndex: "branchId", key: "branchId" },
            { title: "Ngày bắt đầu", dataIndex: "startDate", key: "startDate" },
            { title: "Ngày kết thúc", dataIndex: "endDate", key: "endDate" },
            { title: "Ngày tạo", dataIndex: "createDate", key: "createDate" },
            { title: "Ngày cập nhật", dataIndex: "updateDate", key: "updateDate" },
            {
                title: "Action",
                render: (_, record) => (
                    <Space size="middle">
                        <Button className="buttonAction" onClick={() => handleShowModal(record)}>
                            Chi tiết
                        </Button>
                    </Space >
                ),
            },
        ];
        const targetMovie = dataMovie?.find((movie: any) => movie.id === record);
        const data: ExpandedDataType[] = targetMovie?.listMovieConfig;

        return <> <Table columns={columns} dataSource={data} pagination={false} size="small" />
            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ className: "buttonOk" }}>
                {selectedRowData && (
                    <Form form={form} onFinish={handleSave}>
                        <Form.Item label="Ngày bắt đầu - Ngày kết thúc" name="dateRange" >
                            <RangePicker format={"DD/MM/YYYY"} />
                        </Form.Item>

                        <Form.Item label="Ngày bắt đầu" name="startDate" >
                            <DatePicker format={"DD/MM/YYYY"} />
                        </Form.Item>

                        <Form.Item label="Ngày kết thúc" name="endDate" >
                            <DatePicker format={"DD/MM/YYYY"} />
                        </Form.Item>

                        <Form.Item label="Ngày tạo" name="createDate" >
                            <DatePicker format={"DD/MM/YYYY"} />

                        </Form.Item>

                        <Form.Item label="Ngày cập nhật" name="updateDate" >
                            <DatePicker format={"DD/MM/YYYY"} />
                        </Form.Item>
                    </Form>
                )}
            </Modal ></>;
    };

    const columns: TableColumnsType<DataType> = [
        { title: "Mã Phim", dataIndex: "id", key: "id", width: '40%' },
        { title: "Tên phim", dataIndex: "name", key: "name", width: '60%' },

    ];

    const data: DataType[] = dataMovie.map((s: any) => { return { ...s, key: s?.id } });

    const handleExpand = (record: DataType) => {
        const newExpandedRowKeys = expandedRowKeys.includes(record.key)
            ? []
            : [record.key];
        setExpandedRowKeys(newExpandedRowKeys);
    };

    return (
        <>
            {contextHolder}
            <Table
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => expandedRowRender(record.id),
                    expandedRowKeys,
                    onExpand: (_, record) => handleExpand(record),
                }}
                dataSource={data}
                size="middle"
            />

        </>
    );
};

export default TableComponent;