"use strict";define(["viz/visualization","libs/bbi/bigwig"],function(a,e){return{BBIDataManager:a.GenomeDataManager.extend({load_data:function(a,t,n,i){var r=$.Deferred();this.set_data(a,r);var s=Galaxy.root+"datasets/"+this.get("dataset").id+"/display",d=this;new $.Deferred;return $.when(e.makeBwg(s)).then(function(e,t){$.when(e.readWigData(a.get("chrom"),a.get("start"),a.get("end"))).then(function(e){var t=[],n={max:Number.MIN_VALUE};e.forEach(function(a){n.max!==a.min-1&&(t.push([n.max+1,0]),t.push([a.min-2,0])),t.push([a.min-1,a.score]),t.push([a.max,a.score]),n=a});var i={data:t,region:a,dataset_type:"bigwig"};d.set_data(a,i),r.resolve(i)})}),r}})}});
//# sourceMappingURL=../../maps/viz/bbi-data-manager.js.map
