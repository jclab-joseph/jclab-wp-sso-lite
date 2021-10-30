import {Entity, ManyToOne, JoinColumn, PrimaryColumn, Column} from 'typeorm';
import {Org} from './org';
import {Account} from './account';

@Entity({name: 'ot_org_root'})
export class OrgRoot {
  @ManyToOne(type => Org, { primary: true })
  @JoinColumn({name: 'org_id'})
  org: Org;

  @ManyToOne(type => Account, { primary: true })
  @JoinColumn({name: 'acnt_id'})
  account: Account;

  @Column({name: 'created_at', type: 'timestamp'})
  createdAt: Date;
}
