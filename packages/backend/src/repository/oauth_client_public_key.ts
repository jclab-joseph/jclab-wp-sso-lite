import {EntityRepository, Repository} from 'typeorm';
import {OAuthClientPublicKey} from '../entity/oauth_client_public_key';

@EntityRepository(OAuthClientPublicKey)
export class OAuthClientPublicKeyRepository extends Repository<OAuthClientPublicKey> {

}
