import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name: 'ot_org'})
export class Org {
  @PrimaryGeneratedColumn('uuid', {name: 'org_id'})
  orgId: string;

  @Column({name: 'created_at', type: 'timestamp'})
  createdAt: Date;

  @Column({name: 'name', type: 'varchar', length: 128})
  name: string;
}
