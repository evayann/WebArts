(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2de0d72e"],{"81d5":function(t,e,n){"use strict";var a=n("7b0b"),r=n("23cb"),c=n("50c4");t.exports=function(t){var e=a(this),n=c(e.length),o=arguments.length,i=r(o>1?arguments[1]:void 0,n),u=o>2?arguments[2]:void 0,s=void 0===u?n:r(u,n);while(s>i)e[i++]=t;return e}},c1f4:function(t,e,n){"use strict";n.r(e);var a=n("7a23");function r(t,e,n,r,c,o){var i=Object(a["B"])("P5Vue");return Object(a["t"])(),Object(a["f"])(i,{onSetup:this.setupP5,onDraw:this.drawP5},null,8,["onSetup","onDraw"])}var c,o,i=n("d4ec"),u=n("bee2"),s=n("45eb"),f=n("7e84"),l=n("262e"),p=n("2caf"),h=(n("d81d"),n("cb29"),n("309d")),b=n("2f43"),d="#35d492",v=1,j=1.7,O=3,w=!0;function M(t){var e=2*Math.PI/4.5;return 0===t?0:1===t?1:t<.5?-Math.pow(2,20*t-10)*Math.sin((20*t-11.125)*e)/2:Math.pow(2,-20*t+10)*Math.sin((20*t-11.125)*e)/2+1}function k(t){return t<.5?(1-Math.sqrt(1-Math.pow(2*t,2)))/2:(Math.sqrt(1-Math.pow(-2*t+2,2))+1)/2}function P(t,e,n,a){var r=M(c.map(n,-1,1,0,1));return a&&c.rotate(r*c.PI),c.lerp(t,e,r)}function m(t,e,n,a){c.push();var r=P(2*t,t,c.cos(b["m"]*v),w),o=P(2*e,e,c.sin(j+b["m"]*v),w);c.translate(r,o),c.rect(0,0,n+2,a+2,k(c.map(c.cos(b["m"]*v),-1,1,1,0))*n/2),c.pop()}function y(t,e,n,a,r,c,o,i,u){if(u>=O)m(t,e,n,a);else{var s=r+o,f=c+i;y(t,e,n*r,a*c,s,f,o,i,u+1),y(t+n*r,e,n*(1-r),a*c,s,f,o,i,u+1),y(t+n*r,e+a*c,n*(1-r),a*(1-c),s,f,o,i,u+1),y(t,e+a*c,n*r,a*(1-c),s,f,o,i,u+1)}}function g(t){var e=P(t,0,c.cos(b["m"]*v),!1),n=P(t,0,c.sin(j+b["m"]*v),!1);c.translate(h["f"]/2+e,h["e"]/2+n)}function I(){c.background("black"),c.fill(o),c.noStroke();var t=Math.min(h["f"],h["e"]);g(t/32),c.scale(.5);var e=t/2,n=1/(2*O);y(-e,-e,e,e,.1,.1,n,n,0),y(0,-e,e,e,.9,.1,-n,n,0),y(0,0,e,e,.9,.9,-n,-n,0),y(-e,0,e,e,.1,.9,n,-n,0)}function D(){c.clear(),Object(b["j"])(7/v),Object(b["h"])(),I()}function S(t){c=t,o=c.color(d),D()}var q=function(t){Object(l["a"])(n,t);var e=Object(p["a"])(n);function n(){return Object(i["a"])(this,n),e.apply(this,arguments)}return Object(u["a"])(n,[{key:"setupP5",value:function(t){Object(s["a"])(Object(f["a"])(n.prototype),"setupP5",this).call(this,t),S(t)}},{key:"drawP5",value:function(t){Object(s["a"])(Object(f["a"])(n.prototype),"drawP5",this).call(this,t),I()}},{key:"generateUI",value:function(){return this.setupDatGUI({properties:{Effect:[Object(b["f"])("Cycle",v,.1,2,.1,(function(t){v=t,D()})),Object(b["f"])("Offset",j,0,2*Math.PI,.1,(function(t){return j=t})),Object(b["k"])("Rotation","No Rotation",(function(t){w=t,D()}))],"Visual & Color":[Object(b["c"])("Element",d,(function(t){return o=c.color(t)}))],Misc:[this.pause(),this.reset(D)]}})}}]),n}(b["a"]);q.render=r;e["default"]=q},cb29:function(t,e,n){var a=n("23e7"),r=n("81d5"),c=n("44d2");a({target:"Array",proto:!0},{fill:r}),c("fill")}}]);