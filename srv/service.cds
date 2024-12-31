using {track} from '../db/Schema';

service trackservice {
    entity MaterialBox as projection on track.MaterialBox;
    entity InnerContainer as projection on track.InnerContainer;
    entity OuterContainer as projection on track.OuterContainer;

}
