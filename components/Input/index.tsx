interface InputComponentProps{
    labelText: string,
    classCss?: string,
    name?: string,
    register?: any,
    type?: 'text' | 'password' | 'hidden',
    required?: boolean,
    errors?: any
}

const InputComponent = ({labelText, classCss, name = '', register, type = 'text', required = false, errors}: InputComponentProps) => {
    return (
        <div className={classCss}>
            <label htmlFor={name} className="block text-gray-600 text-sm font-medium mb-2">{labelText} {required && <b className="text-red-600">(*)</b>}</label>
            <input type={type} {...register}
                id={name} name={name} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 disabled:bg-slate-100" disabled={name == 'id'}/>
            {errors && errors[name] && <p className="text-red-500">{errors[name].message}</p>}
        </div>
    )
}
export default InputComponent;