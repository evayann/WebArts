(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-750114b4"],{"81d5":function(t,e,n){"use strict";var r=n("7b0b"),c=n("23cb"),a=n("50c4");t.exports=function(t){var e=r(this),n=a(e.length),i=arguments.length,o=c(i>1?arguments[1]:void 0,n),u=i>2?arguments[2]:void 0,f=void 0===u?n:c(u,n);while(f>o)e[o++]=t;return e}},bf86:function(t,e,n){"use strict";n.r(e);var r=n("7a23");function c(t,e,n,c,a,i){var o=Object(r["B"])("P5Vue");return Object(r["t"])(),Object(r["f"])(o,{onSetup:this.setupP5,onDraw:this.drawP5},null,8,["onSetup","onDraw"])}var a,i,o,u=n("45eb"),f=n("7e84"),s=n("262e"),b=n("2caf"),l=n("3835"),p=n("d4ec"),h=n("bee2"),j=(n("d81d"),n("159b"),n("cb29"),n("309d")),O=n("2f43"),d=n("8be2"),v=65,w=1,k=5,y="#ecb2cd",m=function(t,e,n){return n<1/3?a.lerp(t,e,a.map(n,0,1/3,0,1)):n<2/3?a.lerp(e,t,a.map(n,1/3,2/3,0,1)):t},g=function(t,e,n){return n<2/3?a.lerp(t,e,a.map(n,0,2/3,0,1)):a.lerp(e,t,a.map(n,2/3,1,0,1))},P=function(){function t(){var e=this;Object(p["a"])(this,t),this.offsets=[],Object(d["e"])(8).forEach((function(t){var n=(t+1)%9,r=(n+1)%9,c=(r+1)%9;e.offsets.push([n,r,c])}))}return Object(h["a"])(t,[{key:"renderInBox",value:function(t,e,n){a.push();var r=.1*n,c=.8*n,i=2*c;a.translate(t-t/n,e-n/2);var o=function(t){return[m(r,i,t),g(-c,c,t)]};this.offsets.forEach((function(t){var e=Object(l["a"])(t,3),n=e[0],r=e[1],c=e[2],i=o((O["m"]+n)%9/9),u=Object(l["a"])(i,2),f=u[0],s=u[1],b=o((O["m"]+r)%9/9),p=Object(l["a"])(b,2),h=p[0],j=p[1],d=o((O["m"]+c)%9/9),v=Object(l["a"])(d,2),w=v[0],k=v[1];a.triangle(f,s,h,j,w,k),a.triangle(-f,-s,-h,-j,-w,-k)})),a.pop()}}]),t}(),E=function(t){Object(s["a"])(n,t);var e=Object(b["a"])(n);function n(){return Object(p["a"])(this,n),e.apply(this,arguments)}return Object(h["a"])(n,[{key:"addDrawables",value:function(){var t=this;Object(d["e"])(this.nbElements*this.nbElements).forEach((function(){return t.effects.push(new P)}))}}]),n}(d["a"]);function S(){a.noStroke(),a.fill(0,v),a.rect(0,0,j["f"],j["e"]),a.translate(j["d"],j["c"]),a.fill("black"),a.stroke(i),a.strokeWeight(w),o.render()}function D(){o.reset(k,1,!0)}function I(t){a=t,i=a.color(y),o=new E,Object(O["j"])(9),D()}var x=function(t){Object(s["a"])(n,t);var e=Object(b["a"])(n);function n(){return Object(p["a"])(this,n),e.apply(this,arguments)}return Object(h["a"])(n,[{key:"setupP5",value:function(t){Object(u["a"])(Object(f["a"])(n.prototype),"setupP5",this).call(this,t),I(t)}},{key:"drawP5",value:function(t){Object(u["a"])(Object(f["a"])(n.prototype),"drawP5",this).call(this,t),S()}},{key:"generateUI",value:function(){return this.setupDatGUI({properties:{Effect:[Object(O["f"])("Grid Size",k,2,10,1,(function(t){k=t,D()}))],"Visual & Color":[Object(O["f"])("Alpha",v,0,255,1,(function(t){return v=t})),Object(O["f"])("Stroke size",w,1,3,.1,(function(t){return w=t})),Object(O["c"])("Stroke",y,(function(t){return i=a.color(t)}))],Misc:[this.pause()]}})}}]),n}(O["a"]);x.render=c;e["default"]=x},cb29:function(t,e,n){var r=n("23e7"),c=n("81d5"),a=n("44d2");r({target:"Array",proto:!0},{fill:c}),a("fill")}}]);