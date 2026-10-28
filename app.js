/* ===== CẤU HÌNH TẬP TRUNG (sửa tại đây hoặc data/products.json) ===== */
const FALLBACK = {
  config: { brandName:"Dừa Dòn Thành Nhân", ownerName:"[TÊN CHỦ SỞ HỮU / ĐƠN VỊ]", phone:"0905876567", zalo:"0905876567",
    address:"416/2 Nguyễn Trãi, Nghĩa Lộ, Quảng Ngãi", email:"[EMAIL LIÊN HỆ]", facebookUrl:"[LINK FANPAGE FACEBOOK]", shipFee:25000 },
  variants:[
    {id:"DD-250",label:"Gói 250gr",weight:"250gr",price:32000},
    {id:"DD-500",label:"Gói 500gr",weight:"500gr",price:60000}],
  related:[
    {id:"DD-500",name:"Dừa Dòn Thành Nhân – Gói Tiết Kiệm 500gr",cat:"Món Giòn",price:60000,desc:"Gói lớn cho gia đình, quán chè, kem, sữa chua."},
    {id:"DD-250",name:"Dừa Dòn Thành Nhân – Gói Tiện Lợi 250gr",cat:"Món Giòn",price:32000,desc:"Gói nhỏ vừa ăn, tiện biếu tặng và thử vị."},
    {id:"BDN",name:"Bánh Dừa Nướng Giòn Thơm",cat:"Món Giòn",price:null,desc:"Dữ liệu mẫu – liên hệ để biết giá."},
    {id:"BRG",name:"Bắp Rang Giòn Mặn Ngọt Cay Nhẹ",cat:"Món Giòn",price:null,desc:"Dữ liệu mẫu – liên hệ để biết giá."},
    {id:"KMS",name:"Khoai Môn Sấy Giòn",cat:"Món Giòn",price:55000,desc:"Dữ liệu mẫu – có thể sửa giá."},
    {id:"CSD",name:"Chuối Sấy Dẻo Nguyên Chất",cat:"Trái Cây Sấy",price:25000,desc:"Dữ liệu mẫu – có thể sửa giá."}]
};
const IMGS=[
 {src:"assets/images/hero-dua-don-1.jpg",alt:"Gói Dừa Dòn Thành Nhân"},
 {src:"assets/images/can-canh-dua-say.jpg",alt:"Cận cảnh dừa sấy vàng giòn"},
 {src:"assets/images/dua-don-topping.jpg",alt:"Dừa dòn làm topping"},
 {src:"assets/images/goi-250g-500g.jpg",alt:"Quy cách gói 250gr và 500gr"}];

let D=FALLBACK, C=D.config, variant=null, qty=1, cart=[], imgIdx=0, cat="all";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>n.toLocaleString("vi-VN")+"₫";
const isPH=v=>!v||/^\[.*\]$/.test(v);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function ph(label){ // ảnh dự phòng SVG
  const s=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#F3ECE0"/><circle cx="400" cy="360" r="170" fill="#D4882A" opacity=".85"/><circle cx="400" cy="360" r="110" fill="#FCF9F2"/><text x="400" y="610" font-family="Georgia,serif" font-size="40" font-weight="700" fill="#6E3B16" text-anchor="middle">${label}</text><text x="400" y="660" font-family="sans-serif" font-size="24" fill="#6C5E52" text-anchor="middle">Chép ảnh thật vào assets/images/</text></svg>`;
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s);
}
function safeImg(el,label){el.onerror=()=>{el.onerror=null;el.src=ph(label)}}
let tt; function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),2600)}
function modal(html){$("#mBody").innerHTML=html;$("#modal").classList.add("on")}
const closeModal=()=>$("#modal").classList.remove("on");

/* ===== Nạp dữ liệu kép: fetch JSON, lỗi/file:// thì dùng FALLBACK ===== */
async function load(){
  if(location.protocol!=="file:"){
    try{const r=await fetch("data/products.json");if(r.ok){D=await r.json();}}catch(e){}
  }
  C=D.config;
}

