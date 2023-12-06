import {Moment} from "moment/moment";
import {DateTime} from "next-auth/providers/kakao";
import {Dayjs} from "dayjs";

export interface Item {
    id: number;
    branchId: string;
    roomId: string;
    languageOfMovieId: number;
    dimensionId: number;
    roomName: string;
    movieName: string;
    branchName: string;
    branchAddress: string;
    showDate: Moment | string;
    startTime: Dayjs;
    languageId: number;
    languageName: string;
    dimensionName: string;
    price: number | string;
    movieAndLanguage: string;
    editable?: boolean;
}