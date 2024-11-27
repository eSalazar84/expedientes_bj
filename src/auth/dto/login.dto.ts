import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(60)
    email_dependencia: string

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(60)
    password: string;
}