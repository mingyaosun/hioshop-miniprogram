var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
Page({

        /**
         * 页面的初始数据
         */
        data: {
                id: 0,
                sysHeight: 0,
                imgToken: '',//图片上传所需token
                upLoadUrl: '',//图片上传服务器地址
                imgList: [],
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
                let id = 0;
                var scene = decodeURIComponent(options.scene);
                if (scene != 'undefined') {
                        id = scene;
                } else {
                        id = options.id;
                }
                let upLoadParam = util.getUpLoadParam();
                this.setData({
                        id: id, // 这个是商品id
                        imgToken: upLoadParam.imgToken,
                        upLoadUrl: upLoadParam.upLoadUrl + 'upload.php'
                });
                
        },

        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function () {
                // setTimeout(this.showModal,500)
        },

        /**
         * 生命周期函数--监听页面显示
         */
        onShow: function () {
                let that = this;
                let info = wx.getSystemInfoSync();
                let sysHeight = info.windowHeight;
                that.setData({
                        sysHeight: sysHeight
                });
                setTimeout(function () { getApp().data.isready = true; }, 1000);

        },

        /**
         * 生命周期函数--监听页面隐藏
         */
        onHide: function () {

        },

        /**
         * 生命周期函数--监听页面卸载
         */
        onUnload: function () {
                getApp().data.isready = false;
        },
        textareaAInput(e) {
                this.setData({
                        textareaAValue: e.detail.value
                })
        },
        ChooseImage() {
                let that = this;
                wx.chooseImage({
                        count: 4, //默认9
                        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
                        sourceType: ['album'], //从相册选择
                        success: (res) => {
                                if (this.data.imgList.length != 0) {
                                        this.setData({
                                                imgList: this.data.imgList.concat(res.tempFilePaths)
                                        })
                                } else {
                                        this.setData({
                                                imgList: res.tempFilePaths
                                        })
                                }
                                console.log(this.data.imgList)
                        }
                });
        },
        ViewImage(e) {
                wx.previewImage({
                        urls: this.data.imgList,
                        current: e.currentTarget.dataset.url
                });
        },
        DelImg(e) {
                wx.showModal({
                        title: '提示',
                        content: '确定要删除吗？',
                        cancelText: '取消',
                        confirmText: '确定',
                        success: res => {
                                if (res.confirm) {
                                        this.data.imgList.splice(e.currentTarget.dataset.index, 1);
                                        this.setData({
                                                imgList: this.data.imgList
                                        })
                                }
                                console.log(this.data.imgList)
                        }
                })
        },
        /**
  * 采用递归的方式上传多张
  */
        uploadOneByOne(imgList, successUp, failUp, count, length) {
                var that = this;
                wx.showLoading({
                        title: '正在上传第' + count + '张',
                })
                wx.uploadFile({
                        url: that.data.upLoadUrl,
                        filePath: imgList[count],
                        name: 'file',//示例，使用顺序给文件命名
                        formData: {
                                'token': that.data.imgToken
                        },
                        success: function (e) {
                                successUp++;//成功+1
                        },
                        fail: function (e) {
                                console.log(e)
                                failUp++;//失败+1
                        },
                        complete: function (e) {
                                count++;//下一张
                                if (count == length) {
                                        //上传完毕，作一下提示
                                        console.log('上传成功' + successUp + ',' + '失败' + failUp);
                                        wx.showToast({
                                                title: '上传成功' + successUp,
                                                icon: 'success',
                                                duration: 2000
                                        })
                                } else {
                                        //递归调用，上传下一张
                                        that.uploadOneByOne(imgList, successUp, failUp, count, length);
                                        console.log('正在上传第' + count + '张');
                                }
                        }
                })
        },
        commentAdd() {
                let that = this;
                var imgList = that.data.imgList;
                var successUp = 0; //成功
                var failUp = 0; //失败
                var length = imgList.length; //总数
                var count = 0; //第几张
                this.uploadOneByOne(imgList, successUp, failUp, count, length);//上传照片
        },

})