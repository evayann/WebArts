(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-793111d4"],{"70ba":function(t,n,e){"use strict";function r(t,n){return t<.5?.5*Math.pow(2*t,n):1-.5*Math.pow(2*(1-t),n)}function a(t){var n=2*Math.PI/4.5;return 0===t?0:1===t?1:t<.5?-Math.pow(2,20*t-10)*Math.sin((20*t-11.125)*n)/2:Math.pow(2,-20*t+10)*Math.sin((20*t-11.125)*n)/2+1}function c(t){return 0===t?0:1===t?1:t<.5?Math.pow(2,20*t-10)/2:(2-Math.pow(2,-20*t+10))/2}function u(t){return 1-Math.pow(1-t,3)}function o(t){return t*t*t*t}e.d(n,"a",(function(){return r})),e.d(n,"b",(function(){return a})),e.d(n,"c",(function(){return c})),e.d(n,"e",(function(){return u})),e.d(n,"d",(function(){return o}))},"853a":function(t,n,e){"use strict";e.r(n);var r=e("7a23");function a(t,n,e,a,c,u){var o=Object(r["B"])("P5Vue");return Object(r["t"])(),Object(r["f"])(o,{onSetup:this.setupP5,onDraw:this.drawP5},null,8,["onSetup","onDraw"])}var c,u=e("d4ec"),o=e("bee2"),i=e("45eb"),s=e("7e84"),f=e("262e"),p=e("2caf"),b=e("309d"),h=e("2f43"),d=e("70ba"),w=10,l=10;function j(t,n,e,r,a){c.push(),c.translate(t,n);for(var u=c.TAU/l,o=u;o<c.TAU+u;o+=u){c.push(),c.rotate(o);for(var i=10;i--;){var s=c.PI+i/10*r+e*c.PI;c.circle(c.cos(s)*a/2*r,c.sin(s)*a/2*r,a/50)}c.pop()}c.pop()}function v(t,n,e,r){c.push(),c.rotate(t),c.translate(r*n,0),c.circle(0,0,r/50),c.pop()}function O(){c.background("black"),c.translate(b["d"],b["c"]);var t=Object(d["c"])(h["m"]/10%1),n=.5-c.abs(t-.5),e=c.min(b["d"],b["c"])/1.5,r=2*n;j(0,0,r,n,e);for(var a=0;a<c.TAU;a+=c.TAU/w)j(c.cos(a)*e,c.sin(a)*e,r,n,e);for(var u=w;u--;)v(u*c.TAU/w,u%2==0?t:r,n,e)}function M(t){c=t,c.noStroke(),P()}function P(){Object(h["j"])(10)}var k=function(t){Object(f["a"])(e,t);var n=Object(p["a"])(e);function e(){return Object(u["a"])(this,e),n.apply(this,arguments)}return Object(o["a"])(e,[{key:"setupP5",value:function(t){Object(i["a"])(Object(s["a"])(e.prototype),"setupP5",this).call(this,t),M(t)}},{key:"drawP5",value:function(t){Object(i["a"])(Object(s["a"])(e.prototype),"drawP5",this).call(this,t),O()}},{key:"generateUI",value:function(){return this.setupDatGUI({properties:{Effect:[Object(h["f"])("Number points",w,2,16,2,(function(t){return w=t})),Object(h["f"])("Precision",l,1,10,1,(function(t){return l=t}))],Misc:[this.pause()]}})}}]),e}(h["a"]);k.render=a;n["default"]=k}}]);