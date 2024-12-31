sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "external/PDF"
], function (Controller, MessageBox, MessageToast, Fragment, JSONModel, PDF) {
    "use strict";
    return Controller.extend("tracktrace.controller.ICQrGenerator", {
        onInit: function () {

            var oData = {
                materials: [
                    { packaging: "BOX1", productCode: "P001", batchId: "B001", manufacturingDate: "2024-01-01", expiryDate: "2025-01-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX2", productCode: "P001", batchId: "B001", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX3", productCode: "P001", batchId: "B001", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX4", productCode: "P001", batchId: "B001", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX5", productCode: "P002", batchId: "B002", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX6", productCode: "P002", batchId: "B002", manufacturingDate: "2024-01-01", expiryDate: "2025-01-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX7", productCode: "P002", batchId: "B002", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX8", productCode: "P002", batchId: "B002", manufacturingDate: "2024-02-01", expiryDate: "2025-02-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX9", productCode: "P003", batchId: "B003", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "", productionCode: "PR001", ICCode: "" },
                    { packaging: "BOX10", productCode: "P003", batchId: "B003", manufacturingDate: "2024-03-01", expiryDate: "2025-03-01", qrCode: "", productionCode: "PR001", ICCode: "" }
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


                await this.getBindServices(sSelectedValue);

                let tableLayout = this.byId("_IDGenBlockLayoutRow2");
                tableLayout.setVisible(true);
            }
        },



        getBindServices: async function (value) {
            try {

                let oModel = this.getView().getModel("materialModel");
                let modelData = oModel.getData().materials
                let filterData = modelData.filter(item => {
                    return item.batchId === value
                })
                let dataModel = new JSONModel({ materials: filterData })
                this.getView().setModel(dataModel, "materialDataModel")
            } catch (error) {
                console.error("Error fetching bid details:", error.message);
            }
        },

        onServiceRequestNumber: function (oEvent) {
            const oView = this.getView();
            this._oInputField = oEvent.getSource();
            if (!this.requestNoFragment) {
                Fragment.load({
                    id: oView.getId(),
                    name: "tracktrace.fragments.icValueHelp",
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

       
        onGenerateQR: function () {
            let oTable = this.byId("createTypeTable");
            let aSelectedItems = oTable.getSelectedItems();
            let oModel = this.getView().getModel("materialDataModel");
        
            if (aSelectedItems.length === 0) {
                sap.m.MessageBox.error("Please select at least one row to generate QR and IC codes.");
                return;
            }
        
            let icCode = "IC-" + new Date().getTime();
            console.log("icCode",icCode);
            
        
            let combinedData = aSelectedItems.map((oItem) => {
                let oContext = oItem.getBindingContext("materialDataModel");
                let oData = oContext.getObject();
        
                delete oData.qrCode;
                delete oData.ICCode;
        
                return oData;
            });
        
            let qrPayload = JSON.stringify({
                icCode: icCode,
                rows: combinedData,
            });
            console.log("payload",qrPayload);
            
        
            let qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=" + encodeURIComponent(qrPayload);
            console.log("qrurl",qrCodeUrl);
            
        
            // Update the selected items with QR code and IC code
            aSelectedItems.forEach((oItem) => {
                let oContext = oItem.getBindingContext("materialDataModel");
                let oData = oContext.getObject();
        
                oData.qrCode = qrCodeUrl;
                oData.ICCode = icCode;
                oData.isQRGenerated = true;
        
                // Set the properties back to the model for each item
                oModel.setProperty(oContext.getPath() + "/qrCode", qrCodeUrl);
                oModel.setProperty(oContext.getPath() + "/ICCode", icCode);
                oModel.setProperty(oContext.getPath() + "/isQRGenerated", true);
            });
        
            // Re-arrange the model data so the items with QR codes appear first
            let oData = oModel.getProperty("/materials");
            let aGeneratedRows = oData.filter(item => item.isQRGenerated);
            let aOtherRows = oData.filter(item => !item.isQRGenerated);
            let aUpdatedData = aGeneratedRows.concat(aOtherRows);
        
            // Set the updated data back to the model
            oModel.setProperty("/materials", aUpdatedData);
        
            oModel.refresh();
            oTable.invalidate();
        
            oTable.removeSelections();
        
            sap.m.MessageToast.show("QR Codes and IC Code generated successfully!");
        },
      
        
        
        
      
        


        onPrintQR1: function () {
            var oImage = this.byId("qrImage");
            var sImageSrc = oImage.getSrc();

            console.log("QR Image Source:", sImageSrc);

            if (sImageSrc) {
                var oImageElement = new Image();
                oImageElement.onload = function () {
                    console.log("Image loaded successfully. Proceeding to print...");
                    var oWindow = window.open("", "_blank");
                    oWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
                    oWindow.document.write('<img src="' + sImageSrc + '" style="width:200px;height:200px;"/>');
                    oWindow.document.write('</body></html>');
                    oWindow.document.close();

                    // Delay print and then close the window
                    setTimeout(() => {
                        oWindow.print();
                        oWindow.close(); // Automatically close the print window
                    }, 500); // Add a slight delay before printing
                };
                oImageElement.onerror = function () {
                    console.error("Failed to load the QR code image from URL:", sImageSrc);
                    sap.m.MessageToast.show("Failed to load the QR code image.");
                };
                oImageElement.src = sImageSrc;
            } else {
                console.warn("QR Code source is empty or undefined.");
                sap.m.MessageToast.show("QR Code is not available for printing.");
            }
        },
        onPrintQR: function () {
            var oImage = this.byId("qrImage");

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






        onCloseQRDialog: function () {
            this.byId("qrDialog").close();
        },





        onSelectionChange: function (oEvent) {
            const oTable = this.byId("createTypeTable");
            const aSelectedItems = oEvent.getParameter("listItems");

            aSelectedItems.forEach((oItem) => {
                const oContext = oItem.getBindingContext("materialDataModel");
                const oData = oContext.getObject();

             
                if (oData.isQRGenerated) {
                    oTable.removeSelections(true);
                }
            });
        },







        // Event handler for clicking the "View QR" link
        onViewQRPress: function (oEvent) {
            let oLink = oEvent.getSource();
            let oContext = oLink.getBindingContext("materialDataModel");
            let oData = oContext.getObject();

            // Get the QR code URL for the selected row
            let qrCodeUrl = oData.qrCode;

            // Open the QR dialog and set the QR image source
            let oDialog = this.byId("qrDialog");
            let oImage = this.byId("qrImage");
            oImage.setSrc(qrCodeUrl);

            oDialog.open();
        },

    });
});