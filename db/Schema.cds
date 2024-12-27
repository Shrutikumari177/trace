namespace track;
using {
    managed,
    cuid
} from '@sap/cds/common';

entity PerfumeBottles : managed {
    key productCode : String;
    batchId         : String;
    qrCode          : String; 
    manufacturingDate : Date;
    expiryDate        : Date;
    productionId      : String;
}
