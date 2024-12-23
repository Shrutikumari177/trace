sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast,Fragment,JSONModel) {
    "use strict";
    return Controller.extend("tracktrace.controller.Manufacturing", {
        onInit: function () {
            // Create JSON model with sample data
            var oData = {
                materials: [
                    { productCode: "P001", batchId: "B001", manufacturingDate: "2024-01-01", expiryDate: "2025-01-01", qrCode: "QR123", productionId: "PR001" },
                    { productCode: "P001", batchId: "B001", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "QR344", productionId: "PR005" },
                    { productCode: "P002", batchId: "B002", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "QR456", productionId: "PR002" },
                    { productCode: "P003", batchId: "B003", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "QR789", productionId: "PR003" },
                    { productCode: "P002", batchId: "B002", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "QR901", productionId: "PR004" }
                ]
            };
            
            var oModel = new sap.ui.model.json.JSONModel(oData);
            this.getView().setModel(oModel, "materialModel");
        },

        onValueHelpClosevoy: async function (oEvent) {
            const oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                const sSelectedValue = oSelectedItem.getTitle();
                this._oInputField.setValue(sSelectedValue);
            }
        }, 

        onGoPress:async function(){
            let oInput = this.byId("productReqNo").getValue()
            let tableLayout = this.byId("_IDGenBlockLayoutRow2")
            if(oInput){
                await this.getBindServices(oInput)
                tableLayout.setVisible(true)
            }
        },

        getBindServices: async function (value) {
            try {
                debugger
                let oModel = this.getView().getModel("materialModel");
                let modelData = oModel.getData().materials
                let filterData = modelData.filter(item=>{
                    return item.productCode === value
                })
                let dataModel = new JSONModel({materials:filterData})
                this.getView().setModel(dataModel,"materialDataModel")
            } catch (error) {
                console.error("Error fetching bid details:", error.message);
            }
        },

        onServiceRequestNumber: function(oEvent) {
            const oView = this.getView();
            this._oInputField = oEvent.getSource();        
            if (!this.requestNoFragment) {
                Fragment.load({
                    id: oView.getId(),
                    name: "tracktrace.fragments.product",
                    controller: this
                }).then(oDialog => {
                    this.requestNoFragment = oDialog;                    
                    oView.addDependent(this.requestNoFragment);        
                    this.requestNoFragment.open();
                });
            } else {
                this.requestNoFragment.open();
            }
        },
        
    });
});
