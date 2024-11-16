import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePostDto {

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  content!: string;


  @IsOptional()
  image?: Express.Multer.File;  
}