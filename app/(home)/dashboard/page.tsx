"use client"
import React, {useEffect, useState} from "react";
import {AutoComplete, Button, Col, Form, Row, Select} from "antd";
import {fetchAPI, useFetch} from "@hooks";
import * as XLSX from "xlsx"
import {BarChart, Card, Title} from "@tremor/react";
import {CustomTooltipType} from "@tremor/react/dist/components/chart-elements/common/CustomTooltipProps";
import {NumberUtils} from "../../../util/NumberUtils";
import { useSession } from "next-auth/react";


const DashBoard = () => {
    const rootMovie = useFetch('/movie').data
    const {data: total, setUri} = useFetch('');
    const [movie, setMovie] = useState([]);
    const [formValues, setFormValues] = useState<any>({});
    const [formTotal] = Form.useForm();
    const [formMovie] = Form.useForm();
    const {data : session} = useSession();


    useEffect(() => {
        handleTotalChange()
    }, []);
    const onFinishTotal = (values: any) => {
        if (values.year != undefined && values.branch != undefined) {
            setUri(`/v2/dashboard/findTotalPriceTicket?year=${values.year}&branchName=${values.branch}`)
            setFormValues(values)
        }
    };
    const onFinishMovie = (values: any) => {
        if (values.movie != undefined) {
            fetchAPI.get(`/v2/dashboard/statisticsTicketPriceByMovie2?year=${formValues.year}&branchName=${formValues.branch}&movieName=${values.movie}`)
                .then((response) => response.data)
                .then((data) => setMovie(data))
                .catch((error) => {
                    setMovie([])
                    console.log('fetch data failed', error);
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
        console.log(movie)
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(movie);
        XLSX.utils.book_append_sheet(wb, ws, 'data');
        XLSX.writeFileXLSX(wb, `Data.xlsx`)
    }

    const customTooltip :  React.ComponentType<CustomTooltipType> = ({ payload, active }) => {
        if (!active || !payload) return null;
        return (
            <div className="w-56 rounded-tremor-default text-tremor-default bg-tremor-background p-2 shadow-tremor-dropdown border border-tremor-border">
                {payload.map((category, idx) => (
                    <div key={idx} className="flex flex-1 space-x-2.5">
                        <div className={`w-1 flex flex-col bg-${category.color}-500 rounded`} />
                        <div className="space-y-1">
                            <p className="text-tremor-content">{category.dataKey}</p>
                            <p className="font-medium text-tremor-content-emphasis">{NumberUtils.formatCurrency(category.value as number || 0) }</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    return (
        <div className="container">
            <div className="mt-3">
                <Card>
                    <Title>Tổng doanh thu</Title>
                    <Form
                        form={formTotal}
                        onFinish={onFinishTotal}
                        layout={"inline"}
                        name="control-hooks"
                        style={{
                            maxWidth: 'none',
                        }}
                    >
                        <Form.Item
                            name="branch"
                            label="Chi Nhánh"
                            initialValue={session?.user.role != 2? session?.user.branchid :"cn1"}
                            hidden={session?.user.role != 2}
                        >
                            <Select
                                placeholder="Chọn chi nhánh"
                                allowClear
                                options={session?.user.role != 2 ? [] : useFetch('/branch').data?.map((s: any) => ({label: s.name, value: s.id}))}
                                onSelect={handleTotalChange}
                            >
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="year"
                            label="Năm"
                            initialValue={new Date().getFullYear()}
                        >
                            <Select
                                placeholder="Chọn năm"
                                allowClear
                                options={useFetch('/dashboard/fillYear').data?.map((s: any) => ({
                                    label: s.year,
                                    value: s.year
                                }))}
                                onSelect={handleTotalChange}
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
                        customTooltip={customTooltip}
                    />
                </Card>

            </div>
            <div className="my-3">
                <h1>Thống kê phim</h1>
                <Form
                    form={formMovie}
                    onFinish={onFinishMovie}
                    name="control-hooks"
                    style={{
                        maxWidth: 'none',
                    }}
                >
                    <Form.Item
                        name="movie"
                        label="Phim"
                    >
                        <AutoComplete
                            placeholder="Chọn phim"
                            options={rootMovie?.map((s: any) => ({label: s.name, value: s.name}))}
                            filterOption={(inputValue, option) =>
                                option!.value?.toString().toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                            }
                            onSelect={handleMovieChange}
                            allowClear
                        />
                    </Form.Item>
                </Form>
                {movie.length > 0 && (<>
                    <Row>
                        <Col md={12}>
                            <Button onClick={handleOnExport}>Export</Button>
                        </Col>
                    </Row>
                </>)}
            </div>
        </div>
    );
}
export default DashBoard;