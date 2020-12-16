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
        commentList: [],//父评论列表
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
        commentObj: {//评论对象
            comGoodsid: 0,//商品id
            comCurrUserid: '',//当前登陆人id
            comContext: '',//评论内容
            comComid: 0,//评论id
            comPublishid: 0,//评论发布者id
            comRecipientid: 0,//被评论人id
            comParentid: 0,//这条评论的父id
            niname: '',//昵称
            avatar: '',//头像
            comRecipientname: '',//被评论者昵称
        },
        childrenComments: {},//每条评论的子评论
        comIndex: '',//最外层的父评论索引
        comChildindex: '',//子评论索引
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
            sysHeight: sysHeight,
            'commentObj.comGoodsid': id,

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
                let nocommentimg = that.data.nocommentimg;
                if (_commentList && _commentList.length > 0) {
                    that.setData({
                        nocomment: 2,
                        commentCount: util.transformUnit(totalCount),
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
                } else if (currentPage == 1 && totalPages == 0) {
                    that.setData({
                        hasMore: false,
                        commentList: [],
                        nocomment: 0
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
                    totalPages: totalPages,
                    loadingMore:false
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
            currentPage: this.data.currentPage + 1,
            loadingMore:true
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
        let comIndex = e.currentTarget.dataset.comIndex;//最外层的父评论索引
        let comChildindex = e.currentTarget.dataset.comChildindex;//子评论索引
        let longtype = e.currentTarget.dataset.longtype;//长按删除的评论类型，parent最外层父评论，child 为子评论
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
                            let newCommentList = oldCommentList;
                            if (longtype == 'parent') {
                                newCommentList = oldCommentList.slice(0, index).concat(oldCommentList.slice(index + 1, oldCommentList.length));
                            } else if (longtype == 'child') {
                                if (newCommentList[index ? index : comIndex].childrenCount != undefined) {
                                    //动态修改评论条数
                                    newCommentList[index ? index : comIndex].childrenCount = newCommentList[index ? index : comIndex].childrenCount - 1;
                                }
                                //删除时剔除数组里的元素，实现页面局部刷新
                                if (comChildindex != undefined) {
                                    let oldChildrenComments = that.data.childrenComments;
                                    oldChildrenComments['child' + comIndex] = oldChildrenComments['child' + comIndex].slice(0, comChildindex).concat(oldChildrenComments['child' + comIndex].slice(comChildindex + 1, oldChildrenComments['child' + comIndex].length));
                                    that.setData({
                                        childrenComments: oldChildrenComments
                                    })
                                }
                            }

                            if (newCommentList.length == 0) {
                                nocomment = 0;
                            } else {


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
    },
    onOpen(event) {
        let that = this;
        util.request(api.ChildrenComments, {
            goodsId: that.data.id,
            comId: event.currentTarget.dataset.comComid
        }).then(function (res) {
            if (res.errno === 0) {
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
    },
    /**
     * 添加评论内容
     * @param {} e 
     */
    addComment(e) {
        this.setData({
            'commentObj.comContext': e.detail.value
        })
    },
    /**
     * 显示评论弹窗
     * @param {*} e 
     */
    showRound(e) {
        // 判断是否登录，如果没有登录，则登录
        util.loginNow();
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo == '') {
            return false;
        }
        if (!this.data.commentObj.comCurrUserid) {
            this.setData({
                'commentObj.comCurrUserid': userInfo.id,
                'commentObj.niname': userInfo.nickname,
                'commentObj.avatar': userInfo.avatar
            });
        }

        let comIndex = e.currentTarget.dataset.comIndex;//最外层的父评论索引
        let comChildindex = e.currentTarget.dataset.comChildindex;//子评论索引
        this.setData({
            comIndex: comIndex == undefined ? '' : comIndex,
            comChildindex: comChildindex == undefined ? '' : comChildindex,
            'commentObj.comComid': e.currentTarget.dataset.comComid,//评论id
            'commentObj.comPublishid': e.currentTarget.dataset.comPublishid,//评论发布者id
            'commentObj.comRecipientid': e.currentTarget.dataset.comRecipientid,//被评论人id
            'commentObj.comRecipientname': e.currentTarget.dataset.comRecipientname,//被评论人昵称
            'commentObj.comParentid': e.currentTarget.dataset.comParentid,//这条评论的父id
        });
        this.toggle('round', true);
    },

    hideRound() {
        this.toggle('round', false);
        this.setData({
            comIndex: '',
            comChildindex: '',
            'commentObj.comComid': 0,//评论id
            'commentObj.comPublishid': 0,//评论发布者id
            'commentObj.comRecipientid': 0,//被评论人id
            'commentObj.comRecipientname': '',//被评论人昵称
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
    /**
     * 发送评论
     * @param {}} e 
     */
    sendComment(e) {
        let that = this;
        let comIndex = that.data.comIndex;
        let comChildindex = that.data.comChildindex;
        wx.showLoading({
            title: '正在评论',
        });
        let comParam = {
            niname: that.data.commentObj.niname,
            avatar: that.data.commentObj.avatar,
            cardId: that.data.commentObj.comGoodsid,
            publishId: that.data.commentObj.comCurrUserid,//发布人id就是当期用户id
            recipientId: that.data.commentObj.comPublishid,//回复评论时候,被评论人id，实际就是这条评论之前发布人id
            recipientName: that.data.commentObj.comRecipientname,//被评论人昵称为这条评论之前发布人的昵称
            comId: that.data.commentObj.comComid,
            parentId: that.data.commentObj.comParentid,
            comContext: that.data.commentObj.comContext
        }
        util.request(api.CommentAdd, comParam, "POST").then(function (res) {
            let _res = res;
            if (_res.errno == 0) {
                that.hideRound();
                wx.showToast({
                    title: '发布成功',
                    icon: 'success',
                    duration: 1000,
                    success: function () {
                        let addedComment = res.data.addedComment;
                        //处理时间
                        addedComment.forEach(function (item, index) {
                            item.time = util.wl_changeTime(item.time)
                        })
                        let oldChildrenComments = that.data.childrenComments;
                        if (comChildindex != undefined && comChildindex != '') {
                            //如果是子评论的评论,拼接新的评论到原来列表中，实现伪局部刷新
                            let newComments = oldChildrenComments['child' + comIndex].concat(addedComment);
                            oldChildrenComments['child' + comIndex] = newComments;

                        } else {
                            //如果是子评论的评论,拼接新的评论到原来列表中，实现伪局部刷新
                            let newComments = oldChildrenComments['child' + comIndex];
                            if (newComments != undefined) {
                                oldChildrenComments['child' + comIndex] = newComments.concat(addedComment);
                            }
                        }
                        let commentList = that.data.commentList;//父评论列表
                        if (commentList[comIndex].childrenCount != undefined) {
                            //动态修改评论条数
                            commentList[comIndex].childrenCount = commentList[comIndex].childrenCount + 1;
                        }
                        that.setData({
                            'commentObj.comContext': '',
                            commentList: commentList,
                            childrenComments: oldChildrenComments
                        })
                    }
                })
            } else {
            }
        }).catch(() => { });
    },
    /**
     * 点赞功能
     * @param {} e 
     */
    thumbsUp(e) {
        util.loginNow();
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo == '') {
            return false;
        }
        let that = this;
        let comId = e.currentTarget.dataset.comid;//点赞的评论id
        let thumbsId = e.currentTarget.dataset.thumbsid;//点赞表的id
        let comType = e.currentTarget.dataset.type;//点赞类型，parent为父评论点赞，child为子评论点赞
        let currentUserId = userInfo.id;//当前登录人id
        let goodsId = that.data.id;//商品id
        let type = 2;//评论点赞
        let comParentIndex = e.currentTarget.dataset.thumbsIndex;//父评论点赞索引
        let comChildIndex = e.currentTarget.dataset.thumbsChildindex;//子评论点赞索引
        let comIsup = e.currentTarget.dataset.isup;//点赞状态
        var animation = e.currentTarget.dataset.class;

        let commentList = that.data.commentList;
        let childrenComments = that.data.childrenComments;

        if (comType == 'parent') {
            commentList[comParentIndex].thumbsUpInfo.animation = animation;//设置点赞动画
            commentList[comParentIndex].thumbsUpInfo.isUp = !comIsup;//点赞之后更换图标
            that.setData({
                commentList: commentList
            });
        } else if (comType == 'child') {
            childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.animation = animation;//设置点赞动画
            childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.isUp = !comIsup;//点赞之后更换图标
            that.setData({
                childrenComments: childrenComments
            });
        }

        util.request(api.ThumbsUpAdd, {
            currentUserId: currentUserId,
            comId: comId,
            goodsId: goodsId,
            type: type,
            isUp: !comIsup,
            thumbsId: thumbsId
        }, 'POST').then(function (res) {
            let _res = res;
            if (_res.errno == 0) {
                let _thumbsId = res.data.thumbsId;//点赞成功之后返回的id
                if (comType == 'parent') {
                    commentList[comParentIndex].thumbsUpInfo.id = _thumbsId;
                    if (commentList[comParentIndex].thumbsUpInfo.isUp) {
                        if (commentList[comParentIndex].thumbsUpInfo.count == undefined) {
                            commentList[comParentIndex].thumbsUpInfo.count = 1;
                        } else {
                            commentList[comParentIndex].thumbsUpInfo.count++;
                        }

                    } else {
                        commentList[comParentIndex].thumbsUpInfo.count--;
                    }
                    //先修改点赞数量，然后延迟1秒执行动画
                    that.setData({
                        commentList: commentList
                    })
                    commentList[comParentIndex].thumbsUpInfo.animation = '';//重置点赞动画
                    setTimeout(function(){
                        that.setData({
                            commentList: commentList
                        })
                    },1000)
                    
                } else if (comType == 'child') {
                    childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.id = _thumbsId;
                    if (childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.isUp) {
                        if (childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.count == undefined) {
                            childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.count = 1;
                        } else {
                            childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.count++;
                        }

                    } else {
                        childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.count--;
                    }
                    //先修改点赞数量，然后延迟1秒执行动画
                    that.setData({
                        childrenComments: childrenComments
                    })
                    childrenComments['child' + comParentIndex][comChildIndex].thumbsUpInfo.animation = '';//重置点赞动画
                    setTimeout(function(){
                        that.setData({
                            childrenComments: childrenComments
                        })
                    },1000)
                }
            } else {

            }
        });

    },

})