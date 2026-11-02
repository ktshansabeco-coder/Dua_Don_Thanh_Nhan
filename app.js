/**
 * Dừa Dòn Thành Nhân - Main Application Script
 * Xử lý tải dữ liệu sản phẩm, chọn quy cách (250gr / 500gr), giỏ hàng và đặt hàng Zalo
 */

let storeData = null;
let cart = JSON.parse(localStorage.getItem('ddtn_cart')) || [];
let selectedVariants = {};

// Format tiền tệ VNĐ
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('current-year').textContent = new Date().getFullYear();

    try {
        const res = await fetch('products.json');
        storeData = await res.json();
        initSiteContent();
        renderFeatures();
        renderProducts();
        renderTestimonials();
        updateCartUI();
    } catch (error) {
        console.error('Lỗi tải dữ liệu products.json:', error);
    }

    setupEventListeners();
});

function initSiteContent() {
    if (!storeData || !storeData.brand) return;
    const { brand } = storeData;
    document.getElementById('brand-name').textContent = brand.name;
    document.getElementById('free-ship-banner').textContent = formatVND(brand.free_shipping_threshold);
    document.getElementById('footer-address').textContent = brand.address;
    const phoneEl = document.getElementById('footer-phone');
    phoneEl.textContent = brand.phone;
    phoneEl.href = `tel:${brand.phone.replace(/\./g, '')}`;
    document.getElementById('footer-email').textContent = brand.email;
}

function renderFeatures() {
    const container = document.getElementById('features-container');
    if (!container || !storeData.features) return;
    container.innerHTML = storeData.features.map(f => `
        <div class="feature-card">
            <span class="feature-icon">${f.icon}</span>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
        </div>
    `).join('');
}

function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container || !storeData.products) return;

    container.innerHTML = storeData.products.map(product => {
        const defaultVariant = product.variants[0];
        selectedVariants[product.id] = defaultVariant.id;

        const variantsHTML = product.variants.map((v, idx) => `
            <button type="button" 
                class="variant-btn ${idx === 0 ? 'active' : ''}" 
                onclick="selectVariant('${product.id}', '${v.id}')"
                id="vbtn-${product.id}-${v.id}">
                <span class="v-weight">${v.weight}</span>
                <span class="v-price">${formatVND(v.price)}</span>
            </button>
        `).join('');

        return `
            <article class="product-card">
                <div class="product-img-wrap">
                    <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-body">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.short_desc}</p>
                    <div class="product-meta">
                        <p><strong>Thành phần:</strong> ${product.ingredients}</p>
                        <p><strong>Hạn sử dụng:</strong> ${product.expiry}</p>
                    </div>
                    <span class="variant-label">Chọn quy cách đóng gói:</span>
                    <div class="variant-options">
                        ${variantsHTML}
                    </div>
                    <div class="product-footer">
                        <div class="price-display">
                            <span class="current-price" id="price-${product.id}">${formatVND(defaultVariant.price)}</span>
                            ${defaultVariant.original_price ? `<span class="old-price" id="oldprice-${product.id}">${formatVND(defaultVariant.original_price)}</span>` : ''}
                        </div>
                        <button type="button" class="btn btn-primary" onclick="addToCart('${product.id}')">
                            + Thêm Vào Giỏ
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

window.selectVariant = function(productId, variantId) {
    selectedVariants[productId] = variantId;
    const product = storeData.products.find(p => p.id === productId);
    if (!product) return;

    product.variants.forEach(v => {
        const btn = document.getElementById(`vbtn-${productId}-${v.id}`);
        if (btn) {
            btn.classList.toggle('active', v.id === variantId);
        }
    });

    const chosen = product.variants.find(v => v.id === variantId);
    if (chosen) {
        document.getElementById(`price-${productId}`).textContent = formatVND(chosen.price);
        const oldEl = document.getElementById(`oldprice-${productId}`);
        if (oldEl && chosen.original_price) {
            oldEl.textContent = formatVND(chosen.original_price);
        }
    }
};

window.addToCart = function(productId) {
    const product = storeData.products.find(p => p.id === productId);
    const variantId = selectedVariants[productId];
    const variant = product.variants.find(v => v.id === variantId);

    const cartItemId = `${productId}__${variantId}`;
    const existing = cart.find(item => item.cartItemId === cartItemId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            cartItemId,
            productId,
            productName: product.name,
            variantId: variant.id,
            weight: variant.weight,
            price: variant.price,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Đã thêm ${product.name} (${variant.weight}) vào giỏ!`);
};

