"use client"
import React, {useEffect, useState} from "react";
import {Bar, DualAxes} from '@ant-design/plots';
import {Form, Select} from "antd";
import {useFetch} from "@hooks";

const dashBoard = () => {
    const [total, setTotal] = useState([]);
    const [movie, setMovie] = useState([]);
    const [formValues, setFormValues] = useState({});
    const [formTotal] = Form.useForm();
    const [formMovie] = Form.useForm();

    const configTotal = {
        data: total,
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
            fetch(`http://localhost:8080/api/dashboard/findTotalPriceTicket?year=${values.year}&branchName=${values.branch}`)
                .then((response) => response.json())
                .then((json) => {
                    setTotal(json);
                    setFormValues(values);
                })
                .catch((error) => {
                    console.log('fetch data failed', error);
                });

        }
    };
    const onFinishMovie = (values: any) => {
        if (values.movie != undefined) {
            fetch(`http://localhost:8080/api/dashboard/statisticsTicketPriceByMovie2?year=${formValues.year}&branchName=${formValues.branch}&movieName=${values.movie}`)
                .then((response) => response.json())
                .then((json) => json.statusCode == 400 ? setMovie([]) : setMovie(json))
                .catch((error) => {
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
                            options={useFetch('/branch').data.map((s: any) => ({label: s.name, value: s.name}))}
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
                            options={useFetch('/dashboard/fillYear').data.map((s: any) => ({label: s.year, value: s.year}))}
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
                        <Select
                            placeholder="Chọn phim"
                            allowClear
                            options={useFetch('/movie').data.map((s: any) => ({label: s.name, value: s.name}))}
                            onSelect={handleMovieChange}
                        >
                        </Select>
                    </Form.Item>
                </Form>
                <DualAxes {...configMovie} />
            </div>
        </div>
    );
}
export default dashBoard;