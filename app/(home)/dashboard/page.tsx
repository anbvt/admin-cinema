"use client"
import {useEffect, useState} from "react";
import {Button, Col, Form, Row, Select} from "antd";
import {fetchAPI, useFetch} from "@hooks";
import * as XLSX from "xlsx"
import {AreaChart, BarChart, Card, SearchSelect, SearchSelectItem, Title} from "@tremor/react";
import {NumberUtils} from "../../../util/NumberUtils";
import {useSession} from "next-auth/react";
import {LoadingComponent} from "@components";

type Movie ={
    id: string,
    movieName: string,
    date: string,
    year: number,
    month: number,
    totalPrice: number,
    totalTicket: number
}
const DashBoard = () => {
    const [formValues, setFormValues] = useState<any>({});
    const [movie, setMovie] = useState<Movie[]>([]);
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
                .then((response) => setMovie(response.data))
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
        let ws_info = [
            ["Tên Phim", movie[0].movieName],
            ["Chi nhánh", formValues.branchId]
        ];
        let ws_header = ["month", "totalTicket", "totalPrice", "year", "date"]
        let ws_data = movie.map((n) => {
            return {
                month: n.month,
                totalTicket: n.totalTicket,
                totalPrice: n.totalPrice,
                year: n.year,
                date: n.date
            }
        })
        let ws = XLSX.utils.json_to_sheet(ws_data, {header: ws_header, origin: "A3"});
        XLSX.utils.sheet_add_aoa(ws, ws_info, {origin: "C1"});
        XLSX.utils.sheet_add_json(ws, [], {header: ["Tổng Cộng"], origin: -1});
        XLSX.utils.sheet_set_array_formula(ws, "B8", "=SUM(B4:B7)");
        XLSX.utils.sheet_set_array_formula(ws, "C8", "=SUM(C4:C7)");
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFileXLSX(wb, `${movie[0].movieName}.xlsx`, {cellStyles: true})
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
                </div> : <LoadingComponent/>
            }
        </div>
    );
}
export default DashBoard;