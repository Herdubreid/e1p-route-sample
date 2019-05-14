// Page Two Component
import './style.scss';
import * as ko from 'knockout';
import { navigation } from '../nav';
import { IAccPage, INode } from '../../state';
import { Actions } from '../../store';

let vm: ViewModel;

class ViewModel {
    page: IAccPage;
    node$: ko.Observable<INode>;
    response$: ko.ObservableArray<any>;
    msg$ = ko.pureComputed(() => {
        return vm.response$().length > 0
            ? vm.response$().reduce((a, r) => a += r.length, 0) > 0
                ? ''
                : 'No Data'
            : 'Fetching Balance...';
    })
    balanceRows$ = ko.pureComputed(() => {
        return vm.response$()
            .map((c, i) => {
                return {
                    ...vm.node$().children[i],
                    showTotal: vm.node$().children[i].data.obj[0] > '4',
                    balance: c
                };
            });
    });
    select(node) {
        let page = navigation.pages$().find(p => p.id === node.id);
        if (!page) {
            page = {
                id: node.id,
                component: 'e1p-page-acc-inq',
                title: node.title,
                busy: false,
                sequence: 0,
                data: { node, save: [] }
            };
            Actions.PageAdd(page);
            Actions.PageSave(page);
        }
        navigation.goto(page);
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
            this.response$ = ko.observableArray(this.page.data.save);
            this.page.data.response = this.response$;
            if (this.page.data.save.length === 0) {
                Actions.PageRefresh(this.page);
            }
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
