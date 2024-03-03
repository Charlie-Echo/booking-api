import { IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  location: number;

  seats?: string[];

  @IsNotEmpty()
  start: number;

  @IsNotEmpty()
  end: number;
}
