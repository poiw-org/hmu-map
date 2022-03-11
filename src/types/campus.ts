import Place from './place';

export default interface Campus {
    name: {
        el: string,
        en: string
    }
    places: Place[]
}