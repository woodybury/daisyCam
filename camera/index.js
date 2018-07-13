// modified from https://github.com/WebMaestroFr/rpi-mpeg-ts
const spawn = require("child_process").spawn;

class Camera {
    constructor(options) {
        // Capture options (https://www.raspberrypi.org/documentation/raspbian/applications/camera.md)
        Camera.options = Object.assign({
            nopreview: true,
            inline: true,
            timeout: 0,
            width: 640,
            height: 480,
            framerate: 30
        }, options || {}, {output: "-"});

        Camera.args = [];
        // Command arguments
        Object
            .keys(Camera.options)
            .forEach(opt => {
                if (Camera.options[opt] || Camera.options[opt] === 0) {
                    Camera.args.push(`--${opt}`);
                    if (true !== Camera.options[opt]) {
                        args.push(Camera.options[opt]);
                    }
                }
            });

        // Capture
        Camera.raspivid = spawn("raspivid", Camera.args, {
            stdio: ["ignore", "pipe", "inherit"]
        });

        // H264 stream
        Camera.source = Camera.raspivid.stdout;

        // Converters
        Camera._formats = new Map();
    }

    stream(format, cb) {

        let argsOut, avconv;
        // Output options (https://libav.org/documentation/avconv.html#Options-1)
        switch (format) {

            case "mpeg":
                // Video
                argsOut = [
                    "-f",
                    "mpegts",
                    "-codec:v",
                    "mpeg1video",
                    "-r",
                    24,
                    "-b:v",
                    1024 * 1024,
                    "-bf",
                    "0",
                    "-qmin",
                    "3"
                ];
                break;

            case "image":
                // Frame by frame
                argsOut = [
                    "-f",
                    "image2pipe",
                    "-r",
                    6,
                    "-q:v",
                    "1"
                ];
                break;

            default:
                // Custom
                argsOut = format;
        }

        if (Camera._formats.has(argsOut)) {
            // Process duplicate
            return Camera
                ._formats
                .get(argsOut);
        }

        const argsIn = [
            "-fflags", "nobuffer", "-probesize", 128 * 1024,
            "-f",
            "h264",
            "-r",
            Camera.options.framerate,
            "-i",
            "-",
            "-an"
        ];
        // Command arguments
        const args = argsIn.concat(argsOut, ["-"]);
        // Converter
        avconv = spawn("avconv", args, {
            stdio: ["pipe", "pipe", "inherit"]
        });
        avconv
            .stdout
            .on("error", err => {
                console.log(err);
            });

        if (cb) {
            // Callback
            avconv
                .stdout
                .on("data", cb);
        }

        // Controller
        const stream = {
            start() {
                avconv = spawn("avconv", args, {
                  stdio: ["pipe", "pipe", "inherit"]
                });
                Camera
                    .raspivid = spawn("raspivid", Camera.args, {
                  stdio: ["ignore", "pipe", "inherit"]
                });
                console.log('start stream');
                Camera
                    .source
                    .pipe(avconv.stdin);
                return avconv;
            },
            stop() {
                Camera
                    .source
                    .unpipe(avconv.stdin);
                // kill to allow cv2 access to camera
                avconv.kill();
                Camera
                    .raspivid.kill();
                console.log('killed stream')
            }
        };
        Camera
            ._formats
            .set(argsOut, stream);
        return stream;
    }
}

module.exports = Camera;