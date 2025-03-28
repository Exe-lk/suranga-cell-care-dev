declare module 'jquery' {
    const $: JQueryStatic;
    export default $;
}

interface JQuery {
    val(): string | number | undefined;
    val(value: string | number): JQuery;

    prop(propertyName: string): any;
    prop(propertyName: string, value: any): JQuery;

    checked(): boolean;
    checked(value: boolean): JQuery;

    // Add more method declarations as needed
}
