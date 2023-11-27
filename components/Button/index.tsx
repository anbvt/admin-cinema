import { ReactNode } from "react";

interface ButtonComponentProps{
    children: ReactNode | string
    type?:'button' | 'submit',
    color?: 'red' | 'blue' | 'green',
    onClick?: any
}

const ButtonComponent = ({children, type = 'button', color = 'blue', onClick}: ButtonComponentProps) => {

    return (
        <button type={type} onClick={onClick} className={`w-full bg-${color}-500 text-white py-2 px-4 rounded hover:bg-${color}-600 focus:outline-none focus:shadow-outline-blue active:bg-${color}-800`}>{children}</button>
    )
}
export default ButtonComponent;