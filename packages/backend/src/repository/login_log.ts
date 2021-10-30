import {EntityRepository, Repository} from 'typeorm';
import {LoginLog} from '../entity/login_log';

@EntityRepository(LoginLog)
export class LoginLogRepository extends Repository<LoginLog> {

}
