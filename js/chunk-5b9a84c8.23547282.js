(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-5b9a84c8"],{b64b:function(e,t,n){var c=n("23e7"),r=n("7b0b"),o=n("df75"),u=n("d039"),a=u((function(){o(1)}));c({target:"Object",stat:!0,forced:a},{keys:function(e){return o(r(e))}})},bc8f:function(e,t,n){"use strict";n.r(t);var c=n("7a23");function r(e,t,n,r,o,u){var a=Object(c["B"])("P5Vue");return Object(c["t"])(),Object(c["f"])(a,{onSetup:this.setupP5,onDraw:this.drawP5},null,8,["onSetup","onDraw"])}var o,u,a,i=n("d4ec"),f=n("bee2"),b=n("45eb"),s=n("7e84"),l=n("262e"),p=n("2caf"),j=(n("159b"),n("b64b"),n("309d")),O=n("2f43"),d=n("8be2"),h="#000000",w="#b7e3ce",k=1,v=20,y=v/2,E=10,S=1,P=3,g=function(e,t){return o.noise(e/j["f"]*E+k*S/100,t/j["e"]*E+k*S/100)},D={drawLine:C,drawCurve:L},B=C;function C(e,t,n){n<.5?o.line(e,t,e+v,t+v):o.line(e,t+v,e+v,t)}function L(e,t,n){n<.5?(o.arc(e-y,t-y,v,v,0,90),o.arc(e+y,t+y,v,v,180,270)):(o.arc(e-y,t+y,v,v,270,360),o.arc(e+y,t-y,v,v,90,180))}function M(){o.background(u),o.stroke(a),o.strokeWeight(P),Object(d["e"])(j["f"],v).forEach((function(e){return Object(d["e"])(j["e"],v).forEach((function(t){return B(e,t,g(e,t))}))})),k++}function z(e){o=e,u=o.color(h),a=o.color(w),o.angleMode(o.DEGREES),o.rectMode(o.CENTER),o.noFill()}var F=function(e){Object(l["a"])(n,e);var t=Object(p["a"])(n);function n(){return Object(i["a"])(this,n),t.apply(this,arguments)}return Object(f["a"])(n,[{key:"setupP5",value:function(e){Object(b["a"])(Object(s["a"])(n.prototype),"setupP5",this).call(this,e),z(e)}},{key:"drawP5",value:function(e){Object(b["a"])(Object(s["a"])(n.prototype),"drawP5",this).call(this,e),M()}},{key:"generateUI",value:function(){var e=this;return this.setupDatGUI({properties:{Effect:[Object(O["f"])("Speed",S,.1,10,.1,(function(e){return S=e})),Object(O["e"])("Draw Function","drawLine",Object.keys(D),(function(e){return B=D[e]})),Object(O["f"])("Scale",E,1,25,1,(function(e){return E=e})),Object(O["f"])("Block Size",v,5,50,1,(function(e){v=e,y=v/2}))],"Visual & Color":[Object(O["f"])("Stroke Size",P,1,5,.1,(function(e){return P=e})),Object(O["c"])("Background",h,(function(t){return u=e.p5.color(t)})),Object(O["c"])("Line",w,(function(t){return a=e.p5.color(t)}))],Misc:[this.pause()]}})}}]),n}(O["a"]);F.render=r;t["default"]=F}}]);