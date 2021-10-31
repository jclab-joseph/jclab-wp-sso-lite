import {EntityRepository, Repository} from 'typeorm';
import {AccountAuthorization} from '../entity/account_authorization';

@EntityRepository(AccountAuthorization)
export class AccountAuthorizationRepository extends Repository<AccountAuthorization> {

}
