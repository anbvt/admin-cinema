"use client"
import React, { useEffect, useState } from "react";
import { DownOutlined } from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { Badge, Button, Dropdown, Space, Table } from 'antd';
import { fetchAPI, useFetch } from "@hooks";

interface DataType {
    id: string;
    key: React.Key;
    name: string;
}

interface ExpandedDataType {
    key: React.Key;
    id: string,
    branchId: string,
    date: string;
    name: string;
    upgradeNum: string;
}

const TableComponent = () => {
    const [dataMovie, setDataMovie] = useState([]);
    const [dataDetailMovieConfig, setdataDetailMovieConfig] = useState([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    useEffect(() => {
        fetchAPI.get(`/movie`)
            .then((response) => response.data)
            .then((data) => {
                setDataMovie(data);
                console.log(data);

            })
            .catch((error) => {
                console.log('fetch data failed', error);
                setDataMovie([]);
            });
    }, []);



    const items = [
        { key: '1', label: 'Action 1' },
        { key: '2', label: 'Action 2' },
    ];

    const expandedRowRender = (record: any) => {
        const columns: TableColumnsType<ExpandedDataType> = [
            { title: 'Chi nhánh', dataIndex: 'branchId', key: 'branchId' },
            { title: 'Date', dataIndex: 'date', key: 'date' },
            { title: 'Name', dataIndex: 'name', key: 'name' },
            {
                title: 'Status',
                key: 'state',
                render: () => <Badge status="success" text="Finished" />,
            },
            { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' },
            {
                title: 'Action',
                dataIndex: 'operation',
                key: 'operation',
                render: () => (
                    <Space size="middle">
                        <a>Pause</a>
                        <a>Stop</a>
                        <Dropdown menu={{ items }}>
                            <a>
                                More <DownOutlined />
                            </a>
                        </Dropdown>
                    </Space>
                ),
            },
        ];

        fetchAPI.get(`/movieConfig/findAll?movieId=${record}`)
            .then((response) => response.data)
            .then((data) => {
                setdataDetailMovieConfig(data);
                console.log(data);

            })
            .catch((error) => {
                console.log('fetch data failed', error);
                setdataDetailMovieConfig([]);
            });

        const data = dataDetailMovieConfig;
        console.log(data);

        return <Table columns={columns} dataSource={data} pagination={false} />;
    };

    const columns: TableColumnsType<DataType> = [
        { title: 'Name', dataIndex: 'name', key: 'name' },

    ];

    const data: DataType[] = dataMovie;
    return (
        <>

            <Table
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => expandedRowRender(record.id),
                }}
                dataSource={data}
                size="middle"
            />

        </>
    );
}
export default TableComponent;