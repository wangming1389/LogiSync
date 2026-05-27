import { api } from '@/lib/api';
import { unwrapApiData } from './auth';

export type AddEmployeePayload = {
	fullName: string;
	email: string;
	phoneNumber: string;
	idCard: string;
	role: string;
	department: string;
	dateOfBirth: string;
	vehicleTypePreference?: string;
	firstName?: string;
	lastName?: string;
	avatar?: File | null;
};

export type AddEmployeeResponse = {
	id: string;
	fullName: string | null;
	email: string;
	firstName: string | null;
	lastName: string | null;
	phoneNumber: string | null;
	idCard: string | null;
	avatarUrl: string | null;
	role: string;
	department: string | null;
	dateOfBirth: string | null;
	vehicleTypePreference: string | null;
	workspaceId: string;
	mustChangePassword: boolean;
};

function appendOptional(formData: FormData, key: string, value?: string) {
	if (value?.trim()) formData.append(key, value.trim());
}

export async function addEmployee(payload: AddEmployeePayload) {
	const formData = new FormData();
	formData.append('fullName', payload.fullName.trim());
	formData.append('email', payload.email.trim());
	formData.append('phoneNumber', payload.phoneNumber.trim());
	formData.append('idCard', payload.idCard.trim());
	formData.append('role', payload.role);
	formData.append('department', payload.department.trim());
	formData.append('dateOfBirth', payload.dateOfBirth);
	appendOptional(
		formData,
		'vehicleTypePreference',
		payload.vehicleTypePreference,
	);
	appendOptional(formData, 'firstName', payload.firstName);
	appendOptional(formData, 'lastName', payload.lastName);
	if (payload.avatar) formData.append('avatar', payload.avatar);

	const response = await api.form<{ data: AddEmployeeResponse }>(
		'/employees',
		formData,
	);
	return unwrapApiData<AddEmployeeResponse>(response);
}
