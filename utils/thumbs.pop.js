//运动轨迹坐标
var data = [[{ x: 30, y: 400 }, { x: 70, y: 300 }, { x: -50, y: 150 }, { x: 30, y: 0 }], [{ x: 30, y: 400 }, { x: 30, y: 300 }, { x: 80, y: 150 }, { x: 30, y: 0 }], [{ x: 30, y: 400 }, { x: 0, y: 90 }, { x: 80, y: 100 }, { x: 30, y: 0 }]];
var timer = null;//定时器
var canvas = null;//画布
var ctx = null;//画布上下文

function loadCanvas(res) {
debugger
        canvas = res[0].node
        ctx = canvas.getContext('2d')

        const img = canvas.createImage()
        img.onload = () => {
                this._img = img
        }
        img.src = './heart1.png'

        const img1 = canvas.createImage()
        img1.onload = () => {
                this._img1 = img1
        }
        img1.src = './heart2.png'

        const img2 = canvas.createImage()
        img2.onload = () => {
                this._img2 = img2
        }
        img2.src = './heart3.png'

}

function render(canvas, ctx) {
        ctx.clearRect(0, 0, 600, 600)
        this.drawCar(ctx)
}

function onClickImage() {
        const renderLoop = () => {
                this.render(canvas, ctx)
                timer = canvas.requestAnimationFrame(renderLoop)
        }
        timer = canvas.requestAnimationFrame(renderLoop)

        setTimeout(function () {
                cancelAnimationFrame(timer);
                ctx.clearRect(0, 0, 600, 600)
        }, 2090)
}
function drawCar(ctx) {
        if (!this._img) return
        if (this.x > 350) {
                this.x = -100
        }
        let data = this.data.data;
        var p10 = data[0][0];   // 三阶贝塞尔曲线起点坐标值
        var p11 = data[0][1];   // 三阶贝塞尔曲线第一个控制点坐标值
        var p12 = data[0][2];   // 三阶贝塞尔曲线第二个控制点坐标值
        var p13 = data[0][3];   // 三阶贝塞尔曲线终点坐标值

        var p20 = data[1][0];
        var p21 = data[1][1];
        var p22 = data[1][2];
        var p23 = data[1][3];

        var p30 = data[2][0];
        var p31 = data[2][1];
        var p32 = data[2][2];
        var p33 = data[2][3];

        var t = factor.t;

        /*计算多项式系数 （下同）*/
        var cx1 = 3 * (p11.x - p10.x);
        var bx1 = 3 * (p12.x - p11.x) - cx1;
        var ax1 = p13.x - p10.x - cx1 - bx1;

        var cy1 = 3 * (p11.y - p10.y);
        var by1 = 3 * (p12.y - p11.y) - cy1;
        var ay1 = p13.y - p10.y - cy1 - by1;

        var xt1 = ax1 * (t * t * t) + bx1 * (t * t) + cx1 * t + p10.x;
        var yt1 = ay1 * (t * t * t) + by1 * (t * t) + cy1 * t + p10.y;

        /** ---------------------------------------- */
        var cx2 = 3 * (p21.x - p20.x);
        var bx2 = 3 * (p22.x - p21.x) - cx2;
        var ax2 = p23.x - p20.x - cx2 - bx2;

        var cy2 = 3 * (p21.y - p20.y);
        var by2 = 3 * (p22.y - p21.y) - cy2;
        var ay2 = p23.y - p20.y - cy2 - by2;

        var xt2 = ax2 * (t * t * t) + bx2 * (t * t) + cx2 * t + p20.x;
        var yt2 = ay2 * (t * t * t) + by2 * (t * t) + cy2 * t + p20.y;


        /** ---------------------------------------- */
        var cx3 = 3 * (p31.x - p30.x);
        var bx3 = 3 * (p32.x - p31.x) - cx3;
        var ax3 = p33.x - p30.x - cx3 - bx3;

        var cy3 = 3 * (p31.y - p30.y);
        var by3 = 3 * (p32.y - p31.y) - cy3;
        var ay3 = p33.y - p30.y - cy3 - by3;

        /*计算xt yt的值 */
        var xt3 = ax3 * (t * t * t) + bx3 * (t * t) + cx3 * t + p30.x;
        var yt3 = ay3 * (t * t * t) + by3 * (t * t) + cy3 * t + p30.y;
        console.log('yt3', yt3)
        factor.t += factor.speed;
        ctx.drawImage(this._img, xt1, yt1, 30, 30)
        ctx.drawImage(this._img1, xt2, yt2, 30, 30)
        ctx.drawImage(this._img2, xt3, yt3, 30, 30)
        ctx.restore()
        if (yt3 == 2.379100159999666) {
                cancelAnimationFrame(timer);
        } else {
                if (factor.t > 1) {
                        factor.t = 0;
                        cancelAnimationFrame(timer);

                }
        }

}

module.exports = {
        loadCanvas:loadCanvas,
        onClickImage:onClickImage

}