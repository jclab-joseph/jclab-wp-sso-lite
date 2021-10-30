import {EntityRepository, Repository} from 'typeorm';
import {Org} from '../entity/org';

@EntityRepository(Org)
export class OrgRepository extends Repository<Org> {

}
