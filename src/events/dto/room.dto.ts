import { IsString, IsNotEmpty } from 'class-validator';

export class RoomDto {
  @IsString()
  @IsNotEmpty({ message: 'Room name cannot be empty.' })
  roomName: string;
}