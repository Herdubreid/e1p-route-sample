import * as ko from 'knockout';
import * as storage from 'store2';
import Numeral from 'numeral';
import { createStore, createEvent } from 'effector';
import { IState, initState, IPage, IAccPage, INode } from './state';
import { accountBalance } from './requests';

// App Store

const db = storage.session.namespace('io-celin-e1p-route-sample');

export const Actions = {
    PageAdd: createEvent<IPage>(),
    PageDelete: createEvent<IPage>(), 
    PageUpdate: createEvent<IPage>(),
    PageSave: createEvent<IPage>(),
    PageRefresh: createEvent<IAccPage>()
};

export const pageStore = createStore<IState>(
    db.size() > 0
        ? {
            pages$: ko.observableArray((Object.values<IPage>(db.getAll()))
                .map(p => {
                    return {
                        ...p,
                        busy: false
                    }
                })
                .sort((a, b) => a.title.localeCompare(b.title)))
        }
        : initState)
    .on(Actions.PageAdd, (state: IState, page: IPage) => {
        state.pages$.unshift(page);
    })
    .on(Actions.PageDelete, (state: IState, page: IPage) => {
        const index = state.pages$.indexOf(page);
        state.pages$.splice(index, 1);
        db.remove(page.id);
    })
    .on(Actions.PageUpdate, (state: IState, page: IPage) => {
        const index = state.pages$.indexOf(page);
        state.pages$.splice(index, 1);
        state.pages$.splice(index, 0, page);
    })
    .on(Actions.PageSave, (_: IState, page: IPage) => {
        db.set(page.id, page);
    })
    .on(Actions.PageRefresh, (_: IState, page: IAccPage) => {
        page.busy = true;
        Actions.PageUpdate(page);
        const flatten = (accounts: INode[], parent: INode) => parent
            .children.reduce((a: INode[], n: INode) => {
                a.push(n);
                flatten(a, n);
                return a;
            }, accounts);
        const accounts = page.data.node.children
            .map(n => {
                const flat: INode[] = [];
                flatten(flat, n);
                return {
                    ...n,
                    flat
                }
            });
        const dataRequests = accounts.map(a => accountBalance(a.flat.filter(a => a.data.pec !== 'N').map(a => a.data.aid)));
        const batchRequest = {
            outputType: 'GRID_DATA',
            batchDataRequest: true,
            dataRequests
        };
        callAISService(batchRequest, DATA_SERVICE, response => {
            const mappedResponse = Object.values<any>(response)
                .filter(g => g.output)
                .map(g => g.output)
                .map(g => {
                    return g.map(r => {
                        return {
                            fy: r.groupBy['F0902.FY'],
                            an: [
                                r['F0902.AN01_SUM'],
                                r['F0902.AN02_SUM'],
                                r['F0902.AN03_SUM'],
                                r['F0902.AN04_SUM'],
                                r['F0902.AN05_SUM'],
                                r['F0902.AN06_SUM'],
                                r['F0902.AN07_SUM'],
                                r['F0902.AN08_SUM'],
                                r['F0902.AN09_SUM'],
                                r['F0902.AN10_SUM'],
                                r['F0902.AN11_SUM'],
                                r['F0902.AN12_SUM']
                            ]
                        };
                    })
                        .map(r => {
                            const sum = r.an.reduce((s, a) => Numeral(s).add(a).value());
                            const max = Math.max(...r.an);
                            const min = Math.min(...r.an);
                            const range = Numeral(max).subtract(min).value() || 1;
                            const offset = r.an.map(a => Numeral(a).divide(range).value());
                            return {
                                fy: r.fy,
                                an: r.an,
                                offset,
                                sum,
                                max,
                                min,
                                range
                            };
                        });
                });
            page.data.response(mappedResponse);
            page.busy = false;
            Actions.PageUpdate(page);
        });
    });
