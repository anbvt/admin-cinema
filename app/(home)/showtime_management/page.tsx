'use client'

import React, {ChangeEvent, useEffect, useState} from 'react';
import {Table, Select, Input, Form, DatePicker, TimePicker, Button, Modal} from 'antd';
import {FormInstance} from 'antd/lib/form';

const {Option} = Select;
import {fetchAPI} from "@hooks";
import moment, {Moment} from "moment";
import dayjs from "dayjs";
import {MdCancel, MdEditSquare} from "react-icons/md";
import {IoIosRemoveCircle, IoMdAddCircleOutline} from "react-icons/io";
import {FaSave} from "react-icons/fa";

interface Item {
    id: number;
    branchId: string;
    roomId: string;
    languageOfMovieId: number;
    dimensionId: number;
    roomName: string;
    movieName: string;
    branchName: string;
    branchAddress: string;
    showDate: Moment;
    startTime: Moment;
    languageId: number;
    languageName: string;
    dimensionName: string;
    price: number;
    movieAndLanguage: string;
    editable?: boolean;
}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    inputType: 'text' | 'select' | 'date' | 'time';
    record: Item;
    index: number;
    children: React.ReactNode;
    form: FormInstance<any>;
    branches: any;
    rooms: any;
    dimension: any;
    movieAndLanguage: any;
    setSelectedBranchId: (branchId: number) => {};
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                       editing,
                                                       dataIndex,
                                                       title,
                                                       inputType,
                                                       record,
                                                       index,
                                                       children,
                                                       form,
                                                       branches,
                                                       rooms,
                                                       dimension,
                                                       movieAndLanguage,
                                                       setSelectedBranchId,
                                                       ...restProps
                                                   }) => {
    const handleBranchChange = async (value: string) => {
        const foundItems = branches.filter((item: any) => item.name === value)
        record.branchId = foundItems[0].id;
        setSelectedBranchId(foundItems[0].id);
    };

    const handleLanguageOfMovieChange = (value: number) => {
        record.languageOfMovieId = value;
    };

    const handleDimensionChange = (value: string) => {
        const foundItems = dimension.filter((item: any) => item.name === value)
        record.dimensionId = foundItems[0].id;
    };

    const handleRoomChange = (value: string) => {
        const foundItems = rooms.filter((item: any) => item.name === value)
        record.roomId = foundItems[0].id;
    };

    const inputNode = () => {
        switch (inputType) {
            case 'select':
                if (dataIndex === 'roomName') {
                    return (
                        <Select onChange={handleRoomChange}>
                            {rooms.map((room: any) => (
                                <Option value={room.name} key={room.id}>
                                    {room.name}
                                </Option>
                            ))}
                        </Select>
                    )
                } else if (dataIndex === 'branchName') {
                    return (
                        <Select onChange={handleBranchChange}>
                            {branches.map((branch: any) => (
                                <Option value={branch.name} key={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    )
                } else if (dataIndex === 'movieAndLanguage')
                    return (
                        <Select onChange={handleLanguageOfMovieChange}>
                            {movieAndLanguage.map((mnl: any) => (
                                <Option value={mnl.id} key={mnl.id}>
                                    {mnl.id} - {mnl.movieName} ({mnl.languageName})
                                </Option>
                            ))}
                        </Select>
                    )
                else if (dataIndex === 'dimensionName')
                    return (
                        <Select onChange={handleDimensionChange}>
                            {dimension.map((d: any) => (
                                <Option value={d.name} key={d.id}>
                                    {d.name}
                                </Option>
                            ))}
                        </Select>
                    )
                break;
            case 'date':
                return <DatePicker defaultValue={dayjs(`${record.showDate}`)}/>;
            case 'time':
                return <TimePicker defaultValue={dayjs(`${record.startTime}`, 'HH:mm:ss')}/>;
            default:
                return <Input/>;
        }
    };

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item name={dataIndex} style={{margin: 0}}>
                    {inputNode()}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

const EditableTable: React.FC = () => {
    const [form] = Form.useForm();
    const [data, setData] = useState<Item[]>([]);
    const [branches, setBranches] = useState<any>([]);
    const [rooms, setRooms] = useState<any>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [dimension, setDimension] = useState<any>([]);
    const [movieAndLanguage, setMovieAndLanguage] = useState<any>([]);
    const [open, setOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<number>();

    useEffect(() => {
        const init = async () => {
            const response = await fetchAPI("/showtime");
            console.log(response.data)
            setData(response.data);
        }

        init();
    }, []);

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
        if (selectedBranchId) {
            fetchAPI(`/room/get-by-branch?branchId=${selectedBranchId}`).then((resp) => {
                setRooms(resp.data);
                console.log(resp.data)
            });
        } else {
            return;
        }
    }, [selectedBranchId]);

    const isEditing = (record: Item) => record.id === editingKey;

    const edit = (record: Item) => {
        record.showDate = moment(record.showDate);
        record.startTime = moment(record.startTime);

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
                    startTime: newData[index].startTime.format('HH:mm:ss'),
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

    const remove = async (key: React.Key) => {
        await fetchAPI(`/showtime/deleteShowTime/${key}`);
    };

    const showModal = () => {
        setOpen(true);
    };
    const handleAddShowtimeIsOk = () => {
        setOpen(false);
    };

    const handleAddShowtimeIsCancel = () => {
        setOpen(false);
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
            title: 'Hành động',
            dataIndex: 'action',
            render: (_: any, record: Item) => {
                const editable = isEditing(record);
                return editable ? (
                    <span className={"flex justify-center gap-3"}>
                        <a href="#" onClick={() => save(record.id)}>
                          <FaSave/>
                        </a>
                        <a href="#" onClick={cancel}>
                          <MdCancel/>
                        </a>
                    </span>
                ) : (
                    <span className={"flex justify-center gap-3"}>
                        <a href="#" aria-disabled={editingKey !== undefined} onClick={() => edit(record)}>
                            <MdEditSquare/>
                        </a>
                        <a href="#" onClick={() => remove(record.id)}>
                            <IoIosRemoveCircle/>
                        </a>
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
            <div>
                <Button type="primary" onClick={showModal} className={"flex justify-center gap-2 my-5 bg-black"}>
                    Thêm xuất chiếu <IoMdAddCircleOutline />
                </Button>
                <Modal
                    open={open}
                    title="Thêm xuất chiếu"
                    onOk={handleAddShowtimeIsOk}
                    onCancel={handleAddShowtimeIsCancel}
                    footer={(_, {OkBtn, CancelBtn}) => (
                        <>
                            <CancelBtn/>
                            <OkBtn/>
                        </>
                    )}
                >
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </Modal>
            </div>

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