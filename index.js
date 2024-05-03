const API = (() => {
  const URL = "http://localhost:3000";
  const getCart = async () => {
    // define your method to get cart data
    const response = await fetch(`${URL}/cart`);
    return response.json();
  };

  const getInventory = async () => {
    // define your method to get inventory data
    const response = await fetch(`${URL}/inventory`);
    return response.json();
  };

  const addToCart = async (itemName, itemId, itemAmount) => {
    // define your method to add an item to cart
    try {
      // Check if item already exists in cart
      const cart = await getCart();
      const existingItem = cart.find(item => item.itemId === itemId);
      if (existingItem) {
        // If item exists, update its amount
        const updatedAmount = existingItem.itemAmount + itemAmount;
        const response = await fetch(`${URL}/cart/${existingItem.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemAmount: updatedAmount })
        });
        if (!response.ok) {
          console.error('Failed to update item in cart:', response.statusText);
          return null;
        }
      } else {
        // If item does not exist, add new item to cart
        const response = await fetch(`${URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ itemName, itemId, itemAmount })
        });
        if (!response.ok) {
          console.error('Failed to add item to cart:', response.statusText);
          return null;
        }
      }
      return getCart(); // Return updated cart data
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return null;
    }
  };

  const updateCart = (id, newAmount) => {
    // define your method to update an item in cart
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart;
    }
    set inventory(newInventory) {
      this.#inventory = newInventory;
    }

    subscribe(cb) { }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  // implement your logic for View
  const renderInventory = (inventory) => {
    const inventoryItems = document.querySelector(".inventory-items");
    inventoryItems.innerHTML = "";
    inventory.forEach((item) => {
      const li = document.createElement("li");
      li.className = "inventory-item";
      li.dataset.id = item.id;
      li.innerHTML = `
      <p>${item.content}</p>
      <button class="delete-btn">-</button>
      <span>1</span>
      <button class="add-btn">+</button>
      <button class="add-cart-btn">add to cart</button>
      `;
      inventoryItems.appendChild(li);
    });
  }

  const renderCart = (cart) => {
    const cartItems = document.querySelector(".cart-items");
    cartItems.innerHTML = "";

    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-item";

      const itemName = item.name;
      const itemAmount = item.amount;

      li.innerHTML = `
        <span>${itemName} * ${itemAmount}</span>
        <button class="delete-item-btn">delete</button>
      `;

      cartItems.appendChild(li);
    });
  };
  return {
    renderInventory,
    renderCart
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();

  const init = async () => {
    await fetchData();
    console.log(state.inventory);
    render();
    setupEventListeners();
  };

  const fetchData = async () => {
    const inventory = await API.getInventory();
    const cart = await API.getCart();
    //console.log(inventory);
    console.log(cart);
    state.cart = cart;
    state.inventory = inventory; // 更新模型的库存数据
    console.log("hello");
    console.log(state.cart);
    return inventory;
  };

  const render = () => {
    view.renderInventory(state.inventory); // 渲染库存数据到页面上
    view.renderCart(state.cart);
  };

  const setupEventListeners = () => {
    const inventoryItems = document.querySelector(".inventory-items");
    inventoryItems.addEventListener("click", async (event) => {
      const target = event.target;
      if (target.classList.contains("add-btn")) {
        incrementItem(target.parentElement);
      } else if (target.classList.contains("delete-btn")) {
        decrementItem(target.parentElement);
      } else if (target.classList.contains("add-cart-btn")) {
        const itemElement = target.parentElement;
        const itemId = target.parentElement.dataset.id;
        const itemAmount = parseInt(itemElement.querySelector("span").textContent);
        const itemName = itemElement.querySelector("p").textContent;
        await API.addToCart(itemName, itemId, itemAmount);
        await view.renderCart(); // Render cart after adding item
      }
    });
  };

  const incrementItem = (itemElement) => {
    const quantitySpan = itemElement.querySelector("span");
    let quantity = parseInt(quantitySpan.textContent);
    quantity++;
    quantitySpan.textContent = quantity;
  };

  const decrementItem = (itemElement) => {
    const quantitySpan = itemElement.querySelector("span");
    let quantity = parseInt(quantitySpan.textContent);
    if (quantity > 1) {
      quantity--;
      quantitySpan.textContent = quantity;
    }
  };

  const handleUpdateAmount = () => { };

  const handleAddToCart = () => { };

  const handleDelete = () => { };

  const handleCheckout = () => { };
  const bootstrap = () => {
    init();
  };
  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();