/* ===== Liên hệ (không dùng số cũ; trường giữ chỗ -> modal) ===== */
function contact(type){
  if(type==="call"){ if(isPH(C.phone)) return modal("<h3>Chưa có số điện thoại</h3><p>Chủ shop chưa cập nhật số hotline. Vui lòng quay lại sau hoặc để lại lời nhắn.</p>"); location.href="tel:"+C.phone.replace(/\D/g,""); }
  if(type==="zalo"){ if(isPH(C.zalo)) return modal("<h3>Chưa có số Zalo</h3><p>Chủ shop chưa cập nhật Zalo.</p>"); window.open("https://zalo.me/"+C.zalo.replace(/\D/g,""),"_blank"); }
  if(type==="fb"){ if(isPH(C.facebookUrl)) return modal("<h3>Chưa có Fanpage</h3><p>Chủ shop chưa cập nhật liên kết Facebook. Bạn có thể liên hệ qua Zalo.</p>"); window.open(C.facebookUrl,"_blank"); }
}
function bindCfg(){ $$("[data-cfg]").forEach(e=>e.textContent=C[e.dataset.cfg]||""); }

/* ===== Gallery & Lightbox ===== */
function showImg(i){
  imgIdx=(i+IMGS.length)%IMGS.length; const im=IMGS[imgIdx], big=$("#bigImg");
  big.src=im.src; big.alt=im.alt; safeImg(big,im.alt);
  $$("#thumbs button").forEach((b,k)=>b.classList.toggle("on",k===imgIdx));
}
function initGallery(){
  $("#thumbs").innerHTML=IMGS.map((im,i)=>`<button aria-label="${esc(im.alt)}"><img src="${im.src}" alt="${esc(im.alt)}"></button>`).join("");
  $$("#thumbs button").forEach((b,i)=>{safeImg(b.firstChild,IMGS[i].alt);b.onclick=()=>showImg(i)});
  $("#mainImg").onclick=()=>openLb(imgIdx); showImg(0);
}
function openLb(i){imgIdx=i;lbSet();$("#lightbox").classList.add("on")}
function lbSet(){imgIdx=(imgIdx+IMGS.length)%IMGS.length;const l=$("#lbImg");l.src=IMGS[imgIdx].src;l.alt=IMGS[imgIdx].alt;safeImg(l,IMGS[imgIdx].alt)}

/* ===== Biến thể & số lượng ===== */
function renderVariants(){
  $("#variants").innerHTML=D.variants.map(v=>`<button class="var${variant&&variant.id===v.id?" on":""}" data-id="${v.id}">${v.label}<br><small>${money(v.price)}</small></button>`).join("");
  $$(".var").forEach(b=>b.onclick=()=>{variant=D.variants.find(v=>v.id===b.dataset.id);renderVariants();updateInfo()});
}
function updateInfo(){
  const ps=D.variants.map(v=>v.price);
  $("#price").textContent=variant?money(variant.price):money(Math.min(...ps))+" – "+money(Math.max(...ps));
  $("#sku").textContent=variant?"(Mã: "+variant.id+" • "+variant.weight+")":"";
  $("#specW").textContent=variant?variant.label:D.variants.map(v=>v.label).join(" / ");
  $("#subtotal").textContent=variant?money(variant.price*qty):"Chọn quy cách";
}
function setQty(n){qty=Math.max(1,Math.min(999,parseInt(n)||1));$("#qty").value=qty;updateInfo()}

/* ===== Giỏ hàng ===== */
function saveCart(){try{localStorage.setItem("tn_cart",JSON.stringify(cart))}catch(e){}}
function addItem(id,name,price,n){
  const it=cart.find(c=>c.id===id); if(it)it.qty+=n; else cart.push({id,name,price,qty:n});
  saveCart();renderCart();
}
function totals(){const s=cart.reduce((a,c)=>a+c.price*c.qty,0);const ship=cart.length?C.shipFee:0;return{s,ship,t:s+ship}}
function renderCart(){
  $("#cartCount").textContent=cart.reduce((a,c)=>a+c.qty,0);
  $("#cartItems").innerHTML=cart.length?cart.map((c,i)=>`<div class="ci"><div><b>${esc(c.name)}</b><br><small>${money(c.price)}</small></div>
   <div class="qty"><button data-a="-" data-i="${i}">−</button><input value="${c.qty}" readonly><button data-a="+" data-i="${i}">+</button></div>
   <button class="rm" data-a="x" data-i="${i}">Xóa</button><b style="text-align:right">${money(c.price*c.qty)}</b></div>`).join(""):"<p class='muted'>Giỏ hàng trống. Chọn quy cách và bấm Thêm Vào Giỏ Hàng.</p>";
  $$("#cartItems [data-a]").forEach(b=>b.onclick=()=>{const i=+b.dataset.i,a=b.dataset.a;
    if(a==="+")cart[i].qty++;else if(a==="-")cart[i].qty=Math.max(1,cart[i].qty-1);else cart.splice(i,1);saveCart();renderCart()});
  const t=totals();$("#cSub").textContent=money(t.s);$("#cShip").textContent=money(t.ship);$("#cTot").textContent=money(t.t);
}
const cartOpen=o=>{$("#drawer").classList.toggle("on",o);$("#overlay").classList.toggle("on",o)};

