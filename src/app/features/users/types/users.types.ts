import type { ApiError } from '../../../shared/http/types';

export type UserRole = {
  id: string;
  code: string;
  name: string;
};

export type UserMe = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: UserRole | string; // por si backend devuelve role.code o role completo
};

export type MeResponse = {
  user: UserMe;
};

export type UpdateMeRequest = {
  name: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type UsersSystem = {
  user: UserMe | null;

  name: string;

  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;

  isLoading: boolean;
  isSavingName: boolean;
  isChangingPassword: boolean;
  isDeactivating: boolean;

  error: ApiError | null;
  successMessage: string | null;

  nameError: string | null;
  passwordError: string | null;

  confirmOpen: boolean;

  showCurrentPassword: boolean;
  showNewPassword: boolean;
  showConfirmNewPassword: boolean;
};

export type UsersActions = {
  setName: (v: string) => void;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmNewPassword: (v: string) => void;

  fetchMe: () => Promise<void>;
  saveName: () => Promise<void>;
  changePassword: () => Promise<void>;

  openConfirm: () => void;
  closeConfirm: () => void;
  deactivateMe: () => Promise<void>;

  clearMessage: () => void;
  toggleShowCurrentPassword: () => void;
  toggleShowNewPassword: () => void;
  toggleShowConfirmNewPassword: () => void;
};
