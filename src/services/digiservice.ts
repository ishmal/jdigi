import {Digi} from '../lib/digi';

/**
 * Simple service to allow all components to get
 * a handle to the Digi instance.
 */
export class DigiService {

    private _digi: jsdigi.Digi;

    constructor() {
        this._digi = new jsdigi.Digi();
    }

    get digi(): jsdigi.Digi {
        return this._digi;
    }
}