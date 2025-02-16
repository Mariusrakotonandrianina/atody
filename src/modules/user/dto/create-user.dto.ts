import { IsEmail, IsNotEmpty, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsOptional()
    googleId: string | null;

}