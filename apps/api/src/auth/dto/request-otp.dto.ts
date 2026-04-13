import { IsEmail, IsEnum, IsString, IsOptional } from 'class-validator';

export enum UserRole {
  INSTITUTION = 'INSTITUTION',
  JOURNALIST = 'JOURNALIST',
  INFLUENCER = 'INFLUENCER',
  AGENCY = 'AGENCY',
}

export class RequestOtpDto {
  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsString()
  @IsOptional()
  fullName?: string;
}
