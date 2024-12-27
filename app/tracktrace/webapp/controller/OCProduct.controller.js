
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast,Fragment,JSONModel) {
    "use strict";
    return Controller.extend("tracktrace.controller.OCProduct", {
        onInit: function () {
            var oProductionOrders = {
              "ProductionOrders": [
                {
                  
                  "Packaging2": "IC1",
                  "Packaging3": "BOX1",
                  "ProductCode": 890,
                  "BatchId": 80051,
                  "StartDate": "2024-12-01",
                  "EndDate": "2024-12-10",
                  "SeqNo": "0001",
                  "qrCode":"",
                  "OCCode":""
                },
                {
                  
                  "Packaging2": "IC1",
                  "Packaging3": "BOX2",
                  "ProductCode": 890,
                  "BatchId": 80051,
                  "StartDate": "2024-12-05",
                  "EndDate": "2024-12-15",
                  "SeqNo": "0002",
                  "qrCode":"",
                  "OCCode":""
                },
                {
                  
                  "Packaging2": "IC2",
                  "Packaging3": "BOX3",
                  "ProductCode": 891,
                  "BatchId": 80052,
                  "StartDate": "2024-12-10",
                  "EndDate": "2024-12-20",
                  "SeqNo": "0003",
                  "qrCode":"",
                  "OCCode":""
                },
                {
                  
                  "Packaging2": "IC2",
                  "Packaging3": "BOX4",
                  "ProductCode": 891,
                  "BatchId": 80052,
                  "StartDate": "2024-12-10",
                  "EndDate": "2024-12-20",
                  "SeqNo": "0004",
                  "qrCode":"",
                  "OCCode":""
                },
                {
                  
                  "Packaging2": "IC2",
                  "Packaging3": "BOX5",
                  "ProductCode": 891,
                  "BatchId": 80052,
                  "StartDate": "2024-12-10",
                  "EndDate": "2024-12-20",
                  "SeqNo": "0004",
                  "qrCode":"",
                  "OCCode":""
                }
              ]
            };
          
            var oModel = new sap.ui.model.json.JSONModel(oProductionOrders);
            this.getView().setModel(oModel, "productionOrdersModel");
            var oTable = this.byId('ICProductTable');
             oTable._getSelectAllCheckbox().setVisible(false);
          },

          onSelectionChange: function (oEvent) {
            let oTable = this.byId("ICProductTable");
            let oSelectedItem = oEvent.getParameter("listItem");
            let bSelected = oEvent.getParameter("selected");
        
            // Get the selected item's Packaging2 value
            let sPackaging2 = oSelectedItem.getBindingContext("productionOrdersModel").getProperty("Packaging2");
        
            // Loop through all items in the table
            oTable.getItems().forEach(oItem => {
                let oContext = oItem.getBindingContext("productionOrdersModel");
                if (oContext) {
                    let sItemPackaging2 = oContext.getProperty("Packaging2");
        
                    // Select or deselect only items with the same Packaging2 value
                    if (sItemPackaging2 === sPackaging2) {
                        oTable.setSelectedItem(oItem, bSelected);
                    }
                }
            });
        },                  
        

        onGenerateOCQRPress : function(){
             let oTable = this.byId("ICProductTable");
             let aSelectedItems = oTable.getSelectedItems()
             let oModel = this.getView().getModel("productionOrdersModel")
             if(aSelectedItems.length === 0){
              sap.m.MessageBox.error("Please select at least one row to generate QR and IC codes.");
              return;
             }
             let ocCode = "OC-"+new Date().getTime()
             let combinedData = aSelectedItems.map(oitem=>{
              let oContext = oitem.getBindingContext("productionOrdersModel")
              let oData = oContext.getObject()
              delete oData.qrCode
              delete oData.OCCode
              return oData
             })
             let OCqrPayload = JSON.stringify({
                ocCode : ocCode,
                rows : combinedData
             })
             let qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=" + encodeURIComponent(OCqrPayload);
             console.log("QR Code : ", qrCodeUrl)
             aSelectedItems.forEach(oItem=>{
              let oContext = oItem.getBindingContext("productionOrdersModel")
              let oData = oContext.getObject()
              oData.qrCode = qrCodeUrl;
              oData.OCCode = ocCode;
              oData.isQRGenerated = true;
              oModel.setProperty(oContext.getPath()+"/qrCode",qrCodeUrl)
              oModel.setProperty(oContext.getPath()+"/OCCode",ocCode)
              oModel.setProperty(oContext.getPath()+"/isQRGenerated",true)
             })
             let oData = oModel.getProperty("/ProductionOrders")
             let aGeneratedRows = oData.filter(item=>item.isQRGenerated)
             let aOtherRows = oData.filter(item=>!item.isQRGenerated)
             let aUpdatedData = aGeneratedRows.concat(aOtherRows)
             oModel.setProperty("/ProductionOrders",aUpdatedData)
             oModel.refresh()
             oTable.invalidate()
             oTable.removeSelections()
             sap.m.MessageToast.show("QR Codes and IC Code generated successfully!");
        },

        onViewOCQRCodePress: function (oEvent) {
          let qrCodeUrl = oEvent.getSource().getCustomData()[0].getValue();            
          if (!qrCodeUrl) {
              MessageToast.show("No QR Code available!");
              return;
          }            
          let oDialog = this.byId("qrCodeDialog2");
          let oImage = this.byId("qrCodeDialogImage2");
          oImage.setSrc(qrCodeUrl);
          oDialog.open();
      },

      onCloseDialog: function () {
        this.byId("qrCodeDialog2").close();
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
     
     

        
          
    });
    
});
