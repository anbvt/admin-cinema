export class DateUtils {
    public static formatDate(date: Date): string {
        return date.toLocaleDateString("vi-VI");
    }
}