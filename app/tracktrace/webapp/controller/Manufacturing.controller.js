sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast,Fragment,JSONModel) {
    "use strict";
    return Controller.extend("tracktrace.controller.Manufacturing", {
        onInit: async function () {
            this.loadInitialData()
        },

        loadInitialData:function(){
            var oData = {
                materials: [
                    { productCode: "P001", batchId: "B001", manufacturingDate: "2024-01-01", expiryDate: "2025-01-01", qrCode: "", productionId: "PR001" },
                    { productCode: "P001", batchId: "B001", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "", productionId: "PR005" },
                    { productCode: "P002", batchId: "B002", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "", productionId: "PR002" },
                    { productCode: "P003", batchId: "B003", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "", productionId: "PR003" },
                    { productCode: "P002", batchId: "B002", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "", productionId: "PR004" }
                ]
            };

            var uniqueProductCodes = [...new Set(oData.materials.map(item => item.productCode))];

             var uniqueData = uniqueProductCodes.map(code => ({ productCode: code }));
             var oUniqueModel = new sap.ui.model.json.JSONModel({ products: uniqueData });
             this.getView().setModel(oUniqueModel, "uniqueProductModel");

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

        onGenerateQRPress: function(){
          let oTable = this.byId("createTypeTable")
          let oSelectedItem = oTable.getSelectedItem()
          if(!oSelectedItem){
             MessageToast.show("Please select any item")
          }
          let sObject = oSelectedItem.getBindingContext("materialDataModel");
          let rowData = sObject.getObject()
          console.log("rowData",rowData)
          let qrPayload = JSON.stringify(rowData);
          let qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(qrPayload);
            console.log("Generated QR Code URL: ", qrCodeUrl);
            let oImage = this.getView().byId("qrCodeImage");
            rowData.qrCode = qrCodeUrl
            this.getView().getModel("materialDataModel").refresh()
            oImage.setSrc(qrCodeUrl);
            oImage.setVisible(true);
        },

        onViewQRCodePress: function (oEvent) {
            let qrCodeUrl = oEvent.getSource().getCustomData()[0].getValue();            
            if (!qrCodeUrl) {
                MessageToast.show("No QR Code available!");
                return;
            }            
            let oDialog = this.byId("qrCodeDialog1");
            let oImage = this.byId("qrCodeDialogImage1");
            oImage.setSrc(qrCodeUrl);
            oDialog.open();
        },
        
        onCloseDialog: function () {
            this.byId("qrCodeDialog1").close();
        }, 
        
        onPrintQR: function () {
            var oImage = this.byId("qrCodeDialogImage2");
      
            var qrImageSrc = oImage.getSrc();
      
            if (!qrImageSrc) {
                sap.m.MessageBox.error("QR Code is not available.");
                return;
            }
      
            var { jsPDF } = window.jspdf;
            var doc = new jsPDF();
      
            var startX = 40;
            var startY = 40;
      
      
            doc.addImage(qrImageSrc, 'PNG', startX, startY, 50, 50);
      
            doc.save("ICQRCode.pdf");
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
