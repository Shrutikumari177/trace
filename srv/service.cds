using {track} from '../db/Schema';

service trackservice {
    entity PerfumeBottles as projection on track.PerfumeBottles;
    entity InnerCartons as projection on track.InnerCartons;
    entity OuterCartons as projection on track.OuterCartons;
    entity Users as projection on track.Users;
    action generateQRCode(text: String) returns String;
}
