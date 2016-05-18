/**
 * Created by jacob on 2016/5/12 0012.
 *
 * github: https://github.com/jacobcyl/sui_cator
 */
;(function ($) {
    "use strict";
    var Cater = function (params) {
        var c = this;
        var defaults = {
            url: '/api/category',
            title: '选择分类',
            inputReadOnly: true
        };
        params = params || {};
        for (var def in defaults) {
            if (typeof params[def] === 'undefined') {
                params[def] = defaults[def];
            }
        }

        //create popup class
        if (params.input.className.length > 0) {
            var inputClass = $.trim(params.input.className).replace(/\s+/g, ' ');
            c.popupClass = 'popup_' + inputClass.replace(/ /g, '_');
        } else {
            var t = new Date().getTime();
            c.popupClass = 'popup_' + t
        }
        console.log(c.popupClass);

        c.params = params;
        c.selected = false;//默认未选择分类，除非初始化选择

        var headerHtml = '<header class="bar bar-nav">' +
            '<a class="button button-link button-nav pull-left close-popup"><span class="icon icon-left"></span>返回</a>' +
            '<a class="button button-link button-nav pull-right sure">确定</a>' +
            '<h1 class="title">' + c.params.title + '</h1>' +
            '</header>';
        var searchHtml = '<div class="bar bar-header-secondary">' +
            '<div class="searchbar"><a class="searchbar-cancel">取消</a>' +
            '<div class="search-input"><label class="icon icon-search" for="search"></label><input type="search" id="search" placeholder="输入关键字..."/></div>' +
            '</div>' +
            '</div>';
        var resultHtml = '<section class="search-result off"><a class="iconfont icon-close pull-right search-close"></a><div class="cate-container row"></div></section>';
        var selectHtml = '<section class="cate-selector">' +
            '<div class="cate-parent"></div>' +
            '<div class="cate-sub"><ul class="cate-sub-hub" ></ul></div>' +
            '</section>';

        var contentHtml = '<div class="content">' + resultHtml + selectHtml + '</div>';
        var popUpTmp = '<div class="popup ' + c.popupClass + '">' + headerHtml + searchHtml + contentHtml + '</div>';

        c.openOnInput = function(e) {
            e.preventDefault();
            c.open();
        };

        //绑定相关事件
        c.attachEvent = function (obj) {
            obj.on('opened', function () {
                c.opened = true;//已经打开popup
                c.inline = true;//已经生成分类选择器
            });
            obj.on('closed', function () {
                c.opened = false;
            });
            obj.find('.sure').on('click', c.handleClick);
            obj.find('#search').on('input propertychange', c.onSearch);
            obj.find('.search-close').on('click', c.handleClick);
        };

        c.opened = false;
        //打开分类选择器
        c.open = function () {
            if (!c.inline) {
                c.popup = $.popup(popUpTmp, false);
                c.attachEvent($(c.popup));
                c.init();
            }
            if (!c.opened && c.popup) {
                $.popup('.' + c.popupClass);
            }
        };

        c.init = function () {
            //加载分类数据
            if (!c.dataLoaded) {
                c.loadData();
            }
            c.searchSection = $(c.popup).find('.search-result');
        };

        //更新选择项的值
        c.updateValue = function(arr){
            if(arr){
                c.selected = true;
                c.selectValue = arr;
            } else{
                c.selected = false;
                c.selectValue = null;
            }
        };

        //设置选中数据
        c.setValue = function(){
            if(c.selectValue){
                if (c.input && c.input.length > 0) {
                    $(c.input).val(c.params.formatValue ? c.params.formatValue(c, c.selectValue) : (c.selectValue[0][1].indexOf('其他') >= 0 || c.selectValue[0][1].indexOf('其它') >= 0?'其它分类':c.selectValue[0][1]+' '+c.selectValue[1][1]));
                    $(c.input).attr('code', c.selectValue[0][0]+':'+ c.selectValue[1][0]);
                    if(c.target){
                        c.target.val(c.selectValue[1][0] == 0 ? c.selectValue[0][0]: c.selectValue[1][0]);
                    }
                }
            }
            $.closeModal();
        };

        //搜索筛选分类
        c.onSearch = function () {
            var q = $(this).val();
            if (q == ''){
                if(!c.searchSection.hasClass('off'))
                    c.searchSection.addClass('off');
            }else{
                if(c.searchSection.hasClass('off'))
                    c.searchSection.removeClass('off');
                c.searchSection.find('.cate-item').hide().filter(function(){
                    return $(this).html().indexOf(q) >= 0;
                }).show();
            }
        };

        //点击事件处理器
        c.handleClick = function (e) {
            e.preventDefault();
            var clicked = $(this);
            var code;
            if(clicked.hasClass('parent_btn')){
                if(!clicked.hasClass('on')){
                    $(c.popup).find('.item-list').hide();
                    code = clicked.attr('code');
                    $(c.popup).find('.item-list[code="'+code+'"]').show();
                    $(c.popup).find('.parent_btn').removeClass("on");
                    clicked.addClass("on");
                }
            }else if(clicked.hasClass('cate-item')){
                code = clicked.attr('code');
                var name = clicked.html();
                var pcode = clicked.attr('pcode');
                var pname = clicked.attr('pname');
                if(!$(c.popup).find('a.parent_btn[code="'+pcode+'"]').hasClass('on')){
                    $(c.popup).find('a.parent_btn[code="'+pcode+'"]').trigger('click');
                }

                if(!clicked.hasClass('on')){
                    $(c.popup).find('.cate-item').removeClass('on');
                    $(c.popup).find('.cate-item').filter(function(){
                        return $(this).attr('code') == code
                    }).addClass('on');
                    var arr = [[pcode, pname], [code, name]];
                    c.updateValue(arr);
                    //$.toast('选择：'+clicked.html())
                }
            }else if(clicked.hasClass('sure')){
                c.setValue();
            }else if(clicked.hasClass('search-close')){
                c.searchSection.addClass('off');
            }
        };

        //填充分类数据
        c.fillData = function (data) {
            var cp = $(c.popup).find('.cate-parent');
            var cc = $(c.popup).find('.cate-sub-hub');
            var sc = $(c.popup).find('.cate-container');
            cp.html('');cc.html('');sc.html('');
            $.each(data, function (key, p) {
                var pname = p.name;
                var pid = p.id;
                var child = p.children;
                var pitem = $('<a class="parent_btn cate_code_flag" code="' + pid + '">' + pname + '</a>');
                pitem.on('click', c.handleClick);
                cp.append(pitem);

                var li = $('<li />', {class: 'item-list off', code: pid}), dl = $('<dl />'),dt = $('<dt />', {text: pname}), dd = $('<dd />'), row = $('<div />', {class: 'row'});
                if(child){
                    $.each(child, function (k, s) {
                        var cname = s.name;
                        var cid = s.id;

                        var citem = $('<a class="cate-item col-33 text-overflow" code="' + cid + '" pcode="' + pid + '" pname="'+ pname +'">' + cname + '</a>');
                        row.append(citem.on('click', c.handleClick));
                        sc.append(citem.clone().on('click', c.handleClick));
                    });
                }
                //dd.append(row);dl.append(dt);dl.append(dd);li.append(dl);cc.append(li);
                if(pname.indexOf('其它') < 0)
                    row.append($('<a class="cate-item col-33 text-overflow" code="0" pcode="' + pid + '" pname="'+ pname +'">其它</a>').on('click', c.handleClick));
                cc.append(li.append(dl.append(dt).append(dd.append(row))));
            });
            $(c.popup).find('.parent_btn').eq(0).addClass('on');
            $(c.popup).find('.item-list').eq(0).removeClass('off');
        };

        c.loadData = function () {
            $.showIndicator();
            $.ajax({
                type: 'GET',
                url: c.params.url,
                timeout: 6000,
                success: function (data) {
                    $.hideIndicator();
                    c.fillData(data);
                    c.dataLoaded = true;
                },
                error: function (xhr, errorType, error) {
                    $.hideIndicator();
                    $.toast('加载数据失败');
                    console.log(errorType);
                }
            })
        };

        //绑定点击事件
        if (c.params.input) {
            c.input = $(c.params.input);
            if (c.input.length > 0) {
                if (c.params.inputReadOnly) c.input.prop('readOnly', true);
                if (!c.inline) {
                    var inputName = c.params.input.name;
                    c.input.on('click', c.openOnInput);
                    c.input.attr('name', inputName+'_t');
                    c.target = $('<input />', {type:'hidden', name: inputName}).insertAfter(c.input);
                }
            }
        }
    };

    $.fn.cater = function (params) {
        var args = arguments;
        return this.each(function () {
            if (!this) return;
            var $this = $(this);
            var cater = $this.data("cater");
            if (!cater) {
                var c = $.extend({
                    input: this,
                    display_name: $this.val() ? $this.val().split(' ') : '',
                    value: $this.attr('code') ? $this.attr('code').split(':'):''
                }, params);
                cater = new Cater(c);
                $this.data("cater", cater);
            }
            if (typeof params === typeof "a") {
                cater[params].apply(cater, Array.prototype.slice.call(args, 1));
            }
        });
    }
})(Zepto);
