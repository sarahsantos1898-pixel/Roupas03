const STORAGE_KEY = "clothingStoreConfig";
const ORDER_KEY = "clothingOrders";
const USER_KEY = "clothingStoreUser";

const defaultConfig = {
  title: "Loja de Roupas Online",
  description: "Faça seu pedido de roupas com facilidade. Escolha os produtos, tamanhos e informe os dados para entrega.",
  accentColor: "#e63946", // Vermelho fashion
  heroEmoji: "👕",
  fields: [
    {
      id: "field-name",
      label: "Nome completo",
      type: "text",
      placeholder: "Ex.: João Silva",
      required: true,
    },
    {
      id: "field-email",
      label: "Email",
      type: "email",
      placeholder: "nome@email.com",
      required: true,
    },
    {
      id: "field-phone",
      label: "Telefone",
      type: "tel",
      placeholder: "(11) 99999-9999",
      required: true,
    },
    {
      id: "field-cep",
      label: "CEP",
      type: "text",
      placeholder: "00000-000",
      required: true,
    },
    {
      id: "field-address",
      label: "Endereço completo",
      type: "text",
      placeholder: "Rua, número, complemento, bairro",
      required: true,
    },
    {
      id: "field-city",
      label: "Cidade",
      type: "text",
      placeholder: "Ex.: São Paulo",
      required: true,
    },
  ],
  products: [
    {
      id: "prod-camiseta",
      name: "Camiseta Básica",
      description: "Camiseta 100% algodão",
      price: 49.90,
      sizes: ["P", "M", "G", "GG"],
      colors: ["Branco", "Preto", "Cinza"],
      category: "Camisetas"
    },
    {
      id: "prod-calca",
      name: "Calça Jeans",
      description: "Calça jeans slim fit",
      price: 129.90,
      sizes: ["38", "40", "42", "44"],
      colors: ["Azul", "Preto"],
      category: "Calças"
    },
    {
      id: "prod-moletom",
      name: "Moletom",
      description: "Moletom com capuz",
      price: 89.90,
      sizes: ["P", "M", "G"],
      colors: ["Preto", "Cinza", "Vermelho"],
      category: "Casacos"
    }
  ],
  paymentMethods: ["Cartão de Crédito", "PIX", "Boleto", "Cartão de Débito"]
};

const state = {
  configs: loadConfigCollection(),
  activeConfigId: null,
  blueprint: null,
  orders: loadOrders(),
  user: loadUser(),
  currentView: null,
  cart: []
};

