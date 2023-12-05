import {Moment} from "moment/moment";

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
    showDate: Moment;
    startTime: Moment;
    languageId: number;
    languageName: string;
    dimensionName: string;
    price: number;
    movieAndLanguage: string;
    editable?: boolean;
}