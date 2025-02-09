import dateTimePickerBase from "./dateTimePickerBase";
export default class DatePicker extends dateTimePickerBase {
    controlType: string;
    format: string;
    static enable(selector: JQuery): void;
    constructor(targetInput: JQuery);
    modifyOptions(options: any): void;
}
