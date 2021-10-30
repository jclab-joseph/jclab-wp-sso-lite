import {EntityRepository, Repository} from 'typeorm';
import {Account} from '../entity/account';

@EntityRepository(Account)
export class AccountRepository extends Repository<Account> {

}
