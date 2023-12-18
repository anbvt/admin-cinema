"use client"
import {useSession} from "next-auth/react";
import {LoadingComponent} from "@components";
import type {InputRef} from 'antd';
import {Button, Card, DatePicker, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Upload} from "antd";
import {fetchAPI, useFetch} from "@hooks";
import React, {useEffect, useRef, useState} from "react";
import {File} from "buffer";
import {SearchOutlined, UploadOutlined} from "@ant-design/icons";
import {errorNotification, successNotification} from "@util/Notification";
import type {ColumnsType, ColumnType} from 'antd/es/table';
import dayjs from 'dayjs';
import type {FilterConfirmProps} from 'antd/es/table/interface';
import Image from "next/image";

interface DataType {
    key: string;
    id: string;
    name: string;
    limitage: number;
    status: string,
    yearofmanufacture: number
}

const ManageMovie = () => {
    const {data: session} = useSession()
    const {Option} = Select;
    const rootCountry = useFetch('/country').data
    const rootLanguage = useFetch('/language').data
    const rootTypeMovie = useFetch('movieType').data
    const [rootMovie, setRootMovie] = useState<any>([])
    const [upLoad, setUpload] = useState<File>();
    const [creating, setCreating] = useState(false);
    const [modalOpenCreate, setModalOpenCreate] = useState(false);
    const [modalOpenUpdate, setModalOpenUpdate] = useState(false);
    const [detailMovie, setDetailMovie] = useState<any>([]);
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);
    type DataIndex = keyof DataType;
    useEffect(() => {
        fetchAPI.get("/movie/findAllMovieAdmin")
            .then(response => {
                setRootMovie(response.data);
            })
            .catch(error => {
            });
    }, [session, creating]);

    const handleSearch = (
        selectedKeys: string[],
        confirm: (param?: FilterConfirmProps) => void,
        dataIndex: DataIndex
    ) => {
        confirm();
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters: () => void) => {
        clearFilters();
    };
    //Search
    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<DataType> => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}: any) => (
            <div style={{padding: 8}} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{marginBottom: 8, display: 'block'}}
                />
                <Space>
                    <Button
                        type="default"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{width: 90}}
                    >
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{width: 90}}
                    >
                        Làm Mới
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{color: filtered ? '#1677ff' : undefined}}/>
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible: any) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text: any) =>
            searchedColumn === dataIndex ? text : text
    });
    // Columns
    const columns: ColumnsType<DataType> = [
        {
            title: 'Tên phim',
            dataIndex: 'name',
            key: 'name',
            width: '35%',
            ellipsis: true,
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Năm chiếu',
            dataIndex: 'yearofmanufacture',
            key: 'yearofmanufacture',
            sorter: (a, b) => a.yearofmanufacture - b.yearofmanufacture,
        },
        {
            title: 'Quốc gia',
            dataIndex: 'countryName',
            key: 'countryName',
            width: '10%'
        },
        {
            title: 'Thời lượng',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Giới hạn',
            dataIndex: 'limitage',
            key: 'limitage',
            sorter: (a, b) => a.limitage - b.limitage,
        },
        {
            title: 'Poster',
            dataIndex: 'poster',
            key: 'poster',
            render: (_, record, idx) => (
                <div key={idx}>
                    <Image src={`https://zuhot-cinema-images.s3.amazonaws.com/poster-movie/${_}`} alt={'Hình ảnh phim'}
                           width={80} height={100}/>
                </div>
            )
        },
        {
            title: "Chỉnh sửa",
            render: (_, record, idx) => (
                <Space size="middle">
                    <Button key={idx} className="buttonAction" onClick={() => handleShowModal(record)}>
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ];
    // ShowModalUpdate
    const handleShowModal = async (rowData: any) => {
        await fetchAPI.get("/movie/findMovieById?movieId=" + rowData.id)
            .then((response) => {
                setDetailMovie(response.data);
            })
            .catch((error) => console.error(error)).finally(() => setModalOpenUpdate(true))
    };
    //Config Layout Form
    const formItemLayout = {
        labelCol: {span: 3},
        wrapperCol: {span: 20},
    };
    // ChooseFileSystem
    const normFile = (e: any) => {
        if (e.file?.status === "removed") {
            setUpload(undefined)
        } else setUpload(e.file);
    };

    //On Submit Insert Movie
    const onCreate = (values: any) => {
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
                setModalOpenCreate(false)
            })
        } else {
            errorNotification('Vui lòng chọn hình ảnh!!!')
        }
    };
    const onUpdate = (values: any) => {
        if (upLoad) {
            const data = {
                ...values,
                'yearofmanufacture': Number(values['yearofmanufacture'].format('YYYY')),
                'arrayLanguage': values['language'].concat(values['arrayLanguage']),
                'poster': upLoad?.name,
            }
            delete data.language
            setCreating(true);
            const jsonBlob = new Blob([JSON.stringify(data)], {type: 'application/json'});
            fetchAPI.put('/movie/update', {json: jsonBlob, file: upLoad}, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Access-Control-Allow-Origin': '*'
                }
            }).then((s) => successNotification("Cập nhật phim thành công")).catch((e) =>
                errorNotification('Lỗi! Vui lòng kiểm tra lại dữ liệu nhập')
            ).finally(() => {
                setCreating(false);
                setModalOpenUpdate(false)
            })
        } else {
            errorNotification('Vui lòng chọn hình ảnh!!!')
        }
    };

    return (
        <div>
            {!session ? <LoadingComponent/> : <div>
                <Card title="Thông tin phim">
                    <Button type="default" className="buttonAction mb-3" onClick={() => setModalOpenCreate(true)}>
                        Thêm phim
                    </Button>
                    <Modal
                        title="Thêm phim"
                        centered
                        width={1200}
                        open={modalOpenCreate}
                        onCancel={() => setModalOpenCreate(false)}
                        okButtonProps={{hidden: true}}
                        cancelButtonProps={{hidden: true}}
                    >
                        <Form
                            name="formInsertMovie"
                            {...formItemLayout}
                            style={{maxWidth: 'none'}}
                            onFinish={onCreate}
                            preserve={false}
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
                                <Input placeholder="Thời lượng" addonAfter="Phút"/>
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
                                hidden
                                initialValue={'0'}
                            >
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
                                    <Button htmlType="button" onClick={() => setModalOpenCreate(false)}>Hủy</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Modal>

                    <Table dataSource={rootMovie} columns={columns} size="small" key="data"/>
                    <Modal
                        title="Chỉnh sửa Phim"
                        centered
                        width={1200}
                        open={modalOpenUpdate}
                        onCancel={() => setModalOpenUpdate(false)}
                        okButtonProps={{hidden: true}}
                        cancelButtonProps={{hidden: true}}
                        destroyOnClose
                    >
                        <Form
                            name="formUpdateMovie"
                            {...formItemLayout}
                            style={{maxWidth: 'none'}}
                            onFinish={onUpdate}
                            initialValues={{
                                id: detailMovie.id,
                                name: detailMovie.name,
                                time: detailMovie.time,
                                limitage: detailMovie.limitage,
                                describe: detailMovie.describe,
                                trailer: detailMovie.trailer,
                                status: '0',
                                countryid: detailMovie.countryid,
                                yearofmanufacture: dayjs(String(detailMovie.yearofmanufacture), 'YYYY'),
                                language: detailMovie?.language?.map((language: any) => language.id),
                                arrayType: detailMovie?.type?.map((type: any) => type.id),
                                arrayActor: detailMovie?.actor?.map((actor: any) => actor.name),
                                arrayDirector: detailMovie?.director?.map((director: any) => director.name),
                                arrayLanguage: [],
                            }}
                        >
                            {/*Mã Phim*/}
                            <Form.Item
                                name="id"
                                label="Mã Phim"
                            >
                                <Input placeholder="Mã phim" disabled/>
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
                                <Input placeholder="Thời lượng" addonAfter="Phút"/>
                            </Form.Item>
                            {/*Giới hạn độ tuổi*/}
                            <Form.Item
                                name="limitage"
                                label="Giới hạn độ tuổi"
                                rules={[{required: true, message: 'Vui lòng nhập giới hạn'}]}
                            >
                                <InputNumber placeholder="Độ tuổi"/>
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
                                name="language"
                                label="Ngôn ngữ đã có"
                            >
                                <Select mode="multiple" disabled>
                                    {rootLanguage && rootLanguage.map((s: any, idx: number) => (
                                        <Option value={s.id} key={idx}>{s.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="arrayLanguage"
                                label="Ngôn ngữ"
                                rules={[{type: 'array'}]}
                            >
                                <Select mode="multiple" placeholder="Vui lòng chọn ngôn ngữ">
                                    {rootLanguage && rootLanguage.map((s: any, idx: number) => (
                                        !detailMovie?.language?.some((lang: any) => lang.id === s.id) && (
                                            <Option value={s.id} key={idx}>{s.name}</Option>
                                        )
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
                                rules={[{required: true, message: 'Vui lòng nhập đạo diễn!'}]}
                            >
                                <Input placeholder="Đạo diễn"/>
                            </Form.Item>
                            {/*Diễn viên*/}
                            <Form.Item
                                name="arrayActor"
                                label="Diễn viên"
                                rules={[{required: true, message: 'Vui lòng nhập diễn viên!'}]}
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
                                hidden
                                initialValue={'0'}
                            >
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
                                        beforeUpload={() => {
                                            return false
                                        }}
                                        onRemove={() => setUpload(undefined)}
                                        maxCount={1}
                                >
                                    <Button icon={<UploadOutlined/>}>Chọn ảnh....</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item wrapperCol={{span: 12, offset: 6}}>
                                <Space>
                                    <Button type="default" htmlType="submit" loading={creating} disabled={creating}>
                                        {creating ? 'Đang cập nhật phim' : 'cập nhật'}
                                    </Button>
                                    <Button htmlType="button" onClick={() => setModalOpenUpdate(false)}>Hủy</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Modal>
                </Card>
            </div>}
        </div>
    )
}

export default ManageMovie;