"use client"
import {useEffect, useState} from "react";
import {Button, Col, DatePicker, Form, Row, Select} from "antd";
import {fetchAPI, useFetch} from "@hooks";
import * as XLSX from "xlsx"
import {AreaChart, BarChart, Card, SearchSelect, SearchSelectItem, Title} from "@tremor/react";
import {NumberUtils} from "@util/NumberUtils";
import {useSession} from "next-auth/react";
import {LoadingComponent} from "@components";
import dayjs from "dayjs";

const {RangePicker} = DatePicker;
type Movie = {
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
                .then((response) => setTotal(response.data.map((s:any)=>{ return {...s, ['Tổng giá']: s.totalPrice,month:"Tháng "+ s.month};})))
                .catch((error) => {
                    setTotal([])
                });
        }
    };
    const onFinishMovie = (values: any) => {
        if (values.movie != undefined) {
            fetchAPI.get(`/v2/dashboard/statisticsTicketPriceByMovie2?year=${formValues.year}&branchId=${formValues.branch}&movieId=${values.movie}`)
                .then((response) => setMovie(response.data.map((s:any)=>{ return {...s, ['Tổng giá']: s.totalPrice,['Tổng vé']:s.totalTicket,month:"Tháng "+ s.month};})))
                .catch((error) => {
                    setMovie([])
                });
            if(values.date !== undefined){
                fetchAPI.get(`/v2/dashboard/statisticsTicketPriceByMovieFromDate?movieId=${values.movie}&branchId=${formValues.branch}&startDate=${values.date[0].format('YYYY-MM-DD')}&endDate=${values.date[1].format('YYYY-MM-DD')}`)
                    .then((response)=> setMovie(response.data.map((s:any)=>{ return {...s, ['Tổng giá']: s.totalPrice,['Tổng vé']:s.totalTicket,month:"Tháng "+ s.month};})))
                    .catch((e)=>{
                        setMovie([])
                    });
            }
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
            ["Chi nhánh", formValues.branch]
        ];
        let ws_header = ["Tháng", "Tổng vé", "Tổng giá", "Năm", "date"]
        let ws_data = movie.map((n) => {
            return {
                month: n.month,
                "Tổng vé": n.totalTicket,
                "Tổng giá": n.totalPrice,
                year: n.year,
                date: n.date
            }
        })
        const totalRow = {
            month: "Tổng Cộng",
            "Tổng vé": {f: `SUM(B4:B${ws_data.length + 3})`, t: 'n'},
            "Tổng giá": {f: `SUM(C4:C${ws_data.length + 3})`, t: 'n', z: '#,##0 VNĐ'},
            year: "",
            date: ""
        };
        const ws = XLSX.utils.json_to_sheet(ws_data, {header: ws_header, origin: "A3"});
        XLSX.utils.sheet_add_aoa(ws, ws_info, {origin: "C1"});
        XLSX.utils.sheet_add_json(ws, [totalRow], {header: ws_header, skipHeader: true, origin: -1});
        for (let i = 0; i <= 5; i++) {
            if (!ws["!cols"]) ws["!cols"] = [];
            if (!ws["!cols"][i]) ws["!cols"][i] = {wch: 12};
        }
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
                                                width: "200px"
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
                                        options={rootYear?.map((s: any, idx: number) => ({
                                            label: s.year,
                                            value: s.year,
                                            key: idx
                                        }))}
                                        onChange={handleTotalChange}
                                    ></Select>
                                </Form.Item>
                            </Form>
                            <BarChart
                                className="h-[500px]"
                                data={total}
                                index="month"
                                categories={["Tổng giá"]}
                                colors={["rose"]}
                                showAnimation
                                layout="vertical"
                                valueFormatter={(number) => NumberUtils.formatCurrency(number || 0)}
                                noDataText="Không có dữ liệu"
                                yAxisWidth={100}
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
                                layout={"inline"}
                            >
                                <Form.Item
                                    name="movie"
                                    label="Phim"
                                    style={{width: "700px"}}
                                >
                                    <SearchSelect
                                        placeholder="Chọn phim"
                                        onChange={handleMovieChange}
                                        enableClear={false}
                                    >
                                        {rootMovie?.map((s: any, idx: number) => (
                                            <SearchSelectItem
                                                value={s.id}
                                                key={idx}
                                            >
                                                {s.name}
                                            </SearchSelectItem>
                                        ))}
                                    </SearchSelect>
                                </Form.Item>
                                <Form.Item
                                    name="date"
                                    label="Chọn Ngày"
                                >
                                    <RangePicker
                                        onCalendarChange={(val) => {
                                            setFormValues({...formValues, data: val});
                                        }}

                                        format={"DD-MM-YYYY"}
                                    />

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
                                categories={["Tổng vé", 'Tổng giá']}
                                colors={["indigo", "cyan"]}
                                noDataText="Không có dữ liệu"
                                valueFormatter={(number) => NumberUtils.formatCurrency(number || 0)}
                                showAnimation
                                yAxisWidth={100}
                            />
                        </Card>
                    </div>
                </div>
                : <LoadingComponent/>
            }
        </div>
    );
}
export default DashBoard;