const els = {
  titleInput: document.getElementById("formTitle"),
  descriptionInput: document.getElementById("formDescription"),
  accentInput: document.getElementById("accentColor"),
  heroEmojiInput: document.getElementById("heroEmoji"),
  heroEmojiPreview: document.getElementById("heroEmojiPreview"),
  previewTitle: document.getElementById("previewTitle"),
  previewDescription: document.getElementById("previewDescription"),
  publicHeroEmoji: document.getElementById("publicHeroEmoji"),
  publicTitle: document.getElementById("publicTitle"),
  publicDescription: document.getElementById("publicDescription"),
  publicOrderForm: document.getElementById("publicOrderForm"),
  fieldsContainer: document.getElementById("fieldsContainer"),
  newFieldForm: document.getElementById("newFieldForm"),
  orderForm: document.getElementById("orderForm"),
  ordersLog: document.getElementById("ordersLog"),
  clearOrders: document.getElementById("clearOrders"),
  resetConfig: document.getElementById("resetConfig"),
  loginForm: document.getElementById("loginForm"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  rememberMe: document.getElementById("rememberMe"),
  loginStatus: document.getElementById("loginStatus"),
  sessionChip: document.getElementById("sessionChip"),
  navButtons: document.querySelectorAll("[data-view-target]"),
  viewSections: document.querySelectorAll("[data-view]"),
  configList: document.getElementById("configList"),
  newConfigForm: document.getElementById("newConfigForm"),
  newConfigName: document.getElementById("newConfigName"),
  cloneActiveConfig: document.getElementById("cloneActiveConfig"),
  inputTemplate: document.getElementById("inputTemplate"),
  textareaTemplate: document.getElementById("textareaTemplate"),
  fieldRowTemplate: document.getElementById("fieldRowTemplate"),
  productsContainer: document.getElementById("productsContainer"),
  newProductForm: document.getElementById("newProductForm"),
  cartPreview: document.getElementById("cartPreview"),
  cartTotal: document.getElementById("cartTotal"),
  cartCount: document.getElementById("cartCount"),
  productsSection: document.getElementById("productsSection"),
  categoriesFilter: document.getElementById("categoriesFilter")
};

const initialActiveConfig = getActiveConfig();
state.activeConfigId = initialActiveConfig.id;
state.blueprint = initialActiveConfig.blueprint;

hydrateInitialState();
renderConfigList();
renderFieldList();
renderProductsList();
renderProductsSection();
renderOrders();
renderCart();
bindEvents();
initializeView();

function hydrateInitialState() {
  els.titleInput.value = state.blueprint.title;
  els.descriptionInput.value = state.blueprint.description ?? "";
  els.accentInput.value = state.blueprint.accentColor ?? "#e63946";
  els.heroEmojiInput.value = state.blueprint.heroEmoji ?? "👕";

  if (state.user?.email) {
    els.loginEmail.value = state.user.email;
  }
  updateSessionChip();
  syncAccentColors(state.blueprint.accentColor);
}

function bindEvents() {
  els.titleInput.addEventListener("input", (event) => {
    state.blueprint.title = event.target.value;
    persistConfig();
    renderForms();
  });

  els.descriptionInput.addEventListener("input", (event) => {
    state.blueprint.description = event.target.value;
    persistConfig();
    renderForms();
  });

  els.accentInput.addEventListener("input", (event) => {
    state.blueprint.accentColor = event.target.value;
    syncAccentColors(event.target.value);
    persistConfig();
    renderForms();
  });

  els.heroEmojiInput.addEventListener("input", (event) => {
    const value = (event.target.value || "👕").trim();
    state.blueprint.heroEmoji = value || "👕";
    persistConfig();
    renderForms();
  });

  els.newFieldForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newField = buildFieldFromForm(formData);
    state.blueprint.fields.push(newField);
    persistConfig();
    event.currentTarget.reset();
    renderFieldList();
    renderForms();
  });

  els.newProductForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newProduct = buildProductFromForm(formData);
    state.blueprint.products.push(newProduct);
    persistConfig();
    event.currentTarget.reset();
    renderProductsList();
    renderProductsSection();
  });

  els.newConfigForm.addEventListener("submit", handleNewConfigSubmit);

  els.orderForm.addEventListener("submit", handleOrderSubmit);
  els.publicOrderForm.addEventListener("submit", handlePublicOrderSubmit);

  els.clearOrders.addEventListener("click", () => {
    state.orders = [];
    persistOrders();
    renderOrders();
  });

  els.resetConfig.addEventListener("click", () => {
    state.blueprint = clone(defaultConfig);
    persistConfig();
    hydrateInitialState();
    renderFieldList();
    renderProductsList();
    renderProductsSection();
    renderForms();
  });

  els.loginForm.addEventListener("submit", handleLoginSubmit);

  els.configList.addEventListener("click", handleConfigListClick);

  els.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.viewTarget;
      switchView(target);
    });
  });

  // Filtro de categorias
  if (els.categoriesFilter) {
    els.categoriesFilter.addEventListener("change", (event) => {
      renderProductsSection(event.target.value);
    });
  }
}

function initializeView() {
  const initialView = state.user ? "admin" : "login";
  switchView(initialView);
}

function switchView(target) {
  const viewName = target || "login";
  state.currentView = viewName;
  els.viewSections.forEach((section) => {
    section.classList.toggle("active", section.dataset.view === viewName);
  });
  els.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTarget === viewName);
  });
}

function updateSessionChip() {
  els.sessionChip.textContent = state.user?.email || "Visitante";
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const email = els.loginEmail.value.trim();
  const password = els.loginPassword.value.trim();
  if (!email || password.length < 4) {
    els.loginStatus.textContent = "Informe email e uma senha com ao menos 4 caracteres.";
    return;
  }

  const user = {
    email,
    name: email.split("@")[0],
    role: email.includes("admin") ? "admin" : "customer"
  };
  state.user = user;

  if (els.rememberMe.checked) {
    persistUser(user);
  } else {
    removeUser();
  }

  updateSessionChip();
  els.loginStatus.textContent = `Bem-vindo, ${user.name}!`;
  els.loginPassword.value = "";
  switchView("admin");
  flashMessage("Login efetuado. Configure sua loja!");
}