function orderText(f,list,tot){
  const lines=list.map((c,i)=>`${i+1}. ${c.name} x${c.qty} = ${money(c.price*c.qty)}`).join("\n");
  return `ĐƠN HÀNG – ${C.brandName}\n${lines}\nTạm tính: ${money(tot.s)}\nPhí ship (tạm tính): ${money(tot.ship)}\nTỔNG: ${money(tot.t)}\n`+
   (f?`\nNgười nhận: ${f.name}\nSĐT: ${f.phone}\nĐịa chỉ: ${f.addr}\nGhi chú: ${f.note||"–"}`:"");
}
async function sendZalo(text){
  try{await navigator.clipboard.writeText(text)}catch(e){const t=document.createElement("textarea");t.value=text;document.body.appendChild(t);t.select();try{document.execCommand("copy")}catch(_){}t.remove()}
  if(isPH(C.zalo)) return modal("<h3>Đơn hàng đã được sao chép</h3><p>Chủ shop chưa cập nhật Zalo. Nội dung đơn đã nằm trong bộ nhớ tạm, bạn hãy dán gửi cho shop.</p>");
  toast("Đã sao chép nội dung đơn, đang mở Zalo...");
  setTimeout(()=>window.open("https://zalo.me/"+C.zalo.replace(/\D/g,""),"_blank"),600);
}

/* ===== Sản phẩm gợi ý ===== */
function renderRelated(){
  const q=$("#search").value.trim().toLowerCase();
  const list=D.related.filter(p=>(cat==="all"||p.cat===cat)&&p.name.toLowerCase().includes(q));
  $("#related").innerHTML=list.length?list.map(p=>`<article class="card pcard"><img data-n="${esc(p.name)}" src="assets/images/${p.id}.jpg" alt="${esc(p.name)}" loading="lazy">
   <h3>${esc(p.name)}</h3><p class="muted small">${esc(p.desc)}</p><p class="pp">${p.price?money(p.price):"Liên hệ để biết giá"}</p>
   <div class="row"><button class="btn ghost" data-q="${p.id}">Xem nhanh</button><button class="btn primary" data-add="${p.id}">Thêm vào giỏ</button></div></article>`).join(""):"<p>Không tìm thấy sản phẩm phù hợp.</p>";
  $$("#related img").forEach(i=>safeImg(i,i.dataset.n));
  $$("[data-q]").forEach(b=>b.onclick=()=>{const p=D.related.find(x=>x.id===b.dataset.q);
    modal(`<h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p><p class="pp"><b>${p.price?money(p.price):"Liên hệ để biết giá"}</b></p><button class="btn primary" data-add="${p.id}" id="qvAdd">Thêm vào giỏ</button>`);
    $("#qvAdd").onclick=()=>{relAdd(p.id);closeModal()}});
  $$("#related [data-add]").forEach(b=>b.onclick=()=>relAdd(b.dataset.add));
}
function relAdd(id){const p=D.related.find(x=>x.id===id);
  if(!p.price) return modal(`<h3>${esc(p.name)}</h3><p>Sản phẩm này chưa có giá niêm yết. Vui lòng liên hệ shop qua Zalo để được báo giá.</p><button class="btn zalo" onclick="contact('zalo')">Nhắn Zalo</button>`);
  addItem(p.id,p.name,p.price,1);toast("Đã thêm vào giỏ hàng");}

