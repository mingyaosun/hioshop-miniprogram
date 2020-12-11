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
                id: 0,//商品id
                loading: 0,
                commentList: [],
                nocomment: 2,//0 没有评论，1 没有更多评论，2 有评论
                nocommentimg: [],
                sysHeight: 0,
                currentPage: 1,
                totalPages: 1,
                size: 6,
                totalCount: 0,
                triggered: false,
                hasMore: true,
                isCard: true,
                textNoMore: '没有更多评论啦',
                autoFocus: false,
                activeName1: {
                        active0: {
                                name: '',//折叠面板对应的名字
                                status: false,//折叠面板展开状态，false未展开，true展开
                        }
                },
                commentObj: {
                        comGoodsid: 0,//商品id
                        comCurrUserid: 0,//当前登陆人id
                        comContext: '',//评论内容
                        comComid: 0,//评论id
                        comPublishid: 0,//评论发布者id
                        comRecipientid: 0,//被评论人id
                        comParentid: 0,//这条评论的父id
                        niname: '',//昵称
                        avatar: '',//头像
                },
                childrenComments: {},//每条评论的子评论
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
                let userInfo = wx.getStorageSync('userInfo');
                let sysHeight = info.windowHeight;
                this.setData({
                        id: id, // 这个是商品id
                        sysHeight: sysHeight,
                        'commentObj.comGoodsid': id,
                        'commentObj.comCurrUserid': userInfo.id,
                        'commentObj.niname': userInfo.nickname,
                        'commentObj.avatar': userInfo.avatar
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
                                let totalCount = res.data.commentList.count + res.data.commentList.otherCount;//总条数
                                let totalPages = res.data.commentList.totalPages;//总页数
                                let _commentList = res.data.commentList.data;//返回数据条数
                                console.log(_commentList);
                                let nocommentimg = that.data.nocommentimg;
                                if (_commentList && _commentList.length > 0) {
                                        that.setData({
                                                nocomment: 2,
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
                                        that.setData({
                                                nocomment: 1
                                        });
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
                        size: 6
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
                                                        let nocomment = that.data.nocomment;
                                                        let oldCommentList = that.data.commentList;
                                                        let newCommentList = oldCommentList.slice(0, index).concat(oldCommentList.slice(index + 1, oldCommentList.length));
                                                        if (newCommentList.length == 0) {
                                                                nocomment = 0;
                                                        }
                                                        that.setData({
                                                                nocomment: nocomment,
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
        },
        onOpen(event) {
                let that = this;
                util.request(api.ChildrenComments, {
                        goodsId: that.data.id,
                        comId: event.currentTarget.dataset.comComid
                }).then(function (res) {
                        if (res.errno === 0) {
                                console.log('子评论', res.data.childrenCommentsList)
                                let childrenComments = that.data.childrenComments;
                                let _childrenComments = res.data.childrenCommentsList;
                                // util.wl_changeTime
                                _childrenComments.forEach(function (item, index) {
                                        item.time = util.wl_changeTime(item.time);
                                })
                                const keyChild = event.currentTarget.dataset.keychild;
                                childrenComments[keyChild] = _childrenComments;
                                that.setData({
                                        childrenComments: childrenComments
                                })
                                console.log(that.data.childrenComments)
                                //折叠面板
                                let activeName1 = that.data.activeName1;
                                const { key1 } = event.currentTarget.dataset;
                                activeName1[key1] = {
                                        name: event.detail,
                                        status: true
                                }
                                that.setData({
                                        activeName1: activeName1
                                });
                                console.log('activeName1--open', that.data.activeName1)
                                console.log('open', event)
                        }
                });

        },

        onClose(event) {
                let activeName1 = this.data.activeName1;
                const { key1 } = event.currentTarget.dataset;
                activeName1[key1] = {
                        name: "",
                        status: false
                }
                this.setData({
                        activeName1: activeName1
                });
                console.log('activeName1--close', this.data.activeName1)
                console.log('close', event)
        },
        addComment(e) {
                this.setData({
                        'commentObj.comContext': e.detail.value
                })
        },
        showRound(e) {
                console.log('showRound ', e)
                this.setData({
                        'commentObj.comComid': e.currentTarget.dataset.comComid,//评论id
                        'commentObj.comPublishid': e.currentTarget.dataset.comPublishid,//评论发布者id
                        'commentObj.comRecipientid': e.currentTarget.dataset.comRecipientid,//被评论人id
                        'commentObj.comParentid': e.currentTarget.dataset.comParentid,//这条评论的父id
                });
                this.toggle('round', true);
        },

        hideRound() {
                this.toggle('round', false);
                this.setData({
                        'commentObj.comComid': 0,//评论id
                        'commentObj.comPublishid': 0,//评论发布者id
                        'commentObj.comRecipientid': 0,//被评论人id
                        'commentObj.comParentid': 0,//这条评论的父id
                });
        },
        toggle(type, show) {
                let that = this;
                that.setData({
                        autoFocus: true,
                        [`show.${type}`]: show
                });
        },
        sendComment(e) {
                console.log('commentObj ', this.data.commentObj)
                let that = this;

                wx.showLoading({
                        title: '正在评论',
                });
                util.request(api.CommentAdd, {
                        niname: that.data.commentObj.niname,
                        avatar: that.data.commentObj.avatar,
                        cardId: that.data.commentObj.comGoodsid,
                        publishId: that.data.commentObj.comCurrUserid,//发布人id就是当期用户id
                        recipientId: that.data.commentObj.comPublishid,//回复评论时候,被评论人id，实际就是这条评论之前发布人id
                        comId: that.data.commentObj.comComid,
                        parentId: that.data.commentObj.comParentid,
                        comContext: that.data.commentObj.comContext
                }, "POST").then(function (res) {
                        let _res = res;
                        if (_res.errno == 0) {
                                that.hideRound();
                                wx.showToast({
                                        title: '发布成功',
                                        icon: 'success',
                                        duration: 2000,
                                        success: function () {
                                                // wx.navigateBack();
                                                that.setData({
                                                        'commentObj.comContext': '',
                                                        'commentObj.comComid': 0,//评论id
                                                        'commentObj.comPublishid': 0,//评论发布者id
                                                        'commentObj.comRecipientid': 0,//被评论人id
                                                        'commentObj.comParentid': 0,//这条评论的父id
                                                })
                                        }
                                })
                        } else {
                        }
                }).catch(() => { });
        },

})