function handleNewConfigSubmit(event) {
  event.preventDefault();
  const name = (els.newConfigName.value || "").trim();
  const baseBlueprint = els.cloneActiveConfig.checked ? clone(state.blueprint) : clone(defaultConfig);
  const entry = makeConfigEntry({
    name: name || `Loja ${state.configs.items.length + 1}`,
    blueprint: baseBlueprint,
  });
  state.configs.items.push(entry);
  setActiveConfig(entry.id);
  els.newConfigForm.reset();
  els.cloneActiveConfig.checked = true;
  flashMessage("Configuração da loja criada e ativada.");
}

function handleConfigListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!id) return;

  if (action === "activate") {
    if (id !== state.activeConfigId) {
      setActiveConfig(id);
      flashMessage("Configuração da loja ativada para edição.");
    }
    return;
  }

  if (action === "rename") {
    const current = state.configs.items.find((item) => item.id === id);
    const nextName = prompt("Novo nome da loja", current?.name || "");
    if (nextName && nextName.trim()) {
      renameConfig(id, nextName.trim());
      flashMessage("Configuração renomeada.");
    }
    return;
  }

  if (action === "delete") {
    deleteConfig(id);
  }
}

function setActiveConfig(id) {
  const target = state.configs.items.find((item) => item.id === id);
  if (!target) return;
  state.activeConfigId = id;
  state.configs.activeId = id;
  state.blueprint = target.blueprint;
  persistCollection();
  hydrateInitialState();
  renderFieldList();
  renderProductsList();
  renderProductsSection();
  renderForms();
  renderConfigList();
}

function renameConfig(id, name) {
  const target = state.configs.items.find((item) => item.id === id);
  if (!target) return;
  target.name = name;
  if (id === state.activeConfigId && !state.blueprint.title) {
    state.blueprint.title = name;
    hydrateInitialState();
    renderForms();
  }
  persistCollection();
  renderConfigList();
}

function deleteConfig(id) {
  if (state.configs.items.length <= 1) {
    flashMessage("Mantenha pelo menos uma configuração ativa.");
    return;
  }
  const index = state.configs.items.findIndex((item) => item.id === id);
  if (index === -1) return;
  const deletingActive = state.activeConfigId === id;
  state.configs.items.splice(index, 1);
  if (deletingActive) {
    const fallback = state.configs.items[0];
    state.activeConfigId = fallback.id;
    state.configs.activeId = fallback.id;
    state.blueprint = fallback.blueprint;
    hydrateInitialState();
    renderFieldList();
    renderProductsList();
    renderProductsSection();
    renderForms();
  }
  persistCollection();
  renderConfigList();
  flashMessage("Configuração removida.");
}

function renderConfigList() {
  if (!els.configList) return;
  els.configList.innerHTML = "";
  if (!state.configs.items.length) {
    els.configList.innerHTML = '<p class="muted">Nenhuma loja configurada.</p>';
    return;
  }

  state.configs.items.forEach((config) => {
    const isActive = config.id === state.activeConfigId;
    const row = document.createElement("article");
    row.className = `config-row${isActive ? " active" : ""}`;
    row.dataset.id = config.id;

    const title = document.createElement("div");
    title.className = "config-title";
    title.textContent = config.name || config.blueprint.title || "Loja";

    const meta = document.createElement("p");
    meta.className = "config-meta muted";
    const productCount = config.blueprint.products?.length || 0;
    const orderCount = loadOrders().length;
    meta.textContent = `${productCount} produtos - ${orderCount} pedidos`;

    const info = document.createElement("div");
    info.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "config-actions";

    const status = document.createElement("span");
    status.className = `status-pill ${isActive ? "active" : ""}`;
    status.textContent = isActive ? "Ativa" : "Inativa";
    actions.appendChild(status);

    const activate = document.createElement("button");
    activate.type = "button";
    activate.className = "ghost-button";
    activate.dataset.action = "activate";
    activate.dataset.id = config.id;
    activate.textContent = isActive ? "Em edição" : "Ativar";
    if (isActive) activate.disabled = true;
    actions.appendChild(activate);

    const rename = document.createElement("button");
    rename.type = "button";
    rename.className = "ghost-button";
    rename.dataset.action = "rename";
    rename.dataset.id = config.id;
    rename.textContent = "Renomear";
    actions.appendChild(rename);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon danger";
    remove.dataset.action = "delete";
    remove.dataset.id = config.id;
    remove.textContent = "Excluir";
    if (state.configs.items.length === 1) remove.disabled = true;
    actions.appendChild(remove);

    row.append(info, actions);
    els.configList.appendChild(row);
  });
}

