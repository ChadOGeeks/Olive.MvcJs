import Form from "olive/components/form";


export default class GlobalSearch {
    input: any;
    awaitingAutocompleteResponses: number = 0;
    valueField: JQuery;

    public static enable(selector: JQuery) {
        selector.each((i, e) => new GlobalSearch($(e)).enable());
    }

    constructor(targetInput: any) {
        this.input = targetInput;
    }

    enable() {
        if (this.input.is("[data-typeahead-enabled=true]")) return;
        else this.input.attr("data-typeahead-enabled", true);
        this.input.wrap("<div class='typeahead__container'></div>");

        this.valueField = $("[name='" + this.input.attr("name").slice(0, -5) + "']");

        
        let urlsList = (<string>this.input.attr("data-search-source") || '').split(";");
        
        this.input
        .data("selected-text", "")
        .on('input', () => this.clearValue())
        .on("typeahead:selected", (e, i) => this.itemSelected(i))
        .typeahead(this.createTypeaheadSettings(urlsList));
        
        
    }

    createTypeaheadSettings(urls: string[]) {

        let sources = {};

        for (let url of urls) {
            if(url.charAt(0)=='/'){
                url=window.location.origin+url;
            }
            sources[url] = {
                ajax: query => {
                    return { type: "GET", url: url + '?searcher={{query}}', xhrFields: { withCredentials: true } };
                }
            };
        }

        return {
            maxItem: 50,
            minLength: 2,
            delay: 300,
            dynamic: true,
            backdrop: false,
            correlativeTemplate: true,
            emptyTemplate: "<div class='tt-suggestion'>Not found</div>",
            display: "Title",
            template: `
                            <div class='item'>
                              <img class="icon" src="{{IconUrl}}" />
                                <div class='title-wrapper'>
                                  <div class='title'>{{Title}}</div>
                                  <div class='desc'>{{Description}}</div>
                                </div>
                              </div>
                          `,
            href: "{{Url}}",
            source: sources,
            callback: {
                onNavigateAfter: function (node, lis, a, item, query, event) {
                    if (~[38, 40].indexOf(event.keyCode)) {
                        var resultList = node.closest("form").find("ul.typeahead__list"),
                            activeLi = lis.filter("li.active"),
                            offsetTop = activeLi[0] && activeLi[0].offsetTop - (resultList.height() / 2) || 0;

                        resultList.scrollTop(offsetTop);
                    }
                },
                onClickAfter: function (node, a, item, event) {
                    event.preventDefault();
                    window.location.href = item.Url;
                    $('#result-container').text('');
                },
                onResult: function (node, query, result, resultCount) {
                    if (query === "") return;

                    var text = "";
                    if (result.length > 0 && result.length < resultCount) {
                        text = "Showing <strong>" + result.length + "</strong> of <strong>" + resultCount + '</strong> elements matching "' + query + '"';
                    } else if (result.length > 0) {
                        text = 'Showing <strong>' + result.length + '</strong> elements matching "' + query + '"';
                    } else {
                        text = 'No results matching "' + query + '"';
                    }
                    $('#result-container').html(text);

                },
                onMouseEnter: function (node, a, item, event) {
                    if (item.group === "country") {
                        $(a).append('<span class="flag-chart flag-' + item.display.replace(' ', '-').toLowerCase() + '"></span>')
                    }
                },
                onMouseLeave: function (node, a, item, event) {
                    $(a).find('.flag-chart').remove();
                }
            }
        }
    }


    clearValue() {
        if (this.input.val() === "") this.valueField.val("");
        if (this.input.val() !== this.input.data("selected-text"))
            this.valueField.val("");
    }

    itemSelected(item: any) {

        if (item != undefined) {
            this.valueField.val(item.Value);
            this.input.data("selected-text", item.Display);
            this.input.val(item.Display);
        } else {
            console.log("Clearing text, item is undefined");
            this.input.data("selected-text", "");
        }
        // This will invoke RunOnLoad M# method as typeahead does not fire textbox change event when it sets its value from drop down
        this.input.trigger("change");
    }

    // Convert current form array to simple plain object
    toObject(arr: JQuerySerializeArrayElement[]) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i)
            rv[arr[i].name] = arr[i].value;
        return rv;
    }
}
