"use client"
import {useSession} from "next-auth/react";
import {LoadingComponent} from "@components";
import {Button, Card, DatePicker, Form, Input, InputNumber, Select, Space, Upload} from "antd";
import {fetchAPI, useFetch} from "@hooks";
import {useEffect, useState} from "react";
import {File} from "buffer";
import {UploadOutlined} from "@ant-design/icons";
import {errorNotification, successNotification} from "@util/Notification";


const CreateMovie = () => {
    const {data: session} = useSession()
    const {Option} = Select;
    const rootCountry = useFetch('/country').data
    const rootLanguage = useFetch('/language').data
    const rootTypeMovie = useFetch('movieType').data
    const [upLoad, setUpload] = useState<File>();
    const [creating, setCreating] = useState(false);
    useEffect(() => {

    }, [session]);
    const formItemLayout = {
        labelCol: {span: 3},
        wrapperCol: {span: 20},
    };
    const normFile = (e: any) => {
        setUpload(e?.file);
    };
    const onFinish = (values: any) => {
            if (upLoad) {
                const data = {
                    ...values,
                    'yearofmanufacture': Number(values['yearofmanufacture'].format('YYYY')),
                    'arrayActor': values['arrayActor'].split(",").map((s: any) => {
                        return s
                    }),
                    'arrayDirector': values['arrayDirector'].split(",").map((s: any) => {
                        return s
                    }),
                    'poster': upLoad?.name
                }
                setCreating(true);
                const jsonBlob = new Blob([JSON.stringify(data)], {type: 'application/json'});
                fetchAPI.post('/movie/insert', {json: jsonBlob, file: upLoad}, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Access-Control-Allow-Origin': '*'
                    }
                }).then((s) => successNotification("Thêm phim thành công")).catch((e) =>
                    errorNotification('Lỗi! Vui lòng kiểm tra lại dữ liệu nhập')
                ).finally(() => {
                    setCreating(false);
                })
            }
        }
    ;
    return (
        <div>
            {!session ? <LoadingComponent/> : <div>
                <Card title="Thông tin phim">
                    <Form
                        name="formMovie"
                        {...formItemLayout}
                        style={{maxWidth: 'none'}}
                        onFinish={onFinish}
                    >
                        {/*Mã Phim*/}
                        <Form.Item
                            name="id"
                            label="Mã Phim"
                            rules={[{required: true, message: 'Vui lòng nhập mã phim'}]}
                        >
                            <Input placeholder="Mã phim"/>
                        </Form.Item>
                        {/*Tên Phim*/}
                        <Form.Item
                            name="name"
                            label="Tên Phim"
                            rules={[{required: true, message: 'Vui lòng nhập tên phim'}]}
                        >
                            <Input placeholder="Tên phim"/>
                        </Form.Item>
                        {/*Năm sản xuất*/}
                        <Form.Item
                            name="yearofmanufacture"
                            label="Chọn năm"
                            rules={[{required: true, message: 'Vui lòng chọn thời gian!'}]}
                        >
                            <DatePicker picker="year"/>
                        </Form.Item>
                        {/*Độ dài phim*/}
                        <Form.Item
                            name="time"
                            label="Thời lượng"
                            rules={[{required: true, message: 'Vui lòng nhập thời lượng phim'}]}
                        >
                            <Input placeholder="thời lượng" addonAfter="Phút"/>
                        </Form.Item>
                        {/*Giới hạn độ tuổi*/}
                        <Form.Item
                            name="limitage"
                            label="Giới hạn độ tuổi"
                            rules={[{required: true, message: 'Vui lòng nhập giới hạn'}]}
                        >
                            <InputNumber min={3} placeholder="Độ tuổi"/>
                        </Form.Item>
                        {/*Quốc gia*/}
                        <Form.Item
                            name="countryid"
                            label="Quốc gia"
                            rules={[{required: true, message: 'Vui lòng chọn quốc gia!'}]}
                        >
                            <Select placeholder="Chọn quốc gia">
                                {rootCountry && rootCountry.map((s: any, idx: number) => (
                                    <Option value={s.id} key={idx}>{s.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {/*Ngôn ngữ phim*/}
                        <Form.Item
                            name="arrayLanguage"
                            label="Ngôn ngữ"
                            rules={[{required: true, message: 'Chọn ít nhất 1 ngôn ngữ!', type: 'array'}]}
                        >
                            <Select mode="multiple" placeholder="Vui lòng chọn ngôn ngữ">
                                {rootLanguage && rootLanguage.map((s: any, idx: number) => (
                                    <Option value={s.id} key={idx}>{s.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {/*Thể loại phim*/}
                        <Form.Item
                            name="arrayType"
                            label="Thể loại"
                            rules={[{
                                required: true,
                                message: 'Vui lòng chọn ít nhất một thể loại!',
                                type: 'array'
                            }]}
                        >
                            <Select mode="multiple" placeholder="Chọn thể lọai">
                                {rootTypeMovie && rootTypeMovie.map((s: any, idx: number) => (
                                    <Option value={s.id} key={idx}>{s.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        {/*Đạo diễn*/}
                        <Form.Item
                            name="arrayDirector"
                            label="Đạo diễn"
                            rules={[{required: true, message: 'Vui lòng nhập đạo diễn!', type: 'string'}]}
                        >
                            <Input placeholder="Đạo diễn"/>
                        </Form.Item>
                        {/*Diễn viên*/}
                        <Form.Item
                            name="arrayActor"
                            label="Diễn viên"
                            rules={[{required: true, message: 'Vui lòng nhập diễn viên!', type: 'string'}]}
                        >
                            <Input placeholder="Nhập diễn viên"/>
                        </Form.Item>
                        {/*Mô tả*/}
                        <Form.Item
                            name="describe"
                            label="Mô tả phim"
                            rules={[{required: true, message: 'Vui lòng nhập mô tả'}]}
                        >
                            <Input.TextArea showCount minLength={100}/>
                        </Form.Item>
                        {/*Trailer*/}
                        <Form.Item
                            name="trailer"
                            label="Trailer phim"
                            rules={[{required: true, message: 'Vui lòng nhập đường dẫn trailer'}]}
                        >
                            <Input placeholder="Trailer phim"/>
                        </Form.Item>
                        {/*Trạng thái phim*/}
                        <Form.Item
                            name="status"
                            label="Trạng thái"
                            rules={[{required: true, message: 'Vui lòng chọn trạng thái phim!'}]}
                        >
                            <Select placeholder="Trạng thái">
                                <Option value="0">Sắp chiếu</Option>
                                <Option value="1">Đang chiếu</Option>
                                <Option value="2">Hết chiếu</Option>
                            </Select>
                        </Form.Item>
                        {/*Poster phim*/}
                        <Form.Item
                            name="poster"
                            label="Tải ảnh"
                            valuePropName="file"
                            getValueFromEvent={normFile}
                        >
                            <Upload name="poster" listType="picture"
                                    accept="image/jpeg, image/png, image/jpg"
                                    beforeUpload={(file) => {
                                        return false
                                    }}
                            >
                                <Button icon={<UploadOutlined/>}>Chọn ảnh....</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item wrapperCol={{span: 12, offset: 6}}>
                            <Space>
                                <Button type="default" htmlType="submit" loading={creating} disabled={creating}>
                                    {creating ? 'Đang thêm phim' : 'Thêm phim'}
                                </Button>
                                <Button htmlType="reset">Làm mới</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div>}
        </div>
    )
}

export default CreateMovie;