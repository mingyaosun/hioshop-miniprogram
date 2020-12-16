var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');
Page({

        /**
         * 页面的初始数据
         */
        data: {
                id: 0,
                publishId: 0,//评论人id
                niname: '',//昵称
                avatar: '',//头像
                sysHeight: 0,
                imgBaseUrl: 'https://www.sunmingyao.com/',//文件服务器根路径
                imgToken: '',//图片上传所需token
                upLoadUrl: '',//图片上传服务器地址
                comContext: '',//评论内容
                imgList: [],//图片上传时候的路径列表
                imgSuccList: [],//图片上传成功后，服务器返回的图片链接
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
                let upLoadParam = wx.getStorageSync('upLoadParam');
                let userInfo = wx.getStorageSync('userInfo');
                console.log('userInfo', userInfo)
                this.setData({
                        id: id, // 这个是商品id
                        imgToken: upLoadParam.imgToken,
                        upLoadUrl: upLoadParam.upLoadHttps,
                        publishId: userInfo.id,
                        niname: userInfo.nickname,
                        avatar: userInfo.avatar
                });

        },

        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady: function () {
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
                        comContext: e.detail.value
                })
        },
        ChooseImage() {
                wx.chooseImage({
                        count: 4, //默认9
                        sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
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
                        title: '正在发布',
                });
                if (imgList.length > 0) {
                        wx.uploadFile({
                                url: that.data.upLoadUrl,
                                filePath: imgList[count],
                                name: 'file',//示例，使用顺序给文件命名
                                formData: {
                                        'token': that.data.imgToken
                                },
                                success: function (e) {
                                        successUp++;//成功+1
                                        let data = JSON.parse(e.data)
                                        that.setData({
                                                imgSuccList: that.data.imgSuccList.concat(that.data.imgBaseUrl + data.key)
                                        });
                                        console.log('上传成功之后服务器返回的图片地址', that.data.imgSuccList);
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
                                                //图片全部上传完毕，表单数据入库
                                                util.request(api.CommentAdd, {
                                                        niname: that.data.niname,
                                                        avatar: that.data.avatar,
                                                        cardId: that.data.id,
                                                        publishId: that.data.publishId,
                                                        comContext: that.data.comContext,
                                                        comImgList: that.data.imgSuccList
                                                }, "POST").then(function (res) {
                                                        let _res = res;
                                                        if (_res.errno == 0) {
                                                                wx.showToast({
                                                                        title: '发布成功',
                                                                        icon: 'success',
                                                                        duration: 2000,
                                                                        success: function () {
                                                                                wx.navigateBack();
                                                                        }
                                                                })
                                                        } else {
                                                        }
                                                }).catch(() => {});
                                        } else {
                                                //递归调用，上传下一张
                                                that.uploadOneByOne(imgList, successUp, failUp, count, length);
                                                console.log('正在上传第' + count + '张');
                                        }
                                }
                        })
                }else{
                        util.request(api.CommentAdd, {
                                niname: that.data.niname,
                                avatar: that.data.avatar,
                                cardId: that.data.id,
                                publishId: that.data.publishId,
                                comContext: that.data.comContext,
                                comImgList: that.data.imgSuccList
                        }, "POST").then(function (res) {
                                let _res = res;
                                if (_res.errno == 0) {
                                        wx.showToast({
                                                title: '发布成功',
                                                icon: 'success',
                                                duration: 1000,
                                                success: function () {
                                                        wx.navigateBack();
                                                }
                                        })
                                } else {
                                }
                        }).catch(() => {});
                }

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