window.changeQty = function(cartItemId, delta) {
    const idx = cart.findIndex(item => item.cartItemId === cartItemId);
    if (idx === -1) return;

    cart[idx].quantity += delta;
    if (cart[idx].quantity <= 0) {
        cart.splice(idx, 1);
    }
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('ddtn_cart', JSON.stringify(cart));
}

function getCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const threshold = storeData?.brand?.free_shipping_threshold || 300000;
    const baseShip = storeData?.brand?.shipping_fee || 25000;
    const shipping = (subtotal === 0 || subtotal >= threshold) ? 0 : baseShip;
    return { subtotal, shipping, total: subtotal + shipping };
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalCount;

    const listEl = document.getElementById('cart-items-list');
    if (cart.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:#6E5A4F; padding: 24px 0;">Giỏ hàng của bạn đang trống. Hãy chọn gói Dừa Dòn yêu thích nhé!</p>`;
    } else {
        listEl.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h5>${item.productName}</h5>
                    <span>${item.weight} — ${formatVND(item.price)}</span>
                </div>
                <div class="qty-controls">
                    <button type="button" class="qty-btn" onclick="changeQty('${item.cartItemId}', -1)">-</button>
                    <strong>${item.quantity}</strong>
                    <button type="button" class="qty-btn" onclick="changeQty('${item.cartItemId}', 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    const { subtotal, shipping, total } = getCartTotals();
    document.getElementById('subtotal-amount').textContent = formatVND(subtotal);
    document.getElementById('shipping-amount').textContent = shipping === 0 && subtotal > 0 ? 'Miễn phí' : formatVND(shipping);
    document.getElementById('total-amount').textContent = formatVND(total);
}

function renderTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container || !storeData.testimonials) return;
    container.innerHTML = storeData.testimonials.map(t => `
        <div class="testimonial-card">
            <div class="stars">${'★'.repeat(t.rating)}</div>
            <p>"${t.comment}"</p>
            <div class="testimonial-author">— ${t.name}</div>
        </div>
    `).join('');
}

function buildOrderMessage() {
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return null;
    }

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const note = document.getElementById('cust-note').value.trim();

    if (!name || !phone || !address) {
        alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!');
        return null;
    }

    const { subtotal, shipping, total } = getCartTotals();
    const itemsLines = cart.map((item, i) => 
        `${i + 1}. ${item.productName} (${item.weight}) x ${item.quantity} = ${formatVND(item.price * item.quantity)}`
    ).join('\n');

    return `🥥 ĐƠN ĐẶT HÀNG - DỪA DÒN THÀNH NHÂN
-----------------------------
👤 Khách hàng: ${name}
📞 SĐT: ${phone}
📍 Địa chỉ: ${address}
${note ? `📝 Ghi chú: ${note}\n` : ''}-----------------------------
🛒 Chi tiết sản phẩm:
${itemsLines}
-----------------------------
💰 Tạm tính: ${formatVND(subtotal)}
🚚 Phí ship: ${shipping === 0 ? 'Miễn phí' : formatVND(shipping)}
🔥 TỔNG THANH TOÁN: ${formatVND(total)}`;
}

function setupEventListeners() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');

    const toggleCart = (open) => {
        drawer.classList.toggle('open', open);
        overlay.classList.toggle('open', open);
    };

    document.getElementById('open-cart-btn').addEventListener('click', () => toggleCart(true));
    document.getElementById('close-cart-btn').addEventListener('click', () => toggleCart(false));
    overlay.addEventListener('click', () => toggleCart(false));

    document.getElementById('order-zalo-btn').addEventListener('click', () => {
        const msg = buildOrderMessage();
        if (!msg) return;

        const zaloPhone = storeData?.brand?.zalo || '0900000000';
        navigator.clipboard?.writeText(msg).catch(() => {});
        const encoded = encodeURIComponent(msg);
        window.open(`https://zalo.me/${zaloPhone}?text=${encoded}`, '_blank');
    });

    document.getElementById('copy-order-btn').addEventListener('click', () => {
        const msg = buildOrderMessage();
        if (!msg) return;

        navigator.clipboard.writeText(msg).then(() => {
            showToast('Đã sao chép nội dung đơn hàng vào bộ nhớ tạm!');
        });
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2600);
}
