export type UserRole = 'admin' | 'user';
export interface User { id: string; name: string; email: string; role: UserRole; title: string; department: string; status: 'active' | 'inactive'; joinedAt: string; }
export interface RecordItem { id: string; person: string; company: string; role: string; type: string; status: 'Verified' | 'In progress' | 'Needs review'; updatedAt: string; reference: string; }
export interface AuthResponse { token: string; user: User; }
