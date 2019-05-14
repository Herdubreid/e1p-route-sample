import * as ko from 'knockout';

// App State

export const testing = false;

export interface IAccount {
    aid: string;
    co: string;
    lda: number;
    mcu: string;
    obj: string;
    pec: string;
    sub: string;
}

export interface INode {
    id: string;
    title: string;
    data: IAccount;
    children: INode[];
}

export interface ICoa {
    nodes: INode[],
    filter: string
}

export interface IPage {
    id: string;
    component: string;
    title: string;
    data: any;
    busy: boolean;
    sequence: number;
}

export interface IAccPage extends IPage {
    data: {
        node: INode;
        save: any[];
        response?: ko.ObservableArray<any>;
    };
}

const coaPage: IPage = {
    id: 'coa',
    component: 'e1p-coa-tree',
    title: 'Chart of Accounts',
    busy: false,
    sequence: 0,
    data: { nodes: [], filter: '' }
}

export interface IState {
    pages$: ko.ObservableArray<IPage>;
}

export const initState: IState = {
    pages$: ko.observableArray([coaPage])
}
