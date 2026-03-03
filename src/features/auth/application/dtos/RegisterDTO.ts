export interface RegisterDTO {
    email: string;
    username: string;
    password?: string;
    role_names: string[];
    plan_name: string;
    avatar?: string;
}
