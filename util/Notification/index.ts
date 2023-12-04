import {notification} from 'antd';

notification.config({
    maxCount: 3,
    placement: 'bottomRight'
});
export const otherNotification = (type: 'success' | 'info' | 'warning' | 'error', message: string, description: string) => {
    notification[type]({
        message,
        description
    });
};
export const successNotification = (description: string) => {
    notification["success"]({
        message: "Thông báo:",
        description: description
    })
}
export const errorNotification = (description: string) => {
    notification["error"]({
        message: "Thông báo lỗi:",
        description: description
    })
}
