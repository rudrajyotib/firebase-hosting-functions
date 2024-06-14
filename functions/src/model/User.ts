/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export class User {
    id: string;
    role: string;
    email: string;
    name: string;
    orgId: string;

    constructor(
        id: string,
        role: string,
        email: string,
        name: string,
        orgId: string
    ) {
        this.id = id;
        this.role = role;
        this.email = email;
        this.name = name;
        this.orgId = orgId;
    }

    isValid = (): boolean =>{
        if (!this.role) {
            return false;
        }
        if (this.role !== "student" && this.role !== "org-admin") {
            return false;
        }
        return true;
    };
}

export class UserBuilder {
    id= "";
    role= "";
    email= "";
    name= "";
    orgId= "";

    withId = (id: string) => {
        this.id = id;
        return this;
    };

    withRole = (role: string) => {
        this.role = role;
        return this;
    };

    withEmail = (email: string) => {
        this.email = email;
        return this;
    };

    withName = (name: string) => {
        this.name = name;
        return this;
    };

    withOrgId = (orgId: string) => {
        this.orgId = orgId;
        return this;
    };

    build = () => {
        return new User(
            this.id,
            this.role,
            this.email,
            this.name,
            this.orgId
        );
    };
}
