"use client"

import { InputComponent, ButtonComponent, LoadingComponent, DateComponent } from "@components"
import { fetchAPI } from "@hooks";
import { Radio } from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"


interface IFormInput {
    id: string,
    branchId: string,
    name: string,
    gender: boolean,
    password: string,
    birthday: (s: string) => moment.Moment,
    phone: string,
    email: string
    role: number
}

const InformationPage = () => {
    const { data: session, status } = useSession({ required: true });
    const [loading, setLoading] = useState(true);
    const { handleSubmit, register, formState: { errors }, reset, getValues, setValue } = useForm();

    useEffect(() => {
        if (session)
            fetchAPI.get("/staff/" + session.user.id).then(s => { reset(s.data); setLoading(false); })
    }, [session]);

    const onSubmit = async (data: any) => {
        await fetchAPI.post("/staff/update", data);
    }

    return (
        loading ? <LoadingComponent /> : (<div className="m-10">
            <form name="form-information" onSubmit={handleSubmit(onSubmit)} >
                <InputComponent register={register('id')} classCss="mb-4" labelText="ID Nhân viên" name="id" />
                <InputComponent register={register('name', { required: 'Vui lòng nhập tên' })} classCss="mb-4" labelText="Họ và tên" name="name" errors={errors} />
                <div className="grid grid-cols-2 gap-x-20">
                    <div>
                        <label htmlFor={"gender"} className="block text-gray-600 text-sm font-medium mb-2">Giới tính</label>
                            <Radio.Group defaultValue={getValues('gender')} onChange={(data:any) => setValue('gender', data.target.value)} className="w-full px-3 py-2 border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-slate-100">
                                <Radio value={true}>Nam</Radio>
                                <Radio value={false}>Nữ</Radio>
                            </Radio.Group>
                    </div>
                    <InputComponent register={register('email', { 
                        required: 'Vui lòng nhập email',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                            message: 'Chưa đúng định dạng email',
                        },
                 })} classCss="mb-4" labelText="Email" name="email" errors={errors} />
                </div>
                <div className="grid grid-cols-2 gap-x-20">
                    <InputComponent register={register('phone', { 
                        required: 'Vui lòng nhập số điện thoại',
                        maxLength: {
                            value: 10,
                            message: "Số điện thoại tối đa 10 kí tự"
                        }
                })} classCss="mb-4" labelText="Số điện thoại" name="phone" errors={errors} />
                    <DateComponent labelText="Sinh nhật" name="birthday" />
                </div>
                <div className="grid grid-cols-2 gap-10">
                    <ButtonComponent type="submit">Cập nhật</ButtonComponent>
                    <ButtonComponent onClick={() => reset(getValues())} color="green">Làm mới</ButtonComponent>
                </div>
            </form >
        </div >)
    )
}
export default InformationPage;