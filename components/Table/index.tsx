'use client'
import React, { useEffect, useState } from "react";
import type { TableColumnsType } from "antd";
import { Button, Modal, Space, Table, DatePicker, Form, notification, Col, Row, Input } from "antd";
import { fetchAPI, useFetch } from "@hooks";
import moment from 'moment';
import type { NotificationPlacement } from 'antd/es/notification/interface';
import "./index.css";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

interface DataType {
    key: React.Key;
    id: string;
    name: string;
}

interface ExpandedDataType {
    key: React.Key;
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
    const [detailMovieConfig, setDetailMovieConfig] = useState<any>([]);
    const [status, setStatus] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState<ExpandedDataType | null>(null);
    const [form] = Form.useForm();
    const [api, contextHolder] = notification.useNotification();
    const { RangePicker } = DatePicker;
    dayjs.extend(customParseFormat);
    const dateFormat = 'YYYY-MM-DD';
    const Context = React.createContext({ name: 'Default' });

    useEffect(() => {
        fetchAPI.get("/movie")
            .then(response => {
                setdDataMovie(response.data);
            })
            .catch(error => {
            });
    }, [status]);

    const openNotification = (placement: NotificationPlacement, status: any, message: any) => {
        status({
            message: `${message}`,
            description: <Context.Consumer>{({ name }) => `Cập nhật của bạn ${message} !`}</Context.Consumer>,
            placement,
        });
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            if (values.fromDate) {
                const postData = {
                    startDate: values.fromDate[0] ? values.fromDate[0].format('YYYY-MM-DD') : null,
                    endDate: values.fromDate[1] ? values.fromDate[1].format('YYYY-MM-DD') : null,
                    createDate: values.createDate ? values.createDate.format('YYYY-MM-DD') : null,
                    updateDate: values.updateDate ? values.updateDate.format('YYYY-MM-DD') : null,
                    movieId: selectedRowData?.movieId,
                    branchId: selectedRowData?.branchId
                };

                fetchAPI.post("/movieConfig/update", postData)
                    .then(response => {
                        openNotification('topRight', api.success, 'Thành công');
                        setStatus(!status);
                        setIsModalOpen(false);
                    })
                    .catch(error => {
                        openNotification('topRight', api.error, 'Thất bại');
                    });
            } else {
                form
            }
        });
    };
    const handleShowModal = (rowData: any) => {
        setSelectedRowData(rowData);
        form.setFieldsValue({
            createDate: rowData.createDate ? moment(rowData.createDate) : moment(new Date()),
            updateDate: rowData.createDate ? moment(rowData.updateDate) : moment(new Date()),
            fromDate: !(rowData.startDate && rowData.endDate) ? undefined : [!rowData.startDate ? undefined : dayjs(rowData.startDate, dateFormat), !rowData.endDate ? undefined : dayjs(rowData.endDate, dateFormat)]
        });
        setIsModalOpen(true);

    };

    useEffect(() => {
        fetchAPI.get<ExpandedDataType[]>("/movieConfig/findAllByMovieId?movieId=" + expandedRowKeys[0]).then((a) => {
            setDetailMovieConfig(a.data.map((s: any) => { return { ...s, key: s.branchId } }));
        })
    }, [expandedRowKeys, status])

    const expandedRowRender = () => {
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
        const data: ExpandedDataType[] = detailMovieConfig
        return <div key={expandedRowKeys[0]}>
            <Table columns={columns} dataSource={data} size="middle" pagination={false}/>
            <Modal title="" open={isModalOpen} onCancel={() => setIsModalOpen(false)} okButtonProps={{ style: { display: 'none' } }}>
                {selectedRowData && (
                    <Form form={form} onFinish={handleSave} >
                        <Form.Item label="Ngày bắt đầu" name="fromDate" rules={[{ required: true }]} style={{ marginTop: '30px' }} >
                            <RangePicker format={"DD/MM/YYYY"} style={{ width: '100%' }} />
                        </Form.Item>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Ngày tạo" name="createDate">
                                    <DatePicker format="DD/MM/YYYY" disabled={true} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Ngày cập nhật" name="updateDate">
                                    <DatePicker format="DD/MM/YYYY" disabled={true} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Button type="primary" htmlType="submit" className="buttonOk">
                            Submit
                        </Button>
                    </Form>
                )}
            </Modal >
        </div>;
    }

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
                    expandedRowRender: (record) => expandedRowRender(),
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