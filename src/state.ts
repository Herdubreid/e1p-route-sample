import * as ko from 'knockout';

// App State

export const dirtyFlag$ = ko.observable<boolean>(false);

export const testing = false;

export interface IRow {
}

export interface IState {
    timeStamp: number;
    rows: IRow[];
}

// State Params
export interface IStateParams {
    state: IState;
}

export const initState: IState = {
    timeStamp: 0,
    rows: [],
};
