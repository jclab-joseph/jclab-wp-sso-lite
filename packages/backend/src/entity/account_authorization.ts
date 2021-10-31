import {Entity, Column, ManyToOne, JoinColumn} from 'typeorm';
import {Account} from './account';

@Entity({name: 'ot_acnt_autz'})
export class AccountAuthorization {
  @ManyToOne(() => Account, acnt => acnt.authorizations, {
    primary: true,
    lazy: true
  })
  @JoinColumn({name: 'acnt_id'})
  account: Promise<Account>;

  @Column( {name: 'scope', type: 'varchar', length: 128, primary: true})
  scope: string;

  @Column({name: 'created_at', type: 'timestamp'})
  createdAt: Date = new Date();
}
