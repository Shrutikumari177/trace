const cds = require('@sap/cds');

module.exports = cds.service.impl(async (srv) => {

  // Helper function to create QR code URLs
  const createQRCodeURL = (data) => {
    const qrPayload = JSON.stringify(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrPayload)}`;
  };

  const sequenceMap = {
    IC: 50000, 
    BOX: 40000 ,
    OC:60000
};

const generateCustomID = (prefix) => {
    if (!sequenceMap.hasOwnProperty(prefix)) {
        throw new Error(`Prefix "${prefix}" is not supported.`);
    }
    const id = `${prefix}-${sequenceMap[prefix]}`; // Create the unique ID
    sequenceMap[prefix]++; 
    return id;
};
  // Handler for creating MaterialBox
  srv.on('CREATE', 'MaterialBox', async (req) => {
    const { ProductCode, BatchID, ManufacturingDate, ExpiryDate, ProductionOrder, SeqNo, IC } = req.data;

    if (!ProductCode || !BatchID || !ManufacturingDate || !ExpiryDate || !ProductionOrder || SeqNo === undefined) {
      req.error(400, 'All required fields must be provided.');
    }

    // Generate BoxID
    const boxId = generateCustomID('BOX');
    const qrPayload = {
      BoxID: boxId,
      ProductCode,
      BatchID,
      ManufacturingDate,
      ExpiryDate,
      ProductionOrder,
      SeqNo,
    };
    const boxQRCodeURL = createQRCodeURL(qrPayload);

    const newMaterialBox = {
      BoxID: boxId,
      BoxQRCodeURL: boxQRCodeURL,
      ProductCode,
      BatchID,
      ManufacturingDate,
      ExpiryDate,
      ProductionOrder,
      SeqNo,
      IC,
    };

    const db = await cds.transaction(req);
    await db.run(INSERT.into('track.MaterialBox').entries(newMaterialBox));
    return newMaterialBox;
  });

  srv.on('CREATE', 'InnerContainer', async (req) => {
    const { Boxes, OC } = req.data;

    // Debugging log to check incoming request data
    console.log('Received request data:', req.data);

    // Ensure there are Boxes and each has BoxID
    if (!Boxes || Boxes.length === 0) {
        console.error('At least one Box is required.');
        req.error(400, 'At least one Box is required.');
    }

    // Generate a unique ICID
   
    const icId = generateCustomID('IC'); 

    // Debugging log to check ICID generation
    console.log('Generated ICID:', icId);

    // Prepare the QR code payload for the IC
    const qrPayload = {
        ICID: icId,
        Boxes: Boxes.map((box) => box.BoxID),
    };

    // Debugging log to check QR code payload
    console.log('QR Payload:', qrPayload);

    // Generate QR code URL
    const icQRCodeURL = createQRCodeURL(qrPayload);

    // Debugging log to check generated QR code URL
    console.log('Generated IC QR Code URL:', icQRCodeURL);

    // Prepare new InnerContainer object
    const newInnerContainer = {
        ICID: icId,
        ICQRCodeURL: icQRCodeURL,
        OC: OC || null,  // OC can be passed or be null if not available
    };


    const db = await cds.transaction(req);

    try {
        await db.run(INSERT.into('track.InnerContainer').entries(newInnerContainer));

        console.log('Inserted new InnerContainer:', newInnerContainer);

        for (const box of Boxes) {
            if (!box.BoxID) {
                console.error('BoxID is required for each Box.');
                req.error(400, 'BoxID is required for each Box.');
            }

            console.log('Updating MaterialBox with BoxID:', box.BoxID);

            await db.run(UPDATE('track.MaterialBox').set({ IC: { ICID: icId } }).where({ BoxID: box.BoxID }));

            console.log(`MaterialBox with BoxID ${box.BoxID} updated with ICID: ${icId}`);
        }

        return newInnerContainer;
    } catch (error) {
        req.error(500, 'An error occurred while creating the InnerContainer.');
    }
});


  

  // Handler for creating OuterContainer
  srv.on('CREATE', 'OuterContainer', async (req) => {
    const {  ICs } = req.data;

    if (!ICs || ICs.length === 0) {
        console.error('At least one IC is required.');
        req.error(400, 'At least one IC is required.');
    }

    // Generate OCID
    const ocId = generateCustomID('OC'); 
    
    const qrPayload = {
        OCID: ocId,
        ICs: ICs.map((box) => ICs.ICID),
    };
    const ocQRCodeURL = createQRCodeURL(qrPayload);

    const newOuterContainer = {
      OCID: ocId,
      OCQRCodeURL: ocQRCodeURL,
    };

    const db = await cds.transaction(req);

    try {
        await db.run(INSERT.into('track.OuterContainer').entries(newOuterContainer));

        console.log('Inserted new OuterContainer:', newOuterContainer);

        for (const Ic of ICs) {
            if (!Ic.ICID) {
                console.error('IcID is required for each Box.');
                req.error(400, 'IcID is required for each Box.');
            }

            console.log('Updating InnerContainer with IcID:', Ic.ICID);

            await db.run(UPDATE('track.InnerContainer').set({ OC: { OCID: ocId } }).where({ ICID: Ic.ICID }));

            console.log(`MaterialBox with BoxID ${box.BoxID} updated with ICID: ${icId}`);
        }

        return newOuterContainer;
    } catch (error) {
        req.error(500, 'An error occurred while creating the InnerContainer.');
    }
});

});
