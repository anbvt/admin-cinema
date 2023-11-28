"use client"
import {signIn, useSession} from "next-auth/react";
import { useForm } from "react-hook-form";
import {redirect} from "next/navigation";

const LoginPage = () => {
    const {data : session} = useSession();
    if(session) return redirect("/");
    const { handleSubmit, register, formState: { errors } } = useForm({
        defaultValues: {
            email: 'khaiminh0401@gmail.com',
            password: '04012003'
        }
    });

    const onSubmit = async(data: any) => {
        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: true
        });
    }

    return (
        <div className="bg-gray-100 flex items-center justify-center h-screen">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-semibold mb-6">Đăng nhập</h2>
                <form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-600 text-sm font-medium mb-2">Email <b className="text-red-600">(*)</b></label>
                        <input type="email" {...register('email', {
                            required: 'Yêu cầu nhập email'
                        })}
                            id="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-600 text-sm font-medium mb-2">Password <b className="text-red-600">(*)</b></label>
                        <input type="password" {...register('password', {
                            required: 'Yêu cầu nhập mật khẩu'
                        })}
                            id="password" name="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:shadow-outline-blue active:bg-blue-800">Login</button>
                </form>
            </div>
        </div>
    );
}
export default LoginPage;