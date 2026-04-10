import Logger from '../Logger';
import { RoleGrantResponseModel, RoleResponseModel } from '../typings/ResponseFormats';
import * as RoleDao from '../database/dao/RoleDao';
import Role from '../database/models/Role';
import RoleNotFoundError from '../errors/RoleNotFoundError';
import { RoleBody } from '../typings/body/RoleBody';
import { PaginationQueryParams } from '../typings/params/PaginationQueryParams';

const LOG = new Logger('RoleService.ts');

export const searchRolesWithPagination = async (query?: PaginationQueryParams): Promise<{ rows: Role[]; count: number }> => {
  LOG.debug('Getting all roles');

  const { rows, count } = await RoleDao.getPaginated(query);

  return { rows, count };
};

export const getAccessSettings = async (): Promise<RoleGrantResponseModel[]> => {
  LOG.debug('Getting all access settings role');

  return await RoleDao.getAccessSettings();
};

export const getRoleById = async (id: number): Promise<Role> => {
  LOG.debug('Getting role by id');

  const role = await RoleDao.getRoleById(id);
  const { row } = await RoleDao.getRoleGrantByRoleId(id);
  role.setDataValue('roleGrants', row);

  return role;
};

export const getRoleGrantByRoleId = async (id: number): Promise<RoleGrantResponseModel[]> => {
  LOG.debug('Getting role grant by role id');

  const { row } = await RoleDao.getRoleGrantByRoleId(id);

  return row;
};

export const createRole = async (query: RoleBody): Promise<Role> => {
  LOG.debug('Creating role');

  const newRole = await RoleDao.createRole(query);
  await RoleDao.bulkCreateRolePermission(newRole.id);

  if (query.roleGrants && query.roleGrants.length > 0) {
    await RoleDao.bulkCreateRoleGrant(newRole.id, query.roleGrants);
  }

  return getRoleById(newRole.id);
};

export const editRole = async (roleId: number, query: RoleBody): Promise<Role> => {
  LOG.debug('Editing role');

  const role = await RoleDao.getRoleById(roleId);

  if (!role) {
    throw new RoleNotFoundError(roleId);
  }

  try {
    await role.update({ name: query.name, description: query.description });

    if (query.roleGrants && query.roleGrants.length > 0) {
      await RoleDao.bulkEditRoleGrantByRoleId(roleId, query.roleGrants);
    }
    return getRoleById(roleId);
  } catch (err) {
    throw err;
  }
};

export const deleteRole = async (roleId: number): Promise<void> => {
  LOG.debug('Deleting role');

  await RoleDao.deleteRole(roleId);
};
