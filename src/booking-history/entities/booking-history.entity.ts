import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BookingHistory {
  @PrimaryColumn()
  id: number;

  @PrimaryColumn({ type: 'varchar', length: 15 })
  ticket_id: string;

  @Column({ type: 'integer' })
  user_id: string;

  @Column({ type: 'timestamp with time zone' })
  date_time: number;
}