function renderForms() {
  renderPreview();
  renderPublicView();
}

function renderPreview() {
  els.previewTitle.textContent = state.blueprint.title || "Loja de Roupas";
  els.previewDescription.textContent =
    state.blueprint.description || "Configure sua loja de roupas online.";
  els.heroEmojiPreview.textContent = (state.blueprint.heroEmoji || "👕").slice(0, 2);
  populateOrderForm(els.orderForm, "Simular pedido");
}

function renderPublicView() {
  els.publicTitle.textContent = state.blueprint.title || "Loja de Roupas";
  els.publicDescription.textContent =
    state.blueprint.description || "Faça suas compras com facilidade.";
  els.publicHeroEmoji.textContent = (state.blueprint.heroEmoji || "👕").slice(0, 2);
  
  // Renderiza produtos na visualização pública
  renderProductsSection();
  
  // Adiciona campos do formulário
  const existingForm = els.publicOrderForm.querySelector('.order-fields');
  if (existingForm) existingForm.remove();
  
  const formFields = document.createElement('div');
  formFields.className = 'order-fields';
  populateOrderForm(formFields, "Finalizar compra");
  els.publicOrderForm.appendChild(formFields);
}

function populateOrderForm(formElement, submitLabel) {
  const existingFields = formElement.querySelector('.order-fields');
  if (existingFields) existingFields.remove();
  
  const fieldsContainer = document.createElement('div');
  fieldsContainer.className = 'order-fields';
  
  if (!state.blueprint.fields.length) {
    fieldsContainer.innerHTML = '<p class="muted">Adicione campos no painel para visualizar aqui.</p>';
    formElement.appendChild(fieldsContainer);
    return;
  }

  state.blueprint.fields.forEach((field) => {
    const fieldNode = buildPreviewField(field);
    fieldsContainer.appendChild(fieldNode);
  });

  // Adiciona campo de método de pagamento
  if (state.blueprint.paymentMethods && state.blueprint.paymentMethods.length > 0) {
    const paymentField = document.createElement('div');
    paymentField.className = 'form-field';
    paymentField.innerHTML = `
      <label>Método de Pagamento *</label>
      <div class="payment-methods">
        ${state.blueprint.paymentMethods.map(method => `
          <label class="payment-option">
            <input type="radio" name="paymentMethod" value="${method}" required>
            <span>${method}</span>
          </label>
        `).join('')}
      </div>
    `;
    fieldsContainer.appendChild(paymentField);
  }

  formElement.appendChild(fieldsContainer);
  
  // Adiciona botão de submit se não existir
  if (!formElement.querySelector('button[type="submit"]')) {
    const button = document.createElement("button");
    button.type = "submit";
    button.className = "primary";
    button.textContent = submitLabel;
    formElement.appendChild(button);
  }
}

function renderFieldList() {
  const container = els.fieldsContainer;
  container.innerHTML = "";
  if (!state.blueprint.fields.length) {
    container.classList.add("empty");
    container.innerHTML = '<p class="muted">Nenhum campo configurado ainda.</p>';
    return;
  }
  container.classList.remove("empty");
  state.blueprint.fields.forEach((field, index) => {
    const node = els.fieldRowTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.id = field.id;
    node.querySelector(".label").textContent = field.label;
    node.querySelector(".type").textContent = field.type;
    const up = node.querySelector(".move-up");
    const down = node.querySelector(".move-down");
    const del = node.querySelector(".delete");
    if (index === 0) up.disabled = true;
    if (index === state.blueprint.fields.length - 1) down.disabled = true;
    up.addEventListener("click", () => moveField(index, index - 1));
    down.addEventListener("click", () => moveField(index, index + 1));
    del.addEventListener("click", () => deleteField(index));
    container.appendChild(node);
  });
}

