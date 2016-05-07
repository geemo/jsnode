! function() {
    //全局构造器
    function Global() {
        if (!(this instanceof Global)) {
            return new Global();
        }
        //提示框
        this.tipElem = document.getElementById('tip');
        //http请求对象
        this.httpRequest = new XMLHttpRequest();
    };

    Global.prototype = {
        constructor: Global,
        //显示提示框及信息
        showTip: function(tipMsg, elem) {
            elem = elem || this.tipElem;

            if (tipMsg && typeof elem == 'object') {
                elem.innerHTML = tipMsg;
                elem.style.opacity = 1;
                setTimeout(function() {
                    elem.style.opacity = 0;
                }, 2000);
            }
        },

        //ajax请求
        ajax: function(opt) {
            if (opt && (typeof opt == 'object')) {
                var method = opt.method || 'GET';
                var url = opt.url || '';
                var async = opt.async || true;
                var data = opt.data || null;
                var headers = opt.headers || null;
                var success = opt.success;

                if (this.httpRequest) {
                    var httpRequest = this.httpRequest;
                    //绑定状态改变事件
                    httpRequest.onreadystatechange = function() {
                        if (httpRequest.readyState == XMLHttpRequest.DONE) {
                            if (success) {
                                if ((new RegExp('.*?json.*?'))
                                    .test(httpRequest.getResponseHeader('Content-Type'))) {
                                    success(httpRequest.status, JSON.parse(httpRequest.responseText));
                                } else {
                                    success(httpRequest.status, httpRequest.responseText);
                                }
                            }
                        }
                    };
                    httpRequest.open(method, url, async);
                    //如果是提交
                    if (method == 'POST') {
                        if (headers) {
                            for (var key in headers) {
                                httpRequest.setRequestHeader(key, headers[key]);
                            }
                        } else {
                            httpRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                        }
                    }
                    //发送数据
                    httpRequest.send(data);
                }
            }

        },

        //页面定时跳转
        go: function(url, msg) {
            this.showTip(msg);
            setTimeout(function() {
                window.location.href = url;
            }, 2000);
        }

    };

    window.$ = new Global();



    //表单构造器
    function Form(obj) {
        if (!(this instanceof Form)) {
            return new Form(obj);
        }
        //表单对象
        this.form = obj;
        if (obj && typeof obj == 'object') {
            //表单内的所有带name属性的文本框
            this.nameInputs = obj.querySelectorAll('input[name], textarea[name]');
            //验证码按钮
            this.captchaBtn = obj.querySelector('a[class=captcha]');
            //头像预览
            this.preview = obj.querySelector('.preview');
            if (this.preview) {
                this.fileReader = new FileReader();
                //保存按钮
                this.saveBtn = obj.querySelector('button[type=submit]');
            }
        }
    }

    Form.prototype = {
        constructor: Form,
        //验证单个输入文本格式
        isRight: function(ipt) {
            if (ipt && (typeof ipt == 'object')) {
                if (new RegExp(ipt.dataset.match).test(ipt.value)) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        //验证所有输入文本格式
        checkAll: function() {
            var matchInputs = this.form.querySelectorAll('input[data-match], textarea[data-match]');
            for (var i = matchInputs.length; i--;) {
                if (!this.isRight(matchInputs[i])) {
                    return false;
                }
            }

            var passInputs = this.form.querySelectorAll('input[type=password]');
            //如果有密码框
            if (passInputs.length == 2) {
                //如果重复密码与密码不同
                if (passInputs[0].value != passInputs[1].value) {
                    passInputs[1].className = 'error';
                    return false;
                }
            }
            return true;
        },

        //验证码定时更换
        changeCaptcha: function() {
            var that = this;
            //定时55秒刷新图片
            var intervalId = setInterval(function() {
                that.captchaBtn.click();
            }, 55000);
            return intervalId;
        },

        // 显示头像预览
        showPreview: function(source) {
            var file = source.files[0];
            //图片小于100K则读取
            if (Math.ceil(file.size / 1024) <= 100) {
                this.fileReader.readAsDataURL(file);
                //显示保存按钮
                if (this.saveBtn) {
                    this.saveBtn.style.display = 'block';
                }

                this.preview.style.display = 'block';
            } else {
                $.showTip('图片尺寸不能大于100K!');
                source.value = "";
            }
        },

        //获取表单数据并序列化
        serialize: function() {
            var data = [];
            var input;
            for (var i = this.nameInputs.length; i--;) {
                input = this.nameInputs[i];
                data.push(input.name + '=' + input.value);
            }
            return data.join('&');
        },

        //绑定事件
        bindEvent: function() {
            var that = this;

            if (that.form) {
                //给含有样式的表单绑定提交事件
                if (that.form.className != "") {
                    that.form.onsubmit = function(e) {
                        //取消表单提交事件默认行为
                        e.preventDefault();
                        //验证所有input
                        if (that.checkAll()) {
                            $.ajax({
                                method: 'POST',
                                url: that.form.action,
                                data: that.serialize(),
                                success: function(statusCode, data) {
                                    if (data) {
                                        //如果存在url
                                        if (data.url) {
                                            $.go(data.url, data.info);
                                            that.form.querySelector('input[type=submit]')
                                                .setAttribute('disabled', 'disabled');
                                        } else {
                                            $.showTip(data.info);
                                        }
                                    }
                                }
                            });

                        } else {
                            $.showTip('请填写正确的信息!');
                        }
                    };
                }

                //给各个输入框绑定失去焦点事件
                var matchInputs = that.form.querySelectorAll('input[data-match], textarea[data-match]');
                for (var i = matchInputs.length; i--;) {
                    matchInputs[i].onblur = function(e) {
                        //失去焦点后进行正则匹配
                        if (!that.isRight(this)) {
                            this.className = 'error';
                        } else {
                            this.className = '';
                        }
                    }
                }
                //给文本输入框绑定
                var msgIpt = that.form.querySelector('.msg-ipt');
                var imgBtn = that.form.querySelector('input[name=img]');
                if (msgIpt && imgBtn) {
                    msgIpt.oninput = function(e) {
                        if (imgBtn.value && !/\[img=.+\]/.test(msgIpt.value)) {
                            //图片字符串
                            var imgUbbStr = '[img=' + imgBtn.files[0].name;
                            //图片字符串的光标位置
                            var cursorIdx = this.value.indexOf(imgUbbStr);
                            this.value = this.value.replace(imgUbbStr, '');
                            //设置光标为图片字符串的位置
                            if (this.createTextRange) { //IE浏览器
                                var range = this.createTextRange();
                                range.moveEnd("character", cursorIdx);
                                range.moveStart("character", cursorIdx);
                                range.select();
                            } else { //非IE浏览器
                                this.setSelectionRange(cursorIdx, cursorIdx);
                                this.focus();
                            }
                            //清空选中图片
                            imgBtn.value = '';
                            that.preview.style.display = 'none';
                        }
                    };
                }
                //给图片预览框绑定事件
                if (that.fileReader && imgBtn) {
                    that.fileReader.onload = function(e) {
                        that.preview.children[0].src = e.target.result;
                    };

                    imgBtn.onchange = function() {
                        //显示预览
                        that.showPreview(this);
                        //如果是评论框
                        if (that.form.target === 'cmtJump') {
                            msgIpt.value = msgIpt.value.replace(/\[img=.+\]/, '') + '[img=' + imgBtn.files[0].name + ']';
                        }
                    };

                    if (that.saveBtn) {
                        that.saveBtn.onclick = function(e) {
                            this.style.display = 'none';
                        };
                    }
                }

                //给验证码按钮绑定点击事件
                if (that.captchaBtn && (typeof that.captchaBtn == 'object')) {
                    var captchaBtn = that.captchaBtn;
                    //验证码定时刷新
                    var intervalId = that.changeCaptcha();
                    captchaBtn.onclick = function(e) {
                        var time = (new Date()).getTime();
                        //修改图片src
                        captchaBtn.querySelector('img').src = "/captcha?time=" + time;
                        //修改隐藏验证码id输入框value
                        captchaBtn.querySelector('input').value = time;
                        //删除之前的定时器
                        window.clearInterval(intervalId);
                        //重新创建一个定时器
                        intervalId = that.changeCaptcha();
                    };
                }
            }

        },

        load: function() {
            this.bindEvent();
        }

    };

    //加载表单功能
    (new Form(document.querySelector('form'))).load();

}();
