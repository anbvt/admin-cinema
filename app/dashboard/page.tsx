"use client"
import React, {useEffect, useState} from "react";
import {Bar, DualAxes} from '@ant-design/plots';
import {AutoComplete, Button, Col, Form, Row, Select} from "antd";
import {fetchAPI, useFetch} from "@hooks";
import * as XLSX from "xlsx"
import {writeFileXLSX} from "xlsx";

const DashBoard = () => {
    const rootMovie = useFetch('/movie').data
    const {data: total, setUri} = useFetch('');
    const [movie, setMovie] = useState([]);
    const [formValues, setFormValues] = useState<any>({});
    const [formTotal] = Form.useForm();
    const [formMovie] = Form.useForm();

    const configTotal = {
        data: total || [],
        xField: 'totalPrice',
        yField: 'month',
        seriesField: 'month',
        meta: {
            month: {
                formatter: (value: any, index?: number) => "Tháng " + value
            },
            totalPrice: {
                formatter: (value: any, index?: number) => value.toLocaleString("vi-VI", {
                    style: 'currency',
                    currency: 'VND'
                })
            }
        }
    };
    const configMovie = {
        data: [movie, movie],
        xField: 'month',
        yField: ['totalTicket', 'totalPrice'],
        meta: {
            totalPrice: {
                alias: 'Tổng giá',
                formatter: (value: any, index?: number) => value.toLocaleString("vi-VI", {
                    style: 'currency',
                    currency: 'VND'
                })
            },
            totalTicket: {
                alias: 'Tổng vé'
            }
        },
        title: 'Thống kê phim',
        geometryOptions: [
            {
                geometry: 'column',
            },
            {
                geometry: 'line',
                lineStyle: {
                    lineWidth: 2,
                },
            },
        ],

    };

    useEffect(() => {
        handleTotalChange()
    }, []);
    const onFinishTotal = (values: any) => {
        if (values.year != undefined && values.branch != undefined) {
            setUri(`/dashboard/findTotalPriceTicket?year=${values.year}&branchName=${values.branch}`)
                // .then((response) => response.data)
                // .then((data) => {
                //     setTotal(data);
                //     setFormValues(values);
                // })
                // .catch((error) => {
                //     console.log('fetch data failed', error);
                //     setTotal([]);
                // });

        }
    };
    const onFinishMovie = (values: any) => {
        if (values.movie != undefined) {
            fetchAPI.get(`/dashboard/statisticsTicketPriceByMovie2?year=${formValues.year}&branchName=${formValues.branch}&movieName=${values.movie}`)
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
        XLSX.writeFileXLSX(wb, 'MySheet.xlsx')
    }

    return (
        <div className="container">
            <div className="mt-3">
                <h1>Tổng doanh thu</h1>
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
                        initialValue={"Hưng Thịnh"}
                    >
                        <Select
                            placeholder="Chọn chi nhánh"
                            allowClear
                            options={useFetch('/branch').data?.map((s: any) => ({label: s.name, value: s.name}))}
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
                <Bar {...configTotal} />
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
                <DualAxes {...configMovie} />
            </div>
        </div>
    );
}
export default DashBoard;