function renderProductsList() {
  const container = els.productsContainer;
  if (!container) return;
  
  container.innerHTML = "";
  if (!state.blueprint.products?.length) {
    container.classList.add("empty");
    container.innerHTML = '<p class="muted">Nenhum produto cadastrado ainda.</p>';
    return;
  }
  container.classList.remove("empty");
  
  state.blueprint.products.forEach((product, index) => {
    const node = document.createElement('div');
    node.className = 'product-row';
    node.dataset.id = product.id;
    node.innerHTML = `
      <div class="product-info">
        <strong>${product.name}</strong>
        <span class="muted">${product.category} - R$ ${product.price.toFixed(2)}</span>
      </div>
      <div class="product-actions">
        <button class="ghost-button edit-product" data-index="${index}">Editar</button>
        <button class="icon danger delete-product" data-index="${index}">Excluir</button>
      </div>
    `;
    
    node.querySelector('.edit-product').addEventListener('click', () => editProduct(index));
    node.querySelector('.delete-product').addEventListener('click', () => deleteProduct(index));
    
    container.appendChild(node);
  });
}

function renderProductsSection(filterCategory = null) {
  const container = els.productsSection;
  if (!container) return;
  
  container.innerHTML = "";
  
  let products = state.blueprint.products || [];
  if (filterCategory && filterCategory !== 'all') {
    products = products.filter(p => p.category === filterCategory);
  }
  
  if (!products.length) {
    container.innerHTML = '<p class="muted">Nenhum produto disponível no momento.</p>';
    return;
  }
  
  // Atualiza filtro de categorias
  updateCategoriesFilter();
  
  // Renderiza produtos
  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">
        <span class="product-emoji">${getProductEmoji(product.category)}</span>
      </div>
      <div class="product-details">
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-meta">
          <span class="product-category">${product.category}</span>
          <span class="product-price">R$ ${product.price.toFixed(2)}</span>
        </div>
        <div class="product-options">
          ${product.sizes?.length ? `
            <select class="size-select" data-product="${product.id}">
              <option value="">Selecione o tamanho</option>
              ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
            </select>
          ` : ''}
          ${product.colors?.length ? `
            <select class="color-select" data-product="${product.id}">
              <option value="">Selecione a cor</option>
              ${product.colors.map(color => `<option value="${color}">${color}</option>`).join('')}
            </select>
          ` : ''}
        </div>
        <button class="add-to-cart" data-product="${product.id}">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
    
    productCard.querySelector('.add-to-cart').addEventListener('click', () => {
      const sizeSelect = productCard.querySelector('.size-select');
      const colorSelect = productCard.querySelector('.color-select');
      
      addToCart({
        ...product,
        selectedSize: sizeSelect?.value,
        selectedColor: colorSelect?.value,
        quantity: 1
      });
    });
    
    container.appendChild(productCard);
  });
}

function updateCategoriesFilter() {
  if (!els.categoriesFilter) return;
  
  const categories = ['all', ...new Set(state.blueprint.products?.map(p => p.category) || [])];
  els.categoriesFilter.innerHTML = categories.map(cat => 
    `<option value="${cat}">${cat === 'all' ? 'Todas categorias' : cat}</option>`
  ).join('');
}

function getProductEmoji(category) {
  const emojis = {
    'Camisetas': '👕',
    'Calças': '👖',
    'Casacos': '🧥',
    'Vestidos': '👗',
    'Sapatos': '👟',
    'Acessórios': '👜'
  };
  return emojis[category] || '🛍️';
}

function addToCart(product) {
  // Verifica se o produto já está no carrinho
  const existingIndex = state.cart.findIndex(item => 
    item.id === product.id && 
    item.selectedSize === product.selectedSize &&
    item.selectedColor === product.selectedColor
  );
  
  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += 1;
  } else {
    state.cart.push({
      ...product,
      cartId: cryptoRandom(),
      quantity: 1
    });
  }
  
  renderCart();
  flashMessage(`${product.name} adicionado ao carrinho!`);
}

