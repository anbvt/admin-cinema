import React from 'react';
import {Table, Select, Input, Form, DatePicker, TimePicker, Button, Modal} from 'antd';
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
    branches: any;
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
                                                       branches,
                                                       rooms,
                                                       dimension,
                                                       movieAndLanguage,
                                                       setSelectedBranchId,
                                                       ...restProps
                                                   }) => {
    const handleBranchChange = (value: string) => {
        const foundItems = branches.filter((item: any) => item.name === value)
        record.branchId = foundItems[0].id;
        setSelectedBranchId(foundItems[0].id);
    };

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
                if (dataIndex === 'roomName') {
                    return (
                        <Select onChange={handleRoomChange}>
                            {rooms.map((room: any) => (
                                <Option value={room.name} key={room.id}>
                                    {room.name}
                                </Option>
                            ))}
                        </Select>
                    )
                } else if (dataIndex === 'branchName') {
                    return (
                        <Select onChange={handleBranchChange}>
                            {branches.map((branch: any) => (
                                <Option value={branch.name} key={branch.id}>
                                    {branch.name}
                                </Option>
                            ))}
                        </Select>
                    )
                } else if (dataIndex === 'movieAndLanguage')
                    return (
                        <Select onChange={handleLanguageOfMovieChange}>
                            {movieAndLanguage.map((mnl: any) => (
                                <Option value={mnl.id} key={mnl.id}>
                                    {mnl.id} - {mnl.movieName} ({mnl.languageName})
                                </Option>
                            ))}
                        </Select>
                    )
                else if (dataIndex === 'dimensionName')
                    return (
                        <Select onChange={handleDimensionChange}>
                            {dimension.map((d: any) => (
                                <Option value={d.name} key={d.id}>
                                    {d.name}
                                </Option>
                            ))}
                        </Select>
                    )
                break;
            case 'date':
                return <DatePicker defaultValue={dayjs(`${record.showDate}`)}/>;
            case 'time':
                return <TimePicker />;
            default:
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