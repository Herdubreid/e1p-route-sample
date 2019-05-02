// Page Two Component
import './style.scss';
import * as ko from 'knockout';
import { IStateParams, testing } from '../../state';

class ViewModel {
    busy$ = ko.observable(false);
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

ko.components.register('e1p-page-two', {
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
