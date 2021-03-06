! function() {
    // 搜索框处理
    ! function() {
        var search = document.querySelector('.search');
        if (search) {
            var searchIpt = search.children[0];
            var searchBtn = search.children[1];

            searchBtn.onclick = function(e) {
                if (searchIpt.value) {
                    window.location.href = '/topics?key=' + searchIpt.value;
                } else {
                    $.showTip('输入内容不能为空!');
                }
            };
        }
    }();

    //选项卡切换
    ! function() {
        var tabs = document.querySelector('.tabs');
        if (tabs) {
            var titles = tabs.querySelectorAll('.tabs-title > li');
            var contents = tabs.querySelectorAll('.tabs-content > li');

            var preTitle = titles[0];
            var preContent = contents[0];

            for (var i = titles.length; i--;) {
                ! function(idx) {
                    titles[idx].onclick = function(e) {
                        preTitle.className = '';
                        this.className = 'active';
                        preTitle = this;

                        preContent.style.display = 'none';
                        contents[idx].style.display = 'block';
                        preContent = contents[idx];
                    };
                }(i)
            }
        }
    }();

    //下拉菜单
    ! function() {
        var menu = document.querySelector('.menu');
        if (menu) {
            var menuList = menu.querySelector('.menu-list');
            menu.onclick = function(e) {
                if (menuList.style.display == 'none') {
                    menuList.style.display = 'block';
                } else {
                    menuList.style.display = 'none';
                }
            };
        }
    }();

    // 页面跳转处理
    ! function() {
        var pageBtns = document.querySelectorAll('.page li');
        if (pageBtns.length) {
            //首页按钮
            var firstPage = pageBtns[0];
            //上一页按钮
            var prePage = pageBtns[1];
            //跳转输入框
            var jumpIpt = pageBtns[2].querySelector('input');
            //下一页按钮
            var nextPage = pageBtns[3];

            // 获取模糊查询key值
            var key = document.querySelector('span[data-key]');
            if (key) {
                key = key.dataset.key;
            }
            var keyQueryStr = key ? ('&key=' + key) : '';


            var url = jumpIpt.dataset.url;
            var symbol = (url.indexOf('?') == -1) ? '?' : '&';
            //跳转首页事件绑定
            firstPage.onclick = function(e) {
                if (jumpIpt.dataset.totalPage != '1') {
                    window.location.href = url + symbol + 'page=1' + keyQueryStr;
                }
            };

            var value = jumpIpt.value;
            //跳转上一页事件绑定
            prePage.onclick = function(e) {
                if (jumpIpt.dataset.totalPage != '1' && value != '1') {
                    window.location.href = url + symbol + 'page=' + (parseInt(value) - 1) + keyQueryStr;
                }
            };

            //输入框事件绑定
            jumpIpt.onfocus = function(e) {
                nextPage.innerHTML = '跳转';
            };
            jumpIpt.onblur = function(e) {
                if (this.value != value) {
                    nextPage.innerHTML = '跳转';
                } else {
                    nextPage.innerHTML = '下一页';
                }

            };
            jumpIpt.onkeydown = function(e) {

                if (this.value != value && parseInt(this.value) <= this.dataset.totalPage && e.keyCode == 13) {
                    window.location.href = url + symbol + 'page=' + this.value + keyQueryStr;
                }
            };

            //跳转下一页事件绑定
            nextPage.onclick = function(e) {
                if (this.innerHTML == '下一页') {
                    if (jumpIpt.value < jumpIpt.dataset.totalPage) {
                        window.location.href = url + symbol + 'page=' + (parseInt(value) + 1) + keyQueryStr;
                    }
                } else if (this.innerHTML == '跳转') {
                    if (jumpIpt.value != value && parseInt(jumpIpt.value) <= jumpIpt.dataset.totalPage) {
                        window.location.href = url + symbol + 'page=' + jumpIpt.value + keyQueryStr;
                    }
                }
            };
        }
    }();

    // 发送和回复评论
    ! function() {
        var cmtForm = document.querySelector('form[target=cmtJump]');
        if (cmtForm) {
            var sendBtn = cmtForm.querySelector('.send-btn');
            if (sendBtn) {
                //file input
                var imgBtn = cmtForm.querySelector('#imgBtn');
                var preview = cmtForm.querySelector('.preview');
                var msgIpt = cmtForm.querySelector('.msg-ipt');
                //表单的target
                var cmtJump = document.querySelector('iframe[name=cmtJump]');
                //评论卡片
                var cmtsCard = document.querySelector('#cmtsCard');
                //所有评论
                var cmts = cmtsCard.querySelectorAll('.comment');
                //引用文本
                var quote = '';
                //引用昵称
                var quoteName = '';
                //回复按钮
                var replyBtn = null;
                // iframe加载后
                cmtJump.onload = function(e) {
                    var data = JSON.parse(cmtJump.contentDocument.body.textContent);
                    if (data.status == 1) {
                        var quoteTxt = quote ? ('<blockquote><h5>引用' + quoteName + ':</h5>' + quote + '</blockquote><p>') : '<p>';
                        var commPartTop = '<div class="comment"><div class="comment-title"><a href="/users/' + data.username + '"><img src="/' + (data.headImgUrl ? ('images/' + data.headImgUrl) : 'node.jpg') + '"></a><span>#' + cmtsCard.children.length + '</span></div><h3><a href="/users/' + data.username + '">' + data.nickname + '</a><p></h3><div class="comment-content">' + quoteTxt;

                        var commPartBottom = '</p></div><h3 style="height: 20px"><span class="right"><i class="icon icon-shizhong" style="font-size:12px"></i>' + data.fullDate + '&nbsp;<a class="reply">回复</a></span></h3></div>';

                        cmtsCard.insertAdjacentHTML('beforeend',
                            commPartTop + msgIpt.value.replace(/\[img=.+\]/,
                                '<img src="/pictures' + data.imgUrl + '">') + commPartBottom);
                        //给新添加的评论绑定点击事件
                        var lastChild = cmtsCard.lastChild;
                        lastChild.querySelector('.reply').onclick = replyClick(lastChild);
                        //评论后屏幕滚到最底端
                        window.scrollTo(0, 9999999);
                        $.showTip('评论成功!');

                        clearReply(replyBtn);
                    }
                    //提交后清空图片和文字
                    imgBtn.value = '';
                    msgIpt.value = '';
                    //提交后隐藏预览
                    preview.style.display = 'none';
                };

                sendBtn.onclick = function() {
                    if (imgBtn.value != '' || msgIpt.value != '') {
                        cmtForm.submit();
                    } else {
                        $.showTip('评论内容不能为空!');
                    }

                };

                if (cmts.length) {
                    for (var i = cmts.length - 1; i >= 0; --i) {
                        ! function(cmt) {
                            cmt.querySelector('.reply').onclick = replyClick(cmt);
                        }(cmts[i]);
                    }
                }

                function replyClick(cmt) {
                    return function(e) {
                        e.preventDefault();
                        replyBtn = this;
                        if (this.innerHTML === '回复') {
                            this.innerHTML = '取消';
                            // 昵称和楼层组合名
                            quoteName = cmt.querySelector('h3>a').innerHTML + cmt.querySelector('.comment-title>span').innerHTML;
                            // 点击后修改输入框占位文本            
                            msgIpt.placeholder = '回复' + quoteName + ':';

                            // 获取引用文本
                            quote = cmt.querySelector('.comment-content>p').innerHTML;
                            cmtForm.querySelector('input[name=msg_quote]').value = JSON.stringify({
                                tit: quoteName,
                                cnt: quote.replace(/\<img src="(.+)"\>/, '[img=$1]')
                            });
                            //输入框获取焦点
                            msgIpt.focus();
                        } else {
                            clearReply(this);
                        }
                    };
                }

                function clearReply(rb) {
                    rb.innerHTML = '回复';
                    cmtForm.querySelector('input[name=msg_quote]').value = '';
                    msgIpt.placeholder = '评论内容不能为空!';
                    quote = '';
                    quoteName = '';
                }
            }
        }
    }();

    // 收藏点赞处理
    ! function() {
        var extraBtns = document.querySelector('.extra span');
        if (extraBtns) {

            //点赞按钮
            var zanBtn = extraBtns.children[1];
            //收藏按钮
            var favorBtn = extraBtns.children[0];

            clickToAjax(zanBtn, function() {
                if (new RegExp('.*?kong.*?').test(zanBtn.children[0].className)) {
                    return true;
                } else {
                    $.showTip('请不要重复点赞!');
                    return false;
                }
            }, function(data) {
                if (data.status == 1) {
                    zanBtn.children[0].className = 'icon icon-aixin';
                    zanBtn.children[1].innerHTML = parseInt(zanBtn.children[1].innerHTML) + 1;
                    $.showTip('点赞成功!');
                } else if (data.status == 0) {
                    $.showTip('发生了未知错误!');
                    zanBtn.setAttribute('disabled', 'disabled');
                }
            });


            clickToAjax(favorBtn, function() {
                if (new RegExp('.*?2.*?').test(favorBtn.children[0].className)) {
                    return true;
                } else {
                    $.showTip('请不要重复收藏!');
                    return false;
                }
            }, function(data) {
                if (data.status == 1) {
                    favorBtn.children[0].className = 'icon icon-pingjia1';
                    favorBtn.children[1].innerHTML = parseInt(favorBtn.children[1].innerHTML) + 1;
                    $.showTip('收藏成功!');
                } else if (data.status == 0) {
                    $.showTip('亲, 你已经收藏过啦!');
                    favorBtn.setAttribute('disabled', 'disabled');
                }
            });


        }

    }();

    //点击后进行ajax交互  第二个参数是dom操作  第三个参数是ajax发送数据  如果第三个参数没有 第二个代替第三个
    function clickToAjax(elem, handler, nextHandler) {
        elem.onclick = function(e) {
            e.preventDefault();

            if (typeof nextHandler != undefined) {
                if (handler()) {
                    $.ajax({
                        method: 'GET',
                        url: elem.href,
                        success: function(statusCode, data) {
                            if (data) {
                                nextHandler(data);
                            } else {
                                $.go('/signin', '亲,你还没有登录,正在跳转登录页面......');
                            }
                        }
                    });
                }
            } else {
                $.ajax({
                    method: 'GET',
                    url: elem.href,
                    success: function(statusCode, data) {
                        handler(data);
                    }
                });
            }
        };
    };

}();
