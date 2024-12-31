namespace track;

using {
    managed,
    cuid
} from '@sap/cds/common';

// MaterialBox entity with QR Code and Box details
entity MaterialBox {
  key BoxID          : String ;
  BoxQRCodeURL      : String(255);
  ProductCode       : String(50);
  BatchID           : String(50);
  ManufacturingDate : Date; 
  ExpiryDate        : Date; 
  ProductionOrder   : String(50); 
  SeqNo             : Integer; 
  IC                : Association to InnerContainer; 
}

// InnerContainer entity with QR code and Box association
entity InnerContainer {
  key ICID           : String ;
  ICQRCodeURL        : String(255); 
  Boxes              : Composition of many MaterialBox on Boxes.IC = $self; 
  OC                 : Association to OuterContainer;
}

// OuterContainer entity with QR code and InnerContainer association
entity OuterContainer {
  key OCID           : String ;
  OCQRCodeURL        : String(255); 
  ICs                : Composition of many InnerContainer on ICs.OC = $self; 
}
