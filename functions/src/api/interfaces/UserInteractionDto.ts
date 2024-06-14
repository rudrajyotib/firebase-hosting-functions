export type AddUserRequest = {
    name: string,
    email: string,
    role: "student" | "org-admin",
}
