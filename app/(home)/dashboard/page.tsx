"use client"
import {useEffect, useState} from "react";
import {AutoComplete, Button, Col, Form, Row, Select} from "antd";
import {fetchAPI, useFetch} from "@hooks";
import * as XLSX from "xlsx"
import {AreaChart, BarChart, Card, SearchSelect, SearchSelectItem, Title} from "@tremor/react";
import {NumberUtils} from "../../../util/NumberUtils";
import {useSession} from "next-auth/react";

const DashBoard = () => {
    const [formValues, setFormValues] = useState<any>({});
    const [movie, setMovie] = useState([]);
    const [total, setTotal] = useState([]);
    const [branch, setBranch] = useState([]);
    const rootMovie = useFetch('/movie').data
    const rootYear = useFetch('/dashboard/fillYear').data
    const [formTotal] = Form.useForm();
    const [formMovie] = Form.useForm();
    const {data: session} = useSession();

    useEffect(() => {
        if (session?.user.role == 2) {
            fetchAPI.get('/branch').then((res) => (
                setBranch(res.data)
            ))
        }
        handleTotalChange()
    }, [session]);
    const onFinishTotal = (values: any) => {
        if (values.year != undefined && values.branch != undefined) {
            setFormValues(values);
            fetchAPI.get(`/v2/dashboard/findTotalPriceTicket?year=${values.year}&branchId=${values.branch}`)
                .then((response) => setTotal(response.data))
                .catch((error) => {
                    setTotal([])
                });
        }
    };
    const onFinishMovie = (values: any) => {
        if (values.movie != undefined) {
            fetchAPI.get(`/v2/dashboard/statisticsTicketPriceByMovie2?year=${formValues.year}&branchId=${formValues.branch}&movieId=${values.movie}`)
                .then((response) => response.data)
                .then((data) => setMovie(data))
                .catch((error) => {
                    setMovie([])
                });
        }
    }
    const handleTotalChange = () => {
        formTotal.submit();
    };
    const handleMovieChange = () => {
        formMovie.submit();
    };

    const handleOnExport = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(movie);
        XLSX.utils.book_append_sheet(wb, ws, 'data');
        XLSX.writeFileXLSX(wb, `Data.xlsx`)
    }

    return (
        <div>
            {session ?
                <div className="container">
                    <div className="mt-3">
                        <Card>
                            <Title>Tổng doanh thu</Title>
                            <Form
                                form={formTotal}
                                onFinish={onFinishTotal}
                                layout={"inline"}
                                name="TotalPrice"
                                style={{
                                    maxWidth: 'none',
                                }}
                            >
                                <Form.Item
                                    name="branch"
                                    label="Chi Nhánh"
                                    initialValue={session?.user.branchId || 'cn2'}
                                    hidden={session?.user.role != 2}

                                >
                                    {branch.length > 0 &&
                                        <Select
                                            placeholder="Chọn chi nhánh"
                                            allowClear
                                            options={branch?.map((s: any) => ({
                                                label: s.name,
                                                value: s.id
                                            }))}
                                            onChange={handleTotalChange}
                                            style={{
                                                width: "100px"
                                            }}
                                        >
                                        </Select>}
                                </Form.Item>
                                <Form.Item
                                    name="year"
                                    label="Năm"
                                    initialValue={new Date().getFullYear()}
                                >
                                    <Select
                                        placeholder="Chọn năm"
                                        allowClear
                                        options={rootYear?.map((s: any) => ({
                                            label: s.year,
                                            value: s.year
                                        }))}
                                        onChange={handleTotalChange}
                                    ></Select>
                                </Form.Item>
                            </Form>
                            <BarChart
                                className="h-[500px]"
                                data={total}
                                index="month"
                                categories={["totalPrice"]}
                                colors={["rose"]}
                                showAnimation
                                layout="vertical"
                                valueFormatter={(number) => NumberUtils.formatCurrency(number || 0)}
                                noDataText="Không có dữ liệu"
                            />
                        </Card>

                    </div>
                    <div className="my-3">
                        <Card>
                            <Title>Thống kê phim</Title>
                            <Form
                                form={formMovie}
                                onFinish={onFinishMovie}
                                style={{
                                    maxWidth: 'none',
                                }}
                            >
                                <Form.Item
                                    name="movie"
                                    label="Phim"
                                >
                                    <SearchSelect
                                        placeholder="Chọn phim"
                                        onChange={handleMovieChange}
                                        enableClear={false}
                                    >
                                        {rootMovie?.map((s: any) => (
                                            <SearchSelectItem
                                                value={s.id}
                                            >
                                                {s.name}
                                            </SearchSelectItem>
                                        ))}
                                    </SearchSelect>
                                </Form.Item>
                            </Form>
                            <div>
                                <Row>
                                    <Col md={12}>
                                        {movie?.length > 0 && (
                                            <Button onClick={handleOnExport}>Export</Button>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                            <AreaChart
                                className="h-72 mt-4"
                                data={movie}
                                index="month"
                                categories={["totalTicket", 'totalPrice']}
                                colors={["indigo", "cyan"]}
                                noDataText="Không có dữ liệu"
                                valueFormatter={(number) => NumberUtils.formatCurrency(number || 0)}
                                showAnimation
                                yAxisWidth={100}
                            />
                        </Card>
                    </div>
                </div> : <div>Đang tải....</div>
            }
        </div>
    );
}
export default DashBoard;