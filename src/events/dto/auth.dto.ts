import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username cannot be empty.' })
  @MaxLength(20, { message: 'Username cannot be longer than 20 characters.' })
  username: string;
}