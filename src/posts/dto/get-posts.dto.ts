import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional } from "class-validator";

export class GetPostsDto {

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    @IsOptional()
    searchContent?: string;

    @IsOptional()
    authorId?: string;

    
}