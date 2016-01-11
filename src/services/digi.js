System.register(['../lib/digi'], function(exports_1) {
    var digi_1;
    var DigiService;
    return {
        setters:[
            function (digi_1_1) {
                digi_1 = digi_1_1;
            }],
        execute: function() {
            /**
             * Simple service to allow all components to get
             * a handle to the Digi instance.
             */
            DigiService = (function () {
                function DigiService() {
                    this._digi = new digi_1.Digi();
                }
                Object.defineProperty(DigiService.prototype, "digi", {
                    get: function () {
                        return this._digi;
                    },
                    enumerable: true,
                    configurable: true
                });
                return DigiService;
            })();
            exports_1("DigiService", DigiService);
        }
    }
});
//# sourceMappingURL=digi.js.map