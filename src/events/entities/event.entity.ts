import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  organizer: number;

  @Column({ type: 'smallint' })
  location: number;

  @Column({ type: 'timestamp with time zone' })
  start_date: Date;

  @Column({ type: 'timestamp with time zone' })
  end_date: Date;
}
