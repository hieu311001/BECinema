import { OmitType } from "@nestjs/mapped-types";
import { IsNotEmpty } from "class-validator";
import exp from "constants";
import { PageOptionsDto } from "src/rest-api/page.dto";

export class CreatePromotionDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  logo: string;
}

export class UpdatePromotionDto {
  name: string;

  startDate: Date;

  endDate: Date;

  description: string;

  logo: string;
}

