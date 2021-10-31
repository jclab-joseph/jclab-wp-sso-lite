import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import {Org} from './org';
import {AccountAuthorization} from './account_authorization';

@Entity({name: 'ot_acnt'})
export class Account {
  @PrimaryGeneratedColumn('uuid', {name: 'acnt_id'})
  acntId: string;

  @ManyToOne(type => Org, {
    eager: true,
    nullable: false
  })
  @JoinColumn({name: 'org_id'})
  org: Org;

  @Column({name: 'created_at', type: 'timestamp'})
  createdAt: Date;

  @Column({name: 'name', type: 'varchar', length: 128})
  name: string;

  @Column({name: 'email', type: 'varchar', length: 128})
  email: string;

  @OneToMany(() => AccountAuthorization, (autz) => autz.account, {
    lazy: true
  })
  authorizations: Promise<AccountAuthorization[]>;
}
