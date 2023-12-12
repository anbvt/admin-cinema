import {Button, DatePicker, Form, Input, Modal, notification, Select, Space, TimePicker} from "antd";
import React, {useEffect, useState} from "react";
import {fetchAPI} from "@hooks";
import moment from "moment/moment";
import {IoAddCircleSharp} from "react-icons/io5";
import {Dayjs} from "dayjs";

interface InsertShowtimeFormProps {
    branchOfStaff: string,
    branchName?: string,
    dimension: any,
    setAdded: (check: boolean) => void
}

const InsertShowtimeForm = (props: InsertShowtimeFormProps) => {
    const [open, setOpen] = useState(false);
    const [rooms, setRooms] = useState<any>([]);
    const [movieAndLanguage, setMovieAndLanguage] = useState<any>([]);
    const [selectRoomDisable, setSelectRoomDisable] = useState<boolean>(true);
    const [startTime, setStartTime] = useState<string>();
    const [form] = Form.useForm();

    useEffect(() => {
        if (!props.branchOfStaff) return;
        const init = async () => {
            try {
                const roomsResponse = await fetchAPI(`/room/get-by-branch?branchId=${props.branchOfStaff}`);
                setRooms(roomsResponse.data);

                const languageResponse =
                    await fetchAPI(`/languageOfMovie/get-by-movie-config?branchId=${props.branchOfStaff}`);
                setMovieAndLanguage(languageResponse.data);
            } catch (e: any) {
                console.log(e)
            }
        }

        init()
    }, [props.branchOfStaff]);

    const showModal = () => {
        setOpen(true);
    };

    const handleAddShowtimeIsOk = (values: any) => {
        values.startTime = startTime;
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
        setSelectRoomDisable(true);
        form.resetFields();
    };

    const timePickerOnChange = (time: Dayjs | null, timeString: string) => {
        console.log(timeString)
        setStartTime(timeString);
    };

    return (
        <>
            <Button type="primary" onClick={showModal} className={"rounded-xl my-5 bg-black"}>
                <IoAddCircleSharp />
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
                    <Space>
                        <Form.Item
                            label="Chi nhánh"
                        >
                            <p className={"flex-wrap w-56"}>{props.branchName}</p>
                        </Form.Item>

                        <Form.Item
                            label="Phòng"
                            name="roomId"
                            rules={[{required: true, message: 'Vui lòng chọn phòng!'}]}
                            className={"ms-7"}
                            style={{ width: '150%' }}
                        >
                            <Select onChange={() => setSelectRoomDisable(false)}>
                                {rooms.map((room: any) => (
                                    <Select.Option value={room.id} key={room.id}>
                                        {room.name}
                                    </Select.Option>
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
                                <Select.Option value={mnl.id} key={mnl.id}>
                                    {mnl.id} - {mnl.movieName} ({mnl.languageName})
                                </Select.Option>
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
                                    <Select.Option value={dimension.id} key={dimension.id}>
                                        {dimension.name}
                                    </Select.Option>
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
                            <TimePicker onChange={(time: Dayjs | null, timeString: string) => timePickerOnChange(time, timeString)}/>
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