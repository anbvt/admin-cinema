"use client"
import { fetchAPI, useFetch } from "@hooks";
import { Form, Select } from "antd";
import { useState } from "react";

const DashBoard_Ticket = () => {
    const [formTicket] = Form.useForm();
    const rootMovie = useFetch('/movie').data
    const onFinishTicket = (values: any) => {
        fetchAPI.get(`/v2/dashboard/statisticsTotalTicketInDay?movieId=${values.movie == undefined ? 0 : values.movie}&branchId=${values.branch == undefined ? 0 : values.branch}`)
            .then((response) => response.data)
            .then((data) => setTicket(data))
            .catch((error) => {
                setTicket([])
                console.log('fetch data failed', error);
            });
    }
    const handleTicketChange = () => {
        formTicket.submit();
    };
    const [ticket, setTicket] = useState([]);
    return (
        <div className="container">
            <div className="my-3">
                <Form
                    form={formTicket}
                    onFinish={onFinishTicket}
                    layout={"inline"}
                    name="control-hooks"
                    style={{
                        maxWidth: 'none',
                    }}
                >
                    <Form.Item
                        name="branch"
                        label="Chi Nhánh"
                    >
                        <Select
                            placeholder="Chọn chi nhánh"
                            allowClear
                            options={useFetch('/branch').data?.map((s: any) => ({ label: s.name, value: s.id }))}
                            onChange={handleTicketChange}
                        >
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="movie"
                        label="Phim"
                    >
                        <Select
                            placeholder="Chọn phim"
                            allowClear
                            options={rootMovie?.map((s: any) => ({ label: s.name, value: s.id }))}
                            onChange={handleTicketChange}
                        ></Select>
                    </Form.Item>
                </Form>
            </div>
        </div>
    )
}
export default DashBoard_Ticket;