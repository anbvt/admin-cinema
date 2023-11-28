"use client"
import { fetchAPI } from "@hooks";
import { Card, LineChart, SearchSelect, SearchSelectItem, Title } from "@tremor/react";
import { Form } from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import LoadingComponent from "../../../components/Loading";
import { DateUtils } from "../../../util/DateUtils";

const DashBoard_Ticket = () => {
    const { data: session } = useSession();
    const [formTicket] = Form.useForm();
    const [branch, setBranch] = useState([]);
    const [movie, setMovie] = useState([])
    const [ticket, setTicket] = useState([]);

    useEffect(() => {
        if (session?.user.role == 2) {
            fetchAPI.get('/branch').then((res) => (
                setBranch(res.data)
            ))
            fetchAPI.get("/v2/dashboard/movieOfBranch?branchId=0").then(rs => {
                setMovie(rs.data)
            })
        } else if (session?.user.role == 1) {
            fetchAPI.get(`/v2/dashboard/movieOfBranch?branchId=${session?.user.branchId}`).then(rs => {
                setMovie(rs.data)
            })
        }
        handleTicketChange();
    }, [session])

    // Config for LineChart
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
    // Handle
    const onFinishTicket = (values: any) => {
        if (values.movie != undefined && values.branch != undefined) {
            fetchAPI.get(`/v2/dashboard/statisticsTotalTicketInDay?movieId=${values.movie}&branchId=${values.branch}`)
                .then((response) => response.data)
                .then((data) => setTicket(data))
                .catch((error) => {
                    setTicket([])
                    console.log('fetch data failed', error);
                });
            fetchAPI.get(`/v2/dashboard/movieOfBranch?branchId=${values.branch}`).then(rs => {
                setMovie(rs.data)
            })
        }

    }
    const handleTicketChange = () => {
        formTicket.submit();
    };

    return (
        <div className="container">
            <div className="my-3">
                {!session ? <LoadingComponent /> : (
                    <Card>
                        <Title>Thống kê vé</Title>
                        <Form
                            form={formTicket}
                            onFinish={onFinishTicket}
                            layout={"vertical"}
                            style={{
                                maxWidth: 'none'
                            }}
                        >
                            <Form.Item
                                name="branch"
                                label="Chi Nhánh"
                                initialValue={session?.user.branchId || '0'}
                                hidden={session?.user.role != 2}
                            >
                                <SearchSelect
                                    placeholder="Chọn chi nhánh"
                                    onChange={handleTicketChange}
                                    enableClear={false}
                                >
                                    <SearchSelectItem
                                        value={"0"}
                                    >
                                        Tất cả
                                    </SearchSelectItem>
                                    {branch.length > 0 && (
                                        branch.map((s: any, idx: number) => (
                                            <SearchSelectItem
                                                key={idx}
                                                value={s.id}
                                            >
                                                {s.name}
                                            </SearchSelectItem>
                                        ))
                                    )}
                                </SearchSelect>
                            </Form.Item>
                            <Form.Item
                                name="movie"
                                label="Phim"
                                initialValue={"0"}
                            >
                                <SearchSelect
                                    placeholder="Chọn phim"
                                    onChange={handleTicketChange}
                                    enableClear={false}
                                >
                                    <SearchSelectItem
                                        value={"0"}
                                    >
                                        Tất cả
                                    </SearchSelectItem>
                                    {movie?.map((s: any, idx: number) => (
                                        <SearchSelectItem
                                            key={idx}
                                            value={s.movieId}
                                        >
                                            {s.movieName}
                                        </SearchSelectItem>
                                    ))}
                                </SearchSelect>
                            </Form.Item>
                        </Form >
                        <LineChart showLegend={false} customTooltip={customTooltip} className="h-72 mt-4" noDataText="Không có dữ liệu" colors={["indigo"]} allowDecimals={false} data={ticket} autoMinValue={true} startEndOnly={true} index={"starttime"} categories={["quantity"]} />
                    </Card >
                )}
            </div >
        </div >
    )
}
export default DashBoard_Ticket;