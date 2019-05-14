// Chart of Account Component
import './style.scss';
import * as ko from 'knockout';
import 'jstree';
import { IPage, ICoa, IAccPage } from '../../state';
import { Actions } from '../../store';
import { navigation } from '../nav';

interface ICoaPage extends IPage {
    data: ICoa;
}

let coa: ViewModel;

class ViewModel {
    page: ICoaPage;
    holder: JQuery<HTMLElement>;
    filter$ = ko.observable<string>().extend({ rateLimit: { method: 'notifyWhenChangesStop', timeout: 400 } });
    addChildren(lda: number, objFrom: string, objTo: string, rows: any[]): any[] {
        if (lda > 9) return [];
        const count = rows.filter((r: any) => r.F0901_LDA == lda).length;
        if (count == 0) return this.addChildren(lda + 1, objFrom, objTo, rows);
        return rows
            .filter((r: any) => r.F0901_LDA == lda)
            .filter((r: any) => r.F0901_OBJ >= objFrom && r.F0901_OBJ < objTo)
            .map((r: any, i: number, a: any[]) => {
                const next = a[i + 1];
                const obj = next ? next.F0901_OBJ : objTo;
                let children = [];
                let nxtLda = lda;
                while (children.length === 0 && nxtLda < 9) {
                    nxtLda++;
                    children = this.addChildren(nxtLda, r.F0901_OBJ, obj, rows)
                }
                return {
                    id: r.F0901_AID,
                    text: `${r.F0901_MCU}.${r.F0901_OBJ}${r.F0901_SUB > ' ' ? '.' : ''}${r.F0901_SUB} - ${r.F0901_DL01}`,
                    icon: children.length > 0
                        ? 'fas fa-layer-group icon'
                        : r.F0901_PEC == 'N' ? 'fas fa-times small-icon' : 'fas fa-check small-icon',
                    data: {
                        aid: r.F0901_AID,
                        lda: Number(r.F0901_LDA),
                        pec: r.F0901_PEC,
                        co: r.F0901_CO,
                        mcu: r.F0901_MCU.trim(),
                        sub: r.F0901_SUB,
                        obj: r.F0901_OBJ

                    },
                    children
                }
            });
    }
    getNode(node: any, cb: any): any {
        if (node.id == '#') {
            if (coa.page.data.nodes.length > 0) {
                cb.call(coa, coa.page.data.nodes);
            } else {
                const rq = {
                    dataServiceType: 'AGGREGATION',
                    outputType: 'GRID_DATA',
                    targetName: 'V0901Q',
                    targetType: 'view',
                    maxPageSize: '500',
                    aliasNaming: true,
                    aggregation: {
                        aggregations: [
                            {
                                aggregation: 'COUNT',
                                column: '*'
                            },
                            {
                                aggregation: 'MIN',
                                column: 'F0901.LDA'
                            }

                        ],
                        groupBy: [
                            {
                                column: 'F0006.MCU'
                            },
                            {
                                column: 'F0006.LDM'
                            },
                            {
                                column: 'F0006.DL01'
                            }
                        ],
                        orderBy: [{
                            column: 'F0006.MCU',
                            direction: 'ASC'
                        }]
                    }
                };
                callAISService(rq, DATA_SERVICE, (response: any) => {
                    const result = response.ds_V0901Q.output
                        .filter((r: any) => r.COUNT > 1)
                        .map((r: any) => {
                            const g = r.groupBy;
                            const lda = Number(r['F0901.LDA_MIN']) - 1;
                            const id = g['F0006.MCU'].trim();
                            return {
                                id,
                                text: `${id} - ${g['F0006.DL01']} (${r.COUNT})`,
                                icon: 'fas fa-home large-icon',
                                data: {
                                    aid: '',
                                    lda,
                                    pec: 'N',
                                    co: '',
                                    mcu: id,
                                    sub: '',
                                    obj: ''
                                },
                                children: true
                            };
                        });
                    cb.call(coa, result);
                });
            }
        }
        else {
            const rq = {
                dataServiceType: 'BROWSE',
                outputType: 'GRID_DATA',
                targetName: 'F0901',
                targetType: 'table',
                findOnEntry: 'TRUE',
                returnControlIDs: 'DL01|LDA|PEC|CO|MCU|OBJ|SUB|AID',
                maxPageSize: '1000',
                aliasNaming: true,
                query: {
                    condition: [
                        {
                            value: [
                                {
                                    content: node.id,
                                    specialValueId: 'LITERAL'
                                }
                            ],
                            controlId: 'F0901.MCU',
                            operator: 'EQUAL'
                        }
                    ],
                    matchType: 'MATCH_ALL',
                },
                aggregation: {
                    orderBy: [
                        {
                            column: 'F0901.OBJ',
                            direction: 'ASC'
                        }
                    ]
                }
            };
            callAISService(rq, DATA_SERVICE, (response: any) => {
                const lda = node.data.lda + 1;
                const root = coa.addChildren(lda, '', '9999', response.fs_DATABROWSE_F0901.data.gridData.rowset);
                cb.call(coa, root);
            });
        }
    }
    filter(s: string) {
        const root = coa.holder.jstree(true).get_node('#');
        const show = root.children.filter(node => coa.holder.jstree(true).get_node(node).text
            .toLowerCase().includes(s.toLocaleLowerCase()));
        const hide = root.children.filter(node => !coa.holder.jstree(true).get_node(node).text
            .toLowerCase().includes(s.toLocaleLowerCase()));
        coa.holder.jstree(true).hide_node(hide, true);
        coa.holder.jstree(true).show_node(show, false);
    }
    descendantsComplete = () => {
        this.filter$
            .subscribe(s => {
                coa.filter(s);
                coa.page.data.filter = s;
                ;
            });
    }
    constructor(params: { page: ICoaPage }) {
        this.page = params.page;
        this.filter$(params.page.data.filter);
        this.holder = $('#tree');
        coa = this;
        coa.holder.jstree({
            core: {
                check_callback: true,
                data: coa.getNode
            }
        }).on('loaded.jstree', () => {
            if (coa.page.data.filter.length > 0) coa.filter(coa.page.data.filter);
        }).on('after_open.jstree', () => {
            coa.page.data.nodes = coa.holder.jstree(true).get_json();
            Actions.PageSave(this.page);
        }).on('after_close.jstree', () => {
            coa.page.data.nodes = coa.holder.jstree(true).get_json();
            Actions.PageSave(this.page);
        }).on('select_node.jstree', (_, select) => {
            if (select.event && select.node.state.loaded && select.node.children.length) {
                let accPage: IAccPage = navigation.pages$().find(p => p.id === select.node.id);
                if (!accPage) {
                    const recursiveNodes = (children: any[]) => children
                        .map(id => {
                            const node = coa.holder.jstree(true).get_node(id);
                            return {
                                id: node.id,
                                title: node.text,
                                data: node.data,
                                children: recursiveNodes(node.children)
                            };
                        });
                    const node = {
                        id: select.node.id,
                        title: select.node.text,
                        data: select.node.data,
                        children: recursiveNodes(select.node.children)
                    }
                    accPage = {
                        id: select.node.id,
                        component: 'e1p-page-acc-inq',
                        title: select.node.text,
                        busy: false,
                        sequence: 0,
                        data: { node, save: [] }
                    };
                    Actions.PageAdd(accPage);
                    Actions.PageSave(accPage);
                }
                navigation.goto(accPage);
            }
        });
    }
}

ko.components.register('e1p-coa-tree', {
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
