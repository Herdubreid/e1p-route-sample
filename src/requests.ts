// AIS Requests

export const accountBalance = (accounts: string[]) => {
    return {
        dataServiceType: 'AGGREGATION',
        targetName: 'F0902',
        targetType: 'table',
        aggregation: {
            aggregations: [
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN01'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN02'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN03'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN04'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN05'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN06'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN07'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN08'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN09'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN10'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN11'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AN12'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.APYN'
                },
                {
                    aggregation: 'SUM',
                    column: 'F0902.AWTD'
                }
            ],
            groupBy: [
                {
                    column: 'F0902.FY'
                }
            ],
            orderBy: [
                {
                    column: 'F0902.FY'
                }
            ]
        },
        query: {
            condition: [
                {
                    value: [
                        {
                            content: '17',
                            specialValueId: 'LITERAL'
                        },
                        {
                            content: '20',
                            specialValueId: 'LITERAL'
                        }
                    ],
                    controlId: 'F0902.FY',
                    operator: 'BETWEEN'
                },
                {
                    value: accounts
                        .map(a => {
                            return {
                                content: a,
                                specialValueId: 'LITERAL'
                            };
                        }),
                    controlId: 'F0902.AID',
                    operator: 'LIST'
                }
            ],
            matchType: 'MATCH_ALL',
        }
    }
};
