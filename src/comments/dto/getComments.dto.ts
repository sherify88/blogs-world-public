import { IsNotEmpty, IsUUID } from "class-validator";

export class GetCommentsDto {
  @IsNotEmpty()
  @IsUUID()
  postId!: string;
}