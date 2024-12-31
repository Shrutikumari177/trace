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

            var uniqueProductCodes = [...new Set(oData.materials.map(item => item.batchId))];

             var uniqueData = uniqueProductCodes.map(code => ({ batchId: code }));
             var oUniqueModel = new sap.ui.model.json.JSONModel({ products: uniqueData });
             this.getView().setModel(oUniqueModel, "uniqueProductModel");

             var oModel = new sap.ui.model.json.JSONModel(oData);
             this.getView().setModel(oModel, "materialModel");
             this._loadInitialData()
        },

        _loadInitialData :async function(){
             let oModel = this.getOwnerComponent().getModel()
             let url = "BoxLineItem"
             let oBindList = oModel.bindList(`/${url}`)
             try{
                 let oContext =await oBindList.requestContexts(0,Infinity)
                 if(oContext.length === 0){
                    MessageToast.show("Data not Found!") 
                 }
                let oData =  oContext.map(item=>item.getObject())
                let pModel = new JSONModel()
                pModel.setData({perfumeItem: oData})
                this.getView().setModel(pModel,"perfumeModel")
                console.log("perfumes data is: ", this.getView().getModel("perfumeModel").getData())
             }
             catch(error){
                console.log(`Error when read ${url} entity`)
             }
         },

        onValueHelpSelectItem: async function (oEvent) {
            const oSelectedItem = oEvent.getParameter("selectedItem");
            let tableLayout = this.byId("boxProduct_BlockLayoutRow2")
            if (oSelectedItem) {
                const sSelectedValue = oSelectedItem.getTitle();
                await this._oInputField.setValue(sSelectedValue);
                await this.getBindServices(sSelectedValue);
                tableLayout.setVisible(true)

            }
        }, 

        onGenerateQRPress:async function(){
          let oTable = this.byId("boxProduct_productTypeTable")
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
            rowData.qrCode = qrCodeUrl;
            await this._postQrData(rowData,qrCodeUrl)
            this.getView().getModel("materialDataModel").refresh()
        },

        _postQrData :async function(rowData,qrCodeUrl){
            const {productCode,batchId,manufacturingDate} = rowData
            let boxModel = this.getOwnerComponent().getModel()
           let boxPayload = {
            productCode : productCode,
            QrCode : qrCodeUrl,
            BatchId : batchId,
            CreationDate : manufacturingDate
           }
           let oBindList = boxModel.bindList("/BoxLineItem");
            oBindList.create(boxPayload, true)
            oBindList.attachCreateCompleted((oEvent) => {
                let params = oEvent.getParameters();
                if (params.success) {
                   let response= params.context.getObject()
                   console.log("Response",response);
                }
            })
        },

        onViewQRCodePress: function (oEvent) {
            let qrCodeUrl = oEvent.getSource().getCustomData()[0].getValue();            
            if (!qrCodeUrl) {
                MessageToast.show("No QR Code available!");
                return;
            }            
            let oDialog = this.byId("boxProduct_qrCodeDialog");
            let oImage = this.byId("boxProduct_qrCodeDialogImage");
            oImage.setSrc(qrCodeUrl);
            oDialog.open();
        },
        
        onCloseDialog: function () {
            this.byId("boxProduct_qrCodeDialog").close();
        }, 
        
        onPrintQR: function () {
            var oImage = this.byId("boxProduct_qrCodeDialogImage");
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
                let oModel = this.getView().getModel("materialModel");
                let modelData = oModel.getData().materials
                let filterData = modelData.filter(item=>{
                    return item.batchId === value
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