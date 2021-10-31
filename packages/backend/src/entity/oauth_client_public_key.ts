import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'ot_oauth_pubk'})
export class OAuthClientPublicKey {
  @PrimaryGeneratedColumn('uuid', {name: 'client_id'})
  clientId: string;

  @Column({name: 'created_at', type: 'timestamp'})
  createdAt: Date;

  @Column({name: 'name', type: 'varchar', length: 256})
  name: string;

  @Column({name: 'audience', type: 'varchar', length: 256})
  audience: string;

  @Column({name: 'public_key', type: 'text'})
  publicKey: string;
}
