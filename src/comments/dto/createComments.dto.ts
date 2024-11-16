import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateCommentDto {
  @IsNotEmpty()
  @IsUUID()
  postId!: string;


  @IsNotEmpty()
  @IsString()
  details!: string;

  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
