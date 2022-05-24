"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[7848],{5318:function(e,t,r){r.d(t,{Zo:function(){return c},kt:function(){return m}});var n=r(7378);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function l(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function o(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?l(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):l(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function u(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},l=Object.keys(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(n=0;n<l.length;n++)r=l[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var i=n.createContext({}),p=function(e){var t=n.useContext(i),r=t;return e&&(r="function"==typeof e?e(t):o(o({},t),e)),r},c=function(e){var t=p(e.components);return n.createElement(i.Provider,{value:t},e.children)},f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},s=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,l=e.originalType,i=e.parentName,c=u(e,["components","mdxType","originalType","parentName"]),s=p(r),m=a,d=s["".concat(i,".").concat(m)]||s[m]||f[m]||l;return r?n.createElement(d,o(o({ref:t},c),{},{components:r})):n.createElement(d,o({ref:t},c))}));function m(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=r.length,o=new Array(l);o[0]=s;var u={};for(var i in t)hasOwnProperty.call(t,i)&&(u[i]=t[i]);u.originalType=e,u.mdxType="string"==typeof e?e:a,o[1]=u;for(var p=2;p<l;p++)o[p]=r[p];return n.createElement.apply(null,o)}return n.createElement.apply(null,r)}s.displayName="MDXCreateElement"},1106:function(e,t,r){r.r(t),r.d(t,{assets:function(){return c},contentTitle:function(){return i},default:function(){return m},frontMatter:function(){return u},metadata:function(){return p},toc:function(){return f}});var n=r(2685),a=r(1244),l=(r(7378),r(5318)),o=["components"],u={},i=void 0,p={unversionedId:"types/BufferRelayerRound",id:"types/BufferRelayerRound",title:"BufferRelayerRound",description:"| Field | Type | Description |",source:"@site/idl/types/BufferRelayerRound.md",sourceDirName:"types",slug:"/types/BufferRelayerRound",permalink:"/idl/types/BufferRelayerRound",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"BorshDecimal",permalink:"/idl/types/BorshDecimal"},next:{title:"Callback",permalink:"/idl/types/Callback"}},c={},f=[],s={toc:f};function m(e){var t=e.components,r=(0,a.Z)(e,o);return(0,l.kt)("wrapper",(0,n.Z)({},s,r,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("table",null,(0,l.kt)("thead",{parentName:"table"},(0,l.kt)("tr",{parentName:"thead"},(0,l.kt)("th",{parentName:"tr",align:null},"Field"),(0,l.kt)("th",{parentName:"tr",align:null},"Type"),(0,l.kt)("th",{parentName:"tr",align:null},"Description"))),(0,l.kt)("tbody",{parentName:"table"},(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"numSuccess"),(0,l.kt)("td",{parentName:"tr",align:null},"u32"),(0,l.kt)("td",{parentName:"tr",align:null},"Number of successful responses")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"numError"),(0,l.kt)("td",{parentName:"tr",align:null},"u32"),(0,l.kt)("td",{parentName:"tr",align:null},"Number of error responses")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"roundOpenSlot"),(0,l.kt)("td",{parentName:"tr",align:null},"u64"),(0,l.kt)("td",{parentName:"tr",align:null},"Slot when the buffer relayer round was opened")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"roundOpenTimestamp"),(0,l.kt)("td",{parentName:"tr",align:null},"i64"),(0,l.kt)("td",{parentName:"tr",align:null},"Timestamp when the buffer relayer round was opened")),(0,l.kt)("tr",{parentName:"tbody"},(0,l.kt)("td",{parentName:"tr",align:null},"oraclePubkey"),(0,l.kt)("td",{parentName:"tr",align:null},"publicKey"),(0,l.kt)("td",{parentName:"tr",align:null},"The public key of the oracle fulfilling the buffer relayer update request")))))}m.isMDXComponent=!0}}]);