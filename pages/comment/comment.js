// pages/comment/comment.js
var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/util.js');
var timer = require('../../utils/wxTimer.js');
var api = require('../../config/api.js');
const user = require('../../services/user.js');
import Dialog from '../../components/dialog/dialog';
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
                currentPage: 1,
                totalPages: 1,
                size: 5,
                totalCount: 0,
                triggered: false,
                hasMore: true,
                isCard: true,
                textNoMore: '没有更多评论啦'
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
                let info = wx.getSystemInfoSync();
                let sysHeight = info.windowHeight;
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
                        page: that.data.currentPage,
                        size: that.data.size
                }).then(function (res) {
                        if (res.errno === 0) {
                                let currentPage = res.data.commentList.currentPage;//当前页数
                                let totalCount = res.data.commentList.count;//总条数
                                let totalPages = res.data.commentList.totalPages;//总页数
                                let _commentList = res.data.commentList.data;//返回数据条数
                                console.log(_commentList);
                                let nocommentimg = that.data.nocommentimg;
                                if (_commentList && _commentList.length > 0) {
                                        that.setData({
                                                nocomment: false,
                                                commentCount: util.transformUnit(totalCount)
                                        });
                                        for (var temp101 = 0; temp101 < _commentList.length; temp101++) {
                                                _commentList[temp101].time = util.wl_changeTime(_commentList[temp101].time);
                                                if (_commentList[temp101].list.length > 0) {
                                                        nocommentimg[_commentList[temp101].id + ''] = false;
                                                } else {
                                                        nocommentimg[_commentList[temp101].id + ''] = true;
                                                }
                                        }
                                        that.setData({ nocommentimg });
                                } else {

                                }
                                if (currentPage == 1 && totalPages > 1) {
                                        that.setData({
                                                hasMore: true,
                                                commentList: []
                                        });
                                } else if (currentPage == 1 && totalPages == 1) {
                                        that.setData({
                                                hasMore: false,
                                                commentList: []
                                        });
                                } else if (currentPage == totalPages && currentPage > 1) {
                                        that.setData({
                                                hasMore: false
                                        });
                                }

                                _commentList = that.data.commentList.concat(_commentList);
                                that.setData({
                                        commentList: _commentList,
                                        loading: 1,
                                        triggered: false,
                                        currentPage: currentPage,
                                        totalPages: totalPages
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
         * 下拉刷新
         */
        onRefresh() {
                this.setData({
                        triggered: true,
                        currentPage: 1,
                        size: 5
                });
                this.getCommentInfo();
        },
        /**
         * 上拉加载
         */
        loadMore() {
                this.setData({
                        currentPage: this.data.currentPage + 1
                });
                this.getCommentInfo();
        },
        ViewImage(e) {
                let that = this;
                let urlArr = [];
                let urlList = that.data.commentList[e.currentTarget.dataset.imgindex].list;
                urlList.forEach(element => {
                        urlArr.push(element.url)
                });
                wx.previewImage({
                        urls: urlArr,
                        current: e.currentTarget.dataset.url
                });
        },
        longPress(e) {
                let that = this;
                let cardId = e.currentTarget.id;//卡片id，即评论id
                let publishId = e.currentTarget.dataset.publishid;//发布人id
                let userInfo = wx.getStorageSync('userInfo');
                let index = e.currentTarget.dataset.index;//index
                if (userInfo && userInfo.id == publishId) {//已经登陆的情况下，可以删除当前长按的，自己发表的评论
                        Dialog.confirm({
                                title: '提示',
                                message: '要删除这条评论吗？',
                                asyncClose: true,
                        }).then(() => {
                                util.request(api.CommentDelete, {
                                        cardId: cardId,
                                        publishId: publishId
                                }, "POST")
                                        .then(function (res) {
                                                let _res = res;
                                                if (_res.errno == 0) {
                                                        let oldCommentList = that.data.commentList;
                                                        let newCommentList = oldCommentList.slice(0, index).concat(oldCommentList.slice(index + 1, oldCommentList.length));
                                                        that.setData({
                                                                commentList: newCommentList
                                                        })
                                                        Dialog.close();
                                                } else {
                                                        Dialog.close();
                                                }

                                        });
                        }).catch(() => {
                                Dialog.close();
                        });
                }

                console.log('cardId====== ', cardId)
                console.log('publishId====== ', publishId)
                console.log('userInfo.id====== ', userInfo.id)
                console.log('index====== ', index)


        }

})