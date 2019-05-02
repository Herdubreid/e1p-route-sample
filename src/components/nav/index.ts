// Navigation Component
import './style.scss';
import * as ko from 'knockout';
import { IStateParams, IState } from '../../state';

interface IPage {
    component: string;
    title: string;
}

export let navigation: ViewModel;

class ViewModel {
    readonly PAGE_ONE = 0;
    readonly PAGE_TWO = 1;
    pages$ = ko.observableArray<IPage>([
        { component: 'e1p-page-one', title: 'Page One' },
        { component: 'e1p-page-two', title: 'Page Two' }
    ]);
    selectedPage$ = ko.observable<IPage>(this.pages$()[this.PAGE_ONE]);
    busy$ = ko.observable(false);
    state$ = ko.observable<IState>();
    goto(page: IPage) {
        if (page !== navigation.selectedPage$()) {
            navigation.selectedPage$(page);
        }
    }
    toggleNav() {
        $('#wrapper').toggleClass('toggled');
        $('.fa-bars').toggleClass('fa-rotate-90');
    };
    descendantsComplete = () => {
    }
    constructor(params: IStateParams) {
        navigation = this;
        this.state$(params.state);
    }
}

ko.components.register('e1p-nav', {
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
