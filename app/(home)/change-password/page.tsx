"use client"
import { Radio, notification } from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {ButtonComponent, InputComponent, LoadingComponent} from "@components";
import { fetchAPI } from "@hooks";
import Error from "next/error";



const ChangePasswordPage = () => {
    const { data: session } = useSession({ required: true });
    const [loading, setLoading] = useState(true);
    const [api, contextHolder] = notification.useNotification();
    const { handleSubmit, register, formState: { errors }, reset, getValues, setValue } = useForm({
        defaultValues: {
            id: "",
            passwordOld: "",
            passwordNew: "",
            rps: ""
        }
    });
    useEffect(() => {
        if (session) {
            setValue("id", session.user.id);
            setLoading(false);
        }
    }, [session]);

    const onSubmit = async (data: any) => {
        try {
            await fetchAPI.post("/staff/updatePassword", data)
        } catch (e: any) {
            api['error']({
                message: 'Thông báo lỗi',
                description: e?.response.data.message || ""
            })
        }
    }

    return (
        loading ? <LoadingComponent /> : <>{contextHolder}<div className="m-10">
            <form name="form-information" onSubmit={handleSubmit(onSubmit)} >
                <input type="hidden" {...register("id")} />
                <InputComponent register={register('passwordOld',
                    {
                        required: 'Vui lòng nhập mật khẩu cũ',
                        minLength: {
                            value: 8,
                            message: "Mật khẩu tối đa 8 kí tự"
                        }
                    })} classCss="mb-4" labelText="Mật khẩu cũ" name="passwordOld" />
                <InputComponent register={register('passwordNew',
                    {
                        required: 'Vui lòng nhập mật khẩu mới',
                        minLength: {
                            value: 8,
                            message: "Mật khẩu tối đa 8 kí tự"
                        }
                    })} classCss="mb-4" labelText="Mật khẩu mới" name="passwordNew" />
                <InputComponent register={register('rps', {
                    required: 'Vui lòng nhập mật khẩu',
                    minLength: {
                        value: 8,
                        message: "Mật khẩu tối đa 8 kí tự"
                    },
                    validate: (value) => value === getValues('passwordNew') || 'Không trùng khớp với mật khẩu mới phía trên'
                })} classCss="mb-4" labelText="Nhập lại mật khẩu" name="rps" errors={errors} />
                <div className="grid grid-cols-2 gap-10">
                    <ButtonComponent type="submit">Cập nhật</ButtonComponent>
                    <ButtonComponent onClick={() => reset({
                        passwordOld: "",
                        passwordNew: "",
                        rps: ""
                    })} color="green">Hủy</ButtonComponent>
                </div>
            </form >
        </div ></>
    )
}
export default ChangePasswordPage;