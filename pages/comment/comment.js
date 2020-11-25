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
                console.log(id);
                this.setData({
                        id: id, // 这个是商品id
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
                        id: that.data.id
                }).then(function (res) {
                        if (res.errno === 0) {

                                let _commentList = res.data.commentList;
                                // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
                                console.log(_commentList);
                                let nocommentimg = that.data.nocommentimg;
                                if (_commentList && _commentList.length > 0) {
                                        that.setData({
                                                nocomment: false,
                                                commentCount: util.transformUnit(_commentList.length)
                                        });
                                        for (var temp101 = 0; temp101 < _commentList.length; temp101++) {
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
                                        commentList: res.data.commentList,
                                        loading: 1
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
                                commentList:this.data.commentList
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
         * 页面相关事件处理函数--监听用户下拉动作
         */
        onPullDownRefresh: function () {


        },

        /**
         * 页面上拉触底事件的处理函数
         */
        onReachBottom: function () {

        },

        /**
         * 用户点击右上角分享
         */
        onShareAppMessage: function () {

        }
})