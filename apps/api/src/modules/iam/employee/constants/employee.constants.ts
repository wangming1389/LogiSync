import {
	type RoleScopedWorkspaceType,
	WORKSPACE_ROLES_BY_TYPE,
} from '../../workspace/constants/workspace-role.constants';

export const EMPLOYEE_CREATABLE_ROLES_BY_WORKSPACE_TYPE =
	WORKSPACE_ROLES_BY_TYPE;

export type EmployeeCreatableWorkspaceType = RoleScopedWorkspaceType;
