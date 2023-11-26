
export class NumberUtils{
    public static formatCurrency(value:number) : string{
        return value.toLocaleString("vi-VI",{
            style: 'currency',
            currency: 'VND'
        })
    }
}