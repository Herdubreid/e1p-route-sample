// Page One Component
import './style.scss';
import * as ko from 'knockout';
import { IStateParams, testing } from '../../state';
import { navigation } from '../nav';

class ViewModel {
    busy$ = ko.observable(false);
    pageTwo() {
        navigation.selectedPage$(navigation.pages$()[navigation.PAGE_TWO]);
    }
    descendantsComplete = () => {
    }
    constructor(public params: IStateParams) {
        if (params.state.rows) {
            // Existing data
        } else {
            if (testing) {
                // Test data
            } else {
                // Repository empty
            }
        }
    }
}

ko.components.register('e1p-page-one', {
    viewModel: {
        createViewModel: (params, componentInfo) => {
            const vm = new ViewModel(params);
            const sub = (ko as any).bindingEvent
                .subscribe(componentInfo.element, 'descendantsComplete', vm.descendantsComplete);
            (vm as any).dispose = () => sub.dispose();
            return vm;
        }
    },
    template: require('./template.html')
});
