import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Account} from './account';

@Entity({name: 'ot_auth'})
export class Authentication {
  @PrimaryGeneratedColumn('uuid', {name: 'auth_id'})
  authId: string;

  @ManyToOne(type => Account, {
    eager: true
  })
  @JoinColumn({name: 'acnt_id'})
  account: Account;

  @Column({name: 'created_at', type: 'timestamp'})
  createdAt: Date;

  @Column({name: 'auth_type', type: 'varchar', length: 32})
  authType: string;

  @Column({name: 'username', type: 'varchar', length: 128})
  username: string;

  @Column({name: 'password', type: 'varchar', length: 128})
  password: string;
}
