class Ising {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.lx = 40;
        this.ly = 40;
        this.temp = 4;
        this.is = new Array(this.lx);

        for (let ix = 0; ix < this.lx; ix++) {
            this.is[ix] = new Array(this.ly);
        }
        this.ip = new Array(this.lx);
        this.im = new Array(this.lx);
        this.jp = new Array(this.ly);
        this.jm = new Array(this.ly);

        this.startFlag = false;

        this.init();
        this.timerSetup();
        this.draw_spinconfiguration();
    }

    draw_spinconfiguration() {
        for (let ix = 0; ix < this.lx; ix++) {
            for (let iy = 0; iy < this.ly; iy++) {
                if (this.is[ix][iy] == -1) {
                    this.draw_spin(ix, iy, "#f00");
                } else {
                    this.draw_spin(ix, iy, "#00f");
                }
            }
        }
    }

    timerSetup() {
        this.timer = new vbTimer();
        this.timer.interval = 100;
        this.timer.timer = () => {
            var heff;
            var bt, ww, pp;

            bt = 1.0 / this.temp;


            for (let ix = 0; ix < this.lx; ix++) {
                for (let iy = 0; iy < this.ly; iy++) {
                    heff =
                        this.is[this.ip[ix]][iy] + this.is[this.im[ix]][iy] + this.is[ix][this.jp[iy]] + this.is[ix][this.jm[iy]];
                    ww = Math.exp(bt * heff);
                    pp = ww / (ww + 1.0 / ww);
                    this.is[ix][iy] = -1;
                    if (pp > Math.random()) {
                        this.is[ix][iy] = 1;
                    }
                }
            }
            this.draw_spinconfiguration();

        };
        this.show_thermometer();
    }

    init() {
        this.canvas.width = 500;
        this.canvas.height = 400;
        for (let ix = 0; ix < this.lx; ix++) {
            for (let iy = 0; iy < this.ly; iy++) {
                this.is[ix][iy] = 1;
                if (Math.random() < 0.5) {
                    this.is[ix][iy] = -1;
                }
            }
        }

        for (let ix = 0; ix < this.lx; ix++) {
            this.ip[ix] = ix + 1;
            this.im[ix] = ix - 1;
        }
        this.im[0] = this.lx - 1;
        this.ip[this.lx - 1] = 0;

        for (let iy = 0; iy < this.ly; iy++) {
            this.jp[iy] = iy + 1;
            this.jm[iy] = iy - 1;
        }
        this.jm[0] = this.ly - 1;
        this.jp[this.ly - 1] = 0;
    }

    draw_spin(ix, iy, color) {
        this.context.fillStyle = color;
        this.context.fillRect(10 * ix, 10 * iy, 10, 10);
        //    context.fill();
    }

    show_thermometer() {
        this.context.fillStyle = "#f00";
        this.context.fillRect(440, 370 * (1 - this.temp / 4) + 10, 20, (370 * this.temp) / 4 + 10);
        this.context.fillStyle = "#fff";
        this.context.fillRect(440, 10, 20, 370 * (1 - this.temp / 4) + 10);
        this.context.strokeRect(440, 10, 20, 380);
    }

    setEvent() {
        let nl = new nylon();
        nl.on('temp', (key, point) => {
            if (point.x >= 440 && point.x <= 460) {
                if (point.y >= 0 && point.y <= 370 * (1 - this.temp / 4) + 10) {
                    if (this.temp < 4.0) {
                        this.temp = this.temp + 0.1;
                        this.show_thermometer();
                    }
                } else if (point.y >= 370 * (1 - this.temp / 4) + 10 && point.y <= 380) {
                    if (this.temp > 0.1) {
                        this.temp = this.temp - 0.1;
                        this.show_thermometer();
                    }
                }
            }
        });

        nl.on('run', () => {
            if (this.timer.enabled == false) {
                this.timer.enable();
            } else {
                this.timer.disable();
            }
        });
    }
}

window.addEventListener("load", () => {
    let canvas = document.querySelector("#canvas");
    let context = canvas.getContext("2d");
    let is = new Ising(canvas);
    is.setEvent();

    let nl = new nylon();
    canvas.addEventListener("click", e => {
        const rect = canvas.getBoundingClientRect();
        nl.emit("temp", {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    });

    document.querySelector("#run").addEventListener("click", () => {
        nl.emit('run', null);
    });
});
