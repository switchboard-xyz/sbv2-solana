"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[2743],{5318:function(e,r,n){n.d(r,{Zo:function(){return u},kt:function(){return g}});var t=n(7378);function i(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function o(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function a(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?o(Object(n),!0).forEach((function(r){i(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function s(e,r){if(null==e)return{};var n,t,i=function(e,r){if(null==e)return{};var n,t,i={},o=Object.keys(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||(i[n]=e[n]);return i}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=t.createContext({}),p=function(e){var r=t.useContext(c),n=r;return e&&(n="function"==typeof e?e(r):a(a({},r),e)),n},u=function(e){var r=p(e.components);return t.createElement(c.Provider,{value:r},e.children)},l={inlineCode:"code",wrapper:function(e){var r=e.children;return t.createElement(t.Fragment,{},r)}},m=t.forwardRef((function(e,r){var n=e.components,i=e.mdxType,o=e.originalType,c=e.parentName,u=s(e,["components","mdxType","originalType","parentName"]),m=p(n),g=i,f=m["".concat(c,".").concat(g)]||m[g]||l[g]||o;return n?t.createElement(f,a(a({ref:r},u),{},{components:n})):t.createElement(f,a({ref:r},u))}));function g(e,r){var n=arguments,i=r&&r.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=m;var s={};for(var c in r)hasOwnProperty.call(r,c)&&(s[c]=r[c]);s.originalType=e,s.mdxType="string"==typeof e?e:i,a[1]=s;for(var p=2;p<o;p++)a[p]=n[p];return t.createElement.apply(null,a)}return t.createElement.apply(null,n)}m.displayName="MDXCreateElement"},5310:function(e,r,n){n.d(r,{Z:function(){return d}});var t=n(2685),i=n(1244),o=n(7378),a=n(8944),s=n(5642),c=n(1652),p=n(3772),u=n(6206),l=n(4246);const m=["className","component"];var g=n(4907);const f=function(e={}){const{defaultTheme:r,defaultClassName:n="MuiBox-root",generateClassName:g,styleFunctionSx:f=c.Z}=e,d=(0,s.ZP)("div")(f);return o.forwardRef((function(e,o){const s=(0,u.Z)(r),c=(0,p.Z)(e),{className:f,component:x="div"}=c,w=(0,i.Z)(c,m);return(0,l.jsx)(d,(0,t.Z)({as:x,ref:o,className:(0,a.Z)(f,g?g(n):n),theme:s},w))}))}({defaultTheme:(0,n(2905).Z)(),defaultClassName:"MuiBox-root",generateClassName:g.Z.generate});var d=f},4384:function(e,r,n){n.d(r,{ZP:function(){return $}});var t=n(1244),i=n(2685),o=n(7378),a=n(8944),s=n(2142),c=n(3772),p=n(3892),u=n(2709),l=n(2399);var m=o.createContext(),g=n(765);function f(e){return(0,g.Z)("MuiGrid",e)}const d=["auto",!0,1,2,3,4,5,6,7,8,9,10,11,12];var x=(0,n(2897).Z)("MuiGrid",["root","container","item","zeroMinWidth",...[0,1,2,3,4,5,6,7,8,9,10].map((e=>`spacing-xs-${e}`)),...["column-reverse","column","row-reverse","row"].map((e=>`direction-xs-${e}`)),...["nowrap","wrap-reverse","wrap"].map((e=>`wrap-xs-${e}`)),...d.map((e=>`grid-xs-${e}`)),...d.map((e=>`grid-sm-${e}`)),...d.map((e=>`grid-md-${e}`)),...d.map((e=>`grid-lg-${e}`)),...d.map((e=>`grid-xl-${e}`))]),w=n(4246);const b=["className","columns","columnSpacing","component","container","direction","item","lg","md","rowSpacing","sm","spacing","wrap","xl","xs","zeroMinWidth"];function S(e){const r=parseFloat(e);return`${r}${String(e).replace(String(r),"")||"px"}`}function v(e,r,n={}){if(!r||!e||e<=0)return[];if("string"==typeof e&&!Number.isNaN(Number(e))||"number"==typeof e)return[n[`spacing-xs-${String(e)}`]||`spacing-xs-${String(e)}`];const{xs:t,sm:i,md:o,lg:a,xl:s}=e;return[Number(t)>0&&(n[`spacing-xs-${String(t)}`]||`spacing-xs-${String(t)}`),Number(i)>0&&(n[`spacing-sm-${String(i)}`]||`spacing-sm-${String(i)}`),Number(o)>0&&(n[`spacing-md-${String(o)}`]||`spacing-md-${String(o)}`),Number(a)>0&&(n[`spacing-lg-${String(a)}`]||`spacing-lg-${String(a)}`),Number(s)>0&&(n[`spacing-xl-${String(s)}`]||`spacing-xl-${String(s)}`)]}const h=(0,u.ZP)("div",{name:"MuiGrid",slot:"Root",overridesResolver:(e,r)=>{const{container:n,direction:t,item:i,lg:o,md:a,sm:s,spacing:c,wrap:p,xl:u,xs:l,zeroMinWidth:m}=e.ownerState;return[r.root,n&&r.container,i&&r.item,m&&r.zeroMinWidth,...v(c,n,r),"row"!==t&&r[`direction-xs-${String(t)}`],"wrap"!==p&&r[`wrap-xs-${String(p)}`],!1!==l&&r[`grid-xs-${String(l)}`],!1!==s&&r[`grid-sm-${String(s)}`],!1!==a&&r[`grid-md-${String(a)}`],!1!==o&&r[`grid-lg-${String(o)}`],!1!==u&&r[`grid-xl-${String(u)}`]]}})((({ownerState:e})=>(0,i.Z)({boxSizing:"border-box"},e.container&&{display:"flex",flexWrap:"wrap",width:"100%"},e.item&&{margin:0},e.zeroMinWidth&&{minWidth:0},"wrap"!==e.wrap&&{flexWrap:e.wrap})),(function({theme:e,ownerState:r}){const n=(0,s.P$)({values:r.direction,breakpoints:e.breakpoints.values});return(0,s.k9)({theme:e},n,(e=>{const r={flexDirection:e};return 0===e.indexOf("column")&&(r[`& > .${x.item}`]={maxWidth:"none"}),r}))}),(function({theme:e,ownerState:r}){const{container:n,rowSpacing:t}=r;let i={};if(n&&0!==t){const r=(0,s.P$)({values:t,breakpoints:e.breakpoints.values});i=(0,s.k9)({theme:e},r,(r=>{const n=e.spacing(r);return"0px"!==n?{marginTop:`-${S(n)}`,[`& > .${x.item}`]:{paddingTop:S(n)}}:{}}))}return i}),(function({theme:e,ownerState:r}){const{container:n,columnSpacing:t}=r;let i={};if(n&&0!==t){const r=(0,s.P$)({values:t,breakpoints:e.breakpoints.values});i=(0,s.k9)({theme:e},r,(r=>{const n=e.spacing(r);return"0px"!==n?{width:`calc(100% + ${S(n)})`,marginLeft:`-${S(n)}`,[`& > .${x.item}`]:{paddingLeft:S(n)}}:{}}))}return i}),(function({theme:e,ownerState:r}){let n;return e.breakpoints.keys.reduce(((t,o)=>{let a={};if(r[o]&&(n=r[o]),!n)return t;if(!0===n)a={flexBasis:0,flexGrow:1,maxWidth:"100%"};else if("auto"===n)a={flexBasis:"auto",flexGrow:0,flexShrink:0,maxWidth:"none",width:"auto"};else{const c=(0,s.P$)({values:r.columns,breakpoints:e.breakpoints.values}),p="object"==typeof c?c[o]:c;if(null==p)return t;const u=Math.round(n/p*1e8)/1e6+"%";let l={};if(r.container&&r.item&&0!==r.columnSpacing){const n=e.spacing(r.columnSpacing);if("0px"!==n){const e=`calc(${u} + ${S(n)})`;l={flexBasis:e,maxWidth:e}}}a=(0,i.Z)({flexBasis:u,flexGrow:0,maxWidth:u},l)}return 0===e.breakpoints.values[o]?Object.assign(t,a):t[e.breakpoints.up(o)]=a,t}),{})}));var $=o.forwardRef((function(e,r){const n=(0,l.Z)({props:e,name:"MuiGrid"}),s=(0,c.Z)(n),{className:u,columns:g,columnSpacing:d,component:x="div",container:S=!1,direction:$="row",item:y=!1,lg:O=!1,md:Z=!1,rowSpacing:P,sm:k=!1,spacing:j=0,wrap:N="wrap",xl:M=!1,xs:W=!1,zeroMinWidth:C=!1}=s,E=(0,t.Z)(s,b),T=P||j,z=d||j,G=o.useContext(m),B=S?g||12:G,D=(0,i.Z)({},s,{columns:B,container:S,direction:$,item:y,lg:O,md:Z,sm:k,rowSpacing:T,columnSpacing:z,wrap:N,xl:M,xs:W,zeroMinWidth:C}),R=(e=>{const{classes:r,container:n,direction:t,item:i,lg:o,md:a,sm:s,spacing:c,wrap:u,xl:l,xs:m,zeroMinWidth:g}=e,d={root:["root",n&&"container",i&&"item",g&&"zeroMinWidth",...v(c,n),"row"!==t&&`direction-xs-${String(t)}`,"wrap"!==u&&`wrap-xs-${String(u)}`,!1!==m&&`grid-xs-${String(m)}`,!1!==s&&`grid-sm-${String(s)}`,!1!==a&&`grid-md-${String(a)}`,!1!==o&&`grid-lg-${String(o)}`,!1!==l&&`grid-xl-${String(l)}`]};return(0,p.Z)(d,f,r)})(D);return(0,w.jsx)(m.Provider,{value:B,children:(0,w.jsx)(h,(0,i.Z)({ownerState:D,className:(0,a.Z)(R.root,u),as:x,ref:r},E))})}))},3772:function(e,r,n){n.d(r,{Z:function(){return c}});var t=n(2685),i=n(1244),o=n(3143),a=n(7351);const s=["sx"];function c(e){const{sx:r}=e,n=(0,i.Z)(e,s),{systemProps:c,otherProps:p}=(e=>{const r={systemProps:{},otherProps:{}};return Object.keys(e).forEach((n=>{a.Gc[n]?r.systemProps[n]=e[n]:r.otherProps[n]=e[n]})),r})(n);let u;return u=Array.isArray(r)?[c,...r]:"function"==typeof r?(...e)=>{const n=r(...e);return(0,o.P)(n)?(0,t.Z)({},c,n):c}:(0,t.Z)({},c,r),(0,t.Z)({},p,{sx:u})}}}]);