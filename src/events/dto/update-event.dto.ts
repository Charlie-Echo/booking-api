import { IsNotEmpty } from 'class-validator';

export class UpdateEventDto {
  id: number

  @IsNotEmpty()
  name?: string;

  @IsNotEmpty()
  description?: string;

  @IsNotEmpty()
  location?: number;

  seats?: string[] | 'all';

  @IsNotEmpty()
  start?: Date;

  @IsNotEmpty()
  end?: Date;
}
