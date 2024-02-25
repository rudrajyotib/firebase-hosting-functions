/* eslint-disable require-jsdoc */
// eslint-disable-next-line require-jsdoc
export class Examinee {
    id: string;
    name: string;
    email: string;

    constructor(id: string, name: string, email: string) {
        this.id = id;
        this.email = email;
        this.name = name;
    }
}

export class ExamineeBuilder {
    id = "";
    name = "";
    email = "";

    withId = (id: string) => {
        this.id = id;
    };

    withName = (name: string) => {
        this.name = name;
    };

    withEmail = (email: string) => {
        this.email = email;
    };

    build = ():Examinee => {
        return new Examinee(this.id, this.name, this.email);
    };
}
