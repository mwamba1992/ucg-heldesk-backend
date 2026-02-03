declare const _default: () => {
    nodeEnv: string;
    port: number;
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        synchronize: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    rabbitmq: {
        url: string;
    };
    elasticsearch: {
        node: string;
    };
    ldap: {
        url: string;
        bindDn: string;
        bindPassword: string;
        searchBase: string;
        searchFilter: string;
    };
};
export default _default;
