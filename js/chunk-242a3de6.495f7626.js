(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-242a3de6"],{"068b":function(t,e,r){"use strict";r.r(e);var n=r("7a23");function c(t,e,r,c,o,a){var i=Object(n["B"])("P5Vue");return Object(n["t"])(),Object(n["f"])(i,{onSetup:this.setupP5,onDraw:this.drawP5},null,8,["onSetup","onDraw"])}var o,a,i,f,u,l,s,b=r("d4ec"),h=r("bee2"),d=r("45eb"),p=r("7e84"),v=r("262e"),O=r("2caf"),j=r("3835"),g=r("b85c"),E=(r("159b"),r("a434"),r("cb29"),r("309d")),w=r("2f43"),y="#8d8585",k="#0a0e15",m="#efefef",M=1.7,x=0,P=60,S=10,D=50,C=1,R=8,T=[];function A(t,e){var r,n=function(t,e){return t*R+e},c=n(t,e),f=n(l,R-1),s=Object(g["a"])(T);try{for(s.s();!(r=s.n()).done;){var b=Object(j["a"])(r.value,2),h=b[0],d=b[1],p=c-n(h,d);p>=0&&(f=Math.min(f,p))}}catch(v){s.e(v)}finally{s.f()}return o.lerpColor(i,a,f/n(-u[0],u[0]))}function G(){T.forEach((function(t,e){var r=Object(j["a"])(t,2),n=r[0],c=r[1];T[e]=c==R-1?[n+1,0]:[n,c+1],n>l&&T.splice(e,1)})),x%(P/C)==0&&T.push(u),x+=1}function I(t,e,r,n){for(var c=n;c<R;c+=2)o.fill(A(e,c)),o.rect(0,t+25+r,3*t,t),o.rotate(2*s)}function J(){o.clear(),o.stroke(f),o.strokeWeight(M),o.background("black"),o.translate(E["d"],E["c"]);for(var t=D;t<=l*D;t+=D){var e=t/D;I(t,e,0,0),o.rotate(s),I(t,e,S,1),o.rotate(-s)}G()}function N(){u=[-Math.floor(P/R),P%R]}function U(){T=[],s=360/R,l=Math.max(E["e"]/D,E["f"]/D),N()}function V(t){o=t,f=o.color(y),a=o.color(k),i=o.color(m),t.rectMode(t.CENTER),t.angleMode(t.DEGREES),o.frameRate(60),U()}var W=function(t){Object(v["a"])(r,t);var e=Object(O["a"])(r);function r(){return Object(b["a"])(this,r),e.apply(this,arguments)}return Object(h["a"])(r,[{key:"setupP5",value:function(t){Object(d["a"])(Object(p["a"])(r.prototype),"setupP5",this).call(this,t),V(t)}},{key:"drawP5",value:function(){J()}},{key:"generateUI",value:function(){return this.setupDatGUI({properties:{Effect:[Object(w["f"])("Cycle",C,.5,2,.01,(function(t){C=t,N()})),Object(w["f"])("Number Wall",R,2,23,2,(function(t){R=t,U()})),Object(w["f"])("Distance",D,20,100,1,(function(t){D=t,U()})),Object(w["f"])("Overlap",S,0,50,1,(function(t){S=t,U()}))],"Visual & Color":[Object(w["f"])("Stroke Size",M,.1,5,.1,(function(t){return M=t})),Object(w["c"])("From",k,(function(t){return a=o.color(t)})),Object(w["c"])("To",m,(function(t){return i=o.color(t)})),Object(w["c"])("Stroke",f,(function(t){return f=o.color(t)}))],Misc:[this.pause(),this.reset(U)]}})}}]),r}(w["a"]);W.render=c;e["default"]=W},"159b":function(t,e,r){var n=r("da84"),c=r("fdbc"),o=r("17c2"),a=r("9112");for(var i in c){var f=n[i],u=f&&f.prototype;if(u&&u.forEach!==o)try{a(u,"forEach",o)}catch(l){u.forEach=o}}},"17c2":function(t,e,r){"use strict";var n=r("b727").forEach,c=r("a640"),o=c("forEach");t.exports=o?[].forEach:function(t){return n(this,t,arguments.length>1?arguments[1]:void 0)}},"81d5":function(t,e,r){"use strict";var n=r("7b0b"),c=r("23cb"),o=r("50c4");t.exports=function(t){var e=n(this),r=o(e.length),a=arguments.length,i=c(a>1?arguments[1]:void 0,r),f=a>2?arguments[2]:void 0,u=void 0===f?r:c(f,r);while(u>i)e[i++]=t;return e}},a434:function(t,e,r){"use strict";var n=r("23e7"),c=r("23cb"),o=r("a691"),a=r("50c4"),i=r("7b0b"),f=r("65f0"),u=r("8418"),l=r("1dde"),s=l("splice"),b=Math.max,h=Math.min,d=9007199254740991,p="Maximum allowed length exceeded";n({target:"Array",proto:!0,forced:!s},{splice:function(t,e){var r,n,l,s,v,O,j=i(this),g=a(j.length),E=c(t,g),w=arguments.length;if(0===w?r=n=0:1===w?(r=0,n=g-E):(r=w-2,n=h(b(o(e),0),g-E)),g+r-n>d)throw TypeError(p);for(l=f(j,n),s=0;s<n;s++)v=E+s,v in j&&u(l,s,j[v]);if(l.length=n,r<n){for(s=E;s<g-n;s++)v=s+n,O=s+r,v in j?j[O]=j[v]:delete j[O];for(s=g;s>g-n+r;s--)delete j[s-1]}else if(r>n)for(s=g-n;s>E;s--)v=s+n-1,O=s+r-1,v in j?j[O]=j[v]:delete j[O];for(s=0;s<r;s++)j[s+E]=arguments[s+2];return j.length=g-n+r,l}})},cb29:function(t,e,r){var n=r("23e7"),c=r("81d5"),o=r("44d2");n({target:"Array",proto:!0},{fill:c}),o("fill")}}]);