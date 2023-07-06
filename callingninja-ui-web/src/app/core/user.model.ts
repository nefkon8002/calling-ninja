import {Role} from './role.model';

export interface User {
  token: string;
  mobile?: number;
  name?: string;
  role?: Role;
  email?: string;
}

export interface UserDto {
    mobile: string;
    firstName: string;
    lastName: string;
    familyName: string
    email: string;
    dni: string;
    address: string;
    password: string;
    role: Role;
    active: boolean;
    registrationDate: Date;
    company: string;
    id: 0;
    guid: string;
    balance: string;
    picture: string;
    age: 0;
    eyeColor: string;
    twilio_sid: string;
    twilio_auth: string;
    //creator_user:User
  }



  export interface account_dto{
      password: string,
      username: string,
      authorities: [
        {
          authority: string
        }
      ],
      accountNonExpired: boolean,
      accountNonLocked: boolean,
      credentialsNonExpired:boolean,
      enabled: boolean,
    }



