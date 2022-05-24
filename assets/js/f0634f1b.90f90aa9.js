"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[2319],{5318:function(t,e,n){n.d(e,{Zo:function(){return p},kt:function(){return d}});var r=n(7378);function a(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function o(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?i(Object(n),!0).forEach((function(e){a(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function l(t,e){if(null==t)return{};var n,r,a=function(t,e){if(null==t)return{};var n,r,a={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(a[n]=t[n]);return a}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a}var u=r.createContext({}),c=function(t){var e=r.useContext(u),n=e;return t&&(n="function"==typeof t?t(e):o(o({},e),t)),n},p=function(t){var e=c(t.components);return r.createElement(u.Provider,{value:e},t.children)},s={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},m=r.forwardRef((function(t,e){var n=t.components,a=t.mdxType,i=t.originalType,u=t.parentName,p=l(t,["components","mdxType","originalType","parentName"]),m=c(n),d=a,f=m["".concat(u,".").concat(d)]||m[d]||s[d]||i;return n?r.createElement(f,o(o({ref:e},p),{},{components:n})):r.createElement(f,o({ref:e},p))}));function d(t,e){var n=arguments,a=e&&e.mdxType;if("string"==typeof t||a){var i=n.length,o=new Array(i);o[0]=m;var l={};for(var u in e)hasOwnProperty.call(e,u)&&(l[u]=e[u]);l.originalType=t,l.mdxType="string"==typeof t?t:a,o[1]=l;for(var c=2;c<i;c++)o[c]=n[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},6729:function(t,e,n){n.r(e),n.d(e,{assets:function(){return p},contentTitle:function(){return u},default:function(){return d},frontMatter:function(){return l},metadata:function(){return c},toc:function(){return s}});var r=n(2685),a=n(1244),i=(n(7378),n(5318)),o=["components"],l={},u=void 0,c={unversionedId:"accounts/PermissionAccountData",id:"accounts/PermissionAccountData",title:"PermissionAccountData",description:"Size 0.003480000 SOL",source:"@site/idl/accounts/PermissionAccountData.md",sourceDirName:"accounts",slug:"/accounts/PermissionAccountData",permalink:"/idl/accounts/PermissionAccountData",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"OracleQueueBuffer",permalink:"/idl/accounts/OracleQueueBuffer"},next:{title:"SbState",permalink:"/idl/accounts/SbState"}},p={},s=[],m={toc:s};function d(t){var e=t.components,n=(0,a.Z)(t,o);return(0,i.kt)("wrapper",(0,r.Z)({},m,n,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("b",null,"Size: "),"372 Bytes",(0,i.kt)("br",null),(0,i.kt)("b",null,"Rent Exemption: "),"0.003480000 SOL",(0,i.kt)("br",null),(0,i.kt)("br",null),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Field"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"authority"),(0,i.kt)("td",{parentName:"tr",align:null},"publicKey"),(0,i.kt)("td",{parentName:"tr",align:null},"The authority that is allowed to set permissions for this account.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"permissions"),(0,i.kt)("td",{parentName:"tr",align:null},"u32"),(0,i.kt)("td",{parentName:"tr",align:null},"The ",(0,i.kt)("a",{parentName:"td",href:"/idl/types/SwitchboardPermission"},"SwitchboardPermission")," enumeration assigned by the ",(0,i.kt)("inlineCode",{parentName:"td"},"granter")," to the ",(0,i.kt)("inlineCode",{parentName:"td"},"grantee"),".")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"granter"),(0,i.kt)("td",{parentName:"tr",align:null},"publicKey"),(0,i.kt)("td",{parentName:"tr",align:null},"Public key of account that is granting permissions to use its resources.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"grantee"),(0,i.kt)("td",{parentName:"tr",align:null},"publicKey"),(0,i.kt)("td",{parentName:"tr",align:null},"Public key of account that is being assigned permissions to use a granters resources.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"expiration"),(0,i.kt)("td",{parentName:"tr",align:null},"i64"),(0,i.kt)("td",{parentName:"tr",align:null},"Timestamp when the permissions expire.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"ebuf"),(0,i.kt)("td",{parentName:"tr",align:null},"u8","[256]"),(0,i.kt)("td",{parentName:"tr",align:null},"Reserved.")))))}d.isMDXComponent=!0}}]);