import {EntityRepository, Repository} from 'typeorm';
import {OrgRoot} from '../entity/org_root';

@EntityRepository(OrgRoot)
export class OrgRootRepository extends Repository<OrgRoot> {

}
