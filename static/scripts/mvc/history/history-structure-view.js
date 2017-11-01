"use strict";define(["mvc/history/job-dag","mvc/job/job-model","mvc/job/job-li","mvc/dataset/dataset-li","mvc/base-mvc","utils/localization","libs/d3"],function(t,e,n,i,o,a){window.JobDAG=t;var s=Backbone.View.extend(o.LoggableMixin).extend({_logNamespace:"history",className:"history-structure-component",_INITIAL_ZOOM_LEVEL:1,_MIN_ZOOM_LEVEL:.25,_LINK_ID_SEP:"-to-",_VERTEX_NAME_DATA_KEY:"vertex-name",JobItemClass:n.JobListItemView,ContentItemClass:i.DatasetListItemView,initialize:function(t){this.log(this+"(HistoryStructureComponent).initialize:",t),this.component=t.component,this._liMap={},this._createVertexItems(),this.zoomLevel=t.zoomLevel||this._INITIAL_ZOOM_LEVEL,this.layout=this._createLayout(t.layoutOptions)},_createVertexItems:function(){var t=this;t.component.eachVertex(function(e){var n,i=e.data.job?"job":"copy";"job"===i?n=t._createJobListItem(e):"copy"===i&&(n=t._createContentListItem(e)),t._liMap[e.name]=n}),t.debug("_liMap:",t._liMap)},_createJobListItem:function(t){this.debug("_createJobListItem:",t);var n=this,i=t.data,o=new e.Job(i.job),a=_.map(o.get("outputs"),function(t){return n.model.contents.get(t.type_id)});o.outputCollection.reset(a),o.outputCollection.historyId=n.model.id;var s=new n.JobItemClass({model:o,tool:i.tool,jobData:i});return n.listenTo(s,"expanding expanded collapsing collapsed",n.renderGraph),n.listenTo(s.foldout,"view:expanding view:expanded view:collapsing view:collapsed",n.renderGraph),s},_createContentListItem:function(t){this.debug("_createContentListItem:",t);var e=this,n=t.data;n=e.model.contents.get(n.type_id);var i=new e.ContentItemClass({model:n});return e.listenTo(i,"expanding expanded collapsing collapsed",e.renderGraph),i},layoutDefaults:{linkSpacing:16,linkWidth:0,linkHeight:0,jobWidth:300,jobHeight:300,jobSpacing:12,linkAdjX:4,linkAdjY:0},_createLayout:function(t){t=_.defaults(_.clone(t||{}),this.layoutDefaults);var e=this,n=_.values(e.component.vertices),i=_.extend(t,{nodeMap:{},links:[],svg:{width:0,height:0}});return n.forEach(function(t,e){var n={name:t.name,x:0,y:0};i.nodeMap[t.name]=n}),e.component.edges(function(t){var e={source:t.source,target:t.target};i.links.push(e)}),i},render:function(t){this.debug(this+".render:",t);var e=this;e.$el.html(["<header></header>",'<nav class="controls"></nav>','<figure class="graph"></figure>',"<footer></footer>"].join(""));var n=e.$graph();return e.component.eachVertex(function(t){e._liMap[t.name].render(0).$el.appendTo(n).data(e._VERTEX_NAME_DATA_KEY,t.name)}),e.renderGraph(),this},$graph:function(){return this.$(".graph")},renderGraph:function(t){function e(){n._updateLayout(),n.$graph().css("transform",["scale(",n.zoomLevel,",",n.zoomLevel,")"].join("")).width(n.layout.svg.width).height(n.layout.svg.height),n.renderSVG(),n.component.eachVertex(function(t){var e=n._liMap[t.name],i=n.layout.nodeMap[t.name];e.$el.css({top:i.y,left:i.x})})}this.debug(this+".renderGraph:",t);var n=this;return this.$el.is(":visible")?e():_.delay(e,0),this},_updateLayout:function(){this.debug(this+"._updateLayout:");var t=this.layout;t.linkHeight=t.linkSpacing*_.size(t.nodeMap),t.svg.height=t.linkHeight+t.jobHeight,t.svg.width=0;var e=0,n=t.linkHeight;return _.each(t.nodeMap,function(i,o){i.x=e,i.y=n,e+=t.jobWidth+t.jobSpacing}),t.svg.width=t.linkWidth=Math.max(t.svg.width,e),t.links.forEach(function(e){var n=t.nodeMap[e.source],i=t.nodeMap[e.target];e.x1=n.x+t.linkAdjX,e.y1=n.y+t.linkAdjY,e.x2=i.x+t.linkAdjX,e.y2=i.y+t.linkAdjY}),this.debug(JSON.stringify(t,null,"  ")),this.layout},renderSVG:function(){this.debug(this+".renderSVG:");var t=this,e=t.layout,n=d3.select(this.$graph().get(0)).select("svg");n.empty()&&(n=d3.select(this.$graph().get(0)).append("svg")),n.attr("width",e.svg.width).attr("height",e.svg.height);var i=n.selectAll(".connection").data(e.links);return i.enter().append("path").attr("class","connection").attr("id",function(e){return[e.source,e.target].join(t._LINK_ID_SEP)}).on("mouseover",function(e){d3.select(this).classed("highlighted",!0),t._liMap[e.source].$el.addClass("highlighted"),t._liMap[e.target].$el.addClass("highlighted")}).on("mouseout",function(e){d3.select(this).classed("highlighted",!1),t._liMap[e.source].$el.removeClass("highlighted"),t._liMap[e.target].$el.removeClass("highlighted")}),i.attr("d",function(e){return t._connectionPath(e)}),n.node()},_connectionPath:function(t){var e=(t.x2-t.x1)/this.layout.svg.width*this.layout.linkHeight;return["M",t.x1,",",t.y1," ","C",t.x1+0,",",t.y1-e," ",t.x2-0,",",t.y2-e," ",t.x2,",",t.y2].join("")},events:{"mouseover .graph > .list-item":function(t){this.highlightConnected(t.currentTarget,!0)},"mouseout  .graph > .list-item":function(t){this.highlightConnected(t.currentTarget,!1)}},highlightConnected:function(t,e){this.debug("highlightConnected",t,e),e=void 0===e||e;var n=this,i=n.component,o=e?jQuery.prototype.addClass:jQuery.prototype.removeClass,a=e?"connection highlighted":"connection",s=o.call($(t),"highlighted").data(n._VERTEX_NAME_DATA_KEY);i.edges({target:s}).forEach(function(t){var e=t.source,i=n._liMap[e];o.call(i.$el,"highlighted"),n.$("#"+e+n._LINK_ID_SEP+s).attr("class",a)}),i.vertices[s].eachEdge(function(t){var e=t.target,i=n._liMap[e];o.call(i.$el,"highlighted"),n.$("#"+s+n._LINK_ID_SEP+e).attr("class",a)})},zoom:function(t){return this.zoomLevel=Math.min(1,Math.max(this._MIN_ZOOM_LEVEL,t)),this.renderGraph()},toString:function(){return"HistoryStructureComponent("+this.model.id+")"}}),r=s.extend({className:s.prototype.className+" vertical",layoutDefaults:_.extend(_.clone(s.prototype.layoutDefaults),{linkAdjX:0,linkAdjY:4}),_updateLayout:function(){this.debug(this+"._updateLayout:");var t=this,e=t.layout;e.linkWidth=e.linkSpacing*_.size(e.nodeMap),e.svg.width=e.linkWidth+e.jobWidth,e.svg.height=0;var n=e.linkWidth,i=0;return _.each(e.nodeMap,function(o,a){o.x=n,o.y=i;var s=t._liMap[a];i+=s.$el.height()+e.jobSpacing}),e.linkHeight=e.svg.height=Math.max(e.svg.height,i),e.links.forEach(function(t){var n=e.nodeMap[t.source],i=e.nodeMap[t.target];t.x1=n.x+e.linkAdjX,t.y1=n.y+e.linkAdjY,t.x2=i.x+e.linkAdjX,t.y2=i.y+e.linkAdjY}),this.debug(JSON.stringify(e,null,"  ")),e},_connectionPath:function(t){var e=(t.y2-t.y1)/this.layout.svg.height*this.layout.linkWidth;return["M",t.x1,",",t.y1," ","C",t.x1-e,",",t.y1+0," ",t.x2-e,",",t.y2-0," ",t.x2,",",t.y2].join("")},toString:function(){return"VerticalHistoryStructureComponent("+this.model.id+")"}});return Backbone.View.extend(o.LoggableMixin).extend({_logNamespace:"history",className:"history-structure",_layoutToComponentClass:{horizontal:s,vertical:r},_DEFAULT_LAYOUT:"vertical",initialize:function(t){this.layout=_.contains(t.layout,_.keys(this._layoutToComponentClass))?t.layout:this._DEFAULT_LAYOUT,this.log(this+"(HistoryStructureView).initialize:",t,this.model),this._processTools(t.tools),this._processJobs(t.jobs),this._createDAG()},_processTools:function(t){return this.tools=t||{},this.tools},_processJobs:function(t){return this.jobs=t||[],this.jobs},_createDAG:function(){this.dag=new t({historyContents:this.model.contents.toJSON(),tools:this.tools,jobs:this.jobs,excludeSetMetadata:!0,excludeErroredJobs:!0}),this.debug(this+".dag:",this.dag),this._createComponents()},_createComponents:function(){this.log(this+"._createComponents");var t=this;return t.componentViews=t.dag.weakComponentGraphArray().map(function(e){return t._createComponent(e)}),t.componentViews},_createComponent:function(t){return this.log(this+"._createComponent:",t),new(0,this._layoutToComponentClass[this.layout])({model:this.model,component:t})},render:function(t){this.log(this+".render:",t);var e=this;return e.$el.addClass("clear").html(['<div class="controls"></div>','<div class="components"></div>'].join("")),e.componentViews.forEach(function(t){t.render().$el.appendTo(e.$components())}),e},$components:function(){return this.$(".components")},changeLayout:function(t){if(!(t in this._layoutToComponentClass))throw new Error(this+": unknown layout: "+t);return this.layout=t,this._createComponents(),this.render()},toString:function(){return"HistoryStructureView("+this.model.id+")"}})});
//# sourceMappingURL=../../../maps/mvc/history/history-structure-view.js.map
