import React from 'react';
import {Table, Select, Input, Form, DatePicker, TimePicker, Button, Modal, Space} from 'antd';
import {FormInstance} from 'antd/lib/form';

const {Option} = Select;
import dayjs from "dayjs";
import {Item} from "./Item";

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
    editing: boolean;
    dataIndex: string;
    title: string;
    inputType: 'text' | 'select' | 'date' | 'time';
    record: Item;
    index: number;
    children: React.ReactNode;
    form: FormInstance<any>;
    rooms: any;
    dimension: any;
    movieAndLanguage: any;
    setSelectedBranchId: (branchId: number) => {};
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                       editing,
                                                       dataIndex,
                                                       title,
                                                       inputType,
                                                       record,
                                                       index,
                                                       children,
                                                       form,
                                                       rooms,
                                                       dimension,
                                                       movieAndLanguage,
                                                       setSelectedBranchId,
                                                       ...restProps
                                                   }) => {
    const handleLanguageOfMovieChange = (value: number) => {
        record.languageOfMovieId = value;
    };

    const handleDimensionChange = (value: string) => {
        const foundItems = dimension.filter((item: any) => item.name === value)
        record.dimensionId = foundItems[0].id;
    };

    const handleRoomChange = (value: string) => {
        const foundItems = rooms.filter((item: any) => item.name === value)
        record.roomId = foundItems[0].id;
    };

    const inputNode = () => {
        switch (inputType) {
            case 'select':
                if (dataIndex === 'roomName')
                    return (
                        <Select onChange={handleRoomChange}>
                            {rooms.map((room: any) => (
                                <Select.Option
                                    value={room.name}
                                    key={room.id}
                                    children={<p>{room.name}</p>}
                                />
                            ))}
                        </Select>
                    )
                else if (dataIndex === 'movieAndLanguage')
                    return (
                        <Select
                            className={"!w-72 h-fit"}
                            onChange={handleLanguageOfMovieChange}>
                            {movieAndLanguage.map((mnl: any) => (
                                <Select.Option
                                    value={mnl.id}
                                    key={mnl.id}
                                    children={
                                        <p className={"flex-wrap whitespace-normal"}>{mnl.id} - {mnl.movieName} ({mnl.languageName})</p>
                                    }
                                />
                            ))}
                        </Select>
                    )
                else if (dataIndex === 'dimensionName')
                    return (
                        <Select onChange={handleDimensionChange}>
                            {dimension.map((d: any) => (
                                <Select.Option
                                    value={d.name}
                                    key={d.id}
                                    children={<p className={"flex-wrap"}>{d.name}</p>}
                                />
                            ))}
                        </Select>
                    )
                break;
            case 'date':
                return <DatePicker defaultValue={dayjs(`${record.showDate}`)}/>;
            case 'time':
                return <TimePicker/>;
            default:
                if (dataIndex === 'price')
                    return <Input
                        type={"number"}
                        step={5000}
                        min={0}
                        className={"w-28"}
                    />

                return <Input/>;
        }
    };

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item name={dataIndex} style={{margin: 0}}>
                    {inputNode()}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
};

export default EditableCell;