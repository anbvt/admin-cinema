const error = [
    {
        code: "RP_01",
        name: "NOTHING",
        message: " đang không có dữ liệu"
    },
    {
        code: "RP_02",
        name: "INVALID_TYPE",
        message: " bị sai kiểu dữ liệu"
    },
    {
        code: "RP_03",
        name: "WRONG",
        message: " không chính xác"
    },
    {
        code: "RP_04",
        name: "NOT_EXISTS",
        message: " không tồn tại"
    },
    {
        code: "RP_05",
        name: "NOT_FOUND",
        message: " không tìm thấy"
    },
    {
        code: "RP_06",
        name: "EXISTS",
        message: " đã tồn tại"
    }
]
export const checkError = (param: string, code: string) => {
    const filteredErrors = error.filter((error) => error.code === code);
    return param + filteredErrors[0].message;
}