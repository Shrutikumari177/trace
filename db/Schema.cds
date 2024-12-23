namespace track;

entity PerfumeBottles {
    key ID: UUID;
    BottleCode: String(50);
    Material: String(50);
    ProductionDate: DateTime;
    Carton: Association to InnerCartons; // Link to the parent InnerCarton
}

entity InnerCartons {
    key ID: UUID;
    InnerCartonCode: String(50);
    Bottles: Composition of many PerfumeBottles on Bottles.Carton = $self; // Link bottles to this InnerCarton
    Container: Association to OuterCartons; // Link to the parent OuterCarton
}

entity OuterCartons {
    key ID: UUID;
    OuterCartonCode: String(50);
    InnerCartons: Composition of many InnerCartons on InnerCartons.Container = $self; // Link InnerCartons to this OuterCarton
}

entity Users {
    key ID: UUID;
    Role: String(20); // Manufacturer, Dealer, Retailer, Customer
}
