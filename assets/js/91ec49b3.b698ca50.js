"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[5013],{5318:function(t,e,n){n.d(e,{Zo:function(){return p},kt:function(){return d}});var r=n(7378);function a(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}function i(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function l(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?i(Object(n),!0).forEach((function(e){a(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}function o(t,e){if(null==t)return{};var n,r,a=function(t,e){if(null==t)return{};var n,r,a={},i=Object.keys(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||(a[n]=t[n]);return a}(t,e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(t);for(r=0;r<i.length;r++)n=i[r],e.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(t,n)&&(a[n]=t[n])}return a}var u=r.createContext({}),c=function(t){var e=r.useContext(u),n=e;return t&&(n="function"==typeof t?t(e):l(l({},e),t)),n},p=function(t){var e=c(t.components);return r.createElement(u.Provider,{value:e},t.children)},s={inlineCode:"code",wrapper:function(t){var e=t.children;return r.createElement(r.Fragment,{},e)}},m=r.forwardRef((function(t,e){var n=t.components,a=t.mdxType,i=t.originalType,u=t.parentName,p=o(t,["components","mdxType","originalType","parentName"]),m=c(n),d=a,g=m["".concat(u,".").concat(d)]||m[d]||s[d]||i;return n?r.createElement(g,l(l({ref:e},p),{},{components:n})):r.createElement(g,l({ref:e},p))}));function d(t,e){var n=arguments,a=e&&e.mdxType;if("string"==typeof t||a){var i=n.length,l=new Array(i);l[0]=m;var o={};for(var u in e)hasOwnProperty.call(e,u)&&(o[u]=e[u]);o.originalType=t,o.mdxType="string"==typeof t?t:a,l[1]=o;for(var c=2;c<i;c++)l[c]=n[c];return r.createElement.apply(null,l)}return r.createElement.apply(null,n)}m.displayName="MDXCreateElement"},6228:function(t,e,n){n.r(e),n.d(e,{assets:function(){return p},contentTitle:function(){return u},default:function(){return d},frontMatter:function(){return o},metadata:function(){return c},toc:function(){return s}});var r=n(2685),a=n(1244),i=(n(7378),n(5318)),l=["components"],o={},u=void 0,c={unversionedId:"instructions/permissionInit",id:"instructions/permissionInit",title:"permissionInit",description:"Create and initialize the PermissionAccount.",source:"@site/idl/instructions/permissionInit.md",sourceDirName:"instructions",slug:"/instructions/permissionInit",permalink:"/idl/instructions/permissionInit",draft:!1,tags:[],version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"oracleWithdraw",permalink:"/idl/instructions/oracleWithdraw"},next:{title:"permissionSet",permalink:"/idl/instructions/permissionSet"}},p={},s=[{value:"Accounts",id:"accounts",level:2},{value:"Params",id:"params",level:2}],m={toc:s};function d(t){var e=t.components,n=(0,a.Z)(t,l);return(0,i.kt)("wrapper",(0,r.Z)({},m,n,{components:e,mdxType:"MDXLayout"}),(0,i.kt)("p",null,"Create and initialize the PermissionAccount."),(0,i.kt)("h2",{id:"accounts"},"Accounts"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Name"),(0,i.kt)("th",{parentName:"tr",align:null},"isMut"),(0,i.kt)("th",{parentName:"tr",align:null},"isSigner"),(0,i.kt)("th",{parentName:"tr",align:null},"Description"))),(0,i.kt)("tbody",{parentName:"table"},(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"permission"),(0,i.kt)("td",{parentName:"tr",align:null},"TRUE"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"The permission account being initialized.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"authority"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"The ",(0,i.kt)("a",{parentName:"td",href:"/idl/accounts/PermissionAccountData"},"PermissionAccountData")," authority that can update an account's permissions.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"granter"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"The account receiving the assigned permissions.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"grantee"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"The account granting the assigned permissions.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"payer"),(0,i.kt)("td",{parentName:"tr",align:null},"TRUE"),(0,i.kt)("td",{parentName:"tr",align:null},"TRUE"),(0,i.kt)("td",{parentName:"tr",align:null},"The account paying for the new permission account on-chain.")),(0,i.kt)("tr",{parentName:"tbody"},(0,i.kt)("td",{parentName:"tr",align:null},"systemProgram"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"FALSE"),(0,i.kt)("td",{parentName:"tr",align:null},"The Solana system program account.")))),(0,i.kt)("h2",{id:"params"},"Params"),(0,i.kt)("table",null,(0,i.kt)("thead",{parentName:"table"},(0,i.kt)("tr",{parentName:"thead"},(0,i.kt)("th",{parentName:"tr",align:null},"Field"),(0,i.kt)("th",{parentName:"tr",align:null},"Type"),(0,i.kt)("th",{parentName:"tr",align:null},"Description")))))}d.isMDXComponent=!0}}]);