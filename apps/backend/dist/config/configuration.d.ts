declare const _default: () => {
    port: number;
    database: {
        uri: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    mail: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    frontendurl: string;
};
export default _default;
