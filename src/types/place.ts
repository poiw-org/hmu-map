import type { PlaceType } from "./place_types"

export default interface Place {
    name: {
        en: string,
        el: string
    },
    description: {
        en: string | undefined,
        el: string | undefined
    } | undefined,
    website: string | undefined,
    telephone: string | undefined,
    coordinates: number[],
    floor: number,
    type: PlaceType,
    keywords: string[],
    lessons: string[],
    marker: any | undefined // Do not include in the campus file! This is only for use within the front-end code.
}