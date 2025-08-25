declare const factory: {
    (): void;
    spreadsheet(this: any, el: any, options: any, worksheets: any): Promise<any>;
    worksheet(this: any, spreadsheet: any, options: any, position: any): {
        parent: any;
        options: {};
    };
};
export default factory;
//# sourceMappingURL=factory.d.ts.map