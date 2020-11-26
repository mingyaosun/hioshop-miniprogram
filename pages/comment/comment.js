// pages/comment/comment.js
var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var timer = require('../../utils/wxTimer.js');
var api = require('../../config/api.js');
const user = require('../../services/user.js');
Page({

        /**
         * 页面的初始数据
         */
        data: {
                id: 0,
                loading: 0,
                commentList: [],
                nocomment: true,
                nocommentimg: [],
                sysHeight: 0,
                page: 1,
                size: 3,
                total: 0,
                triggered: false
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function (options) {
                let id = 0;
                var scene = decodeURIComponent(options.scene);
                console.log(scene);
                if (scene != 'undefined') {
                        id = scene;
                } else {
                        id = options.id;
                }
                let info = wx.getSystemInfoSync();
                let sysHeight = info.windowHeight;
                console.log(id);
                this.setData({
                        id: id, // 这个是商品id
                        sysHeight: sysHeight
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
                this.getCommentInfo();
                setTimeout(function () { getApp().data.isready = true; }, 1000);
        },
        getCommentInfo: function () {
                let that = this;
                util.request(api.GoodsDetail, {
                        id: that.data.id,
                        page: this.data.page,
                        size: this.data.size
                }).then(function (res) {
                        if (res.errno === 0) {
                                that.data.page = res.data.commentList.currentPage;
                                that.data.total = res.data.commentList.count;
                                let _commentList = res.data.commentList.data;
                                console.log(_commentList);
                                let nocommentimg = that.data.nocommentimg;
                                if (_commentList && _commentList.length > 0) {
                                        that.setData({
                                                nocomment: false,
                                                commentCount: util.transformUnit(that.data.total)
                                        });
                                        for (var temp101 = 0; temp101 < _commentList.length; temp101++) {
                                                _commentList[temp101].time = util.wl_changeTime(_commentList[temp101].time);
                                                if (_commentList[temp101].list.length > 0) {
                                                        console.log(_commentList[temp101].id);
                                                        nocommentimg[_commentList[temp101].id + ''] = false;
                                                } else {
                                                        nocommentimg[_commentList[temp101].id + ''] = true;
                                                }
                                        }
                                        console.log(nocommentimg);
                                        that.setData({ nocommentimg });
                                } else {

                                }
                                that.setData({
                                        commentList: _commentList,
                                        loading: 1,
                                        triggered: false
                                });
                        }
                        else {
                                util.showErrorToast(res.errmsg)
                        }
                });
        },
        errorImg(e) {
                if (e.type == "error") {
                        var errorImgIndex = e.target.dataset.errorimg; //获取错误图片循环的下标
                        this.data.commentList[errorImgIndex].avatar = '/images/icon/default_avatar_big.png';
                        this.setData({
                                commentList: this.data.commentList
                        })
                }
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

        /**
         * 出发下拉刷新
         */
        onRefresh() {
                this.setData({
                        triggered: true,
                        page: 1,
                        size: 1
                });
                this.getCommentInfo();
        },
        loadMore(){
                console.log(44444444444)
        }

})