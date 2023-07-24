export interface User {
    id: string;
    mobile: number;
    firstName: string;
    lastName: string;
    email: string;
    registrationDate: string;
    role: string;
    active: boolean;
    twilio_sid: string;
    twilio_auth: string;
}
