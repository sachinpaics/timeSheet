// These are interface for the two DB models used for the project.

export interface User {
    id: string;
    email: string;
    name:string,
    last_name:string
}

export interface DataType {
    id: number;
    date: string;
    day: string;
    punch_in: string;
    punch_out: string;
    duration: string;
}