import './css/style.scss';
import * as ko from 'knockout';
import { IState, initState, dirtyFlag$ } from './state';
import './components';

/**
 * App
 */

const storageKey = 'io-celin-e1p-base-route';
// Storage Read
const state = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || initState;
// Storage Save
dirtyFlag$.subscribe(dirty => {
    if (dirty) {
        sessionStorage.setItem(storageKey, JSON.stringify(state));
        dirtyFlag$(false);
    }
});

class ViewModel {
    constructor(public state: IState) { }
}

const viewModel = new ViewModel(state);

ko.applyBindings(viewModel);
