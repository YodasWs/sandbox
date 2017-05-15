// ECMAScript 6
Number.parseInt=Number.parseInt||parseInt;
Number.parseFloat=Number.parseFloat||parseFloat;
Number.isNaN=Number.isNaN||function(v){return typeof v==='number'&&isNaN(v)};
Math.sign=Math.sign||function(x){x=+x;if(x===0||isNaN(x)){return x}return x>0?1:-1};
Number.isFinite=Number.isFinite||function(v){return typeof v==='number'&&isFinite(v)};
Number.isInteger=Number.isInteger||function(v){return Number.isFinite(v)&&Math.floor(v)===v};
String.prototype.startsWith=String.prototype.startsWith||function(s,p){p=p||0;return this.indexOf(s,p)===p};

// Simplify DOM Tasks
Element.prototype.prependChild=function(ele){if(this.childNodes.length)this.insertBefore(ele,this.childNodes[0]);else this.appendChild(ele)};
SVGElement.prototype.moveTo=function(x,y){this.setAttribute("x",x);this.setAttribute("y",y)};
SVGElement.prototype.moveBy=function(dx,dy){this.setAttribute("x",Number.parseFloat(this.getAttribute("x"))+dx);this.setAttribute("y",Number.parseFloat(this.getAttribute("y"))+dy)};
SVGTextPositioningElement.prototype.setText=function(txt){this.appendChild(document.createTextNode(txt))};

// Update trim to PHP functionality
String.prototype.trim=function(c){c=c||"\\s\uFEFF\xA0";return this.replace(new RegExp('^['+c+']+|['+c+']+$','g'),'')};

// RFC 3986
function encodeUri(s){return encodeURIComponent(s).replace(/[!'()*]/g,function(c){return '%'+c.charCodeAt(0).toString(16)})};
