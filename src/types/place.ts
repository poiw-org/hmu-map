import { PlaceType } from "./place_types"

export default interface Place {
    name: {
        en: string,
        el: string
    },
    description: {
        en: string,
        el: string
    },
    coordinates: number[],
    floor: number,
    type: PlaceType
}