/* ===== Khởi tạo ===== */
(async function(){
  await load();bindCfg();initGallery();renderVariants();updateInfo();renderRelated();
  try{cart=JSON.parse(localStorage.getItem("tn_cart"))||[]}catch(e){cart=[]}renderCart();

  $("#clearVar").onclick=()=>{variant=null;qty=1;$("#qty").value=1;renderVariants();updateInfo();toast("Đã xóa tùy chọn")};
  $("#qMinus").onclick=()=>setQty(qty-1);$("#qPlus").onclick=()=>setQty(qty+1);$("#qty").onchange=e=>setQty(e.target.value);
  $("#addCart").onclick=()=>{if(!variant)return toast("Vui lòng chọn quy cách 250gr hoặc 500gr");
    addItem(variant.id,"Dừa Dòn Thành Nhân – "+variant.label,variant.price,qty);toast("Đã thêm vào giỏ hàng");cartOpen(true)};
  $("#zaloNow").onclick=()=>{if(!variant)return toast("Vui lòng chọn quy cách 250gr hoặc 500gr");
    const l=[{id:variant.id,name:"Dừa Dòn Thành Nhân – "+variant.label,price:variant.price,qty}];
    sendZalo(orderText(null,l,{s:variant.price*qty,ship:C.shipFee,t:variant.price*qty+C.shipFee})+"\nXin tư vấn và xác nhận đơn giúp mình.")};

  $("#openCart").onclick=()=>cartOpen(true);$("#closeCart").onclick=()=>cartOpen(false);$("#overlay").onclick=()=>cartOpen(false);
  $("#orderForm").onsubmit=e=>{e.preventDefault();if(!cart.length)return toast("Giỏ hàng đang trống");
    const f=Object.fromEntries(new FormData(e.target));sendZalo(orderText(f,cart,totals()))};
  $("#printOrder").onclick=()=>{if(!cart.length)return toast("Giỏ hàng đang trống");const t=totals();
    $("#printArea").innerHTML=`<h2>Phiếu đơn hàng – ${esc(C.brandName)}</h2><p>${esc(C.address)} • ${esc(C.phone)}</p><table><tr><th>Sản phẩm</th><th>SL</th><th>Thành tiền</th></tr>${cart.map(c=>`<tr><td>${esc(c.name)}</td><td>${c.qty}</td><td>${money(c.price*c.qty)}</td></tr>`).join("")}</table><p>Tạm tính: ${money(t.s)} • Ship tạm tính: ${money(t.ship)} • <b>Tổng: ${money(t.t)}</b></p>`;window.print()};

  $$("[data-contact]").forEach(b=>b.onclick=()=>contact(b.dataset.contact));
  $$(".tabbar button").forEach(b=>b.onclick=()=>{$$(".tabbar button,.tabpane").forEach(x=>x.classList.remove("on"));b.classList.add("on");$("#"+b.dataset.tab).classList.add("on")});
  $$(".chip").forEach(b=>b.onclick=()=>{$$(".chip").forEach(x=>x.classList.remove("on"));b.classList.add("on");cat=b.dataset.cat;renderRelated()});
  $("#search").oninput=renderRelated;
  $("#burger").onclick=()=>$("#nav").classList.toggle("on");$$("#nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("on"));
  $("#toTop").onclick=()=>scrollTo({top:0,behavior:"smooth"});
  $("#mClose").onclick=closeModal;$("#modal").onclick=e=>{if(e.target.id==="modal")closeModal()};
  $("#lbClose").onclick=()=>$("#lightbox").classList.remove("on");$("#lbPrev").onclick=()=>{imgIdx--;lbSet()};$("#lbNext").onclick=()=>{imgIdx++;lbSet()};
  $("#lightbox").onclick=e=>{if(e.target.id==="lightbox")$("#lightbox").classList.remove("on")};
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){$("#lightbox").classList.remove("on");closeModal();cartOpen(false)}
    if($("#lightbox").classList.contains("on")){if(e.key==="ArrowLeft"){imgIdx--;lbSet()}if(e.key==="ArrowRight"){imgIdx++;lbSet()}}});
})();
