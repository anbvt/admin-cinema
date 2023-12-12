'use client'

import React, {useEffect, useState} from 'react';
import {Button, Form, Modal, notification, Select, Table} from 'antd';
import {fetchAPI} from "@hooks";
import moment from "moment";
import {MdCancel, MdEditSquare} from "react-icons/md";
import {IoIosRemoveCircle} from "react-icons/io";
import {FaSave} from "react-icons/fa";
import EditableCell from "./EditTableCell";
import {Item} from "./Item";
import InsertShowtimeForm from "./InsertShowtimeForm";
import dayjs from "dayjs";
import {DateUtils} from "@util/DateUtils";
import {NumberUtils} from "@util/NumberUtils";
import {useSession} from "next-auth/react";
import {ColumnsType} from "antd/es/table";
import {DataType} from "csstype";

const {Option} = Select;

const EditableTable: React.FC = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState<Item[]>([]);
    const [rooms, setRooms] = useState<any>([]);
    const [dimension, setDimension] = useState<any>([]);
    const [movieAndLanguage, setMovieAndLanguage] = useState<any>([]);
    const [editingKey, setEditingKey] = useState<number>();
    const [removed, setRemoved] = useState<number>();
    const [added, setAdded] = useState<boolean>();
    const [filterRoooms, setFilterRooms] = useState<any>([]);
    const {data: session} = useSession();
    const branchOfStaff: string = session?.user.branchId;

    useEffect(() => {
        if (!branchOfStaff) return;
        const init = async () => {
            const response = await fetchAPI(`/showtime/get-by-branch?branchId=${branchOfStaff}`);
            response.data.forEach((item: Item) => {
                item.showDate = DateUtils.formatDate(moment(item.showDate).toDate())
                item.price = NumberUtils.formatCurrency(item.price as number);
                item.movieAndLanguage = `${item.languageOfMovieId} - ${item.movieName} (${item.languageName})`;
            })
            setData(response.data);
        }

        init();
    }, [editingKey, removed, added, branchOfStaff]);

    useEffect(() => {
        const fetchData = async () => {
            const dimensionResponse = await fetchAPI(`/dimension`);
            setDimension(dimensionResponse.data);
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (!branchOfStaff) return;

        const init = async () => {
            const roomsResponse =
                await fetchAPI(`/room/get-by-branch?branchId=${branchOfStaff}`)
            setRooms(roomsResponse.data);

            const languageResponse =
                await fetchAPI(`/languageOfMovie/get-by-movie-config?branchId=${branchOfStaff}`);
            setMovieAndLanguage(languageResponse.data);
        }

        init()
    }, [branchOfStaff]);

    useEffect(() => {
        if (rooms.length > 0) {
            const filters = rooms.map((room: any) => ({
                text: room.name,
                value: room.name,
            }));

            setFilterRooms(filters);
        }
    }, [rooms]);

    const isEditing = (record: Item) => record.id === editingKey;

    const edit = (record: Item) => {
        const priceFormated =
            parseFloat(record.price.toString().replace(/[^\d.,-]/g, '').replace('.', ''))

        record.showDate = moment(record.showDate);
        record.startTime = dayjs(`${record.startTime}`, 'HH:mm:ss');
        record.price = priceFormated;
        form.setFieldsValue({...record});
        setEditingKey(record.id);
    };


    const cancel = () => {
        setEditingKey(undefined);
    };

    const save = async (key: React.Key) => {
        try {
            const row = await form.validateFields();
            const newData = [...data];
            const index = newData.findIndex((item) => key === item.id);

            if (index > -1) {
                const item = newData[index];
                const dataRequest = newData.splice(index, 1, {...item, ...row});
                const showTime = {
                    id: newData[index].id,
                    roomId: newData[index].roomId,
                    languageOfMovieId: newData[index].languageOfMovieId,
                    dimensionId: newData[index].dimensionId,
                    showDate: newData[index].showDate,
                    startTime: newData[index].startTime,
                    price: newData[index].price.toString().replace(/[^\d.,]/g, '')
                };

                await fetchAPI.post("/showtime/updateShowTime", {...showTime});
                setData(newData);
                setEditingKey(index);
            } else {
                newData.push(row as Item);
                setData(newData);
                setEditingKey(undefined);
            }
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const remove = (key: React.Key) => {
        fetchAPI(`/showtime/deleteShowTime/${key}`)
            .then(response => {
                setRemoved(Number(key));
                notification.success({message: 'Xóa show time thành công!'});
            })
            .catch(error => {
                notification.error({message: 'Đã xảy ra lỗi khi xóa show time. Vui lòng thử lại sau!'})
                console.error('Lỗi khi xóa show time:', error);
            });
    };

    const columns: any = [
        {
            title: 'Phòng',
            dataIndex: 'roomName',
            width: '7%',
            editable: true,
            filters: filterRoooms,
            onFilter: (value: string, record: any) => record.roomName.indexOf(value) === 0,
        },
        {
            title: 'Phim - Ngôn ngữ',
            dataIndex: 'movieAndLanguage',
            width: '35%',
            editable: true,
        },
        {
            title: 'Chi nhánh',
            dataIndex: 'branchName',
            width: '10%',
            editable: false,
        },
        {
            title: 'Ngày chiếu',
            dataIndex: 'showDate',
            width: '10%',
            editable: true,
        },
        {
            title: 'Giờ chiếu',
            dataIndex: 'startTime',
            width: '10%',
            editable: true,
        },
        {
            title: 'Độ phân giải',
            dataIndex: 'dimensionName',
            width: '10%',
            editable: true,
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            width: '10%',
            editable: true,
            sorter: (a: any, b: any) => Number.parseFloat(a.price) - Number.parseFloat(b.price),
        },
        {
            title: '',
            dataIndex: 'action',
            render: (_: any, record: Item) => {
                const editable = isEditing(record);
                return editable ? (
                    <span className={"flex justify-center gap-1"}>
                        <Button className={"border-0"} onClick={() => save(record.id)}>
                          <FaSave/>
                        </Button>
                        <Button className={"border-0"} onClick={cancel}>
                          <MdCancel/>
                        </Button>
                    </span>
                ) : (
                    <span className={"flex justify-center gap-1"}>
                        <Button className={"border-0"} aria-disabled={editingKey !== undefined} onClick={() => edit(record)}>
                            <MdEditSquare/>
                        </Button>
                        <Button
                            className={"border-0"}
                            onClick={() => {
                                Modal.confirm({
                                    title: 'Xác nhận',
                                    content: 'Xuất chiếu sẽ bị xóa vĩnh viễn',
                                    cancelText: "Hủy",
                                    okText: "Xóa",
                                    onOk: () => {
                                        remove(record.id)
                                    },
                                    footer: (_, {OkBtn, CancelBtn}) => (
                                        <>
                                            <CancelBtn/>
                                            <OkBtn/>
                                        </>
                                    ),
                                });
                            }}
                        >
                            <IoIosRemoveCircle/>
                        </Button>
                    </span>
                );
            },
        },
    ].map((col) => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: (record: Item) => ({
                record,
                inputType:
                    col.dataIndex === 'roomName' || col.dataIndex === 'branchName' || col.dataIndex === 'movieAndLanguage' || col.dataIndex === 'dimensionName'
                        ? 'select'
                        : col.dataIndex === 'showDate'
                            ? 'date'
                            : col.dataIndex === 'startTime'
                                ? 'time'
                                : 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
                form,
                rooms,
                dimension,
                movieAndLanguage,
            }),
        };
    });

    return (
        <>
            <InsertShowtimeForm
                branchOfStaff={branchOfStaff}
                branchName={data[0]?.branchName}
                dimension={dimension}
                setAdded={(check: boolean) => {setAdded(check)}}
            />
            <Form form={form} component={false}>
                <Table
                    components={{
                        body: {
                            cell: EditableCell,
                        },
                    }}
                    dataSource={data}
                    columns={columns}
                    rowKey="id"
                />
            </Form>
        </>
    );
};

export default EditableTable;