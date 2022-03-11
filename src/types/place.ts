import type { PlaceType } from "./place_types"

export default interface Place {
    name: {
        en: string,
        el: string
    },
    description: {
        en: string,
        el: string
    },
    website: string | undefined,
    telephone: string | undefined,
    coordinates: number[],
    floor: number,
    type: PlaceType,
    keywords: string[]
}