import { DatePicker } from "antd";
import moment from "moment";

interface IDate{
    name: string,
    labelText: string,
    required?: boolean,
    value?: any
}

const DateComponent = ({name = '', labelText = '', required = false, value = moment()}:IDate) =>{
    return (
        <div>
            <label htmlFor={name} className="block text-gray-600 text-sm font-medium mb-2">{labelText} {required && <b className="text-red-600">(*)</b>}</label>
            <DatePicker defaultValue={value} format="DD/MM/YYYY" placeholder="Chọn ngày" className="w-full px-3 py-2 border border-gray-300 rounded " size={'large'} name={name}/>
        </div>
    )
}
export default DateComponent;