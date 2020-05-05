// Postman object extracted into its type with https://app.quicktype.io/?l=ts
export interface Root {
    info:                    Info;
    item:                    Item[];
    protocolProfileBehavior: WelcomeProtocolProfileBehavior;
}

export interface Info {
    _postman_id: string;
    name:        string;
    schema:      string;
}

export interface Item {
    name:                     string;
    request:                  Request;
    response:                 any[];
    protocolProfileBehavior?: ItemProtocolProfileBehavior;
}

export interface ItemProtocolProfileBehavior {
    disableBodyPruning: boolean;
}

export interface Request {
    method: string;
    header: any[];
    url:    URL;
    body?:  Body;
    auth?:  Auth;
}

export interface Auth {
    type:   string;
    bearer: Bearer[];
}

export interface Bearer {
    key:   string;
    value: string;
    type:  string;
}

export interface Body {
    mode:    string;
    raw:     string;
    options: Options;
}

export interface Options {
    raw: Raw;
}

export interface Raw {
    language: string;
}

export interface URL {
    raw:      string;
    protocol: string;
    host:     string[];
    port?:    string;
    path:     string[];
}

export interface WelcomeProtocolProfileBehavior {
}