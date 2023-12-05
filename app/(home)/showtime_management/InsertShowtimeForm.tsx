import {Button, DatePicker, Form, Input, Modal, notification, Select, Space, TimePicker} from "antd";
import {IoMdAddCircleOutline} from "react-icons/io";
import React, {useEffect, useRef, useState} from "react";
import {fetchAPI} from "@hooks";
import {Option} from "antd/es/mentions";
import moment from "moment/moment";

interface InsertShowtimeFormProps {
    branches: any,
    dimension: any,
    setAdded: (check: boolean) => void
}

const InsertShowtimeForm = (props: InsertShowtimeFormProps) => {
    const [open, setOpen] = useState(false);
    const [rooms, setRooms] = useState<any>([]);
    const [movieAndLanguage, setMovieAndLanguage] = useState<any>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectMovieDisable, setSelectMovieDisable] = useState<boolean>(true);
    const [selectRoomDisable, setSelectRoomDisable] = useState<boolean>(true);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!selectedBranchId) return;
        const init = async () => {
            try {
                const roomsResponse = await fetchAPI(`/room/get-by-branch?branchId=${selectedBranchId}`);
                setRooms(roomsResponse.data);

                const languageResponse =
                    await fetchAPI(`/languageOfMovie/get-by-movieconfig?branchId=${selectedBranchId}`);
                setMovieAndLanguage(languageResponse.data);
            } catch (e: any) {
                console.log(e)
            }
        }

        init()
    }, [selectedBranchId]);

    const showModal = () => {
        setOpen(true);
    };

    const handleAddShowtimeIsOk = (values: any) => {
        values.startTime = moment().format('HH:mm:ss');
        fetchAPI.post("/showtime/createShowTime", {...values}).then(() => {
            notification.success({message: 'Thêm xuất chiếu thành công!'});
            setOpen(false);
            props.setAdded(true);
            form.resetFields();
        }).catch(error => {
            notification.error({message: 'Đã xảy ra lỗi khi thêm xuất chiếu. Vui lòng thử lại sau!'});
            console.error('Lỗi khi xóa show time:', error);
        })
    };

    const handleAddShowtimeIsCancel = async () => {
        setOpen(false);
        form.resetFields();
    };

    const handleBranchChange = async (value: string) => {
        setSelectedBranchId(value);
        setSelectMovieDisable(false);
    };

    return (
        <>
            <Button type="primary" onClick={showModal} className={"flex justify-center gap-2 my-5 bg-black"}>
                Thêm xuất chiếu <IoMdAddCircleOutline/>
            </Button>
            <Modal
                open={open}
                title="Thêm xuất chiếu"
                onOk={() => {
                }}
                onCancel={handleAddShowtimeIsCancel}
                footer={() => (
                    <div className={"mt-14"}></div>
                )}
            >
                <Form
                    form={form}
                    name="insertForm"
                    onFinish={handleAddShowtimeIsOk}
                    layout="vertical" // Cấu hình layout cho form
                >
                    <Space className={"grid grid-cols-5"}>
                        <Form.Item
                            label="Chi nhánh"
                            name="branchId"
                            rules={[{required: true, message: 'Vui lòng chọn chi nhánh!'}]}
                            className={"col-span-3"}
                        >
                            <Select onChange={handleBranchChange}>
                                {props.branches.map((branch: any) => (
                                    <Option value={branch.id} key={branch.id}>
                                        {branch.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Phòng"
                            name="roomId"
                            rules={[{required: true, message: 'Vui lòng chọn phòng!'}]}
                            className={"col-span-2"}
                        >
                            <Select
                                disabled={selectMovieDisable}
                                onChange={() => setSelectRoomDisable(false)}
                            >
                                {rooms.map((room: any) => (
                                    <Option value={room.id} key={room.id}>
                                        {room.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Space>

                    <Form.Item
                        label="Phim - Ngôn ngữ"
                        name="languageOfMovieId"
                        rules={[{required: true, message: 'Vui lòng chọn phim!'}]}
                    >
                        <Select disabled={selectRoomDisable}>
                            {movieAndLanguage.map((mnl: any) => (
                                <Option value={mnl.id} key={mnl.id}>
                                    {mnl.id} - {mnl.movieName} ({mnl.languageName})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Space className={"flex justify-evenly"}>
                        <Form.Item
                            label="Độ phân giải"
                            name="dimensionId"
                            rules={[{required: true, message: 'Vui lòng chọn độ phân giải cho phim!'}]}
                        >
                            <Select>
                                {props.dimension.map((dimension: any) => (
                                    <Option value={dimension.id} key={dimension.id}>
                                        {dimension.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Ngày chiếu"
                            name="showDate"
                            rules={[{required: true, message: 'Vui lòng nhập ngày chiếu!'}]}
                        >
                            <DatePicker/>
                        </Form.Item>

                        <Form.Item
                            label="Giờ chiếu"
                            name="startTime"
                            rules={[{required: true, message: 'Vui lòng nhập giờ chiếu!'}]}
                        >
                            <TimePicker/>
                        </Form.Item>
                    </Space>

                    <Form.Item
                        label="Giá tiền"
                        name="price"
                        rules={[{required: true, message: 'Vui lòng nhập giá tiền!'}]}
                    >
                        <Input type={"number"} step={5000}/>
                    </Form.Item>

                    <Form.Item className={"float-right"}>
                        <Button
                            className={"me-3"}
                            onClick={handleAddShowtimeIsCancel}
                        >
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Thêm
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

export default InsertShowtimeForm;