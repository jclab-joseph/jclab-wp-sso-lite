import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Account} from './account';

export enum LoginLogResult {
  SUCCESS = 'SUCCESS',
  FAILED_NO_USER = 'FAILED:NO_USER',
  FAILED_WRONG_PASSWORD = 'FAILED:WRONG_PASSWORD',
}

@Entity({name: 'ot_lgin_log'})
export class LoginLog {
  @PrimaryGeneratedColumn('increment', {type: 'bigint', name: 'seq'})
  seq: string;

  @Column({name: 'created_at', type: 'timestamp'})
  createdAt: Date = new Date();

  @Column({name: 'req_id', type: 'uuid'})
  reqId: string;

  @Column({name: 'result', type: 'varchar'})
  result: LoginLogResult;

  @ManyToOne(type => Account, {
    lazy: true,
    nullable: true,
    cascade: false
  })
  @JoinColumn({name: 'acnt_id'})
  account: Promise<Account>;

  @Column({name: 'username', type: 'varchar', length: 128})
  username: string;

  @Column({name: 'remote_address', type: 'varchar', length: 64})
  remoteAddress: string;

  @Column({name: 'user_agent', type: 'varchar', length: 512})
  userAgent: string;
}
