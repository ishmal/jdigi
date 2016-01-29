import {Digi} from '../lib/digi';

/**
 * Simple service to allow all components to get
 * a handle to the Digi instance.
 */
export class DigiService {

    private _digi: Digi;

    constructor() {
        this._digi = new Digi();
    }

    get digi(): Digi {
        return this._digi;
    }
}
