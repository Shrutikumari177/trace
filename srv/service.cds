using {track} from '../db/Schema';

service trackservice {
    entity PerfumeBottles as projection on track.PerfumeBottles;
}
