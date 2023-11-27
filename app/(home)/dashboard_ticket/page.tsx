"use client"
import { fetchAPI, useFetch } from "@hooks";
import { Card, LineChart, SearchSelect, SearchSelectItem } from "@tremor/react";
import { Form } from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DateUtils } from "../../../util/DateUtils";

const DashBoard_Ticket = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [formTicket] = Form.useForm();
    const rootMovie = useFetch('/movie').data

    const onFinishTicket = (values: any) => {
        fetchAPI.get(`/v2/dashboard/statisticsTotalTicketInDay?movieId=${values.movie}&branchId=${values.branch}`)
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
    const customTooltip = (value: any) => {
        if (!value.active || !value.payload) return null;
        return (
            <>
                <div className="w-56 rounded-tremor-default text-tremor-default bg-tremor-background p-2 shadow-tremor-dropdown border border-tremor-border">
                    {value.payload.map((category: { color: any, value: any }, idx: number) => (
                        <div key={idx} className="flex flex-1 space-x-2.5">
                            <div className={`w-1 flex flex-col bg-${category.color}-500 rounded`} />
                            <div className="space-y-1">
                                <p className="text-tremor-content">Ngày: <span className="font-medium text-tremor-content-emphasis">{DateUtils.formatDate(new Date())}</span></p>
                                <p className="text-tremor-content">Giờ: <span className="font-medium text-tremor-content-emphasis">{value.label}</span></p>
                                <p className="text-tremor-content">Số lượng: <span className="font-medium text-tremor-content-emphasis">{category.value} Vé</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    };
    useEffect(() => {
        if (session) {
            setLoading(false)
        }
    }, [session])
    return (
        <div className="container">
            <div className="my-3">
                <Card>
                    <Form
                        form={formTicket}
                        onFinish={onFinishTicket}
                        layout={"vertical"}
                        style={{
                            maxWidth: 'none'
                        }}
                    >
                        {session?.user.role === 2 ?
                            <>
                                <Form.Item
                                    name="branch"
                                    label="Chi Nhánh"
                                >
                                    <SearchSelect
                                        placeholder="Chọn chi nhánh"
                                        onChange={handleTicketChange}
                                        enableClear={false}
                                    >
                                        <SearchSelectItem
                                            value={"0"}
                                            onSelect={handleTicketChange}
                                        >
                                            Tất cả
                                        </SearchSelectItem>
                                        {useFetch('/branch').data?.map((s: any, idx: number) => (
                                            <SearchSelectItem
                                                key={idx}
                                                value={s.id}
                                                onSelect={handleTicketChange}
                                            >
                                                {s.name}
                                            </SearchSelectItem>
                                        ))}
                                    </SearchSelect>
                                </Form.Item>
                            </> :
                            <>
                                <Form.Item
                                    name="branch"
                                    label="Chi Nhánh"
                                >
                                    <SearchSelect
                                        placeholder="Chọn chi nhánh"
                                        onChange={handleTicketChange}
                                        enableClear={false}
                                    >
                                        {useFetch('/branch').data?.map((s: any, idx: number) => {
                                            session?.user.branchId == s.branchid ? <SearchSelectItem
                                                key={idx}
                                                value={s.id}
                                                onSelect={handleTicketChange}
                                            >
                                                {s.name}
                                            </SearchSelectItem> : null
                                        })}
                                    </SearchSelect>
                                </Form.Item>
                            </>
                        }
                        {session?.user.role === 2 ?
                            <Form.Item
                                name="movie"
                                label="Phim"
                            >
                                <SearchSelect
                                    placeholder="Chọn phim"
                                    onChange={handleTicketChange}
                                    enableClear={false}
                                >
                                    <SearchSelectItem
                                        value={"0"}
                                        onSelect={handleTicketChange}
                                    >
                                        Tất cả
                                    </SearchSelectItem>
                                    {rootMovie?.map((s: any, idx: number) => (
                                        <SearchSelectItem
                                            key={idx}
                                            value={s.id}
                                            onSelect={handleTicketChange}
                                        >
                                            {s.name}
                                        </SearchSelectItem>
                                    ))}
                                </SearchSelect>
                            </Form.Item> :
                            <Form.Item
                                name="movie"
                                label="Phim"
                            >
                                <SearchSelect
                                    placeholder="Chọn phim"
                                    onChange={handleTicketChange}
                                    enableClear={false}
                                >
                                    {rootMovie?.map((s: any, idx: number) => (
                                        <SearchSelectItem
                                            key={idx}
                                            value={s.id}
                                            onSelect={handleTicketChange}
                                        >
                                            {s.name}
                                        </SearchSelectItem>
                                    ))}
                                </SearchSelect>
                            </Form.Item>
                        }
                    </Form >
                    <LineChart showLegend={false} customTooltip={customTooltip} className="h-72 mt-4" noDataText="Không có dữ liệu" colors={["indigo"]} allowDecimals={false} data={ticket} autoMinValue={true} startEndOnly={true} index={"starttime"} categories={["quantity"]} />
                </Card >
            </div >
        </div >
    )
}
export default DashBoard_Ticket;