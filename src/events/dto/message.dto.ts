import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class MessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  roomName?: string;
}

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  roomName: string;
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  roomName: string;
}