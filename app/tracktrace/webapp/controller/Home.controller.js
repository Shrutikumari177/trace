sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], (BaseController) => {
    "use strict";
  
    return BaseController.extend("tracktrace.controller.Home", {
        onInit() {

        },
        onPressOnBoxQrTile: function () {
            const tile = this.getOwnerComponent().getRouter();
            tile.navTo("RouteManufacturing");
        },
        onPressOnOcQrTile: function () {
            const tile = this.getOwnerComponent().getRouter();
            tile.navTo("onRouteOCPage");
        },
        onPressCreateOrderTile: function () {
            const tile = this.getOwnerComponent().getRouter();
            tile.navTo("onRouteCreatePage");
        },
        onPressOnIcQrTile: function () {
            const tile = this.getOwnerComponent().getRouter();
            tile.navTo("onRouteICPage");
        },
    });
  });