function removeFromCart(cartId) {
  state.cart = state.cart.filter(item => item.cartId !== cartId);
  renderCart();
}

function updateQuantity(cartId, delta) {
  const item = state.cart.find(item => item.cartId === cartId);
  if (item) {
    item.quantity = Math.max(1, item.quantity + delta);
    renderCart();
  }
}

function renderCart() {
  if (!els.cartPreview || !els.cartTotal || !els.cartCount) return;
  
  els.cartPreview.innerHTML = "";
  els.cartCount.textContent = state.cart.length;
  
  if (!state.cart.length) {
    els.cartPreview.innerHTML = '<p class="muted">Carrinho vazio</p>';
    els.cartTotal.textContent = 'R$ 0,00';
    return;
  }
  
  let total = 0;
  
  state.cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <div class="cart-item-details">
          ${item.selectedSize ? `<span>Tamanho: ${item.selectedSize}</span>` : ''}
          ${item.selectedColor ? `<span>Cor: ${item.selectedColor}</span>` : ''}
          <span>R$ ${item.price.toFixed(2)}</span>
        </div>
      </div>
      <div class="cart-item-controls">
        <button class="quantity-btn minus" data-cart="${item.cartId}">-</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn plus" data-cart="${item.cartId}">+</button>
        <button class="remove-btn" data-cart="${item.cartId}">×</button>
      </div>
    `;
    
    cartItem.querySelector('.minus').addEventListener('click', () => updateQuantity(item.cartId, -1));
    cartItem.querySelector('.plus').addEventListener('click', () => updateQuantity(item.cartId, 1));
    cartItem.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(item.cartId));
    
    els.cartPreview.appendChild(cartItem);
  });
  
  els.cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

function renderOrders() {
  const log = els.ordersLog;
  if (!log) return;
  
  log.innerHTML = "";
  if (!state.orders.length) {
    log.innerHTML = '<p class="muted">Nenhum pedido registrado ainda.</p>';
    return;
  }
  
  [...state.orders]
    .slice(-5)
    .reverse()
    .forEach((order) => {
      const wrapper = document.createElement("div");
      wrapper.className = "order-entry";
      const total = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
      const timestamp = new Date(order.at).toLocaleString("pt-BR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      wrapper.innerHTML = `
        <div>
          <strong>${order.customerName || "Cliente"}</strong>
          <span class="muted">${order.paymentMethod || ""}</span>
        </div>
        <div>
          <strong>R$ ${total.toFixed(2)}</strong>
          <span class="muted micro">${timestamp}</span>
        </div>
      `;
      log.appendChild(wrapper);
    });
}

function handleOrderSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const values = collectFormValues(event.currentTarget);
  const customerName = values[0] || "Cliente";
  const paymentMethod = formData.get("paymentMethod") || "Não informado";
  
  recordOrder(state.cart, values, customerName, paymentMethod);
  state.cart = [];
  renderCart();
  event.currentTarget.reset();
  flashMessage("Pedido simulado com sucesso!");
}

function handlePublicOrderSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const values = collectFormValues(event.currentTarget);
  const customerName = values[0] || "Cliente";
  const paymentMethod = formData.get("paymentMethod") || "Não informado";
  
  if (state.cart.length === 0) {
    flashMessage("Adicione produtos ao carrinho antes de finalizar!");
    return;
  }
  
  recordOrder(state.cart, values, customerName, paymentMethod);
  state.cart = [];
  renderCart();
  event.currentTarget.reset();
  flashMessage("Pedido realizado com sucesso! Você receberá um email de confirmação.");
}

function collectFormValues(formElement) {
  const formData = new FormData(formElement);
  return state.blueprint.fields.map((field) => formData.get(field.id) || "");
}

function recordOrder(items, customerData, customerName, paymentMethod) {
  const order = {
    id: cryptoRandom(),
    at: new Date().toISOString(),
    items: clone(items),
    customerData,
    customerName,
    paymentMethod,
    total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };
  state.orders.push(order);
  persistOrders();
  renderOrders();
}

function buildFieldFromForm(formData) {
  const type = formData.get("fieldType") || "text";
  return {
    id: `field-${cryptoRandom()}`,
    label: formData.get("fieldLabel") || "Novo campo",
    type,
    placeholder: formData.get("fieldPlaceholder") || "",
    required: formData.get("fieldRequired") === "on",
  };
}

function buildProductFromForm(formData) {
  const sizes = (formData.get("productSizes") || "")
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
  
  const colors = (formData.get("productColors") || "")
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean);
  
  return {
    id: `prod-${cryptoRandom()}`,
    name: formData.get("productName") || "Novo Produto",
    description: formData.get("productDescription") || "",
    price: parseFloat(formData.get("productPrice") || "0"),
    sizes,
    colors,
    category: formData.get("productCategory") || "Geral"
  };
}

function editProduct(index) {
  const product = state.blueprint.products[index];
  if (!product) return;
  
  const newName = prompt("Novo nome do produto:", product.name);
  if (newName !== null) product.name = newName;
  
  const newPrice = prompt("Novo preço:", product.price.toString());
  if (newPrice !== null) product.price = parseFloat(newPrice) || product.price;
  
  persistConfig();
  renderProductsList();
  renderProductsSection();
}

function deleteProduct(index) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    state.blueprint.products.splice(index, 1);
    persistConfig();
    renderProductsList();
    renderProductsSection();
  }
}

function moveField(from, to) {
  if (to < 0 || to >= state.blueprint.fields.length) return;
  const [item] = state.blueprint.fields.splice(from, 1);
  state.blueprint.fields.splice(to, 0, item);
  persistConfig();
  renderFieldList();
  renderForms();
}

function deleteField(index) {
  state.blueprint.fields.splice(index, 1);
  persistConfig();
  renderFieldList();
  renderForms();
}

function buildPreviewField(field) {
  if (field.type === "textarea") {
    const node = els.textareaTemplate.content.firstElementChild.cloneNode(true);
    populateFieldNode(node, field);
    node.querySelector("textarea").name = field.id;
    return node;
  }

  const node = els.inputTemplate.content.firstElementChild.cloneNode(true);
  populateFieldNode(node, field);
  const input = node.querySelector("input");
  input.type = mapInputType(field.type);
  input.name = field.id;
  return node;
}

function populateFieldNode(node, field) {
  const label = node.querySelector("label span");
  if (label) {
    label.textContent = field.required ? `${field.label} *` : field.label;
  }
  const control = node.querySelector("input, textarea, select");
  if (control.tagName !== "SELECT") {
    control.placeholder = field.placeholder || "";
  }
  control.required = Boolean(field.required);
}

function mapInputType(type) {
  const supported = ["text", "email", "tel", "number", "date"];
  return supported.includes(type) ? type : "text";
}

function flashMessage(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function syncAccentColors(color) {
  const accent = sanitizeHex(color) || defaultConfig.accentColor;
  const lighter = lightenColor(accent, 0.4);
  document.documentElement.style.setProperty("--accent", accent);
  document.documentElement.style.setProperty("--accent-soft", lighter);
}

function lightenColor(hex, ratio = 0.3) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel) => Math.round(channel + (255 - channel) * ratio);
  return rgbToHex(mix(r), mix(g), mix(b));
}

function sanitizeHex(value) {
  if (typeof value !== "string") return null;
  const hex = value.trim();
  const valid = /^#?[0-9a-fA-F]{6}$/;
  if (!valid.test(hex)) return null;
  return hex.startsWith("#") ? hex : `#${hex}`;
}

function hexToRgb(hex) {
  const value = sanitizeHex(hex) ?? "#000000";
  const stripped = value.replace("#", "");
  const bigint = parseInt(stripped, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2, 8);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeBlueprint(data) {
  if (!data || typeof data !== "object") return clone(defaultConfig);
  const fields = Array.isArray(data.fields) ? data.fields : defaultConfig.fields;
  const products = Array.isArray(data.products) ? data.products : defaultConfig.products;
  const paymentMethods = Array.isArray(data.paymentMethods) ? data.paymentMethods : defaultConfig.paymentMethods;
  
  return {
    title: data.title ?? defaultConfig.title,
    description: data.description ?? defaultConfig.description,
    accentColor: data.accentColor ?? defaultConfig.accentColor,
    heroEmoji: data.heroEmoji ?? defaultConfig.heroEmoji}
  }