'use client'

import React, {useEffect, useState} from 'react';
import {Table, Select, Form, Button, Modal, notification} from 'antd';

const {Option} = Select;
import {fetchAPI} from "@hooks";
import moment, {Moment} from "moment";
import {MdCancel, MdEditSquare} from "react-icons/md";
import {IoIosRemoveCircle, IoMdAddCircleOutline} from "react-icons/io";
import {FaSave} from "react-icons/fa";
import EditableCell from "./EditTableCell";
import {Item} from "./Item";
import InsertShowtimeForm from "./InsertShowtimeForm";
import dayjs from "dayjs";

const EditableTable: React.FC = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState<Item[]>([]);
    const [branches, setBranches] = useState<any>([]);
    const [rooms, setRooms] = useState<any>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [dimension, setDimension] = useState<any>([]);
    const [movieAndLanguage, setMovieAndLanguage] = useState<any>([]);
    const [editingKey, setEditingKey] = useState<number>();
    const [removed, setRemoved] = useState<number>();
    const [added, setAdded] = useState<boolean>();

    useEffect(() => {
        const init = async () => {
            const response = await fetchAPI("/showtime");
            setData(response.data);
        }

        init();
    }, [editingKey, removed, added]);

    useEffect(() => {
        const fetchData = async () => {
            const branchResponse = await fetchAPI("/branch");
            setBranches(branchResponse.data);

            const dimensionResponse = await fetchAPI("/dimension");
            setDimension(dimensionResponse.data);

            const languageResponse = await fetchAPI("/languageOfMovie");
            setMovieAndLanguage(languageResponse.data);
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (!selectedBranchId) return;

        fetchAPI(`/room/get-by-branch?branchId=${selectedBranchId}`).then((resp) => {
            setRooms(resp.data);
            console.log(resp.data)
        });
    }, [selectedBranchId]);

    const isEditing = (record: Item) => record.id === editingKey;

    const edit = (record: Item) => {
        record.showDate = moment(record.showDate);
        record.startTime = dayjs(`${record.startTime}`, 'HH:mm:ss');

        setSelectedBranchId(record.branchId);
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
                newData.splice(index, 1, {...item, ...row});
                const showTime = {
                    id: newData[index].id,
                    roomId: newData[index].roomId,
                    languageOfMovieId: newData[index].languageOfMovieId,
                    dimensionId: newData[index].dimensionId,
                    showDate: newData[index].showDate,
                    startTime: newData[index].startTime.format("HH:mm:ss"),
                    price: newData[index].price
                };

                fetchAPI.post("/showtime/updateShowTime", {...showTime});

                setData(newData);
                setEditingKey(undefined);
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

    data.forEach((item: Item) => {
        // moment(item.showDate);
        // moment(item.startTime).format('HH:mm:ss');
        item.movieAndLanguage = `${item.languageOfMovieId} - ${item.movieName} (${item.languageName})`
    })

    const columns = [
        {
            title: 'Phòng',
            dataIndex: 'roomName',
            width: '7%',
            editable: true,
        },
        {
            title: 'Phim - Ngôn ngữ',
            dataIndex: 'movieAndLanguage',
            width: '30%',
            editable: true,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'branchAddress',
            width: '20%',
            editable: false,
        },
        {
            title: 'Chi nhánh',
            dataIndex: 'branchName',
            width: '10%',
            editable: true,
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
                branches,
                rooms,
                dimension,
                movieAndLanguage,
                setSelectedBranchId,
            }),
        };
    });

    return (
        <>
            <InsertShowtimeForm branches={branches} dimension={dimension} setAdded={(check: boolean) => {setAdded(check)}}/>
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