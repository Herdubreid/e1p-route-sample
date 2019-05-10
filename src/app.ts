import './css/style.scss';
import * as ko from 'knockout';
import Numeral from 'numeral';
import { IPage } from './state';
import { pageStore } from './store';
import './components';

/**
 * App
 */

export class App {
    pages$: ko.ObservableArray<IPage>;
    constructor() {
        this.pages$ = pageStore.getState().pages$;
    }
}

export const app = new App();

ko.applyBindings(app);

ko.bindingHandlers.amount = {
    update: (element, valueAccessor) => {
        const value = Numeral(valueAccessor());
        ko.bindingHandlers.text.update(element, () => value.format());
    }
};
