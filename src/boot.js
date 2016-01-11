System.register(['angular2/platform/browser', './components/app/app', './services/digi'], function(exports_1) {
    var browser_1, app_1, digi_1;
    return {
        setters:[
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (app_1_1) {
                app_1 = app_1_1;
            },
            function (digi_1_1) {
                digi_1 = digi_1_1;
            }],
        execute: function() {
            browser_1.bootstrap(app_1.AppComponent, [digi_1.DigiService]);
        }
    }
});
//# sourceMappingURL=boot.js.map