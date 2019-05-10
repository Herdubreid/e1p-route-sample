// Page Two Component
import './style.scss';
import * as ko from 'knockout';
import { IAccPage, INode } from '../../state';
import { Actions } from '../../store';

let vm: ViewModel;

class ViewModel {
    page: IAccPage;
    node$: ko.Observable<INode>;
    response$: ko.ObservableArray<any>;
    balanceRows$ = ko.pureComputed(() => {
        return vm.response$()
            .map((c, i) => {
                return {
                    ...vm.node$().children[i],
                    balance: c
                };
            });
    });
    select(node) {
        console.log('Node: ', node);
    }
    descendantsComplete = () => {
    }
    constructor(params: { page: IAccPage }) {
        vm = this;
        this.page = params.page;
        this.node$ = ko.observable(params.page.data.node);
        if (this.page.data.response) {
            this.response$ = this.page.data.response;
        } else {
            this.response$ = ko.observableArray([{}, {}]);
            this.page.data.response = this.response$;
            Actions.PageRefresh(this.page);
        }
    }
}

ko.components.register('e1p-page-acc-inq', {
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
