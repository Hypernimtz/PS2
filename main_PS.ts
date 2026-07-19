//% color="#31C7D5" weight=10 icon="\uf1d1"
 namespace ps2controller {

    let chipSelect = DigitalPin.P12
    pins.digitalWritePin(chipSelect, 1)

    pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
    pins.spiFormat(8, 3)
    pins.spiFrequency(250000)

    let pad = pins.createBuffer(6)
    let connected = false

    const poll_cmd = hex
        `014200000000000000`

    function send_command(transmit: Buffer): Buffer {
        // Handle bit order
        transmit = reverse.rbuffer(transmit)

        let receive = pins.createBuffer(transmit.length);

        pins.digitalWritePin(chipSelect, 0);
        // Actually send the command
        for (let i = 0; i < transmit.length; i++) {
            receive[i] = pins.spiWrite(transmit[i]);
        }
        pins.digitalWritePin(chipSelect, 1)

        // Handle bit order
        receive = reverse.rbuffer(receive)

        return receive
     }

    export enum PS2Button {
        //% blockId="Left" block="D-Pad Left"
        Left,
        //% blockId="Down" block="D-Pad Down"
        Down,
        //% blockId="Right" block="D-Pad Right"
        Right,
        //% blockId="Up" block="D-Pad Up"
        Up,
        //% blockId="Start" block="Start Button"
        Start,
        //% blockId="Analog_Left" block="Left Analog Stick Press"
        Analog_Left,
        //% blockId="Analog_Right" block="Right Analog Stick Press"
        Analog_Right,
        //% blockId="Select" block="Select Button"
        Select,
        //% blockId="Square" block="Square (□) Button"
        Square,
        //% blockId="Cross" block="Cross (×) Button"
        Cross,
        //% blockId="Circle" block="Circle (○) Button"
        Circle,
        //% blockId="Triangle" block="Triangle (△) Button"
        Triangle,
        //% blockId="R1" block="R1 Button"
        R1,
        //% blockId="L1" block="L1 Button"
        L1,
        //% blockId="R2" block="R2 Button"
        R2,
        //% blockId="L2" block="L2 Button"
        L2,
        //% blockId="Buttons" block="Buttons (Unused)"
        Buttons,
        //% blockId="RX" block="Right Analog Stick X Value"
        RX,
        //% blockId="RY" block="Right Analog Stick Y Value"
        RY,
        //% blockId="LX" block="Left Analog Stick X Value"
        LX,
        //% blockId="LY" block="Left Analog Stick Y Value"
        LY,
     };

    //% blockId=robotbit_button_pressed block="Set PS2 Controller|%b|Pressed"
    //% weight=99
    //% blockGap=50
    //% name.fieldEditor="gridpicker" name.fieldOptions.columns=4
     export function button_pressed(b: PS2Button): number {
        if(!connected) return 0x00

        switch (b) {
            case PS2Button.Left:
                return pad[0] & 0x80 ? 0 : 1;
            case PS2Button.Down:
                return pad[0] & 0x40 ? 0 : 1;
            case PS2Button.Right:
                return pad[0] & 0x20 ? 0 : 1;
            case PS2Button.Up:
                return pad[0] & 0x10 ? 0 : 1;
            case PS2Button.Start:
                return pad[0] & 0x08 ? 0 : 1;
            case PS2Button.Analog_Left:
                return pad[0] & 0x04 ? 0 : 1;
            case PS2Button.Analog_Right:
                return pad[0] & 0x02 ? 0 : 1;
            case PS2Button.Select:
                return pad[0] & 0x01 ? 0 : 1;
            case PS2Button.Square:
                return pad[1] & 0x80 ? 0 : 1;
            case PS2Button.Cross:
                return pad[1] & 0x40 ? 0 : 1;
            case PS2Button.Circle:
                return pad[1] & 0x20 ? 0 : 1;
            case PS2Button.Triangle:
                return pad[1] & 0x10 ? 0 : 1;
            case PS2Button.R1:
                return pad[1] & 0x08 ? 0 : 1;
            case PS2Button.L1:
                return pad[1] & 0x04 ? 0 : 1;
            case PS2Button.R2:
                return pad[1] & 0x02 ? 0 : 1;
            case PS2Button.L2:
                return pad[1] & 0x01 ? 0 : 1;
            case PS2Button.Buttons:
                return ~((pad[1] << 8) | pad[0]) & 0xffff;
            case PS2Button.RX:
                return pad[2] - 0x80;
            case PS2Button.RY:
                return pad[3] - 0x80;
            case PS2Button.LX:
                return pad[4] - 0x80;
            case PS2Button.LY:
                return pad[5] - 0x80;
        }
        return 0;
    }

    function poll(): boolean {
        let buf = send_command(poll_cmd)
        if (buf[2] != 0x5a) {
            return false;
        }

        for (let i = 0; i < 6; i++) {
            pad[i] = buf[3 + i];
        }

        connected = true

        return true
    }

    basic.forever(function () {
        poll();
    })
 }
