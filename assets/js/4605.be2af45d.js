"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4605],{9502:function(t,e,r){r.d(e,{Z:function(){return S}});var n=r(2685),i=r(1244),o=r(7378),a=r(8944),s=r(3892),l=r(2709),c=r(2399),d=r(7818),u=r(765),p=r(2897);function m(t){return(0,u.Z)("MuiPaper",t)}(0,p.Z)("MuiPaper",["root","rounded","outlined","elevation","elevation0","elevation1","elevation2","elevation3","elevation4","elevation5","elevation6","elevation7","elevation8","elevation9","elevation10","elevation11","elevation12","elevation13","elevation14","elevation15","elevation16","elevation17","elevation18","elevation19","elevation20","elevation21","elevation22","elevation23","elevation24"]);var g=r(4246);const h=["className","component","elevation","square","variant"],v=t=>{let e;return e=t<1?5.11916*t**2:4.5*Math.log(t+1)+2,(e/100).toFixed(2)},f=(0,l.ZP)("div",{name:"MuiPaper",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:r}=t;return[e.root,e[r.variant],!r.square&&e.rounded,"elevation"===r.variant&&e[`elevation${r.elevation}`]]}})((({theme:t,ownerState:e})=>(0,n.Z)({backgroundColor:t.palette.background.paper,color:t.palette.text.primary,transition:t.transitions.create("box-shadow")},!e.square&&{borderRadius:t.shape.borderRadius},"outlined"===e.variant&&{border:`1px solid ${t.palette.divider}`},"elevation"===e.variant&&(0,n.Z)({boxShadow:t.shadows[e.elevation]},"dark"===t.palette.mode&&{backgroundImage:`linear-gradient(${(0,d.Fq)("#fff",v(e.elevation))}, ${(0,d.Fq)("#fff",v(e.elevation))})`}))));var x=o.forwardRef((function(t,e){const r=(0,c.Z)({props:t,name:"MuiPaper"}),{className:o,component:l="div",elevation:d=1,square:u=!1,variant:p="elevation"}=r,v=(0,i.Z)(r,h),x=(0,n.Z)({},r,{component:l,elevation:d,square:u,variant:p}),w=(t=>{const{square:e,elevation:r,variant:n,classes:i}=t,o={root:["root",n,!e&&"rounded","elevation"===n&&`elevation${r}`]};return(0,s.Z)(o,m,i)})(x);return(0,g.jsx)(f,(0,n.Z)({as:l,ownerState:x,className:(0,a.Z)(w.root,o),ref:e},v))}));function w(t){return(0,u.Z)("MuiCard",t)}(0,p.Z)("MuiCard",["root"]);const Z=["className","raised"],b=(0,l.ZP)(x,{name:"MuiCard",slot:"Root",overridesResolver:(t,e)=>e.root})((()=>({overflow:"hidden"})));var S=o.forwardRef((function(t,e){const r=(0,c.Z)({props:t,name:"MuiCard"}),{className:o,raised:l=!1}=r,d=(0,i.Z)(r,Z),u=(0,n.Z)({},r,{raised:l}),p=(t=>{const{classes:e}=t;return(0,s.Z)({root:["root"]},w,e)})(u);return(0,g.jsx)(b,(0,n.Z)({className:(0,a.Z)(p.root,o),elevation:l?8:void 0,ref:e,ownerState:u},d))}))},47:function(t,e,r){r.d(e,{Z:function(){return h}});var n=r(2685),i=r(1244),o=r(7378),a=r(8944),s=r(3892),l=r(2709),c=r(2399),d=r(765);function u(t){return(0,d.Z)("MuiCardContent",t)}(0,r(2897).Z)("MuiCardContent",["root"]);var p=r(4246);const m=["className","component"],g=(0,l.ZP)("div",{name:"MuiCardContent",slot:"Root",overridesResolver:(t,e)=>e.root})((()=>({padding:16,"&:last-child":{paddingBottom:24}})));var h=o.forwardRef((function(t,e){const r=(0,c.Z)({props:t,name:"MuiCardContent"}),{className:o,component:l="div"}=r,d=(0,i.Z)(r,m),h=(0,n.Z)({},r,{component:l}),v=(t=>{const{classes:e}=t;return(0,s.Z)({root:["root"]},u,e)})(h);return(0,p.jsx)(g,(0,n.Z)({as:l,className:(0,a.Z)(v.root,o),ownerState:h,ref:e},d))}))},5520:function(t,e,r){r.d(e,{Z:function(){return f}});var n=r(1244),i=r(2685),o=r(7378),a=r(8944),s=r(3892),l=r(7818),c=r(2709),d=r(2399),u=r(765);function p(t){return(0,u.Z)("MuiDivider",t)}(0,r(2897).Z)("MuiDivider",["root","absolute","fullWidth","inset","middle","flexItem","light","vertical","withChildren","withChildrenVertical","textAlignRight","textAlignLeft","wrapper","wrapperVertical"]);var m=r(4246);const g=["absolute","children","className","component","flexItem","light","orientation","role","textAlign","variant"],h=(0,c.ZP)("div",{name:"MuiDivider",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:r}=t;return[e.root,r.absolute&&e.absolute,e[r.variant],r.light&&e.light,"vertical"===r.orientation&&e.vertical,r.flexItem&&e.flexItem,r.children&&e.withChildren,r.children&&"vertical"===r.orientation&&e.withChildrenVertical,"right"===r.textAlign&&"vertical"!==r.orientation&&e.textAlignRight,"left"===r.textAlign&&"vertical"!==r.orientation&&e.textAlignLeft]}})((({theme:t,ownerState:e})=>(0,i.Z)({margin:0,flexShrink:0,borderWidth:0,borderStyle:"solid",borderColor:t.palette.divider,borderBottomWidth:"thin"},e.absolute&&{position:"absolute",bottom:0,left:0,width:"100%"},e.light&&{borderColor:(0,l.Fq)(t.palette.divider,.08)},"inset"===e.variant&&{marginLeft:72},"middle"===e.variant&&"horizontal"===e.orientation&&{marginLeft:t.spacing(2),marginRight:t.spacing(2)},"middle"===e.variant&&"vertical"===e.orientation&&{marginTop:t.spacing(1),marginBottom:t.spacing(1)},"vertical"===e.orientation&&{height:"100%",borderBottomWidth:0,borderRightWidth:"thin"},e.flexItem&&{alignSelf:"stretch",height:"auto"})),(({theme:t,ownerState:e})=>(0,i.Z)({},e.children&&{display:"flex",whiteSpace:"nowrap",textAlign:"center",border:0,"&::before, &::after":{position:"relative",width:"100%",borderTop:`thin solid ${t.palette.divider}`,top:"50%",content:'""',transform:"translateY(50%)"}})),(({theme:t,ownerState:e})=>(0,i.Z)({},e.children&&"vertical"===e.orientation&&{flexDirection:"column","&::before, &::after":{height:"100%",top:"0%",left:"50%",borderTop:0,borderLeft:`thin solid ${t.palette.divider}`,transform:"translateX(0%)"}})),(({ownerState:t})=>(0,i.Z)({},"right"===t.textAlign&&"vertical"!==t.orientation&&{"&::before":{width:"90%"},"&::after":{width:"10%"}},"left"===t.textAlign&&"vertical"!==t.orientation&&{"&::before":{width:"10%"},"&::after":{width:"90%"}}))),v=(0,c.ZP)("span",{name:"MuiDivider",slot:"Wrapper",overridesResolver:(t,e)=>{const{ownerState:r}=t;return[e.wrapper,"vertical"===r.orientation&&e.wrapperVertical]}})((({theme:t,ownerState:e})=>(0,i.Z)({display:"inline-block",paddingLeft:`calc(${t.spacing(1)} * 1.2)`,paddingRight:`calc(${t.spacing(1)} * 1.2)`},"vertical"===e.orientation&&{paddingTop:`calc(${t.spacing(1)} * 1.2)`,paddingBottom:`calc(${t.spacing(1)} * 1.2)`})));var f=o.forwardRef((function(t,e){const r=(0,d.Z)({props:t,name:"MuiDivider"}),{absolute:o=!1,children:l,className:c,component:u=(l?"div":"hr"),flexItem:f=!1,light:x=!1,orientation:w="horizontal",role:Z=("hr"!==u?"separator":void 0),textAlign:b="center",variant:S="fullWidth"}=r,$=(0,n.Z)(r,g),y=(0,i.Z)({},r,{absolute:o,component:u,flexItem:f,light:x,orientation:w,role:Z,textAlign:b,variant:S}),M=(t=>{const{absolute:e,children:r,classes:n,flexItem:i,light:o,orientation:a,textAlign:l,variant:c}=t,d={root:["root",e&&"absolute",c,o&&"light","vertical"===a&&"vertical",i&&"flexItem",r&&"withChildren",r&&"vertical"===a&&"withChildrenVertical","right"===l&&"vertical"!==a&&"textAlignRight","left"===l&&"vertical"!==a&&"textAlignLeft"],wrapper:["wrapper","vertical"===a&&"wrapperVertical"]};return(0,s.Z)(d,p,n)})(y);return(0,m.jsx)(h,(0,i.Z)({as:u,className:(0,a.Z)(M.root,c),role:Z,ref:e,ownerState:y},$,{children:l?(0,m.jsx)(v,{className:M.wrapper,ownerState:y,children:l}):null}))}))},4384:function(t,e,r){r.d(e,{ZP:function(){return S}});var n=r(1244),i=r(2685),o=r(7378),a=r(8944),s=r(2142),l=r(3772),c=r(3892),d=r(2709),u=r(2399);var p=o.createContext(),m=r(765);function g(t){return(0,m.Z)("MuiGrid",t)}const h=["auto",!0,1,2,3,4,5,6,7,8,9,10,11,12];var v=(0,r(2897).Z)("MuiGrid",["root","container","item","zeroMinWidth",...[0,1,2,3,4,5,6,7,8,9,10].map((t=>`spacing-xs-${t}`)),...["column-reverse","column","row-reverse","row"].map((t=>`direction-xs-${t}`)),...["nowrap","wrap-reverse","wrap"].map((t=>`wrap-xs-${t}`)),...h.map((t=>`grid-xs-${t}`)),...h.map((t=>`grid-sm-${t}`)),...h.map((t=>`grid-md-${t}`)),...h.map((t=>`grid-lg-${t}`)),...h.map((t=>`grid-xl-${t}`))]),f=r(4246);const x=["className","columns","columnSpacing","component","container","direction","item","lg","md","rowSpacing","sm","spacing","wrap","xl","xs","zeroMinWidth"];function w(t){const e=parseFloat(t);return`${e}${String(t).replace(String(e),"")||"px"}`}function Z(t,e,r={}){if(!e||!t||t<=0)return[];if("string"==typeof t&&!Number.isNaN(Number(t))||"number"==typeof t)return[r[`spacing-xs-${String(t)}`]||`spacing-xs-${String(t)}`];const{xs:n,sm:i,md:o,lg:a,xl:s}=t;return[Number(n)>0&&(r[`spacing-xs-${String(n)}`]||`spacing-xs-${String(n)}`),Number(i)>0&&(r[`spacing-sm-${String(i)}`]||`spacing-sm-${String(i)}`),Number(o)>0&&(r[`spacing-md-${String(o)}`]||`spacing-md-${String(o)}`),Number(a)>0&&(r[`spacing-lg-${String(a)}`]||`spacing-lg-${String(a)}`),Number(s)>0&&(r[`spacing-xl-${String(s)}`]||`spacing-xl-${String(s)}`)]}const b=(0,d.ZP)("div",{name:"MuiGrid",slot:"Root",overridesResolver:(t,e)=>{const{container:r,direction:n,item:i,lg:o,md:a,sm:s,spacing:l,wrap:c,xl:d,xs:u,zeroMinWidth:p}=t.ownerState;return[e.root,r&&e.container,i&&e.item,p&&e.zeroMinWidth,...Z(l,r,e),"row"!==n&&e[`direction-xs-${String(n)}`],"wrap"!==c&&e[`wrap-xs-${String(c)}`],!1!==u&&e[`grid-xs-${String(u)}`],!1!==s&&e[`grid-sm-${String(s)}`],!1!==a&&e[`grid-md-${String(a)}`],!1!==o&&e[`grid-lg-${String(o)}`],!1!==d&&e[`grid-xl-${String(d)}`]]}})((({ownerState:t})=>(0,i.Z)({boxSizing:"border-box"},t.container&&{display:"flex",flexWrap:"wrap",width:"100%"},t.item&&{margin:0},t.zeroMinWidth&&{minWidth:0},"wrap"!==t.wrap&&{flexWrap:t.wrap})),(function({theme:t,ownerState:e}){const r=(0,s.P$)({values:e.direction,breakpoints:t.breakpoints.values});return(0,s.k9)({theme:t},r,(t=>{const e={flexDirection:t};return 0===t.indexOf("column")&&(e[`& > .${v.item}`]={maxWidth:"none"}),e}))}),(function({theme:t,ownerState:e}){const{container:r,rowSpacing:n}=e;let i={};if(r&&0!==n){const e=(0,s.P$)({values:n,breakpoints:t.breakpoints.values});i=(0,s.k9)({theme:t},e,(e=>{const r=t.spacing(e);return"0px"!==r?{marginTop:`-${w(r)}`,[`& > .${v.item}`]:{paddingTop:w(r)}}:{}}))}return i}),(function({theme:t,ownerState:e}){const{container:r,columnSpacing:n}=e;let i={};if(r&&0!==n){const e=(0,s.P$)({values:n,breakpoints:t.breakpoints.values});i=(0,s.k9)({theme:t},e,(e=>{const r=t.spacing(e);return"0px"!==r?{width:`calc(100% + ${w(r)})`,marginLeft:`-${w(r)}`,[`& > .${v.item}`]:{paddingLeft:w(r)}}:{}}))}return i}),(function({theme:t,ownerState:e}){let r;return t.breakpoints.keys.reduce(((n,o)=>{let a={};if(e[o]&&(r=e[o]),!r)return n;if(!0===r)a={flexBasis:0,flexGrow:1,maxWidth:"100%"};else if("auto"===r)a={flexBasis:"auto",flexGrow:0,flexShrink:0,maxWidth:"none",width:"auto"};else{const l=(0,s.P$)({values:e.columns,breakpoints:t.breakpoints.values}),c="object"==typeof l?l[o]:l;if(null==c)return n;const d=Math.round(r/c*1e8)/1e6+"%";let u={};if(e.container&&e.item&&0!==e.columnSpacing){const r=t.spacing(e.columnSpacing);if("0px"!==r){const t=`calc(${d} + ${w(r)})`;u={flexBasis:t,maxWidth:t}}}a=(0,i.Z)({flexBasis:d,flexGrow:0,maxWidth:d},u)}return 0===t.breakpoints.values[o]?Object.assign(n,a):n[t.breakpoints.up(o)]=a,n}),{})}));var S=o.forwardRef((function(t,e){const r=(0,u.Z)({props:t,name:"MuiGrid"}),s=(0,l.Z)(r),{className:d,columns:m,columnSpacing:h,component:v="div",container:w=!1,direction:S="row",item:$=!1,lg:y=!1,md:M=!1,rowSpacing:W,sm:N=!1,spacing:k=0,wrap:P="wrap",xl:R=!1,xs:C=!1,zeroMinWidth:B=!1}=s,A=(0,n.Z)(s,x),j=W||k,L=h||k,T=o.useContext(p),z=w?m||12:T,I=(0,i.Z)({},s,{columns:z,container:w,direction:S,item:$,lg:y,md:M,sm:N,rowSpacing:j,columnSpacing:L,wrap:P,xl:R,xs:C,zeroMinWidth:B}),q=(t=>{const{classes:e,container:r,direction:n,item:i,lg:o,md:a,sm:s,spacing:l,wrap:d,xl:u,xs:p,zeroMinWidth:m}=t,h={root:["root",r&&"container",i&&"item",m&&"zeroMinWidth",...Z(l,r),"row"!==n&&`direction-xs-${String(n)}`,"wrap"!==d&&`wrap-xs-${String(d)}`,!1!==p&&`grid-xs-${String(p)}`,!1!==s&&`grid-sm-${String(s)}`,!1!==a&&`grid-md-${String(a)}`,!1!==o&&`grid-lg-${String(o)}`,!1!==u&&`grid-xl-${String(u)}`]};return(0,c.Z)(h,g,e)})(I);return(0,f.jsx)(p.Provider,{value:z,children:(0,f.jsx)(b,(0,i.Z)({ownerState:I,className:(0,a.Z)(q.root,d),as:v,ref:e},A))})}))},2750:function(t,e,r){r.d(e,{Z:function(){return w}});var n=r(1244),i=r(2685),o=r(7378),a=r(8944),s=r(3772),l=r(3892),c=r(2709),d=r(2399),u=r(1640),p=r(765);function m(t){return(0,p.Z)("MuiTypography",t)}(0,r(2897).Z)("MuiTypography",["root","h1","h2","h3","h4","h5","h6","subtitle1","subtitle2","body1","body2","inherit","button","caption","overline","alignLeft","alignRight","alignCenter","alignJustify","noWrap","gutterBottom","paragraph"]);var g=r(4246);const h=["align","className","component","gutterBottom","noWrap","paragraph","variant","variantMapping"],v=(0,c.ZP)("span",{name:"MuiTypography",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:r}=t;return[e.root,r.variant&&e[r.variant],"inherit"!==r.align&&e[`align${(0,u.Z)(r.align)}`],r.noWrap&&e.noWrap,r.gutterBottom&&e.gutterBottom,r.paragraph&&e.paragraph]}})((({theme:t,ownerState:e})=>(0,i.Z)({margin:0},e.variant&&t.typography[e.variant],"inherit"!==e.align&&{textAlign:e.align},e.noWrap&&{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},e.gutterBottom&&{marginBottom:"0.35em"},e.paragraph&&{marginBottom:16}))),f={h1:"h1",h2:"h2",h3:"h3",h4:"h4",h5:"h5",h6:"h6",subtitle1:"h6",subtitle2:"h6",body1:"p",body2:"p",inherit:"p"},x={primary:"primary.main",textPrimary:"text.primary",secondary:"secondary.main",textSecondary:"text.secondary",error:"error.main"};var w=o.forwardRef((function(t,e){const r=(0,d.Z)({props:t,name:"MuiTypography"}),o=(t=>x[t]||t)(r.color),c=(0,s.Z)((0,i.Z)({},r,{color:o})),{align:p="inherit",className:w,component:Z,gutterBottom:b=!1,noWrap:S=!1,paragraph:$=!1,variant:y="body1",variantMapping:M=f}=c,W=(0,n.Z)(c,h),N=(0,i.Z)({},c,{align:p,color:o,className:w,component:Z,gutterBottom:b,noWrap:S,paragraph:$,variant:y,variantMapping:M}),k=Z||($?"p":M[y]||f[y])||"span",P=(t=>{const{align:e,gutterBottom:r,noWrap:n,paragraph:i,variant:o,classes:a}=t,s={root:["root",o,"inherit"!==t.align&&`align${(0,u.Z)(e)}`,r&&"gutterBottom",n&&"noWrap",i&&"paragraph"]};return(0,l.Z)(s,m,a)})(N);return(0,g.jsx)(v,(0,i.Z)({as:k,ref:e,ownerState:N,className:(0,a.Z)(P.root,w)},W))}))},4776:function(t,e,r){r.d(e,{Z:function(){return o}});r(7378);var n=r(6206),i=r(3126);function o(){return(0,n.Z)(i.Z)}},8181:function(t,e,r){var n;r.d(e,{Z:function(){return u}});var i=r(7378),o=r(1352),a=r(9267),s=r(6758);function l(t,e,r,n,o){const a="undefined"!=typeof window&&void 0!==window.matchMedia,[l,c]=i.useState((()=>o&&a?r(t).matches:n?n(t).matches:e));return(0,s.Z)((()=>{let e=!0;if(!a)return;const n=r(t),i=()=>{e&&c(n.matches)};return i(),n.addListener(i),()=>{e=!1,n.removeListener(i)}}),[t,r,a]),l}const c=(n||(n=r.t(i,2))).useSyncExternalStore;function d(t,e,r,n){const o=i.useCallback((()=>e),[e]),a=i.useMemo((()=>{if(null!==n){const{matches:e}=n(t);return()=>e}return o}),[o,t,n]),[s,l]=i.useMemo((()=>{if(null===r)return[o,()=>()=>{}];const e=r(t);return[()=>e.matches,t=>(e.addListener(t),()=>{e.removeListener(t)})]}),[o,r,t]);return c(l,s,a)}function u(t,e={}){const r=(0,o.Z)(),n="undefined"!=typeof window&&void 0!==window.matchMedia,{defaultMatches:i=!1,matchMedia:s=(n?window.matchMedia:null),ssrMatchMedia:u=null,noSsr:p}=(0,a.Z)({name:"MuiUseMediaQuery",props:e,theme:r});let m="function"==typeof t?t(r):t;m=m.replace(/^@media( ?)/m,"");return(void 0!==c?d:l)(m,i,s,u,p)}},1640:function(t,e,r){var n=r(9490);e.Z=n.Z},6758:function(t,e,r){var n=r(8030);e.Z=n.Z},9703:function(t,e,r){r.d(e,{Z:function(){return m}});var n=r(7378),i=r(2685),o=r(5491),a=r(2704);var s="function"==typeof Symbol&&Symbol.for?Symbol.for("mui.nested"):"__THEME_NESTED__",l=r(4246);var c=function(t){const{children:e,theme:r}=t,c=(0,a.Z)(),d=n.useMemo((()=>{const t=null===c?r:function(t,e){if("function"==typeof e)return e(t);return(0,i.Z)({},t,e)}(c,r);return null!=t&&(t[s]=null!==c),t}),[r,c]);return(0,l.jsx)(o.Z.Provider,{value:d,children:e})},d=r(764),u=r(6206);function p(t){const e=(0,u.Z)();return(0,l.jsx)(d.T.Provider,{value:"object"==typeof e?e:{},children:t.children})}var m=function(t){const{children:e,theme:r}=t;return(0,l.jsx)(c,{theme:r,children:(0,l.jsx)(p,{children:e})})}},3772:function(t,e,r){r.d(e,{Z:function(){return l}});var n=r(2685),i=r(1244),o=r(3143),a=r(7351);const s=["sx"];function l(t){const{sx:e}=t,r=(0,i.Z)(t,s),{systemProps:l,otherProps:c}=(t=>{const e={systemProps:{},otherProps:{}};return Object.keys(t).forEach((r=>{a.Gc[r]?e.systemProps[r]=t[r]:e.otherProps[r]=t[r]})),e})(r);let d;return d=Array.isArray(e)?[l,...e]:"function"==typeof e?(...t)=>{const r=e(...t);return(0,o.P)(r)?(0,n.Z)({},l,r):l}:(0,n.Z)({},l,e),(0,n.Z)({},c,{sx:d})}},8745:function(t,e,r){const n=(0,r(8551).ZP)();e.Z=n},8030:function(t,e,r){var n=r(7378);const i="undefined"!=typeof window?n.useLayoutEffect:n.useEffect;e.Z=i}}]);