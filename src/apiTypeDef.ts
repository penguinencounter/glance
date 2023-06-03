/**
 * Type definitions for the MediaWiki APIs.
 */
/// <reference path="../node_modules/jquery/dist/jquery.js" />

// libraries
interface AbortableJQueryPromise<TR, TJ = any, TN = any> extends JQuery.Promise<TR, TJ, TN> {
    abort: () => void;
}
type FinishUploadJQueryPromise = JQuery.Promise<(data: Object) => JQuery.Promise<Object>>;

// mediawiki
interface mwTitle {
    // properties
    // methods
    canHaveTalkPage: () => boolean;
    exists: () => (boolean | null);
    getExtension: () => (string | null);
    getFileNameTextWithoutExtension: () => string;
    getFileNameWithoutExtension: () => string;
    getFragment: () => (string | null);
    getMain: () => string;
    getMainText: () => string;
    getNamespaceId: () => number;
    getNamespacePrefix: () => string;
    getPrefixedDb: () => string;
    getPrefixedText: () => string;
    getRelativeText: (namespace: number) => string;
    getSubjectPage: () => (mwTitle | null);
    getTalkPage: () => (mwTitle | null);
    getUrl: (params?: Object) => string;
    isTalkNamespace: (namespaceId: number) => boolean;
    isTalkPage: () => boolean;
    normalizeExtension: (extension: string) => string;
    phpCharToUpper: (chr: string) => string;
    toString: () => string;
    toText: () => string;
    wantSignaturesNamespace: (namespaceId: number) => boolean;
}

type mwTitleStatic = {
    // static properties
    exist: {
        pages: { [key: string]: boolean };
        set: (pages: string[], exists?: boolean) => void;
    };
    // constructor
    new(title: string, namespace?: number): mwTitle;
    // static methods
    exists: (title: string | mwTitle) => (boolean | null);
    makeTitle: (namespace: number, title: string) => (mwTitle | null);
    newFromFileName: (uncleanName: string) => (mwTitle | null);
    newFromImg: (img: HTMLImageElement | JQuery<HTMLImageElement>) => (mwTitle | null);
    newFromText: (title: string, namespace?: number) => (mwTitle | null);
    newFromUserInput: (title: string, defaultNamespace?: number, options?: {forUploading?: boolean}) => (mwTitle | null);
}

type Titleable = string | mwTitle;

interface mwApi {
    // properties
    // methods
    abort: () => void;
    ajax: (parameters: Object, ajaxOptions?: Object) => AbortableJQueryPromise<Object, Object>;
    assertCurrentUser: (query: Object) => Object;
    badToken: (type: string) => void;
    chunkedUpload: (file: File, data: Object, chunkSize?: number, chunkRetries?: number) => JQuery.Promise<unknown>;
    chunkedUploadToStash: (file: File, data?: Object, chunkSize?: number, chunkRetries?: number) => FinishUploadJQueryPromise;
    create: (title: Titleable, params: {summary: string}, content: string) => JQuery.Promise<Object>;
    edit: (title: Titleable, transform: (revision: {content: string}) => (string | Object | JQuery.Promise<Object> | JQuery.Promise<string>)) => JQuery.Promise<Object>;
    get: (parameters: Object, ajaxOptions?: Object) => JQuery.Promise<Object>;
    getCategories: (title: Titleable) => JQuery.Promise<boolean | mwTitle>;
    getCategoriesByPrefix: (prefix: string) => JQuery.Promise<string[]>;
    getEditToken: () => JQuery.Promise<unknown>;
    getErrorMessage: (data: Object) => JQuery<HTMLDivElement[]>;
    getMessages: (messages: string | string[], options?: Object) => JQuery.Promise<Object>;
    getToken: (type: string, additionalParams?: Object | string) => JQuery.Promise<string>; // TODO: investigate return type
    getUserInfo: () => JQuery.Promise<{userInfo: {groups: string[], rights: string[]}}>;
    isCategory: (title: Titleable) => JQuery.Promise<boolean>;
    loadMessages: (messages: string | string[], options?: Object) => JQuery.Promise<unknown>;
    loadMessagesIfMissing: (messages: string[], options?: Object) => JQuery.Promise<unknown>;
    login: (username: string, password: string) => JQuery.Promise<Object>; // TODO: investigate return type
    newSection: (title: Titleable, header: string, message: string, additionalParams?: Object) => JQuery.Promise<Object>;
    parse: (content: Titleable, additionalParams: Object) => JQuery.Promise<{data: string}>;
    post: (parameters: Object, ajaxOptions?: Object) => JQuery.Promise<Object>;
    postWithEditToken: (params: Object, ajaxOptions?: Object) => JQuery.Promise<Object>;
    postWithToken: (type: string, params: Object, ajaxOptions?: Object) => JQuery.Promise<Object>;
    rollback: (page: Titleable, user: string, params?: Object) => JQuery.Promise<Object>;
    saveOption: (name: string, value: string | null) => JQuery.Promise<unknown>;
    saveOptions: (options: Object) => JQuery.Promise<unknown>;
    unwatch: ((pages: Titleable, addParams?: Object) => JQuery.Promise<{title: string, watched: boolean}>) |
                ((pages: Titleable[], addParams?: Object) => JQuery.Promise<{title: string, watched: boolean}[]>);
    upload: (file: HTMLInputElement | File | Blob, data: Object) => JQuery.Promise<Object>;
    uploadFromStash: (filekey: string, data: Object) => JQuery.Promise<Object>;
    uploadToStash: () => FinishUploadJQueryPromise;
    watch: ((pages: Titleable, addParams?: Object) => JQuery.Promise<{title: string, watched: boolean}>) |
                ((pages: Titleable[], addParams?: Object) => JQuery.Promise<{title: string, watched: boolean}[]>);
}

type mwApiStatic = {
    // static properties
    // constructor
    new(defaultOptions?: Object): mwApi
    // static methods
}

/* @ts-ignore */
const Title: mwTitleStatic = mw.Title;
/* @ts-ignore */
const Api: mwApiStatic = mw.Api;

export default {
    Api: Api,
    Title: Title
}
