var did_list_url = 'data.js';
var init_did_grid = function (elem, url) {
    // 数据属性
    var source = {
        datatype: "json",
        url: url,
    };

    var grid_cols = [
        { "text": "ID",        "datafield": "id",       "width": "60" },
        { "text": "DID",       "datafield": "did",      "width": "140", cellclassname: 'did_col' },
        { "text": "Type",      "datafield": "type",     "width": "40",  filtertype: 'checkedlist', columntype: 'combobox',
            cellclassname: function (row, columnfield, value) {
                if (row == undefined) return;

                if (value=='a'){
                    return 'type_a';
                }else if (value=='n'){
                    return 'type_n'
                }else
                    return '';
            }
        },
        { "text": "ol",        "datafield": "ol",       "width": "40",  filtertype: 'checkedlist', columntype: 'combobox',  cellsalign: 'center', align: 'center',
            cellclassname: function (row, columnfield, value) {
                if (row == undefined) return;
                // console.log('cellclass:', value, typeof value) //bool
                if (value)
                    return 'ol_1'
                else 
                    return 'ol_0'
            }
        },
        { "text": "nat",       "datafield": "nat",      "width": "40",  filtertype: 'checkedlist', columntype: 'combobox',  cellsalign: 'center', align: 'center' },
        { "text": "group",     "datafield": "_group",   "width": "130", filtertype: 'checkedlist', columntype: 'combobox' },
        { "text": "pub",       "datafield": "pub",      "width": "160" },
        { "text": "pri",       "datafield": "pri",      "width": "160", hidden: true },
        { "text": "stun",      "datafield": "stun",     "width": "160", hidden: true },
        // { "text": "last_on",   "datafield": "last_on",  "width": "160", cellsformat: 'yyyy-MM-dd HH:mm:ss' },
        { "text": "last_on",   "datafield": "last_on",  "width": "160", cellsformat: 'yyyy-MM-dd HH:mm:ss', filtertype: 'date'},
        { "text": "last_off",  "datafield": "last_off", "width": "160", hidden: true },
        /*
        { "text": "push",        "datafield": "_push",    "width": "40", cellsalign: 'right', align: 'right' , maxwidth: 60 },
        { "text": "pcc",         "datafield": "pcc",     "width": "40", cellsalign: 'right', align: 'right', cellsformat:'d' },
        { "text": "Size",        "datafield": "size",    "width": "95", cellsalign: 'right', align: 'right', cellsformat:'n', cellclassname: 'size_col'},
        */
    ];

    var data_fields = [
        { name: 'id',     type: 'number' },
        { name: 'did',    type: 'string' },
        { name: 'type',   type: 'string', map:'typ' },
        { name: 'ol',     type: 'bool' },
        { name: 'nat',    type: 'int' },
        { name: '_group', type: 'string', map:'group'},

        { name: 'pub',    type: 'string' },
        { name: 'pri',    type: 'string' },
        { name: 'stun',   type: 'string' },
        // { name: 'last_on',   type: 'string' },
        { name: 'last_on',   type: 'date' },
        { name: 'last_off',  type: 'string' },
    ];

    var gridAdapter = undefined;
    // 数据适配器, 纯拉数据, ajax 工作
    var dataAdapter = new $.jqx.dataAdapter(source, {
        autoBind: true,
        downloadComplete: function (data) {
            var rows = data;

            // convert .down more readable
            rows.forEach((v,k)=> { 
                var [a,b]=(v.down||'').split('/')
                if(a==b) v.down='ok'
                // console.log(k, a, b, v.down)
            })

            if(typeof gridAdapter != 'undefined'){ //已渲染过, 更新数据
                console.log('-- grid: refresh')
                // gridAdapter.data = rows
                gridAdapter._source.localdata = rows
                // gridAdapter.endUpdate() //触发数据重载 //有缺陷
                // gridAdapter.dataBind()  //触发数据重载 //有缺陷: group 状态被折叠
                $(elem).jqxGrid('updatebounddata', 'cells') //触发刷新: 还有缺陷， group 时 index 消失不可编辑
                return;
            }
            console.log('-- grid: init')

            // 表格适配器, 要装填给 grid
            gridAdapter = new $.jqx.dataAdapter({
                localdata: rows,
                datafields: data_fields,
                datatype: 'array',
                id: 'id',
                addrow: function (rowid, rowdata, position, commit) {
                    // synchronize with the server - send insert command
                    // call commit with parameter true if the synchronization with the server is successful 
                    //and with parameter false if the synchronization failed.
                    // you can pass additional argument to the commit callback which represents the new ID if it is generated from a DB.
                    // console.log('--addrow:', rowid, rowdata, position)
                    commit(true, rowid);
                },
                deleterow: function (rowid, commit) {
                    // synchronize with the server - send delete command
                    commit(true);
                },
                updaterow: function (rowid, newdata, commit) {
                    // synchronize with the server - send update command
                    // console.log('--updaterow:', rowid, newdata)
                    commit(true);
                }
            });

            // 加载数据
            $(elem).jqxGrid('hideloadelement');
            $(elem).jqxGrid('beginupdate', true);
            $(elem).jqxGrid({
                  source: gridAdapter,
                  columns: grid_cols
              });
            $(elem).jqxGrid('endupdate');
        }
    });


    // 表格 属性
    $(elem).jqxGrid({
        // width: getWidth('Grid'),
        width: '100%',
        // width: '50%',
        height: '100%',
        // height: '80%',
        // height: '600',

        // showfilterrow: true, //按列搜索
        filterable: true,

        editable: true, //支持编辑
        editmode: 'dblclick',    //双击 编辑单元格
        // editmode: 'selectedrow', //第二击 编辑整行

        groupable: true,  //支持分组
        // groups: ['group'], //默认分组方式

        // autoloadstate: true, //保存状态 到 localStrorage //主要用于 跨会话/重新加载 grid 时
        // autosavestate: true, //数据加载前的状态 可能出错

        // adaptive: true, //显示 ... 可以单行 查看详情 //按色主题 css 支持不好
        // adaptivewidth: 700,
        
        // enablebrowserselection: true, //允许选文字

        // selectionmode: 'singlerow', 
        // selectionmode: 'multiplerows', //多选
        // selectionmode: 'multiplerowsadvanced',  //高级多选: 默认单选, ctrl 多选, shift 连选(连选不能多区域)
        selectionmode: 'multiplerowsextended',  //比高级多选还高级, 可以拖拽框选 (像选桌面图标一样)

        sortable: true,
        // sortmode: 'one',
        sortmode: 'many',

        // columnsautoresize: true, //双击 列边界时, 自动调整列宽; 默认开, 和 autoresizecolumns 接口 调整的列宽结果还不太一样
        // columnsautoresize: false,
        columnsresize: true,
        columnsreorder: true,

        // scrollmode: 'default', //按像素滚动
        scrollmode: 'logical', //按行滚动
        // scrollmode: 'deferred',  //延迟滚动, 拖拽放开时才滚

        // status bar
        // showstatusbar: true,
        renderstatusbar: function(statusbar) {
            if($(elem).find('.status_s1').length) return;

            var filter_count = $(elem).jqxGrid('getrows').length
            // var source_count = $(elem).jqxGrid('getboundrows').length
            // var select_count = $(elem).jqxGrid('getselectedrowindexes').length
            //$(elem).jqxGrid('getdatainformation')

            let container = $("<div style='margin: 5px;'></div>");
            let res1 = `${filter_count} Items`;
            let res2 = "0 Selected";
            let res9 = "..";
            let span1 = $(`<span class='status_s1' style='float: left;  margin-top: 5px; margin-left: 18px; '>${res1}</span>`);
            let span2 = $(`<span class='status_s2' style='float: left;  margin-top: 5px; margin-left: 18px; '>${res2}</span>`);
            let span9 = $(`<span class='status_s3' style='float: right; margin-top: 5px; margin-left: 18px; margin-right: 45px;'> ${res9}</span>`);
            container.append(span1);
            container.append(span2);
            container.append(span9);
            statusbar.append(container);
        },

        // toolbar
        showtoolbar: true,
        rendertoolbar: function (toolbar) {
            if($(elem).find('.cols_choose').length) return;

            var me = this;
            var container = $("<div style='margin: 5px;'></div>");
            toolbar.append(container);
            // container.append('<input id="addrowbutton" type="button" value="Add Row" />');
            // container.append('<input style="margin-left: 5px;" id="updaterowbutton" type="button" value="Update Sel Row" />');
            container.append('<input type="button" class="cols_choose" value="cols"    style="margin-left: 5px; float: right;" />');
            container.append('<input type="button" class="cols_filter" value="filter"  style="margin-left: 5px; float: right;" />');
            container.append('<input type="button" class="btn_refresh" value="refresh" style="margin-left: 5px; float: right;"/>');

            // 列选择(自带), 列过滤
            $(elem).find(".cols_choose").jqxButton({ theme: theme })
            $(elem).find(".cols_choose").on('click', e => {
                $(elem).jqxGrid('openColumnChooser')
            })

            $(elem).find(".cols_filter").jqxToggleButton({ theme: theme })
            $(elem).find(".cols_filter").on('click', e => {
                var toggled = $(e.target).jqxToggleButton('toggled');
                console.log('filter row:', toggled)
                $(elem).jqxGrid({ showfilterrow: toggled});
            })

            // 刷新数据
            $(elem).find(".btn_refresh").jqxButton({ theme: theme })
            $(elem).find(".btn_refresh").click(function () {
                // save the current state of jqxGrid.
                // var state = $(elem).jqxGrid('savestate') //有缺陷: 1. 不支持 多列排序; 2. 不支持 group 折叠状态
                // console.log('save stat:', state)

                $(elem).jqxGrid('showloadelement')
                dataAdapter.dataBind() //触发 ajax 刷新

                // load the Grid's state.  // 应该异步调用
                // $(elem).jqxGrid('loadstate', state)
                // console.log('load stat:', state)
            })
        }

    }); // ------ end jqxGrid
    $(elem).jqxGrid('localizestrings', {groupsheaderstring:'drag & drop here to group by col'});


    // 计算 statusbar 数值 //它不会自行计算
    function calc_status_count(event) {
        console.log('-- calc_count:', event.type)
        // var filterinfo = $(elem).jqxGrid('getfilterinformation');
        // console.log('on filter:', filterinfo)
        
        var select_count = $(elem).jqxGrid('getselectedrowindexes').length
        $(elem).find('.status_s2').text(` select: ${select_count}`)

        // if(['rowselect', 'rowunselect'].includes(event.type)){}
        if(['bindingcomplete', 'filter'].includes(event.type)){
            var filter_count = $(elem).jqxGrid('getrows').length
            var source_count = $(elem).jqxGrid('getboundrows').length

            $(elem).find('.status_s1').html(`total / filter: &nbsp; ${source_count} / ${filter_count}`)
            // console.log(' filter_count:', filter_count, 'source_count:', source_count, 'select:', select_count)
        }
    }
    $(elem).on("filter",          calc_status_count);
    $(elem).on("bindingcomplete", calc_status_count);
    $(elem).on('rowselect',       calc_status_count);
    $(elem).on('rowunselect',     calc_status_count);


    //显示 加载中..
    $(elem).jqxGrid('showloadelement');

}
