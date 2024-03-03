import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ type: 'varchar', length: 10 })
  seat: string;

  @Column({ type: 'integer' })
  event_id: number;

  @Column({ type: 'boolean' })
  is_booked: boolean;
}
