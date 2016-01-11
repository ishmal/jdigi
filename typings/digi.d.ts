
declare module "digi" {

    /**
     * Interface for a text output widget, which the UI should overload
     */
    export class OutText {
        clear():void;

        putText(msg:string):void;
    }

    /**
     * Interface for a test input widget, which the UI should overload
     */
    export class InText {
        clear():void;

        getText():string;
    }

    export class Mode {

    }

    export class Tuner {

    }


    /**
     * This is the top-level GUI-less app.  Extend this with a GUI.
     */
    export class Digi {


        constructor();


        sampleRate:number;


        mode:Mode;

        bandwidth:number;

        frequency:number;

        useAfc:boolean;

        useQrz:boolean;

        txMode:boolean;

        tuner:Tuner;

        /**
         * Override this in the GUI
         */
        showScope(data:Array<number>):void;

        /**
         * Make this an interface, so we can add things later.
         * Let the GUI override this.
         */
        outText:OutText;

        /**
         * Output text to the gui
         */
        putText(str:string):void;

        /**
         * Make this an interface, so we can add things later.
         * Let the GUI override this.
         */
        inText:InText;

        /**
         * Input text from the gui
         */
        getText():string;

        clear():void;

        transmit(data:Array<number>):void;

        start():void;

        stop():void;


    } //Digi


}