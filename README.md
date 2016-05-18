# sui_cator
专为 MSUI 前端框架定制的二级分类选择插件
> 由于项目中要用到异步加载分类，msui库中没有合适的分类选择插件，所以便编写了次简易分类选择插件，很多地方还需要修改，希望可以改成一个通用的分类选择插件

##效果演示
![效果演示](https://github.com/jacobcyl/sui_cator/blob/master/sui_cator.gif)

##依赖
> - [Zepto.js](https://github.com/madrobby/zepto)
> - [MSUI](https://github.com/sdc-alibaba/SUI-Mobile)

##Usage
- 引入相关文件
```HTML
<link rel="stylesheet" href="//g.alicdn.com/msui/sm/0.6.2/css/sm.min.css">
<link rel="stylesheet" href="sui_cator.css">
...
<input name="category" class="cator" code="8:18">
...
<script type='text/javascript' src='//g.alicdn.com/sj/lib/zepto/zepto.min.js' charset='utf-8'></script>
<script type='text/javascript' src='//g.alicdn.com/msui/sm/0.6.2/js/sm.min.js' charset='utf-8'></script>
<script type='text/javascript' src='sui_cator.js' charset='utf-8'></script>
```
- 属性说明
```
  options = {
    url: 'api/category', //加载分类数据URl，格式为json 参考[数据格式]
    title: '选择分类',
  }
```
- 数据格式
```javascript
  [
    {
      name: 'name',
      id: 'id',
      children:[
        {
          name: 'name',
          id: 'id',
        },
        ...
      ]
    },
    ...
  ]
```
- 初始化
```javascript
    $('.cator').cator();
    //或
    $('.cator').cator(options);
```
