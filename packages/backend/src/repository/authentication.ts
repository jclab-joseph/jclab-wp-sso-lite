import {EntityRepository, Repository} from 'typeorm';
import {Authentication} from '../entity/authentication';

@EntityRepository(Authentication)
export class AuthenticationRepository extends Repository<Authentication> {

}
