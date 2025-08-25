export default factory;
declare function factory(): void;
declare namespace factory {
    function spreadsheet(el: any, options: any, worksheets: any): Promise<{
        worksheets: any;
        config: any;
        element: any;
        el: any;
    }>;
    function worksheet(spreadsheet: any, options: any, position: any): {
        parent: any;
        options: {};
    };
}
//# sourceMappingURL=factory.d.ts.map