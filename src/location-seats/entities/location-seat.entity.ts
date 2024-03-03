import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class LocationSeat {
  @PrimaryColumn({ type: 'varchar', length: 10 })
  seat: string;

  @PrimaryColumn({ type: 'integer' })
  location_id: number;

  @Column({ type: 'varchar', length: 10 })
  zone: string;

  @Column({ type: 'integer' })
  row: number;
}
