"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[848],{5318:function(e,t,a){a.d(t,{Zo:function(){return p},kt:function(){return m}});var r=a(7378);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function u(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var c=r.createContext({}),i=function(e){var t=r.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):o(o({},t),e)),a},p=function(e){var t=i(e.components);return r.createElement(c.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,c=e.parentName,p=u(e,["components","mdxType","originalType","parentName"]),d=i(a),m=n,b=d["".concat(c,".").concat(m)]||d[m]||s[m]||l;return a?r.createElement(b,o(o({ref:t},p),{},{components:a})):r.createElement(b,o({ref:t},p))}));function m(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,o=new Array(l);o[0]=d;var u={};for(var c in t)hasOwnProperty.call(t,c)&&(u[c]=t[c]);u.originalType=e,u.mdxType="string"==typeof e?e:n,o[1]=u;for(var i=2;i<l;i++)o[i]=a[i];return r.createElement.apply(null,o)}return r.createElement.apply(null,a)}d.displayName="MDXCreateElement"},6243:function(e,t,a){a.d(t,{Z:function(){return o}});var r=a(7378),n=a(8944),l="tabItem_lLGn";function o(e){var t=e.children,a=e.hidden,o=e.className;return r.createElement("div",{role:"tabpanel",className:(0,n.Z)(l,o),hidden:a},t)}},637:function(e,t,a){a.d(t,{Z:function(){return m}});var r=a(2685),n=a(7378),l=a(6457),o=a(784),u=a(9947),c=a(3457),i=a(8944),p="tabList_lSCs",s="tabItem_WhCL";function d(e){var t,a,l,d=e.lazy,m=e.block,b=e.defaultValue,v=e.values,f=e.groupId,y=e.className,k=n.Children.map(e.children,(function(e){if((0,n.isValidElement)(e)&&void 0!==e.props.value)return e;throw new Error("Docusaurus error: Bad <Tabs> child <"+("string"==typeof e.type?e.type:e.type.name)+'>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.')})),h=null!=v?v:k.map((function(e){var t=e.props;return{value:t.value,label:t.label,attributes:t.attributes}})),T=(0,o.l)(h,(function(e,t){return e.value===t.value}));if(T.length>0)throw new Error('Docusaurus error: Duplicate values "'+T.map((function(e){return e.value})).join(", ")+'" found in <Tabs>. Every value needs to be unique.');var g=null===b?b:null!=(t=null!=b?b:null==(a=k.find((function(e){return e.props.default})))?void 0:a.props.value)?t:null==(l=k[0])?void 0:l.props.value;if(null!==g&&!h.some((function(e){return e.value===g})))throw new Error('Docusaurus error: The <Tabs> has a defaultValue "'+g+'" but none of its children has the corresponding value. Available values are: '+h.map((function(e){return e.value})).join(", ")+". If you intend to show no default tab, use defaultValue={null} instead.");var N=(0,u.U)(),I=N.tabGroupChoices,O=N.setTabGroupChoices,w=(0,n.useState)(g),x=w[0],C=w[1],Z=[],P=(0,c.o5)().blockElementScrollPositionUntilNextRender;if(null!=f){var E=I[f];null!=E&&E!==x&&h.some((function(e){return e.value===E}))&&C(E)}var L=function(e){var t=e.currentTarget,a=Z.indexOf(t),r=h[a].value;r!==x&&(P(t),C(r),null!=f&&O(f,r))},j=function(e){var t,a=null;switch(e.key){case"ArrowRight":var r=Z.indexOf(e.currentTarget)+1;a=Z[r]||Z[0];break;case"ArrowLeft":var n=Z.indexOf(e.currentTarget)-1;a=Z[n]||Z[Z.length-1]}null==(t=a)||t.focus()};return n.createElement("div",{className:(0,i.Z)("tabs-container",p)},n.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":m},y)},h.map((function(e){var t=e.value,a=e.label,l=e.attributes;return n.createElement("li",(0,r.Z)({role:"tab",tabIndex:x===t?0:-1,"aria-selected":x===t,key:t,ref:function(e){return Z.push(e)},onKeyDown:j,onFocus:L,onClick:L},l,{className:(0,i.Z)("tabs__item",s,null==l?void 0:l.className,{"tabs__item--active":x===t})}),null!=a?a:t)}))),d?(0,n.cloneElement)(k.filter((function(e){return e.props.value===x}))[0],{className:"margin-top--md"}):n.createElement("div",{className:"margin-top--md"},k.map((function(e,t){return(0,n.cloneElement)(e,{key:t,hidden:e.props.value!==x})}))))}function m(e){var t=(0,l.Z)();return n.createElement(d,(0,r.Z)({key:String(t)},e))}},7163:function(e,t,a){a.r(t),a.d(t,{assets:function(){return d},contentTitle:function(){return p},default:function(){return v},frontMatter:function(){return i},metadata:function(){return s},toc:function(){return m}});var r=a(2685),n=a(1244),l=(a(7378),a(5318)),o=a(637),u=a(6243),c=["components"],i={sidebar_position:20,title:"Oracles"},p=void 0,s={unversionedId:"developers/oracle",id:"developers/oracle",title:"Oracles",description:"Create",source:"@site/docs/developers/oracle.mdx",sourceDirName:"developers",slug:"/developers/oracle",permalink:"/developers/oracle",draft:!1,tags:[],version:"current",sidebarPosition:20,frontMatter:{sidebar_position:20,title:"Oracles"},sidebar:"tutorialSidebar",previous:{title:"Oracle Queue",permalink:"/developers/queue"},next:{title:"Data Feeds",permalink:"/developers/feed"}},d={},m=[{value:"Create",id:"create",level:2},{value:"Oracle Deposit",id:"oracle-deposit",level:2},{value:"Oracle Heartbeat",id:"oracle-heartbeat",level:2},{value:"Save Result",id:"save-result",level:2},{value:"Oracle Withdraw",id:"oracle-withdraw",level:2}],b={toc:m};function v(e){var t=e.components,a=(0,n.Z)(e,c);return(0,l.kt)("wrapper",(0,r.Z)({},b,a,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("h2",{id:"create"},"Create"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"oracleInit"))),(0,l.kt)(o.Z,{mdxType:"Tabs"},(0,l.kt)(u.Z,{value:"Typescript",label:"Typescript",default:!0,mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-ts"},"// Typescript code\n"))),(0,l.kt)(u.Z,{value:"Python",label:"Python",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-python"},"# Python code\n"))),(0,l.kt)(u.Z,{value:"CLI",label:"CLI",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"# CLI command\n")))),(0,l.kt)("h2",{id:"oracle-deposit"},"Oracle Deposit"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"tokenTransfer"))),(0,l.kt)(o.Z,{mdxType:"Tabs"},(0,l.kt)(u.Z,{value:"Typescript",label:"Typescript",default:!0,mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-ts"},"// Typescript code\n"))),(0,l.kt)(u.Z,{value:"Python",label:"Python",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-python"},"# Python code\n"))),(0,l.kt)(u.Z,{value:"CLI",label:"CLI",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"# CLI command\n")))),(0,l.kt)("h2",{id:"oracle-heartbeat"},"Oracle Heartbeat"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"oracleHeartbeat"))),(0,l.kt)(o.Z,{mdxType:"Tabs"},(0,l.kt)(u.Z,{value:"Typescript",label:"Typescript",default:!0,mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-ts"},"// Typescript code\n"))),(0,l.kt)(u.Z,{value:"Python",label:"Python",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-python"},"# Python code\n"))),(0,l.kt)(u.Z,{value:"CLI",label:"CLI",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"# CLI command\n")))),(0,l.kt)("h2",{id:"save-result"},"Save Result"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"aggregatorSaveResult"))),(0,l.kt)(o.Z,{mdxType:"Tabs"},(0,l.kt)(u.Z,{value:"Typescript",label:"Typescript",default:!0,mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-ts"},"// Typescript code\n"))),(0,l.kt)(u.Z,{value:"Python",label:"Python",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-python"},"# Python code\n"))),(0,l.kt)(u.Z,{value:"CLI",label:"CLI",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"# CLI command\n")))),(0,l.kt)("h2",{id:"oracle-withdraw"},"Oracle Withdraw"),(0,l.kt)("ul",null,(0,l.kt)("li",{parentName:"ul"},(0,l.kt)("inlineCode",{parentName:"li"},"oracleWithdraw"))),(0,l.kt)(o.Z,{mdxType:"Tabs"},(0,l.kt)(u.Z,{value:"Typescript",label:"Typescript",default:!0,mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-ts"},"// Typescript code\n"))),(0,l.kt)(u.Z,{value:"Python",label:"Python",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-python"},"# Python code\n"))),(0,l.kt)(u.Z,{value:"CLI",label:"CLI",mdxType:"TabItem"},(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-bash"},"# CLI command\n")))))}v.isMDXComponent=!0}}]);